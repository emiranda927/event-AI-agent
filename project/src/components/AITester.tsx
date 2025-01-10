import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { handleMessage } from '../lib/ai-agent';
import { supabase } from '../lib/supabase';
import { AnthropicTest } from './AnthropicTest';

interface AITesterProps {
  eventId: string;
}

export function AITester({ eventId }: AITesterProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextId, setContextId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Array<{
    content: string;
    isAI: boolean;
    confidence?: number;
  }>>([]);

  useEffect(() => {
    createTestContext();
  }, [eventId]);

  async function createTestContext() {
    try {
      // Check for existing test context
      const { data: existingContext } = await supabase
        .from('chat_contexts')
        .select('id')
        .eq('event_id', eventId)
        .eq('platform', 'imessage')
        .eq('chat_id', 'tester')
        .single();

      if (existingContext) {
        setContextId(existingContext.id);
        return;
      }

      // Create new test context
      const { data: newContext, error } = await supabase
        .from('chat_contexts')
        .insert({
          event_id: eventId,
          platform: 'imessage',
          chat_id: 'tester'
        })
        .select()
        .single();

      if (error) throw error;
      setContextId(newContext.id);
    } catch (error) {
      console.error('Error creating test context:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !contextId) return;

    const userMessage = message.trim();
    setMessage('');
    setLoading(true);

    // Add user message to conversation
    setConversation(prev => [...prev, { content: userMessage, isAI: false }]);

    try {
      const response = await handleMessage(eventId, userMessage, contextId, 'imessage');

      // Add AI response to conversation
      setConversation(prev => [...prev, { 
        content: response.response, 
        isAI: true,
        confidence: response.confidence
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setConversation(prev => [...prev, { 
        content: 'Sorry, I encountered an error processing your message.', 
        isAI: true,
        confidence: 0
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <AnthropicTest />
      
      <div className="bg-white rounded-lg shadow">
        <div className="h-96 p-4 overflow-y-auto space-y-4">
          {conversation.length === 0 ? (
            <p className="text-center text-gray-500">
              Start a conversation to test the AI agent's responses
            </p>
          ) : (
            conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.isAI 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.isAI && msg.confidence !== undefined && (
                    <p className="mt-1 text-xs text-gray-500">
                      Confidence: {(msg.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-500">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question about the event..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading || !contextId}
            />
            <button
              type="submit"
              disabled={loading || !message.trim() || !contextId}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}