import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// 1. UPDATE THE PROPS INTERFACE
// The parent component expects an object, not a string.
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (response: { dataset_id: string }) => void; 
}

export const UploadModal = ({ isOpen, onClose, onSuccess }: UploadModalProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .zip file containing your dataset.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${import.meta.env.VITE_FLASK_API_BASE_URL}/api/upload`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUploadStatus('success');
      toast({
        title: "Dataset uploaded successfully!",
        description: "You can now start analyzing your data.",
        className: "bg-success text-success-foreground",
      });

      setTimeout(() => {
        // 2. UPDATE THE onSuccess CALL
        // Pass the entire response data object as required by the parent.
        onSuccess(response.data); 
        
        onClose();
        setUploadStatus('idle');
      }, 1500);

    } catch (error) {
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: "There was an error uploading your dataset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast, onSuccess, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
    },
    multiple: false,
    disabled: isUploading,
  });

  const handleClose = () => {
    if (!isUploading) {
      onClose();
      setUploadStatus('idle');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Dataset
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
              transition-all duration-300 ease-in-out
              ${isDragActive 
                ? 'border-primary bg-primary/10 scale-105' 
                : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5'
              }
              ${isUploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
              ${uploadStatus === 'success' ? 'border-success bg-success/10' : ''}
              ${uploadStatus === 'error' ? 'border-destructive bg-destructive/10' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="space-y-6">
              {uploadStatus === 'success' ? (
                <CheckCircle className="h-16 w-16 mx-auto text-success animate-scale-in" />
              ) : uploadStatus === 'error' ? (
                <AlertCircle className="h-16 w-16 mx-auto text-destructive animate-scale-in" />
              ) : (
                <Upload className={`h-16 w-16 mx-auto transition-all duration-200 ${
                  isDragActive 
                    ? 'text-primary scale-110' 
                    : 'text-muted-foreground hover:text-primary'
                }`} />
              )}

              <div className="space-y-3">
                {uploadStatus === 'success' ? (
                  <>
                    <p className="text-success font-semibold text-lg">Dataset uploaded successfully!</p>
                    <p className="text-muted-foreground text-sm">Redirecting to chat...</p>
                  </>
                ) : uploadStatus === 'error' ? (
                  <>
                    <p className="text-destructive font-semibold text-lg">Upload failed</p>
                    <p className="text-muted-foreground text-sm">Please try again with a valid .zip file</p>
                  </>
                ) : isUploading ? (
                  <>
                    <p className="text-foreground font-semibold text-lg">Uploading your dataset...</p>
                    <div className="flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-foreground font-semibold text-lg">
                      {isDragActive ? 'Drop your dataset here' : 'Drag & drop your dataset'}
                    </p>
                    <p className="text-muted-foreground">
                      or click to browse files
                    </p>
                    <div className="inline-flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-xs text-muted-foreground font-medium">ZIP files only</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {uploadStatus === 'idle' && !isUploading && (
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};