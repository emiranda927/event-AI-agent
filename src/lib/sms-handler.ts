import { Twilio } from 'twilio';
import { handleMessage } from './ai-agent';
import { supabase } from './supabase';

const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function handleIncomingSMS(
  from: string,
  body: string,
  eventId: string
): Promise<void> {
  try {
    // Get or create chat context
    const { data: context } = await supabase
      .from('chat_contexts')
      .select('id')
      .eq('platform', 'sms')
      .eq('chat_id', from)
      .single();

    let contextId: string;

    if (!context) {
      const { data: newContext, error: contextError } = await supabase
        .from('chat_contexts')
        .insert({
          event_id: eventId,
          platform: 'sms',
          chat_id: from
        })
        .select()
        .single();

      if (contextError) throw contextError;
      contextId = newContext.id;
    } else {
      contextId = context.id;
    }

    // Process message with AI
    const response = await handleMessage(eventId, body, contextId, 'sms');

    // Send response via Twilio
    await twilio.messages.create({
      body: response.response,
      to: from,
      from: process.env.TWILIO_PHONE_NUMBER
    });
  } catch (error) {
    console.error('Error handling SMS:', error);
    // Send error message to user
    await twilio.messages.create({
      body: "I'm sorry, I encountered an error processing your message. Please try again later.",
      to: from,
      from: process.env.TWILIO_PHONE_NUMBER
    });
  }
}