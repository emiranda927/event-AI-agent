import React, { useState, useEffect } from 'react';
import { Plus, Users, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Guest = {
  id: string;
  name: string;
  phone_number: string | null;
  email: string | null;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  dietary_restrictions: string | null;
  plus_one: boolean;
};

interface GuestListProps {
  eventId: string;
}

export function GuestList({ eventId }: GuestListProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    phone_number: '',
    email: '',
    dietary_restrictions: '',
    plus_one: false
  });

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

  async function fetchGuests() {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('event_id', eventId)
        .order('name');

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('guests')
        .insert([{
          event_id: eventId,
          ...newGuest,
          rsvp_status: 'pending'
        }]);

      if (error) throw error;
      
      setIsAdding(false);
      setNewGuest({
        name: '',
        phone_number: '',
        email: '',
        dietary_restrictions: '',
        plus_one: false
      });
      await fetchGuests();
    } catch (error) {
      console.error('Error adding guest:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this guest?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRSVPChange(id: string, status: Guest['rsvp_status']) {
    try {
      const { error } = await supabase
        .from('guests')
        .update({ rsvp_status: status })
        .eq('id', id);

      if (error) throw error;
      await fetchGuests();
    } catch (error) {
      console.error('Error updating RSVP status:', error);
    }
  }

  if (loading && !guests.length) {
    return <div className="text-center py-4">Loading guest list...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Guest List
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Guest
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={newGuest.name}
                onChange={e => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={newGuest.phone_number}
                onChange={e => setNewGuest(prev => ({ ...prev, phone_number: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={newGuest.email}
                onChange={e => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dietary Restrictions</label>
              <input
                type="text"
                value={newGuest.dietary_restrictions}
                onChange={e => setNewGuest(prev => ({ ...prev, dietary_restrictions: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newGuest.plus_one}
                  onChange={e => setNewGuest(prev => ({ ...prev, plus_one: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Allow Plus One</span>
              </label>
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
              {loading ? 'Adding...' : 'Add Guest'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RSVP Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dietary Restrictions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 <boltAction type="file" filePath="src/components/GuestList.tsx">              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plus One</th>
              <th className="px-6 py-3 relative">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {guests.map((guest) => (
              <tr key={guest.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {guest.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {guest.email && <div>{guest.email}</div>}
                  {guest.phone_number && <div>{guest.phone_number}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={guest.rsvp_status}
                    onChange={(e) => handleRSVPChange(guest.id, e.target.value as Guest['rsvp_status'])}
                    className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="declined">Declined</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {guest.dietary_restrictions || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {guest.plus_one ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(guest.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}