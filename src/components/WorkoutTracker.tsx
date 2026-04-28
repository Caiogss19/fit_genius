import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2, Timer, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Exercise } from "../types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function WorkoutTracker() {
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Supino Reto', sets: 4, reps: 10, weight: 60, completed: false },
    { id: '2', name: 'Crucifixo Inclinado', sets: 3, reps: 12, weight: 18, completed: true },
    { id: '3', name: 'Crossover Polia Alta', sets: 3, reps: 15, weight: 25, completed: false },
    { id: '4', name: 'Tríceps Corda', sets: 4, reps: 12, weight: 35, completed: false },
  ]);

  const [restTimer, setRestTimer] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    } else if (restTimer === 0) {
      setRestTimer(null);
      toast("⏰ Tempo de descanso concluído! Bora para a próxima série.");
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleComplete = (id: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === id) {
        if (!ex.completed) setRestTimer(60); // 60 seconds rest
        return { ...ex, completed: !ex.completed };
      }
      return ex;
    }));
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Treino de Hoje</h2>
          <p className="text-muted-foreground">Foco em Peito e Tríceps • Dia 3 da semana</p>
        </div>
        <Button className="gap-2 bg-[#F27D26] hover:bg-[#F27D26]/90 text-white">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Exercício</span>
        </Button>
      </header>

      <div className="grid gap-4">
        {exercises.map((ex) => (
          <Card key={ex.id} className={`border-border transition-all ${ex.completed ? 'opacity-50 bg-muted' : 'bg-card'}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleComplete(ex.id)}
                  className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${ex.completed ? 'bg-green-500 border-green-500 text-white' : 'border-border text-transparent hover:border-[#F27D26]'}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div>
                  <h4 className={`font-bold ${ex.completed ? 'line-through' : ''}`}>{ex.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {ex.sets} séries x {ex.reps} reps • {ex.weight} kg
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {restTimer !== null && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-card border border-border shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50"
          >
            <div className="flex items-center gap-2 text-[#F27D26]">
              <Timer className="w-5 h-5 animate-pulse" />
              <span className="text-xl font-bold font-mono tracking-wider">{formatTime(restTimer)}</span>
            </div>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setRestTimer(null)}>
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
