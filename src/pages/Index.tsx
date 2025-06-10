
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SymptomForm from "@/components/SymptomForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import LoadingAnimation from "@/components/LoadingAnimation";
import Header from "@/components/Header";
import TrendingSymptoms from "@/components/TrendingSymptoms";
import InfoSection from "@/components/InfoSection";
import MedicalResourcesSection from "@/components/MedicalResourcesSection";
import HealthTips from "@/components/HealthTips";
import GeminiHealthAdvisor from "@/components/GeminiHealthAdvisor";
import { Heart, Stethoscope, ClipboardList, History, Brain, Globe, Pill, Activity, MapPin, Camera, IdCard, Newspaper, ArrowLeft } from "lucide-react";
import { useSymptomHistory } from "@/hooks/use-symptom-history";
import MedicationReminders from "@/components/MedicationReminders";
import SymptomHistory from "@/components/SymptomHistory";
import { getGeminiApiKey, getHealthConditionInfo, setGeminiApiKey, availableLanguages } from "@/services/geminiService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import DrugInteractionChecker from "@/components/DrugInteractionChecker";
import HealthProgressTracker from "@/components/HealthProgressTracker";
import DoctorDirectory from "@/components/DoctorDirectory";
import MedicineScanner from "@/components/MedicineScanner";
import EmergencyInfoCard from "@/components/EmergencyInfoCard";
import HealthNewsFeed from "@/components/HealthNewsFeed";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState("symptoms");
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [preferredLanguage, setPreferredLanguage] = useState("english");
  const [targetLanguage, setTargetLanguage] = useState("english");
  const { addSymptom, history } = useSymptomHistory();
  const isMobile = useIsMobile();

  const handleSymptomSubmit = async (symptoms: string) => {
    if (symptoms.trim().length < 3) {
      toast.error("Please enter valid symptoms (at least 3 characters)");
      return;
    }

    // Check if API key is set
    if (!getGeminiApiKey()) {
      setApiKeyDialogOpen(true);
      return;
    }

    setIsLoading(true);
    setCurrentTab("results");
    
    try {
      // Get health condition data from Gemini API with language preference
      const healthData = await getHealthConditionInfo(symptoms, preferredLanguage);
      setResults(healthData);
      
      // Add to symptom history
      addSymptom(symptoms, healthData);
      
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error getting health data:", error);
      toast.error("Failed to analyze symptoms. Please try again.");
      setCurrentTab("symptoms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    setGeminiApiKey(apiKey);
    setApiKeyDialogOpen(false);
    toast.success("API key saved successfully");
    
    // Auto-submit the last entered symptoms if any
    if (history.length > 0) {
      const lastSymptom = history[0].symptom;
      handleSymptomSubmit(lastSymptom);
    }
  };

  const handleReminders = () => {
    setRemindersOpen(true);
  };

  const handleHistory = () => {
    setHistoryOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <main className="container px-3 md:px-4 py-4 md:py-8">
        <Tabs 
          value={currentTab} 
          onValueChange={setCurrentTab}
          className="w-full max-w-4xl mx-auto"
        >
          {/* Main tabs - responsive design */}
          <TabsList className="w-full mb-4 md:mb-8 bg-muted flex flex-wrap justify-center">
            <div className={`${isMobile ? 'w-full grid grid-cols-2 gap-1' : 'flex'}`}>
              <TabsTrigger value="symptoms" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-1.5 data-[state=active]:bg-white">
                <Stethoscope className="h-3 w-3 md:h-4 md:w-4" />
                <span>Check Symptoms</span>
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-1.5 data-[state=active]:bg-white" disabled={!results && !isLoading}>
                <ClipboardList className="h-3 w-3 md:h-4 md:w-4" />
                <span>Results</span>
              </TabsTrigger>
            </div>
            
            <div className={`${isMobile ? 'w-full grid grid-cols-2 gap-1 mt-1' : 'flex'}`}>
              <TabsTrigger value="ai-advisor" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-1.5 data-[state=active]:bg-white">
                <Brain className="h-3 w-3 md:h-4 md:w-4" />
                <span>AI Advisor</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-1.5 data-[state=active]:bg-white">
                <Heart className="h-3 w-3 md:h-4 md:w-4" />
                <span>Resources</span>
              </TabsTrigger>
            </div>
          </TabsList>
          
          <div className="flex flex-wrap justify-end gap-2 mb-3 md:mb-4">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-1 text-xs md:text-sm h-8 md:h-10"
              onClick={handleHistory}
            >
              <History className="h-3 w-3 md:h-4 md:w-4" />
              <span>Symptom History</span>
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-1 text-xs md:text-sm h-8 md:h-10"
              onClick={handleReminders}
            >
              <History className="h-3 w-3 md:h-4 md:w-4" />
              <span>Medication Reminders</span>
            </Button>
          </div>
          
          <TabsContent value="symptoms" className="space-y-6">
            <Card className="medical-card p-3 md:p-6 shadow-lg">
              <SymptomForm onSubmit={handleSymptomSubmit} />
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <Card className="p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentTab("drug-interaction")}>
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Pill className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  <h3 className="font-medium text-sm md:text-base">Drug Interaction Checker</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Check if your medications interact with each other</p>
              </Card>
              
              <Card className="p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentTab("health-tracker")}>
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Activity className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  <h3 className="font-medium text-sm md:text-base">Health Progress Tracker</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Track your symptoms and health metrics over time</p>
              </Card>
              
              <Card className="p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentTab("doctor-directory")}>
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                  <h3 className="font-medium text-sm md:text-base">Doctor Directory</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Find doctors and book appointments</p>
              </Card>
              
              <Card className="p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentTab("medicine-scanner")}>
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Camera className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  <h3 className="font-medium text-sm md:text-base">Medicine Scanner</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Scan medicine packaging to get info</p>
              </Card>
              
              <Card className="p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentTab("emergency-info")}>
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <IdCard className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                  <h3 className="font-medium text-sm md:text-base">Emergency Info Card</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Create emergency medical information card</p>
              </Card>
              
              <Card className="p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentTab("health-news")}>
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Newspaper className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                  <h3 className="font-medium text-sm md:text-base">Health News</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Latest health news and articles</p>
              </Card>
            </div>
            
            <TrendingSymptoms onSelect={(symptom) => {
              // Auto-fill the form and trigger search
              handleSymptomSubmit(symptom);
            }} />
            
            <InfoSection />
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4 md:space-y-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-4 md:py-8">
                <LoadingAnimation />
                <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-500">
                  Analyzing symptoms...
                </p>
              </div>
            ) : results ? (
              <ResultsDisplay results={results} />
            ) : (
              <div className="text-center p-4 md:p-8">
                <p className="text-xs md:text-sm text-gray-500">No results to display yet. Check your symptoms first.</p>
                <Button 
                  onClick={() => setCurrentTab("symptoms")} 
                  variant="link"
                  className="mt-2 text-xs md:text-sm"
                >
                  Go to symptom checker
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-advisor" className="space-y-4 md:space-y-8">
            <GeminiHealthAdvisor />
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4 md:space-y-8">
            <MedicalResourcesSection />
            <HealthTips />
          </TabsContent>

          {/* Feature tabs with back buttons */}
          {["drug-interaction", "health-tracker", "doctor-directory", 
            "medicine-scanner", "emergency-info", "health-news"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-3 md:space-y-4">
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm h-8 md:h-10"
                onClick={() => setCurrentTab("symptoms")}
              >
                <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" /> Back to Dashboard
              </Button>
              
              {tabValue === "drug-interaction" && <DrugInteractionChecker />}
              {tabValue === "health-tracker" && <HealthProgressTracker />}
              {tabValue === "doctor-directory" && <DoctorDirectory />}
              {tabValue === "medicine-scanner" && <MedicineScanner />}
              {tabValue === "emergency-info" && <EmergencyInfoCard />}
              {tabValue === "health-news" && <HealthNewsFeed />}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Enter Gemini API Key</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              This key is required to use the symptom analyzer and Gemini AI features. You can get an API key from the Google AI Studio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your Gemini API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="text-xs md:text-sm h-8 md:h-10"
              />
              <p className="text-[10px] md:text-xs text-gray-500">
                Your API key is only stored in your browser and is never sent to our servers.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setApiKeyDialogOpen(false)} 
                size={isMobile ? "sm" : "default"}
                className="text-xs md:text-sm h-8 md:h-10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApiKeySave}
                size={isMobile ? "sm" : "default"}
                className="text-xs md:text-sm h-8 md:h-10"
              >
                Save & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <MedicationReminders
        isOpen={remindersOpen}
        onClose={() => setRemindersOpen(false)}
        recommendedMedicine={results?.["Recommended Medicine"] || ""}
      />

      <SymptomHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectSymptom={(symptom) => {
          handleSymptomSubmit(symptom);
          setHistoryOpen(false);
        }}
      />
    </div>
  );
};

export default Index;
