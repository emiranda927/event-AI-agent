import { AIProvider } from './types';

export class AnthropicProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string): Promise<{ response: string; confidence: number }> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2024-01-01',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || 
          `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      
      if (!data.content || !Array.isArray(data.content) || !data.content[0]?.text) {
        throw new Error('Invalid response format from Anthropic API');
      }

      // Try to parse the response as JSON first
      try {
        const parsedResponse = JSON.parse(data.content[0].text);
        return {
          response: parsedResponse.response || data.content[0].text,
          confidence: parsedResponse.confidence || 0.8
        };
      } catch (e) {
        // If JSON parsing fails, use the raw response
        return {
          response: data.content[0].text,
          confidence: 0.8 // Default confidence for non-JSON responses
        };
      }
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate response');
    }
  }
}