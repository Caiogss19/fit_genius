import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Award, Calendar, Weight, Moon, Sun, Save, Activity } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useTheme } from "./theme-provider";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { calculateTDEE, calculateMacros } from "@/lib/calculations";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";
import { ACHIEVEMENTS } from "@/lib/achievements";

export default function Profile() {
  const user = auth.currentUser;
  const { theme, setTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    age: "25",
    weight: "80",
    height: "180",
    gender: "male",
    activityLevel: "moderate",
    goal: "maintain",
    targetCalories: "2500",
    targetProtein: "160",
    targetCarbs: "200",
    targetFat: "80",
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserAchievements(data.achievements || []);
          setFormData({
            age: data.age?.toString() || "25",
            weight: data.weight?.toString() || "80",
            height: data.height?.toString() || "180",
            gender: data.gender || "male",
            activityLevel: data.activityLevel || "moderate",
            goal: data.goal || "maintain",
            targetCalories: data.targetCalories?.toString() || "2500",
            targetProtein: data.targetProtein?.toString() || "160",
            targetCarbs: data.targetCarbs?.toString() || "200",
            targetFat: data.targetFat?.toString() || "80",
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      toast.success("Saiu com sucesso!");
    }).catch(err => toast.error("Erro ao sair: " + err.message));
  };

  const handleAutoSuggest = () => {
    const calories = calculateTDEE(
      formData.gender as 'male' | 'female',
      Number(formData.weight),
      Number(formData.height),
      Number(formData.age),
      formData.activityLevel
    );
    
    let adjustedCalories = calories;
    if (formData.goal === 'lose') adjustedCalories -= 500;
    if (formData.goal === 'gain') adjustedCalories += 500;

    const macros = calculateMacros(adjustedCalories, formData.goal);
    
    setFormData(prev => ({
      ...prev,
      targetCalories: adjustedCalories.toString(),
      targetProtein: macros.protein.toString(),
      targetCarbs: macros.carbs.toString(),
      targetFat: macros.fat.toString(),
    }));
    toast.success("Metas sugeridas aplicadas! Salve para confirmar.");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const profileData = {
        name: user.displayName || "Usuário",
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        targetCalories: Number(formData.targetCalories),
        targetProtein: Number(formData.targetProtein),
        targetCarbs: Number(formData.targetCarbs),
        targetFat: Number(formData.targetFat),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, profileData, { merge: true });
      toast.success("Perfil atualizado!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      toast.error("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-card border border-border rounded-3xl shadow-sm relative">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ""} className="w-32 h-32 rounded-full border-4 border-[#F27D26]" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#F27D26] to-orange-300 flex items-center justify-center text-white text-4xl font-black">
              {user?.displayName?.charAt(0) || "U"}
            </div>
          )}
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center text-primary-foreground">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black mb-1">{user?.displayName || "Usuário"}</h2>
          <p className="text-muted-foreground mb-4 flex items-center gap-1 justify-center md:justify-start">
            <Calendar className="w-4 h-4" /> {user?.metadata.creationTime ? `Membro desde ${new Date(user.metadata.creationTime).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}` : "Membro novo"}
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="px-3 py-1 bg-green-500/10 text-green-600 text-xs font-bold rounded-full uppercase tracking-widest">Grátis</div>
            <div className="px-3 py-1 bg-blue-500/10 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest italic">Ajuste suas metas abaixo</div>
          </div>
        </div>
        <Button variant="destructive" onClick={handleSignOut} className="gap-2 shrink-0">
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="border-b border-border mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#F27D26]" />
            <CardTitle>Personalização de Dados</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Idade</Label>
              <Input type="number" value={formData.age} onChange={e => setFormData(p => ({ ...p, age: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Peso (kg)</Label>
              <Input type="number" value={formData.weight} onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Altura (cm)</Label>
              <Input type="number" value={formData.height} onChange={e => setFormData(p => ({ ...p, height: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Gênero</Label>
              <Select value={formData.gender} onValueChange={(v) => setFormData(p => ({...p, gender: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nível de Atividade</Label>
              <Select value={formData.activityLevel} onValueChange={(v) => setFormData(p => ({...p, activityLevel: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentário (Pouco exercício)</SelectItem>
                  <SelectItem value="light">Leve (1-2 dias/sem)</SelectItem>
                  <SelectItem value="moderate">Moderado (3-5 dias/sem)</SelectItem>
                  <SelectItem value="active">Ativo (6-7 dias/sem)</SelectItem>
                  <SelectItem value="very_active">Atleta (2x por dia)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Objetivo Principal</Label>
              <Select value={formData.goal} onValueChange={(v) => setFormData(p => ({...p, goal: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Perder Peso</SelectItem>
                  <SelectItem value="maintain">Manter Peso</SelectItem>
                  <SelectItem value="gain">Ganhar Massa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground w-full md:w-auto">
              Ao alterar os dados acima, você pode gerar novas metas automaticamente:
            </p>
            <Button variant="outline" onClick={handleAutoSuggest} className="w-full md:w-auto shrink-0 border-[#F27D26]/50 text-[#F27D26] hover:bg-[#F27D26]/10">
              Sugerir Metas
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border mb-4">
          <CardTitle>Metas Editáveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Calorias (kcal)</Label>
              <Input type="number" value={formData.targetCalories} onChange={e => setFormData(p => ({ ...p, targetCalories: e.target.value }))} className="font-bold text-[#F27D26]" />
            </div>
            <div className="space-y-2">
              <Label>Proteína (g)</Label>
              <Input type="number" value={formData.targetProtein} onChange={e => setFormData(p => ({ ...p, targetProtein: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Carbos (g)</Label>
              <Input type="number" value={formData.targetCarbs} onChange={e => setFormData(p => ({ ...p, targetCarbs: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Gordura (g)</Label>
              <Input type="number" value={formData.targetFat} onChange={e => setFormData(p => ({ ...p, targetFat: e.target.value }))} />
            </div>
          </div>
          
          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#F27D26] hover:bg-[#F27D26]/90 text-white gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar Perfil e Metas"}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
