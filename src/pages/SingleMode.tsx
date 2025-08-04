import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Camera, Image as ImageIcon, Plus, Upload, CheckCircle, Share2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { generateOcrTranscript, correctTranscript } from "@/lib/gemini";
import { Textarea } from "@/components/ui/textarea";

const SingleMode = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<{ path: string; file: File } | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);

  const selectImage = async (source: CameraSource) => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source,
      });

      if (image.webPath && image.path) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `image.${image.format}`, { type: `image/${image.format}` });
        setSelectedImage({ path: image.webPath, file });
        setTranscript(null);
        setError(null);
        setShowActions(false);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Could not select image.",
        variant: "destructive",
      });
    }
  };

  const handleProcess = async () => {
    if (!selectedImage) return;

    setProcessing(true);
    setError(null);
    setTranscript(null);

    try {
      const ocrResult = await generateOcrTranscript(selectedImage.file);
      const correctedResult = await correctTranscript(ocrResult);
      setTranscript(correctedResult);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
      toast({
        title: "Processing Failed",
        description: e.message || "Could not process the image.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!transcript) return;
    try {
      const fileName = `transcript-${Date.now()}.txt`;
      const result = await Filesystem.writeFile({
        path: fileName,
        data: transcript,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      toast({
        title: "Saved!",
        description: `Transcript saved to Documents folder.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Save Failed",
        description: "Could not save the transcript.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!transcript) return;
    try {
      await Share.share({
        title: 'Share Transcript',
        text: transcript,
        dialogTitle: 'Share your transcript',
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Share Failed",
        description: "Could not share the transcript.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <div className="bg-gradient-hero text-white py-6">
        <div className="max-w-md mx-auto px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Single Mode</h1>
          </div>
          <p className="text-white/90 text-sm mt-2 ml-12">
            Capture or select one image to process instantly
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 pb-24">
        {!selectedImage ? (
          <Card className="p-8 text-center bg-gradient-card shadow-card border-0">
            <div className="text-muted-foreground mb-4">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">Select an Image</h3>
              <p className="text-sm">Tap the + button to capture or select an image with Nepali text</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Image Preview */}
            <Card className="p-4 bg-gradient-card shadow-card border-0">
              <img
                src={selectedImage.path}
                alt="Selected"
                className="w-full h-auto rounded-lg object-cover"
              />
            </Card>

            {/* Action Button */}
            {!processing && !transcript && !error && (
              <Button
                onClick={handleProcess}
                className="w-full"
                size="lg"
              >
                <Upload className="h-5 w-5 mr-2" />
                Process Image
              </Button>
            )}

            {processing && (
              <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold text-foreground mb-2">Processing Image...</h3>
                <p className="text-sm text-muted-foreground">This may take a moment...</p>
              </Card>
            )}

            {error && (
                <Card className="p-6 bg-red-500/10 shadow-card border border-red-500/20 text-center">
                    <h3 className="font-semibold text-red-500 mb-2">Processing Failed</h3>
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            {transcript && (
              <Card className="p-4 bg-gradient-card shadow-card border-0">
                <h3 className="font-semibold text-lg mb-2 text-center">Corrected Transcript</h3>
                <Textarea value={transcript} readOnly rows={10} className="bg-background/50" />
                <div className="flex gap-2 mt-4">
                    <Button onClick={handleSave} className="w-full"><Save className="h-4 w-4 mr-2" />Save</Button>
                    <Button onClick={handleShare} className="w-full"><Share2 className="h-4 w-4 mr-2" />Share</Button>
                </div>
              </Card>
            )}
            
            <Button
                onClick={() => {
                  setSelectedImage(null);
                  setTranscript(null);
                  setError(null);
                }}
                variant="outline"
                className="w-full"
            >
                <Plus className="h-4 w-4 mr-2" />
                Select Another Image
            </Button>

          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {!selectedImage && (
        <div className="fixed bottom-6 right-6">
          {showActions && (
            <div className="absolute bottom-16 right-0 space-y-3 animate-scale-in">
              <Button
                variant="fab"
                size="fab"
                onClick={() => selectImage(CameraSource.Camera)}
                className="shadow-glow"
              >
                <Camera className="h-6 w-6" />
              </Button>
              <Button
                variant="fab"
                size="fab"
                onClick={() => selectImage(CameraSource.Photos)}
                className="shadow-glow"
              >
                <ImageIcon className="h-6 w-6" />
              </Button>
            </div>
          )}
          <Button
            variant="fab"
            size="fab"
            onClick={() => setShowActions(!showActions)}
            className={`transform transition-transform duration-300 ${showActions ? 'rotate-45' : ''}`}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SingleMode;
