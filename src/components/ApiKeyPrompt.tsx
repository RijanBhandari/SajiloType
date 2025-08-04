import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { setApiKey } from '@/lib/apiKey';

interface ApiKeyPromptProps {
  open: boolean;
  onClose: () => void;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ open, onClose }) => {
  const [apiKey, setApiKeyValue] = useState('');

  const handleSave = async () => {
    if (apiKey) {
      await setApiKey(apiKey);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your Gemini API Key</DialogTitle>
          <DialogDescription>
            You can get your API key from Google AI Studio. The key will be stored securely on your device.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKeyValue(e.target.value)}
              className="col-span-3"
              type="password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
