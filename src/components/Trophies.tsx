import { ACHIEVEMENTS, TrophyType } from "@/lib/achievements";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";
import { Award, Lock, Trophy } from "lucide-react";
import { Progress } from "./ui/progress";

export default function Trophies() {
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  
  useEffect(() => {
    if (!auth.currentUser) return;
    const docRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserAchievements(data.achievements || []);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
    });
    return () => unsubscribe();
  }, []);

  const achievementsList = Object.values(ACHIEVEMENTS);
  
  const platinum = achievementsList.filter(a => a.type === "platinum");
  const gold = achievementsList.filter(a => a.type === "gold");
  const silver = achievementsList.filter(a => a.type === "silver");
  const bronze = achievementsList.filter(a => a.type === "bronze");

  const unlPlat = platinum.filter(a => userAchievements.includes(a.id)).length;
  const unlGold = gold.filter(a => userAchievements.includes(a.id)).length;
  const unlSilver = silver.filter(a => userAchievements.includes(a.id)).length;
  const unlBronze = bronze.filter(a => userAchievements.includes(a.id)).length;

  const totalUnlocked = userAchievements.length;
  const totalAvailable = achievementsList.length;

  const renderSection = (title: string, items: typeof achievementsList, unlockedCount: number, icon: string, bgClass: string) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">{icon}</span> {title}
          </h3>
          <span className="text-sm text-muted-foreground font-mono">{unlockedCount} / {items.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((award) => {
            const isUnlocked = userAchievements.includes(award.id);
            return (
              <div key={award.id} className={`flex flex-col p-4 rounded-xl border transition-all ${isUnlocked ? 'bg-card border-border shadow-sm' : 'bg-muted/30 border-dashed border-border/50 opacity-80'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-3xl shadow-inner ${isUnlocked ? `bg-gradient-to-tr ${award.color}` : 'bg-muted border border-border'}`}>
                    {isUnlocked ? award.icon : <Lock className="w-6 h-6 text-muted-foreground opacity-50" />}
                  </div>
                  <div className="flex-1">
                    <h5 className={`font-bold text-sm tracking-tight ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{award.title}</h5>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">{award.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Mural de Troféus
        </h2>
        <p className="text-muted-foreground mt-2">Sua estante de conquistas. Desbloqueie todas para se tornar uma lenda.</p>
      </header>

      <Card className="border-border shadow-sm bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
            <div className="p-6 text-center bg-purple-500/5">
              <div className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-1">Platina</div>
              <div className="text-3xl font-black">{unlPlat}</div>
            </div>
            <div className="p-6 text-center bg-yellow-500/5">
              <div className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-1">Ouro</div>
              <div className="text-3xl font-black">{unlGold}</div>
            </div>
            <div className="p-6 text-center bg-slate-500/5">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Prata</div>
              <div className="text-3xl font-black">{unlSilver}</div>
            </div>
            <div className="p-6 text-center bg-orange-500/5">
              <div className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-1">Bronze</div>
              <div className="text-3xl font-black">{unlBronze}</div>
            </div>
          </div>
          <div className="p-6 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">Progresso Total</span>
              <span className="text-sm font-mono text-muted-foreground">{totalUnlocked} / {totalAvailable}</span>
            </div>
            <Progress value={(totalUnlocked / totalAvailable) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-12">
        {renderSection("Troféus de Platina", platinum, unlPlat, "👑", "bg-purple-500/10")}
        {renderSection("Troféus de Ouro", gold, unlGold, "🥇", "bg-yellow-500/10")}
        {renderSection("Troféus de Prata", silver, unlSilver, "🥈", "bg-slate-500/10")}
        {renderSection("Troféus de Bronze", bronze, unlBronze, "🥉", "bg-orange-500/10")}
      </div>
    </div>
  );
}
