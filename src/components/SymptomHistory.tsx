
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";
import { useSymptomHistory } from "@/hooks/use-symptom-history";
import { toast } from "sonner";

interface SymptomHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymptom: (symptom: string) => void;
}

const SymptomHistory: React.FC<SymptomHistoryProps> = ({
  isOpen,
  onClose,
  onSelectSymptom,
}) => {
  const { history, clearHistory } = useSymptomHistory();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleClearHistory = () => {
    clearHistory();
    toast.success("History cleared successfully");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-medical-primary" />
            Your Symptom History
          </DialogTitle>
          <DialogDescription>
            Your recent symptom searches. Click on any entry to search again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No symptom history yet.</p>
              <p className="text-sm mt-2">
                Your searches will appear here after you use the symptom checker.
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      onSelectSymptom(entry.symptom);
                      onClose();
                    }}
                  >
                    <div className="font-medium text-medical-primary">
                      {entry.symptom}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500"
                  onClick={handleClearHistory}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SymptomHistory;
