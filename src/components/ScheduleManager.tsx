import React, { useState, useEffect } from 'react';
import { Plus, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

type Schedule = {
  id: string;
  activity_name: string;
  start_time: string;
  end_time: string | null;
  description: string | null;
  location_detail: string | null;
};

interface ScheduleManagerProps {
  eventId: string;
}

export function ScheduleManager({ eventId }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    activity_name: '',
    start_time: '',
    end_time: '',
    description: '',
    location_detail: ''
  });

  useEffect(() => {
    fetchSchedules();
  }, [eventId]);

  async function fetchSchedules() {
    try {
      const { data, error } = await supabase
        .from('event_schedules')
        .select('*')
        .eq('event_id', eventId)
        .order('start_time');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('event_schedules')
        .insert([{
          event_id: eventId,
          ...newSchedule
        }]);

      if (error) throw error;
      
      setIsAdding(false);
      setNewSchedule({
        activity_name: '',
        start_time: '',
        end_time: '',
        description: '',
        location_detail: ''
      });
      await fetchSchedules();
    } catch (error) {
      console.error('Error adding schedule:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this schedule item?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('event_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !schedules.length) {
    return <div className="text-center py-4">Loading schedules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Event Schedule</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Activity Name</label>
              <input
                type="text"
                required
                value={newSchedule.activity_name}
                onChange={e => setNewSchedule(prev => ({ ...prev, activity_name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location Detail</label>
              <input
                type="text"
                value={newSchedule.location_detail || ''}
                onChange={e => setNewSchedule(prev => ({ ...prev, location_detail: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                required
                value={newSchedule.start_time}
                onChange={e => setNewSchedule(prev => ({ ...prev, start_time: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={newSchedule.end_time || ''}
                onChange={e => setNewSchedule(prev => ({ ...prev, end_time: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newSchedule.description || ''}
                onChange={e => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
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
              {loading ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {schedules.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No activities scheduled yet.</p>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-gray-900">{schedule.activity_name}</h3>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(`2000-01-01T${schedule.start_time}`), 'h:mm a')}
                      {schedule.end_time && ` - ${format(new Date(`2000-01-01T${schedule.end_time}`), 'h:mm a')}`}
                    </span>
                  </div>
                  {schedule.location_detail && (
                    <p className="text-sm text-gray-600">{schedule.location_detail}</p>
                  )}
                  {schedule.description && (
                    <p className="text-sm text-gray-600 mt-2">{schedule.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(schedule.id)}
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