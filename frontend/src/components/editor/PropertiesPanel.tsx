'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PropertiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  component: any | null;
  onUpdate: (updatedProps: any) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ isOpen, onClose, component, onUpdate }) => {
  const [props, setProps] = React.useState(component?.props || {});

  React.useEffect(() => {
    // Update local state when the selected component changes
    setProps(component?.props || {});
  }, [component]);

  if (!component) {
    return null;
  }

  const handlePropChange = (propName: string, value: any) => {
    setProps((prev: any) => ({ ...prev, [propName]: value }));
  };

  const handleSave = () => {
    onUpdate(props);
    onClose();
  };

  const renderFields = () => {
    switch (component.type) {
      case 'countdown':
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetDate" className="text-right">
                Target Date
              </Label>
              <Input
                id="targetDate"
                type="datetime-local"
                value={(props.targetDate || '').substring(0, 16)}
                onChange={(e) => handlePropChange('targetDate', new Date(e.target.value).toISOString())}
                className="col-span-3"
              />
            </div>
          </div>
        );
      // Add cases for other components here in the future
      default:
        return <p className="py-4">This component has no editable properties.</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Properties: {component.type}</DialogTitle>
          <DialogDescription>
            Make changes to your component here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {renderFields()}
        <DialogFooter>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};