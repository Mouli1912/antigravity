import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Activity, RefreshCcw } from 'lucide-react';

interface AnalyticsWidgetProps {
  recoveredTasksCount: number;
}

export function AnalyticsWidget({ recoveredTasksCount }: AnalyticsWidgetProps) {
  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-2">
        <CardDescription>Productivity Recovery</CardDescription>
        <CardTitle className="text-3xl flex items-center gap-2">
          <RefreshCcw className="w-6 h-6 text-blue-500" />
          {recoveredTasksCount}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Activity className="w-4 h-4" />
          <span>Ignored tasks recovered</span>
        </div>
      </CardContent>
    </Card>
  );
}
