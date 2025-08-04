import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { FileText, Image, Layers, Zap } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <div className="bg-gradient-hero text-white py-8">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Nepali OCR to Docs</h1>
          </div>
          <p className="text-white/90 text-sm">
            Convert handwritten or printed Nepali text to text files instantly
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* Mode Selection Cards */}
        <div className="space-y-4">
          <Card 
            className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer transform hover:scale-105 border-0"
            onClick={() => navigate("/batch")}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-full">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">Batch Mode</h3>
                <p className="text-muted-foreground text-sm">
                  Process multiple images at once
                </p>
              </div>
              <div className="text-primary">
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer transform hover:scale-105 border-0"
            onClick={() => navigate("/single")}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-full">
                <Image className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">Single Mode</h3>
                <p className="text-muted-foreground text-sm">
                  Process one image at a time
                </p>
              </div>
              <div className="text-primary">
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-center text-foreground">Features</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-success mb-1">✓</div>
              <p className="text-muted-foreground">Nepali Text Recognition</p>
            </div>
            <div className="text-center">
              <div className="text-success mb-1">✓</div>
              <p className="text-muted-foreground">File Sharing</p>
            </div>
            <div className="text-center">
              <div className="text-success mb-1">✓</div>
              <p className="text-muted-foreground">Batch Processing</p>
            </div>
            <div className="text-center">
              <div className="text-success mb-1">✓</div>
              <p className="text-muted-foreground">High Accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;