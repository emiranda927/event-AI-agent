import { Request, Response } from 'express';
import { handleIncomingSMS } from '../lib/sms-handler';
import { supabase } from '../lib/supabase';

export async function smsWebhook(req: Request, res: Response) {
  const { From, Body } = req.body;

  try {
    // Find the active event for this phone number
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!event) {
      return res.status(404).send('No active event found');
    }

    // Process the message
    await handleIncomingSMS(From, Body, event.id);

    // Send TwiML response
    res.type('text/xml').send(`
      <?xml version="1.0" encoding="UTF-8"?>
      <Response></Response>
    `);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal server error');
  }
}