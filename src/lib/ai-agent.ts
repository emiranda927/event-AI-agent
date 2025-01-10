import { supabase } from './supabase';

type EventInfo = {
  name: string;
  date: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  location_address: string;
  location_map_link?: string;
  parking_instructions?: string;
  dress_code?: string;
  gift_registry_link?: string;
  schedules: Array<{
    activity_name: string;
    start_time: string;
    end_time?: string;
    description?: string;
    location_detail?: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

async function getEventInfo(eventId: string): Promise<EventInfo | null> {
  try {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;
    if (!event) return null;

    const { data: schedules } = await supabase
      .from('event_schedules')
      .select('*')
      .eq('event_id', eventId)
      .order('start_time');

    const { data: faqs } = await supabase
      .from('faqs')
      .select('*')
      .eq('event_id', eventId);

    return {
      ...event,
      schedules: schedules || [],
      faqs: faqs || []
    };
  } catch (error) {
    console.error('Error fetching event info:', error);
    return null;
  }
}

async function getRecentMessages(contextId: string, limit: number = 5) {
  try {
    const { data: messages, error } = await supabase
      .rpc('get_chat_history', {
        p_context_id: contextId,
        p_limit: limit
      });

    if (error) throw error;
    return messages || [];
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    return [];
  }
}

async function storeMessage(contextId: string, content: string, isAI: boolean) {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        context_id: contextId,
        content,
        sender_id: isAI ? 'ai' : 'user',
        is_ai_response: isAI
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error storing message:', error);
  }
}

async function storeUnansweredQuestion(eventId: string, question: string, context: any[]) {
  try {
    const { error } = await supabase
      .from('unanswered_questions')
      .insert({
        event_id: eventId,
        question,
        context: JSON.stringify(context),
        status: 'pending'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error storing unanswered question:', error);
  }
}

function generatePrompt(message: string, eventInfo: EventInfo, history: any[]): string {
  const context = {
    event: {
      name: eventInfo.name,
      date: eventInfo.date,
      time: `${eventInfo.start_time}${eventInfo.end_time ? ` - ${eventInfo.end_time}` : ''}`,
      location: {
        name: eventInfo.location_name,
        address: eventInfo.location_address,
        mapLink: eventInfo.location_map_link,
        parking: eventInfo.parking_instructions
      },
      dressCode: eventInfo.dress_code,
      giftRegistry: eventInfo.gift_registry_link,
      schedule: eventInfo.schedules,
      faqs: eventInfo.faqs
    },
    history: history.map(msg => ({
      role: msg.is_ai_response ? 'assistant' : 'user',
      content: msg.content
    }))
  };

  return `You are an AI event assistant helping guests with questions about ${eventInfo.name}.
Event context: ${JSON.stringify(context, null, 2)}

User message: ${message}

Respond naturally and helpfully to the user's question based on the event information provided.`;
}

export async function handleMessage(
  eventId: string,
  message: string,
  contextId: string,
  platform: 'sms' | 'imessage' | 'whatsapp'
): Promise<{ response: string; confidence: number }> {
  try {
    const eventInfo = await getEventInfo(eventId);
    if (!eventInfo) {
      throw new Error('Event not found');
    }

    const history = await getRecentMessages(contextId, 5);
    const prompt = generatePrompt(message, eventInfo, history);

    try {
      const response = await fetch('/.netlify/functions/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (!result || typeof result.response !== 'string') {
        throw new Error('Invalid response format from AI service');
      }

      // Store messages regardless of confidence
      await Promise.all([
        storeMessage(contextId, message, false),
        storeMessage(contextId, result.response, true)
      ]);
      
      if (result.confidence < 0.7) {
        await storeUnansweredQuestion(eventId, message, history);
      }

      return {
        response: result.response,
        confidence: result.confidence || 0.8
      };
    } catch (error) {
      console.error('Error in AI processing:', error);
      const errorResponse = {
        response: error instanceof Error && error.message !== 'Failed to fetch'
          ? `I'm sorry, I encountered an error: ${error.message}`
          : "I'm sorry, I encountered an error processing your message. Please try again later.",
        confidence: 1
      };
      
      await Promise.all([
        storeMessage(contextId, message, false),
        storeMessage(contextId, errorResponse.response, true)
      ]);
      
      return errorResponse;
    }
  } catch (error) {
    console.error('Error handling message:', error instanceof Error ? error.message : error);
    return {
      response: error instanceof Error && error.message === 'Event not found'
        ? "I'm sorry, I couldn't find information about this event."
        : "I'm sorry, I encountered an error. Please try again later.",
      confidence: 1
    };
  }
}