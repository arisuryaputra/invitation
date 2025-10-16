'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getTemplates, createInvitation } from '@/services/invitation.service';
import type { Template } from '@/services/invitation.service';


export default function CreateInvitationPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
        const data = await getTemplates();
        setTemplates(data);
        if (data.length > 0) {
            setSelectedTemplate(data[0].id);
        }
    };
    fetchTemplates();
  }, []);

  const handleCreate = async (body: object) => {
    setIsCreating(true);
    const newInvitation = await createInvitation(body);
    if (newInvitation && newInvitation.id) {
      router.push(`/editor/${newInvitation.id}`);
    } else {
      alert('Error creating invitation.');
      setIsCreating(false);
    }
  };

  const handleCreateFromTemplate = () => {
    if (selectedTemplate) {
      handleCreate({ templateId: selectedTemplate });
    }
  };

  const handleCreateBlank = () => {
    handleCreate({});
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
        if (json.components && Array.isArray(json.components)) {
          handleCreate({ components: json.components });
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