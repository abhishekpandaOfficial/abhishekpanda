import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhotoUploadProps {
  currentPhoto: string | null;
  memberId: string;
  memberName: string;
  onPhotoUploaded: (url: string) => void;
}

export const PhotoUpload = ({ 
  currentPhoto, 
  memberId, 
  memberName,
  onPhotoUploaded 
}: PhotoUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getCroppedImage = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!previewUrl || !canvasRef.current) {
        resolve(null);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, size, size);
        
        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        
        const aspectRatio = img.width / img.height;
        let drawWidth, drawHeight;
        
        if (aspectRatio > 1) {
          drawHeight = size;
          drawWidth = size * aspectRatio;
        } else {
          drawWidth = size;
          drawHeight = size / aspectRatio;
        }
        
        ctx.drawImage(
          img,
          -drawWidth / 2 + position.x / zoom,
          -drawHeight / 2 + position.y / zoom,
          drawWidth,
          drawHeight
        );
        
        ctx.restore();
        
        // Create circular clip
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.beginPath();
          tempCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          tempCtx.closePath();
          tempCtx.clip();
          tempCtx.drawImage(canvas, 0, 0);
          
          tempCanvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.9);
        } else {
          resolve(null);
        }
      };
      img.src = previewUrl;
    });
  }, [previewUrl, zoom, rotation, position]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to upload photos");
        setIsUploading(false);
        return;
      }

      const croppedBlob = await getCroppedImage();
      if (!croppedBlob) {
        toast.error("Failed to process image");
        setIsUploading(false);
        return;
      }

      const fileName = `${user.id}/${memberId}-${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('family-photos')
        .upload(fileName, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('family-photos')
        .getPublicUrl(data.path);

      onPhotoUploaded(publicUrl);
      toast.success("Photo uploaded successfully");
      handleClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <>
      <Button
        size="icon"
        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Camera className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Upload Photo for {memberName}
            </DialogTitle>
            <DialogDescription>
              Select and crop a photo for the family tree
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Hidden canvas for cropping */}
            <canvas ref={canvasRef} className="hidden" />

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Preview Area */}
            <div className="relative mx-auto">
              <div 
                className="w-64 h-64 mx-auto rounded-full overflow-hidden bg-muted/50 border-2 border-dashed border-border flex items-center justify-center cursor-move relative"
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="absolute select-none pointer-events-none"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                      transformOrigin: 'center',
                      maxWidth: 'none',
                      width: 'auto',
                      height: '100%',
                    }}
                    draggable={false}
                  />
                ) : currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt="Current"
                    className="w-full h-full object-cover opacity-50"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No photo selected</p>
                  </div>
                )}
              </div>
              
              {/* Circular overlay guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 rounded-full border-4 border-primary/30" />
              </div>
            </div>

            {/* Controls */}
            {previewUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Zoom Control */}
                <div className="flex items-center gap-3">
                  <ZoomOut className="w-4 h-4 text-muted-foreground" />
                  <Slider
                    value={[zoom]}
                    min={0.5}
                    max={3}
                    step={0.1}
                    onValueChange={([value]) => setZoom(value)}
                    className="flex-1"
                  />
                  <ZoomIn className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Rotation Control */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation((r) => r - 90)}
                    className="border-border/50"
                  >
                    <RotateCw className="w-4 h-4 mr-1 transform -scale-x-100" />
                    -90°
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation((r) => r + 90)}
                    className="border-border/50"
                  >
                    <RotateCw className="w-4 h-4 mr-1" />
                    +90°
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setZoom(1);
                      setRotation(0);
                      setPosition({ x: 0, y: 0 });
                    }}
                    className="border-border/50"
                  >
                    Reset
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Upload Button */}
            <Button
              variant="outline"
              className="w-full border-dashed border-2 h-12"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {previewUrl ? "Choose Different Photo" : "Select Photo"}
            </Button>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!previewUrl || isUploading}
              className="bg-gradient-to-r from-pink-500 to-rose-600"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Photo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoUpload;
