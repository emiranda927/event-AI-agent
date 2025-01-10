import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function AnthropicTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/.netlify/functions/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'This is a test message. Please respond with "Connection successful!" in JSON format.'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to Anthropic API');
      }

      setResult({
        success: true,
        message: 'Successfully connected to Anthropic API'
      });
    } catch (error) {
      console.error('API Test Error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to test API connection'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">API Connection Test</h3>
        <button
          onClick={testConnection}
          disabled={testing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-md ${
            result.success ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <h3
                className={`text-sm font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.success ? 'Success' : 'Error'}
              </h3>
              <div
                className={`mt-2 text-sm ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {result.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}