import { Handler } from '@netlify/functions';
import { handleIncomingSMS } from '../../src/lib/sms-handler';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  // Verify the request is from Twilio
  if (!event.headers['x-twilio-signature']) {
    return {
      statusCode: 401,
      body: 'Unauthorized'
    };
  }

  try {
    const params = new URLSearchParams(event.body!);
    const from = params.get('From');
    const body = params.get('Body');

    if (!from || !body) {
      throw new Error('Missing required parameters');
    }

    // Find the active event
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!event) {
      return {
        statusCode: 404,
        body: 'No active event found'
      };
    }

    // Process the message
    await handleIncomingSMS(from, body, event.id);

    // Return TwiML response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/xml'
      },
      body: `<?xml version="1.0" encoding="UTF-8"?>
        <Response></Response>`
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }
}