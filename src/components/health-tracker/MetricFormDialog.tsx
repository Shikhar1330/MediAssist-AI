
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { HealthMetric, metricTypes } from "./healthTrackerTypes";

interface MetricFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (metricData: {
    metricType: string;
    value: number;
    notes?: string;
  }) => void;
  editingMetric: HealthMetric | null;
}

const MetricFormDialog = ({ 
  open, 
  onOpenChange, 
  onSave,
  editingMetric 
}: MetricFormDialogProps) => {
  const [currentMetricType, setCurrentMetricType] = useState(metricTypes[0].id);
  const [metricValue, setMetricValue] = useState("");
  const [metricNotes, setMetricNotes] = useState("");

  // Reset form when dialog opens or editing metric changes
  useEffect(() => {
    if (open) {
      if (editingMetric) {
        setCurrentMetricType(editingMetric.metricType);
        setMetricValue(editingMetric.value.toString());
        setMetricNotes(editingMetric.notes || "");
      } else {
        setCurrentMetricType(metricTypes[0].id);
        setMetricValue("");
        setMetricNotes("");
      }
    }
  }, [open, editingMetric]);

  const handleSave = () => {
    if (!metricValue.trim()) {
      toast.error("Please enter a value");
      return;
    }

    const value = parseFloat(metricValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }

    // Properly handle notes - only pass notes if it has content
    const notes = metricNotes.trim() || undefined;
    
    // Log what we're about to save to help debugging
    console.log("Saving metric:", { 
      metricType: currentMetricType, 
      value, 
      notes 
    });
    
    onSave({
      metricType: currentMetricType,
      value,
      notes
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingMetric ? "Edit Health Measurement" : "Add Health Measurement"}
          </DialogTitle>
          <DialogDescription>
            Record your health metrics to track changes over time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Metric Type</label>
            <Select 
              value={currentMetricType} 
              onValueChange={setCurrentMetricType}
              disabled={!!editingMetric}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricTypes.map(metric => (
                  <SelectItem key={metric.id} value={metric.id}>
                    {metric.name} ({metric.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Value</label>
            <Input
              type="number"
              placeholder="Enter value"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Unit: {metricTypes.find(m => m.id === currentMetricType)?.unit}
            </p>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Input
              placeholder="Add any additional notes"
              value={metricNotes}
              onChange={(e) => setMetricNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
            {editingMetric ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MetricFormDialog;
