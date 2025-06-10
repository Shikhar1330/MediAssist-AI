
import { LucideIcon } from "lucide-react";

export interface HealthMetric {
  id: string;
  date: string;
  metricType: string;
  value: number;
  unit: string;
  notes?: string;
}

export interface MetricType {
  id: string;
  name: string;
  unit: string;
  normal: string;
  icon?: LucideIcon;
}

export const metricTypes: MetricType[] = [
  { id: "bloodPressure", name: "Blood Pressure", unit: "mmHg", normal: "120/80" },
  { id: "heartRate", name: "Heart Rate", unit: "bpm", normal: "60-100" },
  { id: "temperature", name: "Body Temperature", unit: "°F", normal: "97-99" },
  { id: "bloodSugar", name: "Blood Sugar", unit: "mg/dL", normal: "70-100" },
  { id: "weight", name: "Weight", unit: "kg", normal: "varies" },
  { id: "pain", name: "Pain Level", unit: "scale 1-10", normal: "0" },
];

export interface TrendInfo {
  icon: React.ReactNode;
  text: string;
  color: string;
}
