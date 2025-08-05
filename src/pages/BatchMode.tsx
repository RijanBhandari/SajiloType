import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Camera, Image as ImageIcon, Plus, Trash2, Share2, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource, GalleryPhotos } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { generateOcrTranscript, correctTranscript } from "@/lib/gemini";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

type ImageStatus = 'pending' | 'processing' | 'done' | 'error';

interface ProcessImage {
  id: string;
  file: File;
  path: string;
  status: ImageStatus;
  transcript?: string;
  error?: string;
}

const BatchMode = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [images, setImages] = useState<ProcessImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [combinedTranscript, setCombinedTranscript] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);

  const addImages = async (source: CameraSource) => {
    try {
      let photos: GalleryPhotos | { photos: { webPath: string; path: string; format: string }[] };
      if (source === CameraSource.Photos) {
        photos = await CapacitorCamera.pickImages({
          quality: 90,
        });
      } else {
        const photo = await CapacitorCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source,
        });
        photos = { photos: photo ? [photo] : [] };
      }

      const newImages: ProcessImage[] = await Promise.all(photos.photos.map(async (photo) => {
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        const file = new File([blob], `image-${Date.now()}.${photo.format}`, { type: `image/${photo.format}` });
        return {
          id: `id-${Date.now()}-${Math.random()}`,
          file,
          path: photo.webPath,
          status: 'pending',
        };
      }));

      setImages(prev => [...prev, ...newImages]);
      setShowActions(false);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not select images.", variant: "destructive" });
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const startProcessing = async () => {
    if (images.length === 0) return;

    setProcessing(true);
    setCombinedTranscript(null);

    let fullTranscript = "";

    for (const image of images) {
      setImages(prev => prev.map(img => img.id === image.id ? { ...img, status: 'processing' } : img));
      try {
        const ocrResult = await generateOcrTranscript(image.file);
        const correctedResult = await correctTranscript(ocrResult);
        fullTranscript += correctedResult + "\n\n---\n\n";
        setImages(prev => prev.map(img => img.id === image.id ? { ...img, status: 'done', transcript: correctedResult } : img));
      } catch (e: any) {
        setImages(prev => prev.map(img => img.id === image.id ? { ...img, status: 'error', error: e.message } : img));
      }
    }

    setCombinedTranscript(fullTranscript.trim());
    setProcessing(false);
    toast({ title: "Batch Processing Complete", description: "All images have been processed." });
  };
  
  const handleSendToPC = async () => {
    if (!combinedTranscript) return;
    try {
      const response = await fetch('http://YOUR_LAPTOP_IP:5000/type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: combinedTranscript }),
      });

      if (response.ok) {
        toast({ title: "Sent to PC!", description: "Transcript sent to your laptop's keyboard." });
      } else {
        const errorData = await response.json();
        toast({ title: "Send Failed", description: `Could not send to PC: ${errorData.error || response.statusText}`, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Send Failed", description: `Network error: ${e.message}`, variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (!combinedTranscript) return;
    try {
      await Share.share({ title: 'Share Batch Transcript', text: combinedTranscript });
    } catch (e) {
      toast({ title: "Share Failed", description: "Could not share the transcript.", variant: "destructive" });
    }
  };

  const getProgress = () => {
    if (images.length === 0) return 0;
    const doneCount = images.filter(img => img.status === 'done' || img.status === 'error').length;
    return (doneCount / images.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <div className="bg-gradient-hero text-white py-6">
        <div className="max-w-md mx-auto px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Batch Mode</h1>
          </div>
          <p className="text-white/90 text-sm mt-2 ml-12">Select multiple images to process in a batch.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 pb-40">
        {images.length === 0 && !combinedTranscript ? (
          <Card className="p-8 text-center bg-gradient-card shadow-card border-0">
            <div className="text-muted-foreground mb-4">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No Images Selected</h3>
              <p className="text-sm">Tap the + button to add images</p>
            </div>
          </Card>
        ) : !combinedTranscript && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Selected Images</h3>
              <span className="text-sm text-muted-foreground">{images.length} image(s)</span>
            </div>
            
            {images.map((image) => (
              <Card key={image.id} className="p-4 bg-gradient-card shadow-card border-0">
                <div className="flex items-center gap-4">
                  <img src={image.path} alt="selected" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{image.file.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {image.status === 'pending' && <><Loader2 className="h-4 w-4 animate-spin" /><span>Pending</span></>}
                      {image.status === 'processing' && <><Loader2 className="h-4 w-4 animate-spin text-primary" /><span>Processing...</span></>}
                      {image.status === 'done' && <><CheckCircle className="h-4 w-4 text-green-500" /><span>Done</span></>}
                      {image.status === 'error' && <><AlertCircle className="h-4 w-4 text-red-500" /><span>Error</span></>}
                    </div>
                  </div>
                  {!processing && (
                    <Button variant="ghost" size="icon" onClick={() => removeImage(image.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {image.status === 'error' && <p className="text-xs text-red-500 mt-2">{image.error}</p>}
              </Card>
            ))}
          </div>
        )}

        {combinedTranscript && (
            <Card className="p-4 bg-gradient-card shadow-card border-0 mt-6">
                <h3 className="font-semibold text-lg mb-2 text-center">Combined Transcript</h3>
                <Textarea value={combinedTranscript} readOnly rows={15} className="bg-background/50" />
                <div className="flex gap-2 mt-4">
                    <Button onClick={handleSendToPC} className="w-full">Send to PC</Button>
                    <Button onClick={handleShare} className="w-full"><Share2 className="h-4 w-4 mr-2" />Share</Button>
                </div>
                <Button onClick={() => { setImages([]); setCombinedTranscript(null); }} variant="outline" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Batch
                </Button>
            </Card>
        )}
      </div>

      {/* Floating Action Button */}
      {!processing && !combinedTranscript && (
        <div className="fixed bottom-24 right-6">
            {showActions && (
            <div className="absolute bottom-16 right-0 space-y-3 animate-scale-in">
                <Button variant="fab" size="fab" onClick={() => addImages(CameraSource.Camera)} className="shadow-glow"><Camera className="h-6 w-6" /></Button>
                <Button variant="fab" size="fab" onClick={() => addImages(CameraSource.Photos)} className="shadow-glow"><ImageIcon className="h-6 w-6" /></Button>
            </div>
            )}
            <Button variant="fab" size="fab" onClick={() => setShowActions(!showActions)} className={`transform transition-transform duration-300 ${showActions ? 'rotate-45' : ''}`}><Plus className="h-6 w-6" /></Button>
        </div>
      )}

      {/* Bottom Action */}
      {images.length > 0 && !combinedTranscript && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t p-6">
          <div className="max-w-md mx-auto">
            {processing && <Progress value={getProgress()} className="mb-4" />}
            <Button onClick={startProcessing} className="w-full" size="lg" disabled={processing}>
              {processing ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processing...</> : `Start Processing (${images.length} images)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchMode;
