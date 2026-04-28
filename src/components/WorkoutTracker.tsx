import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Exercise } from "../types";

export default function WorkoutTracker() {
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Supino Reto', sets: 4, reps: 10, weight: 60, completed: false },
    { id: '2', name: 'Crucifixo Inclinado', sets: 3, reps: 12, weight: 18, completed: true },
    { id: '3', name: 'Crossover Polia Alta', sets: 3, reps: 15, weight: 25, completed: false },
    { id: '4', name: 'Tríceps Corda', sets: 4, reps: 12, weight: 35, completed: false },
  ]);

  const toggleComplete = (id: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex));
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Treino de Hoje</h2>
          <p className="text-muted-foreground">Foco em Peito e Tríceps • Dia 3 da semana</p>
        </div>
        <Button className="gap-2 bg-[#F27D26] hover:bg-[#F27D26]/90">
          <Plus className="w-4 h-4" />
          Novo Exercício
        </Button>
      </header>

      <div className="grid gap-4">
        {exercises.map((ex) => (
          <Card key={ex.id} className={`border-border transition-all ${ex.completed ? 'opacity-50 bg-muted' : 'bg-card'}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleComplete(ex.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${ex.completed ? 'bg-green-500 border-green-500 text-white' : 'border-border text-transparent hover:border-[#F27D26]'}`}
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
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
