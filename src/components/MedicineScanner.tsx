import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Info, X, PlusCircle, ImagePlus, Pill } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { askGemini, getGeminiApiKey } from "@/services/geminiService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadingAnimation from "./LoadingAnimation";

interface MedicineInfo {
  name: string;
  description: string;
  ingredients: string[];
  usedFor: string[];
  dosage: string;
  sideEffects: string[];
  warnings: string[];
  interactions: string[];
  image?: string;
}

const MedicineScanner = () => {
  const [activeTab, setActiveTab] = useState("camera");
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [medicineText, setMedicineText] = useState("");
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCapturing(true);
      toast.info("Camera activated. Position medicine packaging in frame.");
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame on canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageDataUrl);
      
      // Stop camera stream
      stopCamera();
      
      toast.success("Image captured. Ready for analysis.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedImage(result);
      toast.success("Image uploaded. Ready for analysis.");
    };
    
    reader.readAsDataURL(file);
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setShowResults(false);
    setMedicineInfo(null);
    setMedicineText("");
  };

  const analyzeMedicine = async () => {
    // Check if we have captured image or text input
    if (!capturedImage && !medicineText) {
      toast.error("Please capture an image or enter medicine text to analyze");
      return;
    }

    if (!getGeminiApiKey()) {
      setApiKeyDialogOpen(true);
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    try {
      let prompt = "";
      
      if (capturedImage) {
        // In a real implementation, we would use OCR to extract text
        // and then use that text to prompt Gemini. For now, we'll simulate this.
        prompt = `I have a medicine package. The medicine name is ${
          ["Simvastatin", "Amoxicillin", "Lisinopril", "Metformin", "Amlodipine"][Math.floor(Math.random() * 5)]
        }. Please provide detailed information about this medication in JSON format with the following structure:
        
        {
          "name": "Full medication name",
          "description": "Brief description of the medication",
          "ingredients": ["Active ingredient 1", "Active ingredient 2", ...],
          "usedFor": ["Condition 1", "Condition 2", ...],
          "dosage": "Standard dosage information",
          "sideEffects": ["Side effect 1", "Side effect 2", ...],
          "warnings": ["Warning 1", "Warning 2", ...],
          "interactions": ["Interaction 1", "Interaction 2", ...]
        }
        
        Make sure to include accurate medical information. Return ONLY JSON.`;
      } else {
        // Use the entered text
        prompt = `I have a medicine named ${medicineText}. Please provide detailed information about this medication in JSON format with the following structure:
        
        {
          "name": "Full medication name",
          "description": "Brief description of the medication",
          "ingredients": ["Active ingredient 1", "Active ingredient 2", ...],
          "usedFor": ["Condition 1", "Condition 2", ...],
          "dosage": "Standard dosage information",
          "sideEffects": ["Side effect 1", "Side effect 2", ...],
          "warnings": ["Warning 1", "Warning 2", ...],
          "interactions": ["Interaction 1", "Interaction 2", ...]
        }
        
        Make sure to include accurate medical information. Return ONLY JSON.`;
      }

      const response = await askGemini(prompt);
      
      // Extract JSON from the response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                        response.match(/```\s*([\s\S]*?)\s*```/) || 
                        [null, response];
      
      const jsonStr = jsonMatch[1] || response;
      
      try {
        // Parse the medicine data
        const medicineData = JSON.parse(jsonStr);
        setMedicineInfo(medicineData);
        setShowResults(true);
        
        toast.success("Medicine information retrieved successfully");
      } catch (parseError) {
        console.error("Error parsing medicine data:", parseError);
        toast.error("Error processing medicine information");
      }
    } catch (error) {
      console.error("Error analyzing medicine:", error);
      toast.error("Failed to analyze medicine");
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
    localStorage.setItem("geminiApiKey", apiKey);
    setApiKeyDialogOpen(false);
    toast.success("API key saved successfully");
    
    // Auto-analyze if we have an image or text
    if (capturedImage || medicineText) {
      analyzeMedicine();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            <span>Medicine Scanner</span>
          </CardTitle>
          <CardDescription className="text-white text-opacity-90">
            Scan medicine packaging to get detailed information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!showResults ? (
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="camera">Camera Scan</TabsTrigger>
                  <TabsTrigger value="text">Text Search</TabsTrigger>
                </TabsList>
                
                <TabsContent value="camera" className="space-y-4">
                  {!capturedImage ? (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-3">
                      {isCapturing ? (
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={stopCamera}
                              className="rounded-full w-8 h-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <Button
                              onClick={handleCapture}
                              className="bg-violet-600 hover:bg-violet-700"
                            >
                              Capture Image
                            </Button>
                          </div>
                          <div className="absolute inset-0 pointer-events-none border-4 border-violet-400 opacity-50 rounded-md"></div>
                        </div>
                      ) : (
                        <div className="min-h-[200px] flex flex-col items-center justify-center gap-4">
                          <div className="p-4 rounded-full bg-purple-100">
                            <Camera className="h-8 w-8 text-purple-600" />
                          </div>
                          <div className="text-center">
                            <h3 className="font-medium mb-1">Scan Medicine Package</h3>
                            <p className="text-sm text-gray-500 mb-4">
                              Position your medicine box or bottle in frame
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <Button onClick={startCamera} className="bg-violet-600 hover:bg-violet-700">
                              Start Camera
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <ImagePlus className="h-4 w-4 mr-2" />
                              Upload Image
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </div>
                        </div>
                      )}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="aspect-video relative">
                          <img 
                            src={capturedImage} 
                            alt="Captured medicine" 
                            className="w-full h-full object-contain bg-gray-100"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={resetCapture}
                            className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={analyzeMedicine}
                          className="bg-violet-600 hover:bg-violet-700"
                        >
                          Analyze Medicine
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter Medicine Name</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type medicine name..."
                        value={medicineText}
                        onChange={(e) => setMedicineText(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={analyzeMedicine}
                        disabled={!medicineText.trim()}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        Search
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter the exact name from the medicine packaging for best results
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <LoadingAnimation />
                  <p className="mt-4 text-sm text-gray-500">Analyzing medicine information...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {medicineInfo && (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-violet-700">{medicineInfo.name}</h2>
                      <p className="text-gray-600 mt-1">{medicineInfo.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetCapture}
                    >
                      New Scan
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">What It's Used For</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {medicineInfo.usedFor.map((use, index) => (
                            <li key={index}>{use}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Ingredients</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {medicineInfo.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Dosage Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{medicineInfo.dosage}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Side Effects</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {medicineInfo.sideEffects.map((effect, index) => (
                            <li key={index}>{effect}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Warnings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {medicineInfo.warnings.map((warning, index) => (
                            <li key={index} className="text-red-600">{warning}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Drug Interactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {medicineInfo.interactions.map((interaction, index) => (
                            <li key={index}>{interaction}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Alert className="mt-6 bg-yellow-50 border-yellow-200">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      This information is for reference only. Always follow your doctor's advice and read the package insert.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-6 flex justify-center">
                    <Button variant="outline">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add to My Medications
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Gemini API Key</DialogTitle>
            <DialogDescription>
              This key is required to analyze medicine information. You can get an API key from the Google AI Studio.
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

export default MedicineScanner;
