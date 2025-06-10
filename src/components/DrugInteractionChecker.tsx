
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pill, AlertCircle, Check, X, Plus, Trash } from "lucide-react";
import { askGemini, getGeminiApiKey } from "@/services/geminiService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadingAnimation from "./LoadingAnimation";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "severe" | "moderate" | "mild" | "none";
  description: string;
  recommendation: string;
}

const DrugInteractionChecker = () => {
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState(getGeminiApiKey());

  const handleAddMedication = () => {
    if (!newMedication.trim()) {
      toast.error("Please enter a medication name");
      return;
    }

    if (medications.includes(newMedication.trim())) {
      toast.error("This medication is already in your list");
      return;
    }

    setMedications([...medications, newMedication.trim()]);
    setNewMedication("");
    toast.success(`Added ${newMedication} to your list`);
  };

  const handleRemoveMedication = (med: string) => {
    setMedications(medications.filter(m => m !== med));
    toast.info(`Removed ${med} from your list`);
  };

  const checkInteractions = async () => {
    if (medications.length < 2) {
      toast.error("Please add at least two medications to check for interactions");
      return;
    }

    if (!getGeminiApiKey()) {
      setApiKeyDialogOpen(true);
      return;
    }

    setIsLoading(true);
    setInteractions([]);

    try {
      const prompt = `I need to check drug interactions between these medications: ${medications.join(", ")}. 
      
      For each possible pair of drugs, provide information about potential interactions in this JSON format:
      
      [
        {
          "drug1": "Drug Name 1",
          "drug2": "Drug Name 2",
          "severity": "severe|moderate|mild|none",
          "description": "Description of the interaction",
          "recommendation": "Recommendation for the patient"
        },
        ...more pairs
      ]
      
      IMPORTANT: Return ONLY valid JSON with this exact structure. Do not add any explanations outside the JSON.`;

      const response = await askGemini(prompt);
      
      // Extract JSON from the response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                        response.match(/```\s*([\s\S]*?)\s*```/) || 
                        [null, response];
      
      const jsonStr = jsonMatch[1] || response;
      
      // Parse the interaction data
      try {
        const interactionData = JSON.parse(jsonStr);
        setInteractions(interactionData);
        
        // Count severe interactions
        const severeCount = interactionData.filter(
          (interaction: DrugInteraction) => interaction.severity === "severe"
        ).length;
        
        if (severeCount > 0) {
          toast.error(`Found ${severeCount} severe drug interactions!`);
        } else {
          toast.success("Interaction check completed");
        }
        
      } catch (parseError) {
        console.error("Error parsing interaction data:", parseError);
        toast.error("Error processing interaction results");
      }
    } catch (error) {
      console.error("Error checking interactions:", error);
      toast.error("Failed to check drug interactions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    // Save API key
    // This would typically be handled by a service in a real app
    localStorage.setItem("geminiApiKey", apiKey);
    setApiKeyDialogOpen(false);
    toast.success("API key saved successfully");
    
    // Auto-check interactions if medications are entered
    if (medications.length >= 2) {
      checkInteractions();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return "bg-red-100 border-red-500 text-red-800";
      case "moderate":
        return "bg-orange-100 border-orange-500 text-orange-800";
      case "mild":
        return "bg-yellow-100 border-yellow-500 text-yellow-800";
      case "none":
        return "bg-green-100 border-green-500 text-green-800";
      default:
        return "bg-gray-100 border-gray-500 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "severe":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "moderate":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "mild":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "none":
        return <Check className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-6 w-6" />
            <span>Drug Interaction Checker</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Your Medications</h3>
              <p className="text-sm text-gray-500 mb-4">
                Add the medications you're taking to check for potential interactions.
              </p>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter medication name..."
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  className="flex-grow"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMedication();
                    }
                  }}
                />
                <Button onClick={handleAddMedication}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              {medications.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {medications.map((med) => (
                    <Badge key={med} className="px-2 py-1 flex items-center gap-1">
                      <span>{med}</span>
                      <button 
                        onClick={() => handleRemoveMedication(med)}
                        className="ml-1 rounded-full hover:bg-red-200 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">No medications added yet.</p>
              )}
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={checkInteractions} 
                  disabled={medications.length < 2 || isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Check Interactions
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingAnimation />
                <p className="mt-4 text-sm text-gray-500">Analyzing drug interactions...</p>
              </div>
            ) : interactions.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Interaction Results</h3>
                <div className="space-y-4">
                  {interactions.map((interaction, index) => (
                    <Card 
                      key={index} 
                      className={`border-l-4 ${getSeverityColor(interaction.severity)}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getSeverityIcon(interaction.severity)}
                              <h4 className="font-semibold">
                                {interaction.drug1} + {interaction.drug2}
                              </h4>
                            </div>
                            <p className="text-sm mb-2">{interaction.description}</p>
                            <p className="text-sm font-medium">Recommendation:</p>
                            <p className="text-sm text-gray-700">{interaction.recommendation}</p>
                          </div>
                          <Badge 
                            variant={interaction.severity === "none" ? "outline" : "destructive"}
                            className="capitalize"
                          >
                            {interaction.severity}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}
            
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <AlertTitle>Important Disclaimer</AlertTitle>
              <AlertDescription className="text-sm">
                This tool provides information for educational purposes only. Always consult with a healthcare 
                professional before making any changes to your medication regimen. Never stop taking prescribed 
                medication without medical advice.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Gemini API Key</DialogTitle>
            <DialogDescription>
              This key is required to use the drug interaction checker. You can get an API key from the Google AI Studio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your Gemini API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Your API key is only stored in your browser and is never sent to our servers.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApiKeySave}>
                Save & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrugInteractionChecker;
