import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Key, ExternalLink } from "lucide-react";
import { getApiKey, setApiKey } from "@/lib/apiKey";
import { useToast } from "@/components/ui/use-toast";

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

const ApiKeySetup = ({ onApiKeySet }: ApiKeySetupProps) => {
  const [apiKey, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingApiKey();
  }, []);

  const checkExistingApiKey = async () => {
    try {
      const existingKey = await getApiKey();
      if (existingKey) {
        onApiKeySet();
      }
    } catch (error) {
      console.error("Error checking API key:", error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await setApiKey(apiKey.trim());
      toast({
        title: "Success",
        description: "API key saved successfully!",
      });
      onApiKeySet();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-6 bg-gradient-card shadow-card border-0">
        <div className="text-center mb-6">
          <Key className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Setup Required</h2>
          <p className="text-muted-foreground">
            To use OCR functionality, you need to provide a Gemini AI API key
          </p>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            <div className="space-y-2">
              <p>To get your free Gemini API key:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Visit Google AI Studio</li>
                <li>Sign in with your Google account</li>
                <li>Create a new API key</li>
                <li>Copy and paste it below</li>
              </ol>
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => window.open("https://makersuite.google.com/app/apikey", "_blank")}
              >
                Get API Key <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSaveApiKey}
            disabled={isLoading || !apiKey.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Saving..." : "Save API Key"}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Your API key is stored securely on your device and never shared
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ApiKeySetup;
