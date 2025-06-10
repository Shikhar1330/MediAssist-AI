
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BodySymptomMapProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBodyPart: (part: string) => void;
}

const bodyParts = [
  { id: "head", name: "Head", top: "5%", left: "50%" },
  { id: "throat", name: "Throat", top: "15%", left: "50%" },
  { id: "chest", name: "Chest", top: "25%", left: "50%" },
  { id: "stomach", name: "Stomach", top: "35%", left: "50%" },
  { id: "leftArm", name: "Left Arm", top: "30%", left: "30%" },
  { id: "rightArm", name: "Right Arm", top: "30%", left: "70%" },
  { id: "lowerAbdomen", name: "Lower Abdomen", top: "45%", left: "50%" },
  { id: "back", name: "Back", top: "30%", left: "50%" },
  { id: "leftLeg", name: "Left Leg", top: "65%", left: "42%" },
  { id: "rightLeg", name: "Right Leg", top: "65%", left: "58%" },
  { id: "feet", name: "Feet", top: "85%", left: "50%" },
];

const BodySymptomMap: React.FC<BodySymptomMapProps> = ({
  isOpen,
  onClose,
  onSelectBodyPart,
}) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-medical-primary" />
            Body Symptom Map
          </DialogTitle>
        </DialogHeader>

        <div className="relative h-[500px] mx-auto my-4">
          {/* Body outline - simplified version */}
          <div className="w-[200px] h-full mx-auto relative">
            <svg
              viewBox="0 0 100 250"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Simple body outline */}
              <path
                d="M50,10 C60,10 65,15 65,25 C65,35 60,40 60,45 
                L60,60 C60,62 70,65 70,80 C70,90 65,100 60,110 
                L60,150 C60,155 65,160 65,170 C65,190 60,210 55,220 
                L55,240 C55,245 52.5,250 50,250 C47.5,250 45,245 45,240 
                L45,220 C40,210 35,190 35,170 C35,160 40,155 40,150 
                L40,110 C35,100 30,90 30,80 C30,65 40,62 40,60 
                L40,45 C40,40 35,35 35,25 C35,15 40,10 50,10 Z"
                fill="#e0f2fe"
                stroke="#3b82f6"
                strokeWidth="1"
              />
              {/* Head circle */}
              <circle cx="50" cy="15" r="10" fill="#e0f2fe" stroke="#3b82f6" />
            </svg>

            {/* Clickable body part hotspots */}
            {bodyParts.map((part) => (
              <div
                key={part.id}
                className={`absolute w-8 h-8 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer transition-all ${
                  hoveredPart === part.id ? "bg-medical-primary/20" : "bg-transparent"
                }`}
                style={{
                  top: part.top,
                  left: part.left,
                }}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                onClick={() => {
                  onSelectBodyPart(part.name);
                  onClose();
                }}
              >
                <div 
                  className={`w-3 h-3 rounded-full ${
                    hoveredPart === part.id ? "bg-medical-primary scale-125" : "bg-medical-primary/50"
                  }`}
                ></div>
                {hoveredPart === part.id && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-white text-xs border rounded shadow whitespace-nowrap">
                    {part.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 pt-2">
          Click on a body part to select symptoms for that area
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BodySymptomMap;
