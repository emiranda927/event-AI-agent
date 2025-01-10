export interface AIProvider {
  generateResponse(prompt: string): Promise<{ response: string; confidence: number }>;
}

export interface AIProviderConfig {
  type: 'openai' | 'anthropic';
  apiKey: string;
}