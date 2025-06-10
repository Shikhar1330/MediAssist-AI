import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  HeartPulse, Pill, AlertTriangle, Home, ClipboardCheck,
  Search, Heart, Download, Share2, Globe
} from "lucide-react";
import { toast } from "sonner";
import { availableLanguages, translateHealthInfo } from "@/services/geminiService";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultsDisplayProps {
  results: any;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results: initialResults }) => {
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [isTranslating, setIsTranslating] = useState(false);
  const [results, setResults] = useState(initialResults);
  const [targetLanguage, setTargetLanguage] = useState('english');
  const isMobile = useIsMobile();
  
  // Effect to update results when initial results change
  useEffect(() => {
    setResults(initialResults);
  }, [initialResults]);
  
  const handleLanguageChange = async (language: string) => {
    if (language === selectedLanguage) return;
    
    // Set the target language before starting translation
    setTargetLanguage(language);
    setIsTranslating(true);
    
    try {
      // If selecting English, use the original results
      if (language === 'english') {
        setResults(initialResults);
      } else {
        // Otherwise translate the results
        const translatedResults = await translateHealthInfo(initialResults, language);
        setResults(translatedResults);
      }
      setSelectedLanguage(language);
      
      // Find the language name for the toast
      const languageName = availableLanguages.find(lang => lang.code === language)?.name || language;
      toast.success(`Information translated to ${languageName}`);
    } catch (error) {
      // Find the language name for the toast
      const languageName = availableLanguages.find(lang => lang.code === language)?.name || language;
      toast.error(`Failed to translate to ${languageName}`);
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };
  
  const downloadResults = () => {
    try {
      const resultsText = Object.entries(results)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}:\n${(value as string[]).map(item => `- ${item}`).join('\n')}`;
          }
          return `${key}: ${value}`;
        })
        .join('\n\n');
      
      const blob = new Blob([resultsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MediAssist-Results.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Results downloaded successfully");
    } catch (error) {
      toast.error("Failed to download results");
    }
  };
  
  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MediAssist AI Results',
          text: `Here are my health recommendations for ${results.Disease}`,
        });
        toast.success("Shared successfully");
      } catch (error) {
        toast.error("Failed to share results");
      }
    } else {
      toast.error("Sharing is not supported by your browser");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="medical-card overflow-hidden">
        <div className="bg-gradient-to-r from-medical-primary to-medical-accent p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <ClipboardCheck className="h-4 w-4 md:h-5 md:w-5 text-white" />
              <h3 className="text-white text-base md:text-lg font-medium">Health Assessment Results</h3>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Select
                value={selectedLanguage}
                onValueChange={handleLanguageChange}
                disabled={isTranslating}
              >
                <SelectTrigger className="h-8 md:h-9 w-full sm:w-[160px] bg-white/10 text-white border-white/20 text-xs md:text-sm">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Globe className="h-3 w-3 md:h-4 md:w-4" />
                    <SelectValue placeholder="Select Language" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableLanguages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <div className="flex gap-1 md:gap-2 ml-auto sm:ml-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:text-white/80 h-8 md:h-9"
                  onClick={downloadResults}
                >
                  <Download className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="sr-only md:not-sr-only md:ml-1 text-xs md:text-sm">Download</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:text-white/80 h-8 md:h-9"
                  onClick={shareResults}
                >
                  <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="sr-only md:not-sr-only md:ml-1 text-xs md:text-sm">Share</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {isTranslating && (
          <div className="p-3 md:p-4 bg-blue-50 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 md:h-4 md:w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs md:text-sm">Translating to {availableLanguages.find(lang => lang.code === targetLanguage)?.name || targetLanguage}...</span>
            </div>
          </div>
        )}
        
        {results.translatedLanguage && results.translatedLanguage !== 'english' && (
          <div className="px-3 md:px-4 pt-2">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Globe className="h-2 w-2 md:h-3 md:w-3" />
              Translated to {availableLanguages.find(lang => lang.code === results.translatedLanguage)?.name || results.translatedLanguage}
            </Badge>
          </div>
        )}
        
        <Tabs defaultValue="condition" className="w-full">
          <div className="p-2 md:p-3">
            <TabsList className="w-full flex flex-wrap gap-1">
              <div className={`${isMobile ? 'w-full grid grid-cols-2 gap-1' : 'flex gap-1'}`}>
                <TabsTrigger value="condition" className="text-xs md:text-sm py-1 md:py-1.5 flex-1">Condition</TabsTrigger>
                <TabsTrigger value="treatment" className="text-xs md:text-sm py-1 md:py-1.5 flex-1">Treatment</TabsTrigger>
              </div>
              
              <div className={`${isMobile ? 'w-full grid grid-cols-2 gap-1 mt-1' : 'flex gap-1'}`}>
                <TabsTrigger value="advice" className="text-xs md:text-sm py-1 md:py-1.5 flex-1">Advice</TabsTrigger>
                <TabsTrigger value="info" className="text-xs md:text-sm py-1 md:py-1.5 flex-1">Information</TabsTrigger>
              </div>
            </TabsList>
          </div>

          <TabsContent value="condition" className="m-0">
            <CardContent className="p-3 md:p-4 space-y-3 md:space-y-4">
              <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <HeartPulse className="h-4 w-4 md:h-5 md:w-5 text-medical-primary" />
                  <h4 className="font-semibold text-sm md:text-base text-gray-800">Potential Condition</h4>
                </div>
                <p className="text-xs md:text-sm text-gray-700">{results.Disease}</p>
              </div>
              
              <div className="p-3 md:p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <Search className="h-4 w-4 md:h-5 md:w-5 text-medical-accent" />
                  <h4 className="font-semibold text-sm md:text-base text-gray-800">Symptom Analysis</h4>
                </div>
                <p className="text-xs md:text-sm text-gray-700">{results['Symptom Description']}</p>
              </div>
              
              <div className="bg-yellow-50 p-3 md:p-4 rounded-lg border border-yellow-100">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-medical-warning" />
                  <h4 className="font-semibold text-sm md:text-base text-gray-800">When to Consult a Doctor</h4>
                </div>
                <p className="text-xs md:text-sm text-gray-700">{results['When to Consult a Doctor']}</p>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="treatment" className="m-0">
            <CardContent className="p-3 md:p-4 space-y-3 md:space-y-4">
              <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <Pill className="h-4 w-4 md:h-5 md:w-5 text-medical-secondary" />
                  <h4 className="font-semibold text-sm md:text-base text-gray-800">Recommended Treatment</h4>
                </div>
                <p className="text-xs md:text-sm text-gray-700">{results['Recommended Medicine']}</p>
                
                <div className="mt-2 md:mt-3">
                  <h5 className="text-xs md:text-sm font-medium text-gray-700">Dosage</h5>
                  <p className="text-xs md:text-sm text-gray-600">{results.Dosage}</p>
                </div>
              </div>
              
              <div className="p-3 md:p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <h4 className="font-semibold text-sm md:text-base text-gray-800">Alternative Medicines</h4>
                </div>
                <ul className="space-y-1">
                  {results['Alternative Medicines'].map((medicine: string, index: number) => (
                    <li key={index} className="flex items-start gap-1 md:gap-2 text-xs md:text-sm text-gray-700">
                      <span className="text-medical-primary">•</span>
                      <span>{medicine}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-50 p-3 md:p-4 rounded-lg border border-red-100">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-medical-danger" />
                  <h4 className="font-semibold text-sm md:text-base text-gray-800">Side Effects & Precautions</h4>
                </div>
                <p className="text-xs md:text-sm text-gray-700 mb-1 md:mb-2">{results.Precautions}</p>
                
                <h5 className="text-xs md:text-sm font-medium text-gray-700 mt-2 md:mt-3">Possible Side Effects:</h5>
                <ul className="space-y-1">
                  {results['Side Effects'].map((effect: string, index: number) => (
                    <li key={index} className="flex items-start gap-1 md:gap-2 text-xs md:text-sm text-gray-700">
                      <span className="text-medical-danger">•</span>
                      <span>{effect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="advice" className="m-0">
            <CardContent className="p-3 md:p-4 space-y-3 md:space-y-4">
              <div className="bg-indigo-50 p-3 md:p-4 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <Home className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                  <h4 className="font-semibold text-sm md:text-base text-gray-800">Home Remedies</h4>
                </div>
                <ul className="space-y-1">
                  {results['Home Remedies'].map((remedy: string, index: number) => (
                    <li key={index} className="flex items-start gap-1 md:gap-2 text-xs md:text-sm text-gray-700">
                      <span className="text-indigo-600">•</span>
                      <span>{remedy}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-purple-50 p-3 md:p-4 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <Heart className="h-4 w-4 md:h-5 md:w-5 text-medical-accent" />
                  <h4 className="font-semibold text-sm md:text-base text-gray-800">Lifestyle Tips</h4>
                </div>
                <ul className="space-y-1">
                  {results['Lifestyle Tips'].map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-1 md:gap-2 text-xs md:text-sm text-gray-700">
                      <span className="text-medical-accent">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="info" className="m-0">
            <CardContent className="p-3 md:p-4">
              <div className="space-y-3 md:space-y-4">
                <div className="p-3 md:p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm md:text-base text-gray-800 mb-1 md:mb-2">About Your Condition</h4>
                  <p className="text-xs md:text-sm text-gray-700">{results['Symptom Description']}</p>
                </div>
                
                <div className="bg-amber-50 p-3 md:p-4 rounded-lg border border-amber-100">
                  <h4 className="font-semibold text-sm md:text-base text-gray-800 mb-1 md:mb-2">Medical Disclaimer</h4>
                  <p className="text-xs md:text-sm text-gray-700">
                    {showFullDisclaimer 
                      ? results.Disclaimer 
                      : `${results.Disclaimer.substring(0, 80)}...`}
                  </p>
                  {!showFullDisclaimer && (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs md:text-sm text-medical-primary" 
                      onClick={() => setShowFullDisclaimer(true)}
                    >
                      Read More
                    </Button>
                  )}
                </div>
                
                <div className="text-center text-xs text-gray-500 pt-2">
                  <p>Last updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
