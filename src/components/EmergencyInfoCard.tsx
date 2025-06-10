
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { IdCard, Download, Share2, Plus, QrCode, Trash, Edit, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";

// Adding the html2canvas dependency
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const emergencyInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  birthDate: z.string().optional(),
  bloodType: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  medications: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  doctorName: z.string().optional(),
  doctorPhone: z.string().optional(),
  additionalInfo: z.string().optional(),
  organDonor: z.boolean().default(false),
  dnr: z.boolean().default(false),
});

type EmergencyInfoFormValues = z.infer<typeof emergencyInfoSchema>;

const EmergencyInfoCard = () => {
  const [savedProfiles, setSavedProfiles] = useState<EmergencyInfoFormValues[]>([]);
  const [activeTab, setActiveTab] = useState("create");
  const [editMode, setEditMode] = useState(false);
  const [activeProfileIndex, setActiveProfileIndex] = useState<number | null>(null);

  const form = useForm<EmergencyInfoFormValues>({
    resolver: zodResolver(emergencyInfoSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      bloodType: "",
      weight: "",
      height: "",
      allergies: "",
      conditions: "",
      medications: "",
      emergencyContact: "",
      emergencyPhone: "",
      doctorName: "",
      doctorPhone: "",
      additionalInfo: "",
      organDonor: false,
      dnr: false,
    },
  });

  // Load profiles from localStorage on component mount
  useEffect(() => {
    const savedProfilesStr = localStorage.getItem('emergencyProfiles');
    if (savedProfilesStr) {
      try {
        setSavedProfiles(JSON.parse(savedProfilesStr));
      } catch (error) {
        console.error('Failed to parse saved profiles:', error);
      }
    }
  }, []);
  
  // Save profiles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('emergencyProfiles', JSON.stringify(savedProfiles));
  }, [savedProfiles]);

  const handleSubmit = (values: EmergencyInfoFormValues) => {
    if (editMode && activeProfileIndex !== null) {
      // Update existing profile
      const updatedProfiles = [...savedProfiles];
      updatedProfiles[activeProfileIndex] = values;
      setSavedProfiles(updatedProfiles);
      setEditMode(false);
      toast.success("Emergency profile updated");
    } else {
      // Create new profile
      setSavedProfiles([...savedProfiles, values]);
      toast.success("Emergency profile created");
    }
    
    // Reset form and switch to view tab if we have profiles now
    form.reset();
    if (savedProfiles.length > 0 || editMode) {
      setActiveTab("view");
    }
  };

  const handleEditProfile = (index: number) => {
    const profile = savedProfiles[index];
    form.reset(profile);
    setActiveProfileIndex(index);
    setEditMode(true);
    setActiveTab("create");
  };

  const handleDeleteProfile = (index: number) => {
    const updatedProfiles = savedProfiles.filter((_, i) => i !== index);
    setSavedProfiles(updatedProfiles);
    toast.info("Profile deleted");
  };

  const handleCancelEdit = () => {
    form.reset();
    setEditMode(false);
    setActiveProfileIndex(null);
    setActiveTab("view");
  };

  const downloadEmergencyCard = async (index: number) => {
    const cardElement = document.getElementById(`emergency-card-${index}`);
    if (!cardElement) return;
    
    try {
      toast.info("Preparing emergency card for download...");
      
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        backgroundColor: "#ffffff"
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      
      // Create download link
      const link = document.createElement("a");
      link.download = `${savedProfiles[index].name.replace(/\s+/g, "_")}_emergency_card.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success("Emergency card downloaded successfully");
    } catch (error) {
      console.error("Error downloading emergency card:", error);
      toast.error("Failed to download emergency card");
    }
  };

  const shareEmergencyCard = (index: number) => {
    // In a real implementation, this would create a shareable link or QR code
    toast.info("Sharing functionality would be implemented here");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <IdCard className="h-6 w-6" />
            <span>Emergency Information Card</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="create">
                {editMode ? "Edit Profile" : "Create Profile"}
              </TabsTrigger>
              <TabsTrigger value="view" disabled={savedProfiles.length === 0}>
                View Cards
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Personal Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bloodType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blood Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {bloodTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (kg)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <h3 className="text-lg font-medium pt-2">Emergency Contacts</h3>
                      
                      <FormField
                        control={form.control}
                        name="emergencyContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="emergencyPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="doctorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doctor's Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Dr. Smith" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="doctorPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doctor's Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 987-6543" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Medical Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergies</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List any allergies (e.g., Penicillin, Peanuts, Latex)" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="conditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medical Conditions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List any chronic conditions (e.g., Diabetes, Asthma, Heart Disease)" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="medications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Medications</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List medications with dosages" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="additionalInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Information</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any other important health information" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4 pt-2">
                        <h3 className="text-lg font-medium">Important Designations</h3>
                        
                        <FormField
                          control={form.control}
                          name="organDonor"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Organ Donor</FormLabel>
                                <FormDescription>
                                  I wish to donate my organs
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dnr"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>DNR Status</FormLabel>
                                <FormDescription>
                                  Do Not Resuscitate order in place
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      This information is for emergency use. Keep it updated and accessible.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-end gap-2">
                    {editMode && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                      {editMode ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Emergency Card
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="view" className="space-y-6">
              {savedProfiles.length > 0 ? (
                <div className="space-y-6">
                  {savedProfiles.map((profile, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden border-2 border-orange-200"
                      id={`emergency-card-${index}`}
                    >
                      <div className="bg-orange-50 p-4 border-b border-orange-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <IdCard className="h-5 w-5 text-orange-600" />
                            <h3 className="text-lg font-semibold">{profile.name}</h3>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditProfile(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteProfile(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-3">
                          <div className="p-4 border-r border-orange-100">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Personal Info</h4>
                            <div className="space-y-2">
                              {profile.birthDate && (
                                <div>
                                  <p className="text-xs text-gray-500">Date of Birth</p>
                                  <p className="text-sm">{profile.birthDate}</p>
                                </div>
                              )}
                              {profile.bloodType && (
                                <div>
                                  <p className="text-xs text-gray-500">Blood Type</p>
                                  <p className="text-sm font-semibold text-red-600">{profile.bloodType}</p>
                                </div>
                              )}
                              {(profile.weight || profile.height) && (
                                <div>
                                  <p className="text-xs text-gray-500">Physical</p>
                                  <p className="text-sm">
                                    {profile.weight && `${profile.weight} kg`}
                                    {profile.weight && profile.height && " • "}
                                    {profile.height && `${profile.height} cm`}
                                  </p>
                                </div>
                              )}
                              
                              {(profile.organDonor || profile.dnr) && (
                                <div className="pt-2">
                                  {profile.organDonor && <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">Organ Donor</Badge>}
                                  {profile.dnr && <Badge className="bg-red-100 text-red-800 hover:bg-red-100">DNR</Badge>}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-4 border-r border-orange-100">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Medical Info</h4>
                            <div className="space-y-3">
                              {profile.allergies && (
                                <div>
                                  <p className="text-xs font-medium text-red-600">Allergies</p>
                                  <p className="text-sm">{profile.allergies}</p>
                                </div>
                              )}
                              {profile.conditions && (
                                <div>
                                  <p className="text-xs font-medium text-orange-600">Medical Conditions</p>
                                  <p className="text-sm">{profile.conditions}</p>
                                </div>
                              )}
                              {profile.medications && (
                                <div>
                                  <p className="text-xs font-medium text-blue-600">Medications</p>
                                  <p className="text-sm">{profile.medications}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Emergency Contacts</h4>
                            <div className="space-y-3">
                              {profile.emergencyContact && (
                                <div>
                                  <p className="text-xs text-gray-500">Emergency Contact</p>
                                  <p className="text-sm">{profile.emergencyContact}</p>
                                  {profile.emergencyPhone && <p className="text-sm font-medium">{profile.emergencyPhone}</p>}
                                </div>
                              )}
                              {profile.doctorName && (
                                <div>
                                  <p className="text-xs text-gray-500">Doctor</p>
                                  <p className="text-sm">{profile.doctorName}</p>
                                  {profile.doctorPhone && <p className="text-sm font-medium">{profile.doctorPhone}</p>}
                                </div>
                              )}
                              {profile.additionalInfo && (
                                <div>
                                  <p className="text-xs text-gray-500">Additional Info</p>
                                  <p className="text-sm">{profile.additionalInfo}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 p-4 bg-gray-50 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => shareEmergencyCard(index)}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <QrCode className="h-4 w-4" />
                            QR Code
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => downloadEmergencyCard(index)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download Card
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setActiveTab("create")}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Another Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No emergency profiles created yet.</p>
                  <Button
                    variant="link"
                    onClick={() => setActiveTab("create")}
                    className="mt-2"
                  >
                    Create your first profile
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyInfoCard;
