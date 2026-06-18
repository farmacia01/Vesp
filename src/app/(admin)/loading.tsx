import { Loader } from '@/components/ui/loader';

export default function Loading() {
  return (
    <div className="h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center gap-4">
      <Loader />
      <p className="text-muted-foreground font-medium animate-pulse">Carregando dados...</p>
    </div>
  );
}
