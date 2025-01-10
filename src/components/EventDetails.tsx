import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SMSSettings } from './SMSSettings';
import { EventDetailsForm } from './EventDetailsForm';
import { ScheduleManager } from './ScheduleManager';
import { FAQManager } from './FAQManager';
import { AITester } from './AITester';
import { supabase } from '../lib/supabase';

export function EventDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'details' | 'schedule' | 'faqs' | 'sms' | 'ai'>('details');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  async function fetchEventDetails() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'sms', label: 'SMS' },
    { id: 'ai', label: 'AI Test' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">Event not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'details' && <EventDetailsForm event={event} onUpdate={fetchEventDetails} />}
            {activeTab === 'schedule' && <ScheduleManager eventId={id} />}
            {activeTab === 'faqs' && <FAQManager eventId={id} />}
            {activeTab === 'sms' && <SMSSettings eventId={id} />}
            {activeTab === 'ai' && <AITester eventId={id} />}
          </div>
        </div>
      </div>
    </div>
  );
}