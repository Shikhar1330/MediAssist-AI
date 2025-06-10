
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
            <AlertTriangle className="h-8 w-8 text-medical-danger" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-xl text-gray-700 mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
          Please return to the home page to continue using MediAssist AI.
        </p>
        
        <Button 
          className="bg-medical-primary hover:bg-medical-primary/90"
          onClick={() => window.location.href = "/"}
        >
          Return to Home
        </Button>
      </div>
      
      <div className="mt-12 text-sm text-gray-500">
        <p>If you believe this is an error, please contact our support team.</p>
      </div>
    </div>
  );
};

export default NotFound;
