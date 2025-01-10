import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Calendar, Users, MessageSquare, BellRing, Settings } from 'lucide-react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { EventDetails } from './components/EventDetails';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { session } = useAuth();

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">AI Event Agent</span>
                <span className="block text-indigo-600">Your Digital Event Assistant</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Create intelligent chatbots for your events that can answer guest questions, 
                provide updates, and manage RSVPs - all through group chat.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Calendar, text: 'Manage multiple events seamlessly' },
                  { icon: Users, text: 'Handle guest inquiries automatically' },
                  { icon: MessageSquare, text: 'Real-time group chat integration' },
                  { icon: BellRing, text: 'Smart notifications and reminders' },
                  { icon: Settings, text: 'Customizable AI responses' },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <p className="ml-3 text-base text-gray-500">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-lg sm:overflow-hidden">
                <div className="px-4 py-8 sm:px-10">
                  <Auth />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}