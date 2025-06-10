
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface TrendingSymptomsProps {
  onSelect: (symptom: string) => void;
}

const TrendingSymptoms: React.FC<TrendingSymptomsProps> = ({ onSelect }) => {
  const trendingSymptoms = [
    {
      category: "Respiratory",
      symptoms: ["Persistent cough", "Shortness of breath", "Sinus pressure", "Chest congestion"]
    },
    {
      category: "Digestive",
      symptoms: ["Stomach pain", "Nausea and vomiting", "Diarrhea", "Acid reflux"]
    },
    {
      category: "Neurological",
      symptoms: ["Migraine", "Dizziness", "Blurred vision", "Memory issues"]
    }
  ];

  return (
    <Card className="medical-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-4 w-4" />
          Trending Symptoms
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingSymptoms.map((category) => (
            <div key={category.category} className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">{category.category}</h4>
              <ul className="space-y-1">
                {category.symptoms.map((symptom) => (
                  <li key={symptom}>
                    <button
                      onClick={() => onSelect(symptom)}
                      className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <span className="text-medical-primary mr-1.5">•</span>
                      {symptom}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingSymptoms;
