import { Handler } from '@netlify/functions';
import { Twilio } from 'twilio';

const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Method Not Allowed'
      })
    };
  }

  try {
    const message = await twilio.messages.create({
      body: 'Hello! This is a test message from your AI Event Agent.',
      to: '+13394401498',
      from: process.env.TWILIO_PHONE_NUMBER
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        messageId: message.sid
      })
    };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to send test message'
      })
    };
  }
};