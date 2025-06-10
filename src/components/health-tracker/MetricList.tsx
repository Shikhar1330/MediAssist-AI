
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { HealthMetric } from "./healthTrackerTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface MetricListProps {
  metrics: HealthMetric[];
  currentMetricType: string;
  onAddClick: () => void;
  onEditClick: (metric: HealthMetric) => void;
  onDeleteClick: (id: string) => void;
}

const MetricList = ({ 
  metrics, 
  currentMetricType, 
  onAddClick, 
  onEditClick, 
  onDeleteClick 
}: MetricListProps) => {
  const isMobile = useIsMobile();
  
  // Filter metrics by selected type for list
  const filteredMetrics = metrics
    .filter(metric => metric.metricType === currentMetricType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardContent className="p-3 md:p-4">
        {filteredMetrics.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {filteredMetrics.map(metric => (
              <Card key={metric.id} className="p-2 md:p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                      <p className="text-xs md:text-sm text-gray-500">
                        {isMobile 
                          ? format(new Date(metric.date), "MM/dd/yy h:mm a")
                          : format(new Date(metric.date), "MMM dd, yyyy • h:mm a")}
                      </p>
                    </div>
                    <div className="mt-1">
                      <span className="text-base md:text-lg font-medium">{metric.value} </span>
                      <span className="text-xs md:text-sm text-gray-500">{metric.unit}</span>
                    </div>
                    {metric.notes && (
                      <p className="mt-1 text-xs md:text-sm">{metric.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onEditClick(metric)}
                      className="h-7 w-7 md:h-8 md:w-8 p-0"
                    >
                      <Edit className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onDeleteClick(metric.id)}
                      className="h-7 w-7 md:h-8 md:w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 md:py-10">
            <p className="text-xs md:text-sm text-gray-500">No measurements found for this metric.</p>
            <Button 
              variant="link" 
              onClick={onAddClick}
              className="mt-1 md:mt-2 text-xs md:text-sm"
            >
              Add your first measurement
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricList;
