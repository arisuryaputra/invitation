'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Guest Book & RSVP</CardTitle>
        <CardDescription>Leave a message and let us know you're coming!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Your Name</Label>
            <Input
              type="text"
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="message">Message / Wishes</Label>
            <Textarea
              id="message"
              placeholder="Type your message here."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
        <div className="mt-6 space-y-4">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="p-3 bg-muted rounded-md border">
                <p className="font-semibold text-card-foreground">{comment.name}</p>
                <p className="text-sm text-muted-foreground">{comment.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{comment.timestamp}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No messages yet. Be the first to comment!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestBook;