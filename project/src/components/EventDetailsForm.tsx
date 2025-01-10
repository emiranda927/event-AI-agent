import React, { useState } from 'react';
import { MapPin, Clock, Calendar, Car, Gift, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EventDetailsFormProps {
  event: any;
  onUpdate: () => void;
}

export function EventDetailsForm({ event, onUpdate }: EventDetailsFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: event.name,
    date: event.date,
    start_time: event.start_time,
    end_time: event.end_time || '',
    location_name: event.location_name,
    location_address: event.location_address,
    location_map_link: event.location_map_link || '',
    parking_instructions: event.parking_instructions || '',
    dress_code: event.dress_code || '',
    gift_registry_link: event.gift_registry_link || '',
    ai_tone: event.ai_tone,
    response_style: event.response_style
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('events')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', event.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Basic Information
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label className="block text-sm font-medium text-gray-700">Event Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <div className="mt-1 flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <div className="mt-1 flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="time"
                  name="start_time"
                  required
                  value={formData.start_time}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <div className="mt-1 flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location Details
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Venue Name</label>
              <input
                type="text"
                name="location_name"
                required
                value={formData.location_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="location_address"
                required
                value={formData.location_address}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Map Link</label>
              <input
                type="url"
                name="location_map_link"
                value={formData.location_map_link}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Parking Instructions
                </div>
              </label>
              <textarea
                name="parking_instructions"
                rows={3}
                value={formData.parking_instructions}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter parking details, fees, or special instructions..."
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Dress Code</label>
              <input
                type="text"
                name="dress_code"
                value={formData.dress_code}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Formal, Casual, Black Tie"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Gift Registry Link
                </div>
              </label>
              <input
                type="url"
                name="gift_registry_link"
                value={formData.gift_registry_link}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="https://..."
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">AI Tone</label>
              <select
                name="ai_tone"
                value={formData.ai_tone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Response Style</label>
              <select
                name="response_style"
                value={formData.response_style}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="detailed">Detailed</option>
                <option value="brief">Brief</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}