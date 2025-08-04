import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BatchMode from "./pages/BatchMode";
import SingleMode from "./pages/SingleMode";
import BatchProgress from "./pages/BatchProgress";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { getApiKey } from "./lib/apiKey";
import { ApiKeyPrompt } from "./components/ApiKeyPrompt";

const queryClient = new QueryClient();

const App = () => {
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApiKey = async () => {
      const key = await getApiKey();
      if (!key) {
        setShowApiKeyPrompt(true);
      }
      setApiKey(key);
      setLoading(false);
    };
    checkApiKey();
  }, []);

  const handleApiKeyClose = async () => {
    const key = await getApiKey();
    setApiKey(key);
    setShowApiKeyPrompt(false);
  }

  if (loading) {
    return <div>Loading...</div>; // Or a proper splash screen
  }

  if (showApiKeyPrompt || !apiKey) {
    return <ApiKeyPrompt open={true} onClose={handleApiKeyClose} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/batch" element={<BatchMode />} />
            <Route path="/single" element={<SingleMode />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

