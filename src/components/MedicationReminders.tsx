
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Reminder {
  id: string;
  medication: string;
  time: string;
  days: string[];
}

interface MedicationRemindersProps {
  isOpen: boolean;
  onClose: () => void;
  recommendedMedicine?: string;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MedicationReminders: React.FC<MedicationRemindersProps> = ({
  isOpen,
  onClose,
  recommendedMedicine,
}) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState<Reminder>({
    id: "",
    medication: recommendedMedicine || "",
    time: "08:00",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Load reminders from localStorage
  useEffect(() => {
    try {
      const savedReminders = localStorage.getItem("medication-reminders");
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      }
    } catch (error) {
      console.error("Error loading reminders:", error);
    }
  }, []);

  // Save reminders to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("medication-reminders", JSON.stringify(reminders));
    } catch (error) {
      console.error("Error saving reminders:", error);
    }
  }, [reminders]);

  // Set recommended medicine when available and not null
  useEffect(() => {
    if (recommendedMedicine) {
      setNewReminder(prev => ({
        ...prev,
        medication: recommendedMedicine
      }));
    }
  }, [recommendedMedicine]);

  const handleDayToggle = (day: string) => {
    setNewReminder((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const addReminder = () => {
    if (!newReminder.medication.trim()) {
      toast.error("Please enter a medication name");
      return;
    }

    if (newReminder.days.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    const updatedReminder = {
      ...newReminder,
      id: Date.now().toString(),
    };

    setReminders((prev) => [...prev, updatedReminder]);
    setNewReminder({
      id: "",
      medication: "",
      time: "08:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    });
    setIsAddingNew(false);

    // Request notification permission if needed
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    toast.success("Reminder added successfully");
  };

  const removeReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    toast.success("Reminder removed");
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      return new Date(2000, 0, 1, parseInt(hours), parseInt(minutes)).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-medical-primary" />
            Medication Reminders
          </DialogTitle>
          <DialogDescription>
            Set up reminders for your medications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {reminders.length === 0 && !isAddingNew ? (
            <div className="text-center py-8 text-gray-500">
              <p>No reminders set yet.</p>
              <p className="text-sm mt-2">
                Add a reminder to get notifications for your medications.
              </p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-medical-primary">
                      {reminder.medication}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(reminder.time)}
                      <span className="mx-1">•</span>
                      {reminder.days.join(", ")}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 h-8 w-8 p-0"
                    onClick={() => removeReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {isAddingNew ? (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Medication Name</Label>
                <Input
                  id="medication"
                  value={newReminder.medication}
                  onChange={(e) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      medication: e.target.value,
                    }))
                  }
                  placeholder="Enter medication name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newReminder.time}
                  onChange={(e) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Days</Label>
                <div className="flex flex-wrap gap-1">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={newReminder.days.includes(day) ? "default" : "outline"}
                      size="sm"
                      className={
                        newReminder.days.includes(day)
                          ? "bg-medical-primary hover:bg-medical-primary/90"
                          : ""
                      }
                      onClick={() => handleDayToggle(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingNew(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={addReminder}
                  className="bg-medical-secondary hover:bg-medical-secondary/90"
                >
                  Save Reminder
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsAddingNew(true)}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Add New Reminder
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationReminders;
