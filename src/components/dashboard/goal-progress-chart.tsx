'use client';

export function GoalProgressChart({ percentage = 71 }: { percentage?: number }) {
  const radius = 60;
  const strokeWidth = 16;
  const cx = 80;
  const cy = 80;
  const circumference = Math.PI * radius; // Half circle
  const dasharray = `${circumference} ${circumference}`;
  const dashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-[160px] h-[80px] overflow-hidden">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          className="transform rotate-180"
        >
          {/* Background Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#B0FF29"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-2">
          <span className="text-3xl font-bold text-foreground tracking-tight font-mono">
            {percentage}%
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Meta atingida</span>
        </div>
      </div>
    </div>
  );
}
