import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ChevronLeft, ChevronRight, Apple, Trash2, Camera, Sparkles, Loader2, Copy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GoogleGenAI, Type } from "@google/genai";
import { unlockAchievement } from "@/lib/achievements";

type FoodItem = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: string;
};

export default function DietTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<FoodItem>>({
    name: "", calories: 0, protein: 0, carbs: 0, fat: 0, amount: "100g"
  });

  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dateStr = format(currentDate, "yyyy-MM-dd");

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unsubscribeProfile = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
    });

    return () => unsubscribeProfile();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);

    const docRef = doc(db, "users", auth.currentUser.uid, "diet", dateStr);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setItems(docSnap.data().items || []);
      } else {
        setItems([]);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}/diet/${dateStr}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dateStr]);

  const saveItems = async (newItems: FoodItem[]) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, "users", auth.currentUser.uid, "diet", dateStr);
      await setDoc(docRef, {
        date: dateStr,
        items: newItems,
        water: profileData?.water || 0 // Retain water if exists
      }, { merge: true });

      // Check achievement
      const tCal = profileData?.targetCalories || 2400;
      const tProt = profileData?.targetProtein || 160;
      
      const cal = newItems.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
      const prot = newItems.reduce((acc, item) => acc + (Number(item.protein) || 0), 0);

      // Met within margin (calories +- 10%, protein >= 95%)
      if (cal >= tCal * 0.9 && cal <= tCal * 1.1 && prot >= tProt * 0.95) {
        unlockAchievement(auth.currentUser.uid, "macro_master");
      }

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}/diet/${dateStr}`);
      toast.error("Erro ao salvar refeição.");
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.calories) {
      toast.error("Preencha o nome e as calorias.");
      return;
    }
    const itemToAdd: FoodItem = {
      name: newItem.name || "",
      calories: Number(newItem.calories) || 0,
      protein: Number(newItem.protein) || 0,
      carbs: Number(newItem.carbs) || 0,
      fat: Number(newItem.fat) || 0,
      amount: newItem.amount || "100g"
    };
    
    const updatedItems = [...items, itemToAdd];
    setItems(updatedItems);
    await saveItems(updatedItems);
    
    setIsAddOpen(false);
    setNewItem({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0, amount: "100g" });
    toast.success("Refeição adicionada!");
  };

  const handleDeleteItem = async (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    await saveItems(updatedItems);
    toast.success("Refeição removida");
  };

  const handleRepeatPreviousDay = async () => {
    if (!auth.currentUser) return;
    try {
      const prevDateStr = format(subDays(currentDate, 1), "yyyy-MM-dd");
      const docRef = doc(db, "users", auth.currentUser.uid, "diet", prevDateStr);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists() && docSnap.data().items?.length > 0) {
          const previousItems = docSnap.data().items;
          const updatedItems = [...items, ...previousItems];
          setItems(updatedItems);
          await saveItems(updatedItems);
          toast.success("Refeições copiadas do dia anterior!");
      } else {
          toast.error("Nenhuma refeição encontrada no dia anterior.");
      }
    } catch (e) {
      toast.error("Erro ao buscar refeições anteriores.");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPhotoOpen(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        try {
          // Initialize GenAI
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
              { text: "Você é um nutricionista experiente. Analise a imagem deste alimento/prato e estime seus macronutrientes totais aproximados em uma porção média que julgar. Retorne um JSON." },
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64String,
                }
              }
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nome curto do prato/alimento identicado. (em PT-BR)" },
                  calories: { type: Type.INTEGER, description: "Total de Calorias (kcal) estimadas." },
                  protein: { type: Type.INTEGER, description: "Total de Proteína (g) estimada." },
                  carbs: { type: Type.INTEGER, description: "Total de Carboidratos (g) estimados." },
                  fat: { type: Type.INTEGER, description: "Total de Gordura (g) estimada." },
                  amount: { type: Type.STRING, description: "Tamanho da porção assumida, ex: '1 prato', '200g'. (em PT-BR)" }
                },
                required: ["name", "calories", "protein", "carbs", "fat", "amount"]
              }
            }
          });

          const result = JSON.parse(response.text?.trim() || "{}");
          
          setNewItem({
            name: result.name || "Refeição IA",
            calories: result.calories || 0,
            protein: result.protein || 0,
            carbs: result.carbs || 0,
            fat: result.fat || 0,
            amount: result.amount || "1 porção",
          });
          
          toast.success("Imagem analisada! Confirme os dados.");
          setIsPhotoOpen(false);
          setIsAddOpen(true); // Open the manual add dialog with pre-filled data

        } catch (apiError: any) {
          console.error("GenAI Error:", apiError);
          toast.error("Erro na IA: " + (apiError.message || apiError.toString()));
          setIsPhotoOpen(false);
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível ler a imagem.");
      setIsPhotoOpen(false);
    }
  };

  const totalCalories = items.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
  const totalProtein = items.reduce((acc, item) => acc + (Number(item.protein) || 0), 0);
  const totalCarbs = items.reduce((acc, item) => acc + (Number(item.carbs) || 0), 0);
  const totalFat = items.reduce((acc, item) => acc + (Number(item.fat) || 0), 0);

  const targetCalories = profileData?.targetCalories || 2400;
  const targetProtein = profileData?.targetProtein || 160;
  const targetCarbs = profileData?.targetCarbs || 200;
  const targetFat = profileData?.targetFat || 80;

  const remainingCalories = Math.max(0, targetCalories - totalCalories);
  const calPercent = Math.min(100, (totalCalories / targetCalories) * 100);

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sua Dieta</h2>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1 shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium w-28 text-center capitalize">
            {format(currentDate, "dd MMM", { locale: ptBR })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 border-border bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-[#F27D26]/80 -z-10" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between z-10 relative">
              Resumo do Dia
              <span className="text-sm font-normal text-primary-foreground/80 capitalize">
                {format(currentDate, "EEEE", { locale: ptBR })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 z-10 relative">
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/80 mb-2">Restante</p>
                <h3 className="text-5xl md:text-6xl font-black">{remainingCalories}</h3>
                <p className="text-xs text-primary-foreground/80 mt-1">kcal</p>
              </div>
              <div className="flex flex-col justify-center gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1 text-primary-foreground">
                    <span>CONSUMIDO</span>
                    <span>{totalCalories} kcal</span>
                  </div>
                  <Progress value={calPercent} className="h-2 bg-primary-foreground/20 [&>div]:bg-primary-foreground" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1 text-primary-foreground">
                    <span>META</span>
                    <span>{targetCalories} kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Macros do Dia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Proteína", current: totalProtein, target: targetProtein, color: "bg-blue-500", progressClass: "[&>div]:bg-blue-500" },
              { label: "Carbos", current: totalCarbs, target: targetCarbs, color: "bg-green-500", progressClass: "[&>div]:bg-green-500" },
              { label: "Gordura", current: totalFat, target: targetFat, color: "bg-yellow-500", progressClass: "[&>div]:bg-yellow-500" },
            ].map((macro) => (
              <div key={macro.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">{macro.label}</span>
                  <span className="text-muted-foreground">{Math.round(macro.current)}g / {macro.target}g</span>
                </div>
                <Progress value={Math.min(100, (macro.current / macro.target) * 100)} className={`h-1.5 ${macro.progressClass}`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Refeições Consumidas</h3>
          
          <div className="flex items-center gap-2">
            <Dialog open={isPhotoOpen} onOpenChange={setIsPhotoOpen}>
              <DialogContent className="sm:max-w-sm hide-close border-none bg-black/80 backdrop-blur-md">
                <DialogTitle className="sr-only">Analisando imagem</DialogTitle>
                <div className="flex flex-col items-center py-6 gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 border-4 border-[#F27D26] rounded-full animate-ping opacity-20" />
                    <div className="w-20 h-20 bg-[#F27D26]/20 rounded-full flex items-center justify-center relative z-10 border-2 border-[#F27D26]/50">
                      <Sparkles className="w-10 h-10 text-[#F27D26] animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-white font-bold text-lg mb-1">FitGenius Analisando</h3>
                    <p className="text-white/60 text-sm">Extraindo macros do seu prato...</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-[#F27D26]/10 border-[#F27D26]/30 text-[#F27D26] hover:bg-[#F27D26]/20"
              onClick={() => fileInputRef.current?.click()}
              title="Reconhecimento por IA"
            >
              <Camera className="w-4 h-4" />
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              className="bg-[#F27D26]/10 border-[#F27D26]/30 text-[#F27D26] hover:bg-[#F27D26]/20"
              onClick={handleRepeatPreviousDay}
              title="Copiar refeições do dia anterior"
            >
              <Copy className="w-4 h-4" />
            </Button>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-[#F27D26] hover:bg-[#F27D26]/90 text-white">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Adicionar</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Refeição / Alimento</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="name">Nome / Descrição</Label>
                      <Input id="name" placeholder="Ex: Frango grelhado" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Porção</Label>
                      <Input id="amount" placeholder="Ex: 150g" value={newItem.amount} onChange={e => setNewItem({...newItem, amount: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cals">Calorias (kcal)</Label>
                      <Input id="cals" type="number" value={newItem.calories || ""} onChange={e => setNewItem({...newItem, calories: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prot">Proteína (g)</Label>
                      <Input id="prot" type="number" value={newItem.protein || ""} onChange={e => setNewItem({...newItem, protein: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carb">Carbos (g)</Label>
                      <Input id="carb" type="number" value={newItem.carbs || ""} onChange={e => setNewItem({...newItem, carbs: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fat">Gordura (g)</Label>
                      <Input id="fat" type="number" value={newItem.fat || ""} onChange={e => setNewItem({...newItem, fat: Number(e.target.value)})} />
                    </div>
                  </div>
                  <Button onClick={handleAddItem} className="w-full bg-[#F27D26] hover:bg-[#F27D26]/90 text-white mt-2">
                    Adicionar à Dieta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#F27D26] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border border-dashed rounded-xl">
            <Apple className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground font-medium">Nenhum registro para este dia</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm mx-auto">Use o ícone da <b>Câmera</b> para analisar uma foto do seu prato com a IA.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, idx) => (
              <Card key={idx} className="border-border hover:border-[#F27D26]/30 transition-all group bg-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-[#F27D26]/10 group-hover:text-[#F27D26] transition-colors">
                      <Apple className="w-6 h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold truncate">{item.name} <span className="text-sm font-normal text-muted-foreground">({item.amount})</span></h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] md:text-xs text-muted-foreground font-medium">
                        <span className="text-blue-500 bg-blue-500/10 px-1 py-0.5 rounded">{item.protein}g P</span>
                        <span className="text-green-500 bg-green-500/10 px-1 py-0.5 rounded">{item.carbs}g C</span>
                        <span className="text-yellow-500 bg-yellow-500/10 px-1 py-0.5 rounded">{item.fat}g G</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-bold text-lg">{item.calories}<span className="text-[10px] font-normal ml-0.5 opacity-60">kcal</span></p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteItem(idx)}
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
