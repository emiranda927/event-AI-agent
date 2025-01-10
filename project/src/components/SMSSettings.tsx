import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

type SMSSettings = {
  id: string;
  enabled: boolean;
  welcome_message: string | null;
};

interface SMSSettingsProps {
  eventId: string;
}

export function SMSSettings({ eventId }: SMSSettingsProps) {
  const [settings, setSettings] = useState<SMSSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [eventId]);

  async function fetchSettings() {
    try {
      let { data, error } = await supabase
        .from('sms_settings')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        const { data: newSettings, error: createError } = await supabase
          .from('sms_settings')
          .insert({
            event_id: eventId,
            enabled: false,
            welcome_message: 'Welcome! I\'m your event assistant. You can ask me questions about the event anytime.'
          })
          .select()
          .single();

        if (createError) {
          if (createError.code === '23505') {
            const { data: existingSettings, error: fetchError } = await supabase
              .from('sms_settings')
              .select('*')
              .eq('event_id', eventId)
              .single();

            if (fetchError) throw fetchError;
            data = existingSettings;
          } else {
            throw createError;
          }
        } else {
          data = newSettings;
        }
      }

      setSettings(data);
    } catch (error) {
      console.error('Error fetching SMS settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('sms_settings')
        .update({
          enabled: settings.enabled,
          welcome_message: settings.welcome_message,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;
      setTestResult(null);
    } catch (error) {
      console.error('Error saving SMS settings:', error);
    } finally {
      setSaving(false);
    }
  }

  async function sendTestMessage() {
    setSendingTest(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/.netlify/functions/send-test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server');
      }
      
      if (result.success) {
        setTestResult({
          success: true,
          message: 'Test message sent successfully! Check your phone.'
        });
      } else {
        throw new Error(result.error || 'Failed to send test message');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setSendingTest(false);
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading SMS settings...</div>;
  }

  if (!settings) {
    return <div className="text-center py-4 text-red-600">Error loading SMS settings</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <MessageSquare className="h-6 w-6 mr-2" />
          SMS Settings
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sms-enabled"
            checked={settings.enabled}
            onChange={(e) => setSettings(prev => prev ? { ...prev, enabled: e.target.checked } : null)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="sms-enabled" className="ml-2 block text-sm text-gray-900">
            Enable SMS functionality for this event
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Welcome Message
          </label>
          <div className="mt-1">
            <textarea
              rows={4}
              value={settings.welcome_message || ''}
              onChange={(e) => setSettings(prev => prev ? { ...prev, welcome_message: e.target.value } : null)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter the welcome message that guests will receive when they first text your event number"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={sendTestMessage}
            disabled={sendingTest || !settings.enabled}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-2" />
            {sendingTest ? 'Sending...' : 'Send Test Message'}
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {testResult && (
        <div className={`mt-4 p-4 rounded-md ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {testResult.message}
        </div>
      )}

      {settings.enabled && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Webhook Setup</h3>
          <p className="text-sm text-gray-600">
            Configure your Twilio webhook URL to:
          </p>
          <code className="mt-2 block bg-gray-100 p-2 rounded text-sm">
            {window.location.origin}/.netlify/functions/sms-webhook
          </code>
        </div>
      )}
    </div>
  );
}