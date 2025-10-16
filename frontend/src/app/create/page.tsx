'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Template {
  id: string;
  name: string;
}

export default function CreateInvitationPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/templates')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0].id);
        }
      });
  }, []);

  const createInvitation = (body: object) => {
    setIsCreating(true);
    fetch('http://localhost:3001/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    .then(res => res.json())
    .then(newInvitation => {
      if (newInvitation.id) {
        router.push(`/editor/${newInvitation.id}`);
      } else {
        throw new Error('Failed to create invitation, no ID received.');
      }
    })
    .catch(err => {
      console.error("Creation failed:", err);
      alert('Error creating invitation.');
      setIsCreating(false);
    });
  };

  const handleCreateFromTemplate = () => {
    if (selectedTemplate) {
      createInvitation({ templateId: selectedTemplate });
    }
  };

  const handleCreateBlank = () => {
    createInvitation({});
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') throw new Error('Invalid file content');
        const json = JSON.parse(content);
        // Basic validation for the imported JSON structure
        if (json.components && Array.isArray(json.components)) {
          createInvitation({ components: json.components });
        } else {
          alert('Invalid JSON format. The file must contain a "components" array.');
        }
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        alert('Could not read or parse the file. Please ensure it is a valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Tabs defaultValue="template" className="w-[450px]">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="template">From Template</TabsTrigger>
          <TabsTrigger value="blank">Start Blank</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Create from Template</CardTitle>
              <CardDescription>Choose a pre-designed template to get started quickly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="template-select">Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate} disabled={templates.length === 0}>
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateFromTemplate} disabled={isCreating || !selectedTemplate} className="w-full">
                {isCreating ? 'Creating...' : 'Create from Template'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="blank">
          <Card>
            <CardHeader>
              <CardTitle>Start from Scratch</CardTitle>
              <CardDescription>Begin with a blank canvas and build your invitation from the ground up.</CardDescription>
            </CardHeader>
            <CardContent/>
            <CardFooter>
              <Button onClick={handleCreateBlank} disabled={isCreating} className="w-full">
                {isCreating ? 'Creating...' : 'Create Blank Invitation'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import from File</CardTitle>
              <CardDescription>Load a previously exported invitation design from a JSON file.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                <Input type="file" ref={fileInputRef} accept=".json" className="hidden" onChange={handleFileChange} />
                <Button onClick={() => fileInputRef.current?.click()} disabled={isCreating} className="w-full">
                    Choose JSON File
                </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}