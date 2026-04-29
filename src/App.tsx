import { motion } from "motion/react";
import { Dumbbell, Utensils, User as UserIcon, Home, LogIn, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { auth, signInWithGoogle } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Dashboard from "./components/Dashboard";
import WorkoutTracker from "./components/WorkoutTracker";
import DietTracker from "./components/DietTracker";
import Profile from "./components/Profile";
import Trophies from "./components/Trophies";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const tabs = [
    { id: "dashboard", label: "Geral", icon: Home },
    { id: "workouts", label: "Treino", icon: Dumbbell },
    { id: "diet", label: "Dieta", icon: Utensils },
    { id: "trophies", label: "Troféus", icon: Award },
    { id: "profile", label: "Perfil", icon: UserIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Dumbbell className="w-12 h-12 text-[#F27D26]" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <Toaster />
        <Card className="max-w-md w-full border-border shadow-xl overflow-hidden">
          <div className="h-2 bg-primary" />
          <CardHeader className="pt-12">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
              <Dumbbell className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">FitGenius</h1>
            <p className="text-muted-foreground mt-2">Sua jornada fitness otimizada por IA começa aqui.</p>
          </CardHeader>
          <CardContent className="pb-12 px-8">
            <Button 
              onClick={() => signInWithGoogle().catch(err => toast.error("Falha ao entrar: " + err.message))}
              className="w-full h-14 text-lg font-bold transition-all gap-3"
            >
              <LogIn className="w-5 h-5" />
              Entrar com Google
            </Button>
            <p className="text-[10px] mt-6 text-muted-foreground uppercase tracking-widest font-mono">
              Nenhum dado será compartilhado sem permissão
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Sidebar / Bottom Nav (Mobile) */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col border-r border-border p-6 bg-card z-50">
        <h1 className="text-2xl font-bold tracking-tighter mb-12 flex items-center gap-2">
          <Dumbbell className="w-8 h-8 text-[#F27D26]" />
          <span>FitGenius</span>
        </h1>
        
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn(
                "w-5 h-5",
                activeTab === tab.id ? "text-primary-foreground" : "group-hover:text-primary"
              )} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono italic">
            v1.0.0 — Crafted for Performance
          </p>
        </div>
      </div>

      <Toaster />
      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === "workouts" && <WorkoutTracker />}
          {activeTab === "diet" && <DietTracker />}
          {activeTab === "trophies" && <Trophies />}
          {activeTab === "profile" && <Profile />}
        </motion.div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-card border-t border-border px-6 py-4 flex justify-between items-center z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <tab.icon className="w-6 h-6" />
          </button>
        ))}
      </div>
    </div>
  );
}
