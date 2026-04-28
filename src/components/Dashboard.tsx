import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Flame, Droplets, Target, Plus, Minus } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";
import { format } from "date-fns";
import { Button } from "./ui/button";

export default function Dashboard() {
  const [profileData, setProfileData] = useState<any>(null);
  const [dietItems, setDietItems] = useState<any[]>([]);
  const [waterIntake, setWaterIntake] = useState<number>(0);
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

    return () => {
      unsubscribeProfile();
      unsubscribeDiet();
    };
  }, []);

  const totalCalories = dietItems.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
  const totalProtein = dietItems.reduce((acc, item) => acc + (Number(item.protein) || 0), 0);
  const totalCarbs = dietItems.reduce((acc, item) => acc + (Number(item.carbs) || 0), 0);

  const stats = [
    { 
      title: "Calorias Consumidas", 
      value: totalCalories.toString(), 
      target: profileData?.targetCalories?.toString() || "2400", 
      unit: "kcal", 
      icon: Flame, 
      color: "text-orange-500", 
      progress: profileData?.targetCalories ? (totalCalories / profileData.targetCalories) * 100 : 0 
    },
    { 
      title: "Proteína", 
      value: totalProtein.toString(), 
      target: profileData?.targetProtein?.toString() || "160", 
      unit: "g", 
      icon: Activity, 
      color: "text-blue-500", 
      progress: profileData?.targetProtein ? (totalProtein / profileData.targetProtein) * 100 : 0 
    },
    { 
      title: "Carbos", 
      value: totalCarbs.toString(), 
      target: profileData?.targetCarbs?.toString() || "200", 
      unit: "g", 
      icon: Activity, 
      color: "text-green-500", 
      progress: profileData?.targetCarbs ? (totalCarbs / profileData.targetCarbs) * 100 : 0 
    },
    { 
      title: "Peso Atual", 
      value: profileData?.weight?.toString() || "0", 
      target: profileData?.goal === 'lose' ? (profileData.weight - 2).toString() : profileData?.goal === 'gain' ? (profileData.weight + 2).toString() : profileData?.weight?.toString() || "0", 
      unit: "kg", 
      icon: Target, 
      color: "text-indigo-500", 
      progress: 100 
    },
  ];

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
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}/diet/${dateStr}`);
      toast.error("Erro ao registrar água.");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Painel Principal</h2>
        <p className="text-muted-foreground">Bem-vindo de volta, {profileData?.name || "Usuário"}! Aqui está seu resumo de hoje.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-border shadow-sm overflow-hidden group hover:border-[#F27D26]/30 transition-all bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-60 uppercase tracking-wider">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}<span className="text-sm font-normal opacity-40 ml-1">{stat.unit}</span></div>
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: {stat.target} {stat.unit}
                </p>
                <Progress value={Math.min(100, stat.progress || 0)} className="h-1 mt-4" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* WATER TRACKER WIDGET */}
        <Card className="border-border bg-card shadow-sm col-span-1 lg:col-span-1 border-b-4 border-b-blue-500 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-500/5">
            <CardTitle className="font-bold">Água (Hoje)</CardTitle>
            <Droplets className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-pulse" />
                <div className="w-32 h-32 rounded-full border-4 border-blue-500 flex flex-col items-center justify-center bg-card z-10 relative shadow-inner">
                  <h3 className="text-3xl font-black text-blue-500">{waterIntake.toFixed(1)}</h3>
                  <span className="text-sm text-muted-foreground">L / 2.5 L</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 text-blue-500 border-blue-500/50 hover:bg-blue-500/10" onClick={() => updateWater(-0.25)}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Button className="font-bold bg-blue-500 hover:bg-blue-600 text-white gap-2 w-full text-sm" onClick={() => updateWater(0.25)}>
                  <Plus className="w-4 h-4 hidden sm:inline" /> 
                  + 250ml
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Treino de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F27D26]/10 rounded-xl border border-[#F27D26]/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F27D26] flex items-center justify-center text-primary-foreground font-bold">A</div>
                  <div>
                    <h4 className="font-bold">Peito e Tríceps</h4>
                    <p className="text-sm text-muted-foreground">6 exercícios • Estimativa 55 min</p>
                  </div>
                </div>
                <button 
                  onClick={() => toast.success("Treino iniciado! Foco no progresso.")}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-[#F27D26] transition-colors"
                >
                  Começar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
