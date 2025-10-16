'use client';

import React, { useState } from 'react';

interface GuestBookProps {}

interface Comment {
  name: string;
  message: string;
  timestamp: string;
}

const GuestBook: React.FC<GuestBookProps> = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && message) {
      const newComment = {
        name,
        message,
        timestamp: new Date().toLocaleString(),
      };
      setComments([newComment, ...comments]);
      setName('');
      setMessage('');
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-md bg-white text-gray-800 w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-center mb-4">Guest Book & RSVP</h3>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message / Wishes
          </label>
          <textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Send Message
        </button>
      </form>
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="font-semibold">{comment.name}</p>
              <p className="text-gray-600">{comment.message}</p>
              <p className="text-xs text-gray-400 mt-1">{comment.timestamp}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default GuestBook;