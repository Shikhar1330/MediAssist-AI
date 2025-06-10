
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const InfoSection = () => {
  return (
    <Card className="medical-card bg-gradient-to-br from-white to-blue-50">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-lg bg-medical-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medical-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-base">Verified Medical Info</h3>
            <p className="text-sm text-gray-600">
              All recommendations are based on verified medical knowledge sources and up-to-date clinical guidelines.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-lg bg-medical-secondary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medical-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-base">Regular Updates</h3>
            <p className="text-sm text-gray-600">
              Our system is continuously updated with the latest medical research and treatment guidelines.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-lg bg-medical-accent/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medical-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-base">Privacy Focused</h3>
            <p className="text-sm text-gray-600">
              Your health information is kept private and secure. We don't store or share your personal medical data.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 max-w-3xl mx-auto">
            <strong className="text-medical-primary">Important:</strong> MediAssist AI provides general health information for educational purposes. 
            It's not a substitute for professional medical advice, diagnosis, or treatment. 
            Always seek the advice of your physician or other qualified health provider with any questions about your medical condition.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoSection;
