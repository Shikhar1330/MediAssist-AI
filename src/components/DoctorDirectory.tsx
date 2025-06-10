
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Search, Phone, Calendar, Star, Clock, MapPinned, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  distance: number;
  rating: number;
  availableSlots: string[];
  image: string;
  phone: string;
  address: string;
  experience: number;
}

const specialties = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "Orthopedic",
  "ENT Specialist",
  "Gynecologist",
  "Psychiatrist",
  "Ophthalmologist",
];

// Sample doctor data
const sampleDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    location: "Central Hospital",
    distance: 2.3,
    rating: 4.8,
    availableSlots: ["Today, 2:00 PM", "Today, 4:30 PM", "Tomorrow, 10:00 AM"],
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop",
    phone: "+1 (555) 123-4567",
    address: "123 Medical Center Blvd, Suite 101",
    experience: 12
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Pediatrician",
    location: "Children's Clinic",
    distance: 3.5,
    rating: 4.9,
    availableSlots: ["Tomorrow, 9:00 AM", "Tomorrow, 2:15 PM"],
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop",
    phone: "+1 (555) 987-6543",
    address: "456 Wellness Way, Suite 202",
    experience: 8
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatologist",
    location: "Skin & Wellness Center",
    distance: 1.8,
    rating: 4.7,
    availableSlots: ["Today, 5:30 PM", "Tomorrow, 11:45 AM", "Tomorrow, 3:30 PM"],
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop",
    phone: "+1 (555) 456-7890",
    address: "789 Health Street, Suite 303",
    experience: 15
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Orthopedic",
    location: "Joint & Spine Institute",
    distance: 4.1,
    rating: 4.6,
    availableSlots: ["Tomorrow, 1:00 PM", "Friday, 10:30 AM"],
    image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=300&h=300&fit=crop",
    phone: "+1 (555) 234-5678",
    address: "321 Bone & Joint Circle, Suite 404",
    experience: 20
  },
  {
    id: "5",
    name: "Dr. Lisa Wang",
    specialty: "General Physician",
    location: "Community Healthcare",
    distance: 0.9,
    rating: 4.5,
    availableSlots: ["Today, 3:15 PM", "Tomorrow, 9:30 AM", "Friday, 2:00 PM"],
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&h=300&fit=crop",
    phone: "+1 (555) 345-6789",
    address: "555 Primary Care Road, Suite 505",
    experience: 10
  }
];

const DoctorDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>(sampleDoctors);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(sampleDoctors);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "name">("distance");

  const [savedDoctors, setSavedDoctors] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<"all" | "saved">("all");

  // Load saved doctors from localStorage on component mount
  useEffect(() => {
    const savedDoctorIds = localStorage.getItem('savedDoctors');
    if (savedDoctorIds) {
      try {
        setSavedDoctors(JSON.parse(savedDoctorIds));
      } catch (error) {
        console.error('Failed to parse saved doctors:', error);
      }
    }
  }, []);
  
  // Save doctors to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedDoctors', JSON.stringify(savedDoctors));
  }, [savedDoctors]);

  // Filter doctors based on search query, specialty, and view
  useEffect(() => {
    let filtered = [...doctors];
    
    if (searchQuery) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }
    
    if (currentView === "saved") {
      filtered = filtered.filter(doctor => savedDoctors.includes(doctor.id));
    }
    
    // Sort doctors
    switch (sortBy) {
      case "distance":
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    setFilteredDoctors(filtered);
  }, [searchQuery, selectedSpecialty, doctors, sortBy, currentView, savedDoctors]);

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(doctor.availableSlots[0] || "");
    setBookingDialog(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot || !selectedDoctor) {
      toast.error("Please select a time slot");
      return;
    }
    
    toast.success(`Appointment booked with ${selectedDoctor.name} for ${selectedSlot}`);
    setBookingDialog(false);
    
    // In a real app, you would make an API call to book the appointment
  };

  const toggleSaveDoctor = (doctorId: string) => {
    if (savedDoctors.includes(doctorId)) {
      setSavedDoctors(savedDoctors.filter(id => id !== doctorId));
      toast.info("Removed from saved doctors");
    } else {
      setSavedDoctors([...savedDoctors, doctorId]);
      toast.success("Added to saved doctors");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("");
    setSortBy("distance");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            <span>Doctor Directory & Booking</span>
          </CardTitle>
          <CardDescription className="text-white text-opacity-90">
            Find and book appointments with top doctors in your area
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search doctors by name or specialty"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="w-full md:w-[200px]">
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {specialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-[150px]">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" onClick={handleClearFilters} className="md:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
            
            <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "all" | "saved")}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Doctors</TabsTrigger>
                <TabsTrigger value="saved">Saved Doctors</TabsTrigger>
              </TabsList>
              
              <div className="space-y-4">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map(doctor => (
                    <Card key={doctor.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-[120px] h-[120px] bg-gray-100">
                          <img 
                            src={doctor.image} 
                            alt={doctor.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                            <div>
                              <h3 className="text-lg font-medium">{doctor.name}</h3>
                              <p className="text-gray-500 text-sm">{doctor.specialty}</p>
                            </div>
                            <div className="flex items-center mt-2 sm:mt-0">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="font-medium">{doctor.rating}</span>
                              <span className="text-gray-500 text-sm ml-1">({Math.floor(Math.random() * 200) + 50} reviews)</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center text-sm">
                              <MapPinned className="h-4 w-4 text-gray-500 mr-2" />
                              <span>{doctor.location} • {doctor.distance} miles away</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 text-gray-500 mr-2" />
                              <span>{doctor.experience} years experience</span>
                            </div>
                          </div>
                          
                          {doctor.availableSlots.length > 0 ? (
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">Next Available:</p>
                              <div className="flex flex-wrap gap-2">
                                {doctor.availableSlots.slice(0, 3).map((slot, index) => (
                                  <Badge key={index} variant="outline" className="bg-green-50">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {slot}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mb-4">No available slots</p>
                          )}
                          
                          <div className="flex gap-2 mt-2">
                            <Button 
                              onClick={() => handleBookAppointment(doctor)} 
                              className="bg-rose-600 hover:bg-rose-700"
                              disabled={doctor.availableSlots.length === 0}
                            >
                              Book Appointment
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => toggleSaveDoctor(doctor.id)} 
                            >
                              {savedDoctors.includes(doctor.id) ? "Unsave" : "Save"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-2">No doctors found matching your criteria.</p>
                    <Button variant="link" onClick={handleClearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book an Appointment</DialogTitle>
            <DialogDescription>
              {selectedDoctor && `Schedule your visit with ${selectedDoctor.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoctor && (
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-4">
                <img 
                  src={selectedDoctor.image} 
                  alt={selectedDoctor.name} 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">{selectedDoctor.name}</h3>
                  <p className="text-sm text-gray-500">{selectedDoctor.specialty}</p>
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-gray-500" />
                    <span>{selectedDoctor.address}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <Phone className="h-3.5 w-3.5 text-gray-500" />
                    <span>{selectedDoctor.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Select Appointment Time</label>
                <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDoctor.availableSlots.map((slot, index) => (
                      <SelectItem key={index} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Reason for Visit (Optional)</label>
                <Input placeholder="Brief description of your condition" />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBooking} 
              className="bg-rose-600 hover:bg-rose-700"
              disabled={!selectedSlot}
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDirectory;
