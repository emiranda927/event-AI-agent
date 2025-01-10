import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UnansweredQuestionsProps {
  eventId: string;
}

export function UnansweredQuestions({ eventId }: UnansweredQuestionsProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [eventId]);

  async function fetchQuestions() {
    try {
      const { data, error } = await supabase
        .from('unanswered_questions')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching unanswered questions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuestionStatus(id: string, status: 'answered' | 'ignored') {
    try {
      const { error } = await supabase
        .from('unanswered_questions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchQuestions();
    } catch (error) {
      console.error('Error updating question status:', error);
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No unanswered questions at this time.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <HelpCircle className="h-5 w-5 mr-2" />
        Unanswered Questions
      </h3>

      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="bg-white shadow rounded-lg p-4">
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{question.question}</p>
              {question.context && (
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium">Context:</p>
                  <pre className="mt-1 whitespace-pre-wrap">{question.context}</pre>
                </div>
              )}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => handleQuestionStatus(question.id, 'ignored')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Ignore
                </button>
                <button
                  onClick={() => handleQuestionStatus(question.id, 'answered')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark as Answered
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}