import React, { useState, useEffect } from 'react';
import { Plus, HelpCircle, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

interface FAQManagerProps {
  eventId: string;
}

export function FAQManager({ eventId }: FAQManagerProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: ''
  });

  useEffect(() => {
    fetchFAQs();
  }, [eventId]);

  async function fetchFAQs() {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at');

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('faqs')
        .insert([{
          event_id: eventId,
          ...newFAQ
        }]);

      if (error) throw error;
      
      setIsAdding(false);
      setNewFAQ({
        question: '',
        answer: ''
      });
      await fetchFAQs();
    } catch (error) {
      console.error('Error adding FAQ:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !faqs.length) {
    return <div className="text-center py-4">Loading FAQs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <HelpCircle className="h-6 w-6 mr-2" />
          Frequently Asked Questions
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Question</label>
            <input
              type="text"
              required
              value={newFAQ.question}
              onChange={e => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Answer</label>
            <textarea
              required
              rows={3}
              value={newFAQ.answer}
              onChange={e => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save FAQ'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {faqs.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No FAQs added yet.</p>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}