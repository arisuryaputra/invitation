'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  description: string;
}

export default function CreateInvitationPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:3001/api/templates')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch templates", err);
        setLoading(false);
      });
  }, []);

  const handleCreate = () => {
    if (!selectedTemplate) {
      alert('Please select a template.');
      return;
    }
    setIsCreating(true);
    fetch('http://localhost:3001/api/invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateId: selectedTemplate }),
    })
    .then(res => res.json())
    .then(newInvitation => {
      alert(`Invitation created! Redirecting to editor...`);
      router.push(`/editor/${newInvitation.id}`);
    })
    .catch(err => {
      console.error("Failed to create invitation", err);
      alert('Error creating invitation.');
      setIsCreating(false);
    });
  };

  if (loading) {
    return <div className="text-center p-10">Loading templates...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Create a New Invitation</h1>

        <div>
          <label htmlFor="template" className="block text-sm font-medium text-gray-700">
            Select a Template
          </label>
          <select
            id="template"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isCreating ? 'Creating...' : 'Create & Start Editing'}
          </button>
        </div>
      </div>
    </div>
  );
}