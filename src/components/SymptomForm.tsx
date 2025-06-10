
import React, { useState } from "react";
import { Search, History, MapPin, Mic, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SymptomHistory from "./SymptomHistory";
import BodySymptomMap from "./BodySymptomMap";
import VoiceInput from "./VoiceInput";
import MedicationReminders from "./MedicationReminders";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface SymptomFormProps {
  onSubmit: (symptoms: string) => void;
}

const SymptomForm: React.FC<SymptomFormProps> = ({ onSubmit }) => {
  const [symptoms, setSymptoms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [bodyMapOpen, setBodyMapOpen] = useState(false);
  const [voiceInputOpen, setVoiceInputOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const exampleSymptoms = [
    "Headache and fever",
    "Sore throat and cough",
    "Upset stomach and nausea",
    "Joint pain and swelling",
    "Rash and itching",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoading(true);
    
    // Call the parent's onSubmit function after a short delay to show loading animation
    setTimeout(() => {
      onSubmit(symptoms);
      setLoading(false);
    }, 800);
    
    // Reset submitting state after a short delay
    setTimeout(() => setIsSubmitting(false), 500);
  };

  const handleBodyPartSelect = (bodyPart: string) => {
    const symptomPrefix = `Pain or discomfort in my ${bodyPart.toLowerCase()}`;
    setSymptoms(symptomPrefix);
    toast.info(`Selected body part: ${bodyPart}`);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-1 md:space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Symptom Checker</h2>
        <p className="text-sm md:text-base text-gray-600">
          Describe your symptoms in detail for the most accurate analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="symptoms">What symptoms are you experiencing?</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="symptoms"
              className="pl-10 medical-input text-sm md:text-base"
              placeholder="e.g., headache and fever for 2 days"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <Button 
            type="button" 
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="flex items-center gap-1 px-2 md:px-3 h-8 md:h-10"
            onClick={() => setHistoryOpen(true)}
          >
            <History className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">History</span>
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            className="flex items-center gap-1 px-2 md:px-3 h-8 md:h-10"
            onClick={() => setBodyMapOpen(true)}
          >
            <MapPin className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Body Map</span>
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="flex items-center gap-1 px-2 md:px-3 h-8 md:h-10"
            onClick={() => setVoiceInputOpen(true)}
          >
            <Mic className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Voice</span>
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="flex items-center gap-1 px-2 md:px-3 h-8 md:h-10"
            onClick={() => setRemindersOpen(true)}
          >
            <Bell className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Reminders</span>
          </Button>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-medical-secondary hover:bg-medical-secondary/90 text-white relative overflow-hidden" 
          disabled={isSubmitting}
        >
          {loading ? (
            <div className="flex items-center justify-center w-full">
              <div className="absolute inset-0 overflow-hidden">
                <div className="h-full bg-white/20 w-5 blur-sm animate-progress"></div>
              </div>
              <span className="relative z-10 animate-pulse flex items-center">
                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Analyzing Symptoms...
              </span>
            </div>
          ) : (
            <>Get Health Recommendations</>
          )}
        </Button>
      </form>

      <div className="pt-3 md:pt-4 border-t border-gray-100">
        <p className="text-xs md:text-sm text-gray-500 mb-2">Try examples:</p>
        <div className="flex flex-wrap gap-1 md:gap-2">
          {exampleSymptoms.map((example) => (
            <button
              key={example}
              className="px-2 md:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs md:text-sm text-gray-700 transition-colors"
              onClick={() => setSymptoms(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      
      {/* Modals */}
      <SymptomHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectSymptom={(symptom) => setSymptoms(symptom)}
      />
      
      <BodySymptomMap
        isOpen={bodyMapOpen}
        onClose={() => setBodyMapOpen(false)}
        onSelectBodyPart={handleBodyPartSelect}
      />
      
      <VoiceInput
        isOpen={voiceInputOpen}
        onClose={() => setVoiceInputOpen(false)}
        onTranscript={(transcript) => setSymptoms(transcript)}
      />
      
      <MedicationReminders
        isOpen={remindersOpen}
        onClose={() => setRemindersOpen(false)}
      />
    </div>
  );
};

export default SymptomForm;
