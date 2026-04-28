import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Coffee, UtensilsCrossed, Apple, Moon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DietTracker() {
  const meals = [
    { title: "Café da Manhã", icon: Coffee, calories: 450, macros: "30P / 50C / 12G", items: ["Ovos Mexidos", "Pão Integral"] },
    { title: "Almoço", icon: UtensilsCrossed, calories: 750, macros: "45P / 80C / 20G", items: ["Frango Grelhado", "Arroz Feijão", "Salada"] },
    { title: "Lanche", icon: Apple, calories: 300, macros: "20P / 40C / 8G", items: ["Whey Protein", "Banana"] },
    { title: "Jantar", icon: Moon, calories: 550, macros: "35P / 40C / 15G", items: ["Peixe", "Batata Doce"] },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 border-border bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Resumo do Dia
              <span className="text-sm font-normal text-primary-foreground/60">Terça, 28 Abr</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-2">Restante</p>
                <h3 className="text-6xl font-black">1.150</h3>
                <p className="text-xs text-primary-foreground/60 mt-1">kcal</p>
              </div>
              <div className="flex flex-col justify-center gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1 text-primary-foreground">
                    <span>CONSUMIDO</span>
                    <span>1.250 kcal</span>
                  </div>
                  <Progress value={52} className="h-2 bg-primary-foreground/20" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1 text-primary-foreground">
                    <span>QUEIMADO</span>
                    <span>320 kcal</span>
                  </div>
                  <Progress value={30} className="h-2 bg-primary-foreground/20" />
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
              { label: "Proteína", current: 95, target: 160, color: "bg-blue-500" },
              { label: "Carbos", current: 140, target: 240, color: "bg-green-500" },
              { label: "Gordura", current: 45, target: 75, color: "bg-yellow-500" },
            ].map((macro) => (
              <div key={macro.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">{macro.label}</span>
                  <span className="text-muted-foreground">{macro.current}g / {macro.target}g</span>
                </div>
                <Progress value={(macro.current / macro.target) * 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Refeições</h3>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.map((meal) => (
            <Card key={meal.title} className="border-border hover:border-[#F27D26]/30 transition-all cursor-pointer group bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-[#F27D26]/10 group-hover:text-[#F27D26] transition-colors">
                    <meal.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">{meal.title}</h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-tighter">{meal.macros}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{meal.calories}<span className="text-[10px] font-normal ml-0.5">kcal</span></p>
                  <p className="text-[10px] text-muted-foreground uppercase">Esgotado</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
