
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceInputProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (transcript: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  isOpen,
  onClose,
  onTranscript,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize speech recognition when component mounts
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast.error('Error with speech recognition. Please try again.');
        stopRecording();
      };
      
      setRecognition(recognitionInstance);
    }
    
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore errors when stopping on unmount
        }
      }
    };
  }, []);

  const startRecording = () => {
    if (recognition) {
      try {
        recognition.start();
        setIsRecording(true);
        setTranscript("");
        toast.info("Listening for symptoms...");
      } catch (error) {
        console.error('Error starting recording:', error);
        toast.error("Couldn't start recording. Please try again.");
      }
    } else {
      toast.error("Speech recognition not supported in your browser");
    }
  };

  const stopRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      onClose();
    } else {
      toast.error("Please speak to describe your symptoms first");
    }
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-medical-primary" />
            Voice Symptom Input
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-6">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isRecording ? "bg-red-100 animate-pulse" : "bg-gray-100"
            }`}
          >
            <Button
              variant="ghost"
              size="lg"
              className={`w-20 h-20 rounded-full ${
                isRecording ? "bg-red-500 text-white hover:bg-red-600" : "bg-medical-primary text-white hover:bg-medical-primary/90"
              }`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
          </div>

          <div className="w-full px-4 py-3 border rounded-lg min-h-[100px] bg-gray-50">
            {transcript ? (
              <p className="text-gray-800">{transcript}</p>
            ) : (
              <p className="text-gray-400 italic">
                {isRecording ? "Listening..." : "Press the microphone button and describe your symptoms..."}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!transcript.trim()}
              className="bg-medical-secondary hover:bg-medical-secondary/90"
            >
              Use This Description
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceInput;
