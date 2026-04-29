import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Flame, Droplets, Target, Zap, Utensils, Dumbbell, Award, ArrowUpRight, Plus, Minus } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { unlockAchievement } from "@/lib/achievements";

export default function Dashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [profileData, setProfileData] = useState<any>(null);
  const [dietItems, setDietItems] = useState<any[]>([]);
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [workoutData, setWorkoutData] = useState<any>(null);
  const dateStr = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unsubscribeProfile = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
    });

    const unsubscribeDiet = onSnapshot(doc(db, "users", auth.currentUser.uid, "diet", dateStr), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDietItems(data.items || []);
        setWaterIntake(data.water || 0);
      } else {
        setDietItems([]);
        setWaterIntake(0);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}/diet/${dateStr}`);
    });

    const unsubscribeWorkout = onSnapshot(doc(db, "users", auth.currentUser.uid, "workouts", dateStr), (docSnap) => {
      if (docSnap.exists()) {
        setWorkoutData(docSnap.data());
      } else {
        setWorkoutData(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}/workouts/${dateStr}`);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeDiet();
      unsubscribeWorkout();
    };
  }, []);

  const totalCalories = dietItems.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
  const totalProtein = dietItems.reduce((acc, item) => acc + (Number(item.protein) || 0), 0);
  const totalCarbs = dietItems.reduce((acc, item) => acc + (Number(item.carbs) || 0), 0);

  const targetCal = Number(profileData?.targetCalories) || 2400;
  const targetProt = Number(profileData?.targetProtein) || 160;
  const targetCarbs = Number(profileData?.targetCarbs) || 200;

  const stats = [
    { 
      title: "Calorias Consumidas", 
      value: totalCalories.toString(), 
      target: targetCal.toString(), 
      unit: "kcal", 
      icon: Flame, 
      color: "text-[#F27D26]",
      bg: "bg-[#F27D26]/10",
      progress: (totalCalories / targetCal) * 100 
    },
    { 
      title: "Proteína", 
      value: totalProtein.toString(), 
      target: targetProt.toString(), 
      unit: "g", 
      icon: Activity, 
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      progress: (totalProtein / targetProt) * 100 
    },
    { 
      title: "Carboidratos", 
      value: totalCarbs.toString(), 
      target: targetCarbs.toString(), 
      unit: "g", 
      icon: Activity, 
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      progress: (totalCarbs / targetCarbs) * 100 
    },
    { 
      title: "Peso Atual", 
      value: profileData?.weight?.toString() || "0", 
      target: profileData?.goal === 'lose' ? (Number(profileData.weight) - 2).toString() : profileData?.goal === 'gain' ? (Number(profileData.weight) + 2).toString() : profileData?.weight?.toString() || "0", 
      unit: "kg", 
      icon: Target, 
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      progress: 100 
    },
  ];

  const streak = profileData?.streak || 0; // Simulated / fetched later

  const updateWater = async (amountInLiters: number) => {
    if (!auth.currentUser) return;
    const newAmount = Math.max(0, Number((waterIntake + amountInLiters).toFixed(2)));
    setWaterIntake(newAmount); // Optimistic UI
    
    try {
      const docRef = doc(db, "users", auth.currentUser.uid, "diet", dateStr);
      await setDoc(docRef, { 
        date: dateStr, 
        items: dietItems, // Ensure items and date are present to pass firestore rule
        water: newAmount 
      }, { merge: true });

      if (newAmount >= 2.5 && waterIntake < 2.5) {
        unlockAchievement(auth.currentUser.uid, "hydration_master");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}/diet/${dateStr}`);
      toast.error("Erro ao registrar água.");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Geral</h2>
          <p className="text-muted-foreground mt-1">Bem-vindo de volta, {profileData?.name || "Atleta"}! {totalCalories === 0 ? "Pronto para começar o dia?" : "Continue no foco."}</p>
        </div>
        
        {/* Streak Badge */}
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-orange-500">Ofensiva</div>
            <div className="text-xl font-black leading-none">{streak} dias</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-border shadow-sm overflow-hidden group hover:shadow-md transition-all bg-card h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="mt-auto pt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">{stat.value}</span>
                  <span className="text-sm font-medium text-muted-foreground">/ {stat.target} {stat.unit}</span>
                </div>
                <Progress value={Math.min(100, stat.progress || 0)} className="h-1.5 mt-4" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WATER TRACKER WIDGET */}
        <Card className="border-border bg-card shadow-sm col-span-1 border-t-4 border-t-blue-500 overflow-hidden group flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg flex items-center justify-between">
              Hidratação
              <span className="text-xs font-mono text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">Meta: 2.5L</span>
            </CardTitle>
            <CardDescription>Acompanhe seu consumo diário</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 relative flex-1 flex flex-col justify-between">
            <div className="flex flex-col items-center justify-center text-center space-y-8 mb-6">
              <div className="relative">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-[spin_4s_linear_infinite] border-t-blue-500" />
                <div className="w-36 h-36 rounded-full border border-blue-500/20 flex flex-col items-center justify-center bg-card z-10 relative shadow-inner">
                  <div className="text-4xl font-black text-blue-500">{waterIntake.toFixed(1)}<span className="text-lg text-blue-500/50">L</span></div>
                  <span className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-wider">{Math.round((waterIntake/2.5)*100)}% concluído</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                 <Droplets className="w-4 h-4 text-blue-500" />
                 {Math.floor(waterIntake / 0.5)} Garrafas (500ml)
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-auto">
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 bg-card border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all" onClick={() => updateWater(-0.25)}>
                <Minus className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground">-250ml</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 bg-card border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-blue-500" onClick={() => updateWater(0.25)}>
                <Plus className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold">Copo</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 bg-card border-border hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-blue-500" onClick={() => updateWater(0.5)}>
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold">Garrafa</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TREINO WIDGET */}
        <Card className="lg:col-span-2 border-border bg-card shadow-sm relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Dumbbell className="w-64 h-64 rotate-12" />
          </div>
          <CardHeader>
             <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary mb-2">
               <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
               Progresso de Treino
             </div>
            <CardTitle className="text-2xl">Treino de Hoje</CardTitle>
            <CardDescription>Sua rotina programada e recomendada</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center relative z-10">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gradient-to-r from-muted to-muted/50 rounded-2xl border border-border group-hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-inner mb-auto shrink-0">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{workoutData?.name || "Treino do Dia"}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                       <span className={`bg-background px-2 py-0.5 rounded-md border border-border text-xs font-mono ${(workoutData?.exercises?.filter((e: any) => e.completed).length || 0) === (workoutData?.exercises?.length || 0) && (workoutData?.exercises?.length || 0) > 0 ? 'text-green-500' : ''}`}>
                         {workoutData?.exercises?.filter((e: any) => e.completed).length || 0} / {workoutData?.exercises?.length || 0} concluídos
                       </span>
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => onNavigate("workouts")}
                  className="font-bold group bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 shadow-xl shadow-primary/20 w-full sm:w-auto"
                >
                  Ir para Treino
                  <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </div>
            </div>
            
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

