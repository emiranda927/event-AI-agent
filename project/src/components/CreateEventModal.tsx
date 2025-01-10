import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    start_time: '',
    end_time: '',
    location_name: '',
    location_address: '',
    location_map_link: '',
    parking_instructions: '',
    dress_code: '',
    gift_registry_link: '',
    ai_tone: 'formal',
    response_style: 'detailed'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('events')
        .insert([{
          ...formData,
          user_id: user.id
        }]);

      if (error) throw error;
      onClose();
      // Reset form data
      setFormData({
        name: '',
        date: '',
        start_time: '',
        end_time: '',
        location_name: '',
        location_address: '',
        location_map_link: '',
        parking_instructions: '',
        dress_code: '',
        gift_registry_link: '',
        ai_tone: 'formal',
        response_style: 'detailed'
      });
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.message || 'Error creating event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  required
                  value={formData.start_time}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                <input
                  type="text"
                  name="location_name"
                  required
                  value={formData.location_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Venue Address</label>
                <input
                  type="text"
                  name="location_address"
                  required
                  value={formData.location_address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Map Link</label>
                <input
                  type="url"
                  name="location_map_link"
                  value={formData.location_map_link}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Parking Instructions</label>
                <textarea
                  name="parking_instructions"
                  value={formData.parking_instructions}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dress Code</label>
                <input
                  type="text"
                  name="dress_code"
                  value={formData.dress_code}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gift Registry Link</label>
                <input
                  type="url"
                  name="gift_registry_link"
                  value={formData.gift_registry_link}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">AI Tone</label>
                <select
                  name="ai_tone"
                  value={formData.ai_tone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="humorous">Humorous</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Response Style</label>
                <select
                  name="response_style"
                  value={formData.response_style}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="detailed">Detailed</option>
                  <option value="brief">Brief</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}