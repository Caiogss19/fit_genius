import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Timer, X, PlayCircle, Dumbbell, Activity, Check, Settings2, MoreHorizontal, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { Exercise, ExerciseSet } from "../types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";
import { format, subDays, addDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { unlockAchievement } from "@/lib/achievements";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function WorkoutTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [newExName, setNewExName] = useState<string>("");

  const dateStr = format(currentDate, "yyyy-MM-dd");

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const docRef = doc(db, "users", auth.currentUser.uid, "workouts", dateStr);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().exercises || [];
        // Migration of old data
        const migrated = data.map((ex: any) => {
          if (!ex.detailedSets) {
            const arr: ExerciseSet[] = [];
            for (let i = 0; i < (ex.sets || 1); i++) {
              arr.push({
                id: Math.random().toString(36).substring(7),
                reps: ex.reps || 0,
                weight: ex.weight || 0,
                completed: ex.completed || false
              });
            }
            return { ...ex, detailedSets: arr };
          }
          return ex;
        });
        setExercises(migrated);
      } else {
        setExercises([]);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}/workouts/${dateStr}`);
    });

    return () => unsubscribe();
  }, [dateStr]);

  const saveExercises = async (newExercises: Exercise[]) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, "users", auth.currentUser.uid, "workouts", dateStr);
      await setDoc(docRef, {
        name: "Treino do Dia",
        date: dateStr,
        exercises: newExercises
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}/workouts/${dateStr}`);
      toast.error("Erro ao salvar treino.");
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    } else if (restTimer === 0) {
      setRestTimer(null);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      try {
        const audio = new Audio('https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch(e){}
      toast.success("⏰ Tempo de descanso concluído! Bora para a próxima série.");
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleSetComplete = async (exId: string, setId: string) => {
    if (!auth.currentUser) return;
    
    let startedRest = false;
    let anyCompleted = false;

    const newExs = exercises.map(ex => {
      if (ex.id === exId && ex.detailedSets) {
        const newSets = ex.detailedSets.map(s => {
          if (s.id === setId) {
            if (!s.completed) {
              startedRest = true;
            }
            return { ...s, completed: !s.completed };
          }
          return s;
        });
        
        const allCompleted = newSets.length > 0 && newSets.every(s => s.completed);
        anyCompleted = anyCompleted || newSets.some(s => s.completed);

        return { ...ex, detailedSets: newSets, completed: allCompleted };
      }
      return ex;
    });

    if (startedRest) {
      setRestTimer(60); // Default 60 seconds rest
      if (navigator.vibrate) navigator.vibrate(50);
      if (anyCompleted) unlockAchievement(auth.currentUser.uid, "first_workout");
    }

    setExercises(newExs);
    await saveExercises(newExs);
  };

  const updateSetValues = async (exId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    const num = parseFloat(value) || 0;
    const newExs = exercises.map(ex => {
      if (ex.id === exId && ex.detailedSets) {
        const newSets = ex.detailedSets.map(s => {
          if (s.id === setId) {
            return { ...s, [field]: num };
          }
          return s;
        });
        return { ...ex, detailedSets: newSets };
      }
      return ex;
    });
    setExercises(newExs);
    // Debounce save in real app, but for now we just save immediately when they type (or on blur ideally, but simple state first)
    await saveExercises(newExs);
  };

  const addSet = async (exId: string) => {
    const newExs = exercises.map(ex => {
      if (ex.id === exId) {
        const lastSet = ex.detailedSets?.[ex.detailedSets.length - 1];
        const newSet: ExerciseSet = {
          id: Math.random().toString(36).substring(7),
          reps: lastSet ? lastSet.reps : 10,
          weight: lastSet ? lastSet.weight : 0,
          completed: false,
        };
        const newDetailed = [...(ex.detailedSets || []), newSet];
        return { ...ex, detailedSets: newDetailed, completed: false };
      }
      return ex;
    });
    setExercises(newExs);
    await saveExercises(newExs);
  };

  const deleteSet = async (exId: string, setId: string) => {
    const newExs = exercises.map(ex => {
      if (ex.id === exId && ex.detailedSets) {
        const newSets = ex.detailedSets.filter(s => s.id !== setId);
        const allCompleted = newSets.length > 0 && newSets.every(s => s.completed);
        return { ...ex, detailedSets: newSets, completed: allCompleted };
      }
      return ex;
    });
    setExercises(newExs);
    await saveExercises(newExs);
  };

  const handleCreateExercise = async () => {
    if (!newExName.trim()) {
      toast.error("Descreva o nome do exercício.");
      return;
    }

    const exToSave: Exercise = {
      id: Math.random().toString(36).substring(7),
      name: newExName,
      sets: 1, reps: 0, weight: 0, completed: false,
      detailedSets: [
        { id: Math.random().toString(36).substring(7), reps: 10, weight: 0, completed: false }
      ]
    };

    const updatedList = [...exercises, exToSave];
    await saveExercises(updatedList);
    toast.success("Adicionado com sucesso!");
    setIsAddOpen(false);
    setNewExName("");
  };

  const handleDeleteExercise = async (id: string) => {
    const updated = exercises.filter(ex => ex.id !== id);
    await saveExercises(updated);
    toast.success("Deletado.");
  };

  // Stats computation
  const totalVolume = exercises.reduce((acc, ex) => {
    return acc + (ex.detailedSets?.reduce((sAcc, s) => sAcc + (s.completed ? s.reps * s.weight : 0), 0) || 0);
  }, 0);

  const completedSets = exercises.reduce((acc, ex) => {
    return acc + (ex.detailedSets?.filter(s => s.completed).length || 0);
  }, 0);

  const totalSets = exercises.reduce((acc, ex) => {
    return acc + (ex.detailedSets?.length || 0);
  }, 0);

  return (
    <div className="space-y-6 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registro de Treino</h2>
          <div className="flex items-center gap-2 mt-2 bg-muted/50 w-fit p-1 rounded-lg border border-border">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold capitalize min-w-[100px] text-center">
              {format(currentDate, "dd 'de' MMM", { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if(!open) setNewExName(""); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 h-10 px-6">
              <Plus className="w-4 h-4" />
              <span>Adicionar Exercício</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">Novo Exercício</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="ex-name" className="text-muted-foreground font-semibold">Qual exercício você vai fazer?</Label>
                <Input 
                  id="ex-name" 
                  placeholder="Ex: Supino Inclinado, Agachamento Livre..." 
                  value={newExName} 
                  onChange={e => setNewExName(e.target.value)} 
                  className="h-12 text-lg font-medium"
                  autoFocus
                />
              </div>
              <Button onClick={handleCreateExercise} className="w-full h-12 text-base font-bold transition-transform active:scale-95">
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* OVERVIEW STATS */}
      {exercises.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <Activity className="w-5 h-5 text-blue-500 mb-2" />
            <div className="text-2xl font-black">{totalSets}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Séries Totais</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <Check className="w-5 h-5 text-green-500 mb-2" />
            <div className="text-2xl font-black">{completedSets}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Concluídas</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <Dumbbell className="w-5 h-5 text-orange-500 mb-2" />
            <div className="text-2xl font-black">{totalVolume}<span className="text-sm text-muted-foreground ml-1 font-medium">kg</span></div>
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Volume</div>
          </div>
        </div>
      )}

      {exercises.length === 0 ? (
         <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl bg-muted/10 mx-auto max-w-lg">
           <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-10 h-10 text-primary opacity-80" />
           </div>
           <h3 className="text-xl font-bold mb-1">Dia de Descanso?</h3>
           <p className="text-sm text-muted-foreground mb-6">Você ainda não registrou nenhum exercício hoje. Comece a montar seu treino agora.</p>
           <Button onClick={() => setIsAddOpen(true)} className="font-bold">Começar Novo Treino</Button>
         </div>
      ) : (
        <div className="space-y-4">
          {exercises.map((ex, index) => (
            <Card key={ex.id} className={`border-border transition-all overflow-hidden bg-card shadow-sm group`}>
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <CardTitle className="text-lg font-bold">{ex.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteExercise(ex.id)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10 font-medium">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover Exercício
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-0 sm:p-4 sm:pt-0">
                <div className="w-full overflow-x-auto">
                    <table className="w-full mt-2 text-sm text-left">
                      <thead>
                        <tr className="uppercase text-[10px] tracking-wider font-bold text-muted-foreground border-b border-border/50">
                          <th className="px-4 py-2 w-16 text-center">Série</th>
                          <th className="px-2 py-2">kg</th>
                          <th className="px-2 py-2">Reps</th>
                          <th className="px-4 py-2 w-20 text-center">Feito</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ex.detailedSets?.map((set, setIndex) => (
                          <tr key={set.id} className={`border-b border-border/30 last:border-0 transition-colors ${set.completed ? 'bg-green-500/5' : 'hover:bg-muted/30'}`}>
                            <td className="px-4 py-3 text-center">
                              <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-semibold text-xs ${set.completed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                {setIndex + 1}
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              <Input 
                                type="number" 
                                className="w-full max-w-[80px] h-9 text-base font-bold bg-transparent border-border/50 focus:bg-background focus:ring-1 text-center px-1"
                                value={set.weight || ""} 
                                onChange={(e) => updateSetValues(ex.id, set.id, 'weight', e.target.value)}
                                disabled={set.completed}
                                inputMode="decimal"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Input 
                                type="number" 
                                className="w-full max-w-[80px] h-9 text-base font-bold bg-transparent border-border/50 focus:bg-background focus:ring-1 text-center px-1"
                                value={set.reps || ""} 
                                onChange={(e) => updateSetValues(ex.id, set.id, 'reps', e.target.value)}
                                disabled={set.completed}
                                inputMode="numeric"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => toggleSetComplete(ex.id, set.id)}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-105' : 'bg-muted text-muted-foreground hover:bg-green-500/20 hover:text-green-500 active:scale-95'}`}
                                >
                                  <Check className="w-5 h-5" strokeWidth={set.completed ? 3 : 2} />
                                </button>
                                {/* Only show delete if it's not the only set and not completed */}
                                {(ex.detailedSets?.length || 0) > 1 && !set.completed && (
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-red-500 transition-colors" onClick={() => deleteSet(ex.id, set.id)}>
                                     <X className="w-4 h-4" />
                                   </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                <div className="px-4 pb-4 sm:px-0 sm:pb-0 mt-3 pt-3 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="w-full font-bold text-primary hover:bg-primary/10 gap-2 h-10" onClick={() => addSet(ex.id)}>
                    <Plus className="w-4 h-4" />
                    Adicionar Série
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ENHANCED REST TIMER OVERLAY */}
      <AnimatePresence>
        {restTimer !== null && (
          <motion.div
            initial={{ y: 150, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 150, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] bg-card/95 backdrop-blur-xl border border-primary/30 shadow-[0_10px_40px_-10px_rgba(var(--primary),0.3)] rounded-2xl p-4 z-50 overflow-hidden"
          >
            {/* Progress bar background */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${(restTimer / 60) * 100}%` }}
            />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Descanso</div>
                  <div className="text-3xl font-black font-mono tracking-tighter tabular-nums leading-none text-primary">
                    {formatTime(restTimer)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <Button variant="outline" size="icon" className="h-10 w-10 border-primary/20 hover:bg-primary/10 text-primary" onClick={() => setRestTimer(restTimer + 15)}>
                   <span className="font-bold text-xs">+15</span>
                 </Button>
                 <Button variant="outline" size="icon" className="h-10 w-10 border-primary/20 hover:bg-primary/10 text-primary" onClick={() => setRestTimer(Math.max(0, restTimer - 15))}>
                   <span className="font-bold text-xs">-15</span>
                 </Button>
                 <div className="w-px h-8 bg-border mx-1" />
                 <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors" onClick={() => setRestTimer(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
