
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

const HealthTips = () => {
  const healthTips = [
    {
      title: "Stay Hydrated",
      description: "Aim to drink 8-10 glasses of water daily to maintain proper bodily functions and help with toxin removal.",
      icon: "💧"
    },
    {
      title: "Quality Sleep",
      description: "Adults should get 7-9 hours of quality sleep each night to support immune function and overall health.",
      icon: "😴"
    },
    {
      title: "Regular Exercise",
      description: "Engage in at least 150 minutes of moderate exercise per week to support cardiovascular health.",
      icon: "🏃‍♂️"
    },
    {
      title: "Balanced Diet",
      description: "Consume a variety of fruits, vegetables, whole grains, lean proteins and healthy fats daily.",
      icon: "🥗"
    },
    {
      title: "Manage Stress",
      description: "Practice meditation, deep breathing, or other relaxation techniques to reduce chronic stress.",
      icon: "🧘‍♀️"
    },
    {
      title: "Regular Check-ups",
      description: "Schedule preventive health screenings and annual check-ups with healthcare providers.",
      icon: "🩺"
    }
  ];

  return (
    <Card className="medical-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-medical-accent" />
          Daily Health Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {healthTips.map((tip) => (
            <div 
              key={tip.title}
              className="p-4 border rounded-lg hover:border-medical-accent/50 hover:bg-medical-accent/5 transition-colors"
            >
              <div className="text-2xl mb-2">{tip.icon}</div>
              <h4 className="font-medium text-gray-800 mb-1">{tip.title}</h4>
              <p className="text-sm text-gray-600">{tip.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthTips;
