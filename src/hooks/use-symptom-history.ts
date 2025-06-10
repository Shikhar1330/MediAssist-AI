import { useState, useEffect } from "react";

interface SymptomEntry {
  id: string;
  symptom: string;
  timestamp: number;
  results?: any;
}

export const useSymptomHistory = () => {
  const [history, setHistory] = useState<SymptomEntry[]>([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("symptom-history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Error loading symptom history:", error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("symptom-history", JSON.stringify(history));
    } catch (error) {
      console.error("Error saving symptom history:", error);
    }
  }, [history]);

  const addSymptom = (symptom: string, results?: any) => {
    const newEntry: SymptomEntry = {
      id: Date.now().toString(),
      symptom,
      timestamp: Date.now(),
      results,
    };

    setHistory((prev) => {
      // Keep only the 10 most recent entries
      const updatedHistory = [newEntry, ...prev.slice(0, 9)];
      return updatedHistory;
    });

    return newEntry;
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addSymptom,
    clearHistory,
  };
};
