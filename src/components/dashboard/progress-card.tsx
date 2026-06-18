import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressCardProps {
  title: string;
  completed: number;
  total: number;
}

export function ProgressCard({ title, completed, total }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between">
          <span>{title}</span>
          <span className="text-muted-foreground font-normal">
            {completed} / {total}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {percentage}% concluído
        </p>
      </CardContent>
    </Card>
  );
}
