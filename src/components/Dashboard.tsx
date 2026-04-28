import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Flame, Droplets, Target } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";

export default function Dashboard() {
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unsubscribe = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
    });

    return () => unsubscribe();
  }, []);

  const stats = [
    { 
      title: "Calorias Consumidas", 
      value: "0", 
      target: profileData?.targetCalories?.toString() || "2400", 
      unit: "kcal", 
      icon: Flame, 
      color: "text-orange-500", 
      progress: profileData?.targetCalories ? (0 / profileData.targetCalories) * 100 : 0 
    },
    { 
      title: "Proteína", 
      value: "0", 
      target: profileData?.targetProtein?.toString() || "160", 
      unit: "g", 
      icon: Activity, 
      color: "text-blue-500", 
      progress: profileData?.targetProtein ? (0 / profileData.targetProtein) * 100 : 0 
    },
    { 
      title: "Carbos", 
      value: "0", 
      target: profileData?.targetCarbs?.toString() || "200", 
      unit: "g", 
      icon: Activity, 
      color: "text-green-500", 
      progress: profileData?.targetCarbs ? (0 / profileData.targetCarbs) * 100 : 0 
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
                <Progress value={stat.progress || 0} className="h-1 mt-4" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border bg-card">
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

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Dica Nutricional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video rounded-xl bg-muted overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=400&auto=format&fit=crop" 
                alt="Saudável" 
                className="object-cover w-full h-full"
              />
            </div>
            <p className="text-sm leading-relaxed opacity-80 italic">
              "Sabia que consumir proteínas no café da manhã pode ajudar a controlar o apetite ao longo do dia?"
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
