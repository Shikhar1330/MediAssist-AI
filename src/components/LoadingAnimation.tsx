
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Stethoscope, LoaderCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const LoadingAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const isMobile = useIsMobile();
  
  const steps = [
    "Analyzing Symptoms",
    "Identifying Conditions",
    "Reviewing Medical Database",
    "Preparing Recommendations",
    "Finalizing Results"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return Math.min(prev + 1.5, 100);
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepIndex = Math.min(Math.floor(progress / 20), steps.length - 1);
    setCurrentStep(stepIndex);
  }, [progress]);

  return (
    <Card className="medical-card overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-medical-primary to-medical-accent p-3 md:p-4">
        <h3 className="text-white text-base md:text-lg font-medium flex items-center gap-2">
          <LoaderCircle className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
          Processing Your Health Information
        </h3>
      </div>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col items-center space-y-6 md:space-y-8 py-4 md:py-6">
          <div className="relative">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-8 w-8 md:h-12 md:w-12 text-primary animate-breathe" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            {steps[currentStep]}
          </h3>
          
          <div className="w-full space-y-2 md:space-y-3">
            <Progress value={progress} className="h-2 md:h-2.5" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Analyzing medical data...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          
          <div className="text-center text-xs md:text-sm text-gray-600 max-w-md">
            <p>
              Our advanced AI is analyzing your symptoms using a comprehensive database of medical knowledge. 
              Please wait while we prepare your personalized health recommendations.
            </p>
          </div>
          
          {/* Mobile step indicator */}
          {isMobile ? (
            <div className="flex items-center justify-center space-x-1">
              {steps.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx <= currentStep ? "bg-primary w-6" : "bg-gray-200 w-3"
                  } ${idx === currentStep ? "animate-pulse" : ""}`}
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 w-full gap-2">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center ${index <= currentStep ? "text-primary" : "text-gray-300"}`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full mb-1 
                      ${index < currentStep ? "bg-primary" : 
                        index === currentStep ? "bg-primary animate-pulse" : "bg-gray-200"}`}
                  ></div>
                  <span className="text-[10px] md:text-xs text-center">{step.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-2 md:mt-4">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 md:w-3 md:h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            <div className="w-2 h-2 md:w-3 md:h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingAnimation;
