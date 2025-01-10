import OpenAI from 'openai';
import { AIProvider } from './types';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateResponse(prompt: string): Promise<{ response: string; confidence: number }> {
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo", // Fallback to a widely available model
        messages: [
          { 
            role: "system", 
            content: `${prompt}\n\nRespond in JSON format with two fields:\n- response: Your response to the user\n- confidence: A number between 0 and 1 indicating how confident you are in your answer`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      try {
        const result = JSON.parse(completion.choices[0].message.content || '{}');
        return {
          response: result.response,
          confidence: result.confidence
        };
      } catch (e) {
        // If JSON parsing fails, use the raw response with a lower confidence
        return {
          response: completion.choices[0].message.content || 'Sorry, I encountered an error.',
          confidence: 0.7
        };
      }
    } catch (error) {
      console.error('OpenAI error:', error);
      throw error;
    }
  }
}