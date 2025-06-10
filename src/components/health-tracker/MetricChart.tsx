
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { format } from "date-fns";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { HealthMetric, MetricType, TrendInfo } from "./healthTrackerTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface MetricChartProps {
  metrics: HealthMetric[];
  currentMetricType: string;
  currentMetricInfo: MetricType;
}

const MetricChart = ({ metrics, currentMetricType, currentMetricInfo }: MetricChartProps) => {
  const isMobile = useIsMobile();
  
  // Filter metrics by selected type for chart
  const filteredMetrics = metrics
    .filter(metric => metric.metricType === currentMetricType)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Prepare data for chart
  const chartData = filteredMetrics.map(metric => ({
    date: format(new Date(metric.date), isMobile ? "MM/dd" : "MMM dd"),
    value: metric.value
  }));

  // Get trend information
  const getTrend = (): TrendInfo => {
    if (filteredMetrics.length < 2) return { icon: <ArrowRight />, text: "Not enough data", color: "text-gray-500" };
    
    const latest = filteredMetrics[filteredMetrics.length - 1];
    const previous = filteredMetrics[filteredMetrics.length - 2];
    
    if (latest.value > previous.value) {
      return { icon: <ArrowUp />, text: "Increasing", color: "text-red-500" };
    } else if (latest.value < previous.value) {
      return { icon: <ArrowDown />, text: "Decreasing", color: "text-green-500" };
    } else {
      return { icon: <ArrowRight />, text: "Stable", color: "text-blue-500" };
    }
  };

  const trend = getTrend();

  return (
    <Card>
      <CardContent className="p-3 md:p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-2 md:mb-4">
          <Card className="p-2 md:p-3">
            <p className="text-xs md:text-sm text-gray-500">Metric</p>
            <p className="text-sm md:text-lg font-medium truncate">{currentMetricInfo.name}</p>
          </Card>
          <Card className="p-2 md:p-3">
            <p className="text-xs md:text-sm text-gray-500">Unit</p>
            <p className="text-sm md:text-lg font-medium">{currentMetricInfo.unit}</p>
          </Card>
          <Card className="p-2 md:p-3">
            <p className="text-xs md:text-sm text-gray-500">Normal Range</p>
            <p className="text-sm md:text-lg font-medium">{currentMetricInfo.normal}</p>
          </Card>
          <Card className="p-2 md:p-3">
            <p className="text-xs md:text-sm text-gray-500">Trend</p>
            <p className={`text-sm md:text-lg font-medium flex items-center gap-1 ${trend.color}`}>
              {trend.icon} <span className="truncate">{trend.text}</span>
            </p>
          </Card>
        </div>
        
        {chartData.length > 0 ? (
          <div className="h-[200px] md:h-[300px] mt-4 md:mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ 
                  top: 5, 
                  right: isMobile ? 5 : 20, 
                  left: isMobile ? -15 : 0, 
                  bottom: 5 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickMargin={isMobile ? 5 : 10}
                />
                <YAxis 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  width={isMobile ? 25 : 40}
                />
                <Tooltip 
                  contentStyle={{ fontSize: isMobile ? '12px' : '14px' }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name={currentMetricInfo.name} 
                  stroke="#10b981" 
                  activeDot={{ r: isMobile ? 6 : 8 }} 
                  strokeWidth={isMobile ? 1.5 : 2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] md:h-[300px] flex items-center justify-center">
            <p className="text-xs md:text-sm text-gray-500">No data available for this metric. Add a measurement to see the chart.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricChart;
