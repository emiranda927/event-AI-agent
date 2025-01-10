import { Handler } from '@netlify/functions';

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || 
        `API request failed with status ${response.status}`
      );
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries reached');
}

async function generateAnthropicResponse(prompt: string): Promise<{ response: string; confidence: number }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key is not configured');
  }

  try {
    const response = await fetchWithRetry(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2024-01-01',
          'x-api-key': process.env.ANTHROPIC_API_KEY
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1024,
          system: "You are an AI event assistant. Always respond in JSON format with 'response' and 'confidence' fields.",
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      }
    );

    const data = await response.json();
    
    if (!data.content || !Array.isArray(data.content) || !data.content[0]?.text) {
      throw new Error('Invalid response format from Anthropic API');
    }

    // Always try to parse as JSON first
    try {
      const text = data.content[0].text.trim();
      // If the response isn't already JSON, wrap it
      const jsonStr = text.startsWith('{') ? text : JSON.stringify({
        response: text,
        confidence: 0.8
      });
      
      const result = JSON.parse(jsonStr);
      
      // Validate the response format
      if (!result.response || typeof result.confidence !== 'number') {
        throw new Error('Invalid response structure');
      }
      
      return {
        response: result.response,
        confidence: Math.max(0, Math.min(1, result.confidence)) // Ensure confidence is between 0 and 1
      };
    } catch (e) {
      // If JSON parsing fails, return a formatted response
      return {
        response: data.content[0].text,
        confidence: 0.8
      };
    }
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw error;
  }
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!event.body) {
      throw new Error('Request body is required');
    }

    const { prompt } = JSON.parse(event.body);
    
    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    const result = await generateAnthropicResponse(prompt);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error in generate-response:', error);
    
    const statusCode = error.message?.includes('API key') ? 401 
      : error.message?.includes('Invalid response') ? 502 
      : 500;

    return {
      statusCode,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.ANTHROPIC_API_KEY ? 'API configuration error' : 'Missing API configuration'
      })
    };
  }
};