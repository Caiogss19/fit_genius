import { db } from "./firebase";
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Trophy, X } from "lucide-react";

export type TrophyType = "bronze" | "silver" | "gold" | "platinum";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: TrophyType;
  color: string;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  "first_workout": { id: "first_workout", title: "A Primeira Gota", description: "Completou o seu primeiro exercício.", icon: "🔥", type: "bronze", color: "from-orange-400 to-orange-600" },
  "hydration_master": { id: "hydration_master", title: "Oásis Interior", description: "Bateu a meta de água do dia (2.5L+).", icon: "💧", type: "silver", color: "from-blue-300 to-blue-500" },
  "macro_master": { id: "macro_master", title: "Química Perfeita", description: "Bateu suas metas de calorias e proteínas do dia.", icon: "🎯", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_1": { id: "workout_1", title: "Espartano Lendário 1", description: "Completou 10 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_2": { id: "workout_2", title: "Monstro Destemido 2", description: "Completou 20 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_3": { id: "workout_3", title: "Deus Determinado 3", description: "Completou 30 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_4": { id: "workout_4", title: "Atleta Colossal 4", description: "Completou 40 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_5": { id: "workout_5", title: "Trovão Implacável 5", description: "Completou 50 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_6": { id: "workout_6", title: "Fera Brutal 6", description: "Completou 60 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_7": { id: "workout_7", title: "Ferro Selvagem 7", description: "Completou 70 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_8": { id: "workout_8", title: "Guerreiro Invencível 8", description: "Completou 80 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_9": { id: "workout_9", title: "Hércules Absoluto 9", description: "Completou 90 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_10": { id: "workout_10", title: "Ogro Furioso 10", description: "Completou 100 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_11": { id: "workout_11", title: "Mito Imortal 11", description: "Completou 110 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_12": { id: "workout_12", title: "Vulcão Místico 12", description: "Completou 120 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_13": { id: "workout_13", title: "Dragão Supremo 13", description: "Completou 130 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_14": { id: "workout_14", title: "Titã Inabalável 14", description: "Completou 140 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_15": { id: "workout_15", title: "Gladiador Iniciante 15", description: "Completou 150 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_16": { id: "workout_16", title: "Ciborgue Divino 16", description: "Completou 160 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_17": { id: "workout_17", title: "Vencedor Desperto 17", description: "Completou 170 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_18": { id: "workout_18", title: "Herói Lendário 18", description: "Completou 180 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_19": { id: "workout_19", title: "Tornado Destemido 19", description: "Completou 190 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_20": { id: "workout_20", title: "Aço Determinado 20", description: "Completou 200 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_21": { id: "workout_21", title: "Espartano Colossal 21", description: "Completou 210 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_22": { id: "workout_22", title: "Monstro Implacável 22", description: "Completou 220 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_23": { id: "workout_23", title: "Deus Brutal 23", description: "Completou 230 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_24": { id: "workout_24", title: "Atleta Selvagem 24", description: "Completou 240 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_25": { id: "workout_25", title: "Trovão Invencível 25", description: "Completou 250 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_26": { id: "workout_26", title: "Fera Absoluto 26", description: "Completou 260 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_27": { id: "workout_27", title: "Ferro Furioso 27", description: "Completou 270 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_28": { id: "workout_28", title: "Guerreiro Imortal 28", description: "Completou 280 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_29": { id: "workout_29", title: "Hércules Místico 29", description: "Completou 290 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_30": { id: "workout_30", title: "Ogro Supremo 30", description: "Completou 300 exercícios totais.", icon: "🏋️", type: "bronze", color: "from-orange-400 to-orange-600" },
  "workout_31": { id: "workout_31", title: "Mito Inabalável 31", description: "Completou 310 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_32": { id: "workout_32", title: "Vulcão Iniciante 32", description: "Completou 320 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_33": { id: "workout_33", title: "Dragão Divino 33", description: "Completou 330 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_34": { id: "workout_34", title: "Titã Desperto 34", description: "Completou 340 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_35": { id: "workout_35", title: "Gladiador Lendário 35", description: "Completou 350 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_36": { id: "workout_36", title: "Ciborgue Destemido 36", description: "Completou 360 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_37": { id: "workout_37", title: "Vencedor Determinado 37", description: "Completou 370 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_38": { id: "workout_38", title: "Herói Colossal 38", description: "Completou 380 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_39": { id: "workout_39", title: "Tornado Implacável 39", description: "Completou 390 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_40": { id: "workout_40", title: "Aço Brutal 40", description: "Completou 400 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_41": { id: "workout_41", title: "Espartano Selvagem 41", description: "Completou 410 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_42": { id: "workout_42", title: "Monstro Invencível 42", description: "Completou 420 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_43": { id: "workout_43", title: "Deus Absoluto 43", description: "Completou 430 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_44": { id: "workout_44", title: "Atleta Furioso 44", description: "Completou 440 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_45": { id: "workout_45", title: "Trovão Imortal 45", description: "Completou 450 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_46": { id: "workout_46", title: "Fera Místico 46", description: "Completou 460 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_47": { id: "workout_47", title: "Ferro Supremo 47", description: "Completou 470 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_48": { id: "workout_48", title: "Guerreiro Inabalável 48", description: "Completou 480 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_49": { id: "workout_49", title: "Hércules Iniciante 49", description: "Completou 490 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_50": { id: "workout_50", title: "Ogro Divino 50", description: "Completou 500 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_51": { id: "workout_51", title: "Mito Desperto 51", description: "Completou 510 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_52": { id: "workout_52", title: "Vulcão Lendário 52", description: "Completou 520 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_53": { id: "workout_53", title: "Dragão Destemido 53", description: "Completou 530 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_54": { id: "workout_54", title: "Titã Determinado 54", description: "Completou 540 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_55": { id: "workout_55", title: "Gladiador Colossal 55", description: "Completou 550 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_56": { id: "workout_56", title: "Ciborgue Implacável 56", description: "Completou 560 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_57": { id: "workout_57", title: "Vencedor Brutal 57", description: "Completou 570 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_58": { id: "workout_58", title: "Herói Selvagem 58", description: "Completou 580 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_59": { id: "workout_59", title: "Tornado Invencível 59", description: "Completou 590 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_60": { id: "workout_60", title: "Aço Absoluto 60", description: "Completou 600 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_61": { id: "workout_61", title: "Espartano Furioso 61", description: "Completou 610 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_62": { id: "workout_62", title: "Monstro Imortal 62", description: "Completou 620 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_63": { id: "workout_63", title: "Deus Místico 63", description: "Completou 630 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_64": { id: "workout_64", title: "Atleta Supremo 64", description: "Completou 640 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_65": { id: "workout_65", title: "Trovão Inabalável 65", description: "Completou 650 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_66": { id: "workout_66", title: "Fera Iniciante 66", description: "Completou 660 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_67": { id: "workout_67", title: "Ferro Divino 67", description: "Completou 670 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_68": { id: "workout_68", title: "Guerreiro Desperto 68", description: "Completou 680 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_69": { id: "workout_69", title: "Hércules Lendário 69", description: "Completou 690 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_70": { id: "workout_70", title: "Ogro Destemido 70", description: "Completou 700 exercícios totais.", icon: "🏋️", type: "silver", color: "from-slate-300 to-slate-500" },
  "workout_71": { id: "workout_71", title: "Mito Determinado 71", description: "Completou 710 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_72": { id: "workout_72", title: "Vulcão Colossal 72", description: "Completou 720 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_73": { id: "workout_73", title: "Dragão Implacável 73", description: "Completou 730 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_74": { id: "workout_74", title: "Titã Brutal 74", description: "Completou 740 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_75": { id: "workout_75", title: "Gladiador Selvagem 75", description: "Completou 750 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_76": { id: "workout_76", title: "Ciborgue Invencível 76", description: "Completou 760 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_77": { id: "workout_77", title: "Vencedor Absoluto 77", description: "Completou 770 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_78": { id: "workout_78", title: "Herói Furioso 78", description: "Completou 780 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_79": { id: "workout_79", title: "Tornado Imortal 79", description: "Completou 790 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_80": { id: "workout_80", title: "Aço Místico 80", description: "Completou 800 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_81": { id: "workout_81", title: "Espartano Supremo 81", description: "Completou 810 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_82": { id: "workout_82", title: "Monstro Inabalável 82", description: "Completou 820 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_83": { id: "workout_83", title: "Deus Iniciante 83", description: "Completou 830 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_84": { id: "workout_84", title: "Atleta Divino 84", description: "Completou 840 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_85": { id: "workout_85", title: "Trovão Desperto 85", description: "Completou 850 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_86": { id: "workout_86", title: "Fera Lendário 86", description: "Completou 860 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_87": { id: "workout_87", title: "Ferro Destemido 87", description: "Completou 870 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_88": { id: "workout_88", title: "Guerreiro Determinado 88", description: "Completou 880 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_89": { id: "workout_89", title: "Hércules Colossal 89", description: "Completou 890 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_90": { id: "workout_90", title: "Ogro Implacável 90", description: "Completou 900 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_91": { id: "workout_91", title: "Mito Brutal 91", description: "Completou 910 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_92": { id: "workout_92", title: "Vulcão Selvagem 92", description: "Completou 920 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_93": { id: "workout_93", title: "Dragão Invencível 93", description: "Completou 930 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_94": { id: "workout_94", title: "Titã Absoluto 94", description: "Completou 940 exercícios totais.", icon: "🏋️", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "workout_95": { id: "workout_95", title: "Gladiador Furioso 95", description: "Completou 950 exercícios totais.", icon: "🏋️", type: "platinum", color: "from-purple-400 to-purple-600" },
  "workout_96": { id: "workout_96", title: "Ciborgue Imortal 96", description: "Completou 960 exercícios totais.", icon: "🏋️", type: "platinum", color: "from-purple-400 to-purple-600" },
  "workout_97": { id: "workout_97", title: "Vencedor Místico 97", description: "Completou 970 exercícios totais.", icon: "🏋️", type: "platinum", color: "from-purple-400 to-purple-600" },
  "workout_98": { id: "workout_98", title: "Herói Supremo 98", description: "Completou 980 exercícios totais.", icon: "🏋️", type: "platinum", color: "from-purple-400 to-purple-600" },
  "workout_99": { id: "workout_99", title: "Tornado Inabalável 99", description: "Completou 990 exercícios totais.", icon: "🏋️", type: "platinum", color: "from-purple-400 to-purple-600" },
  "workout_100": { id: "workout_100", title: "Aço Iniciante 100", description: "Completou 1000 exercícios totais.", icon: "🏋️", type: "platinum", color: "from-purple-400 to-purple-600" },
  "diet_1": { id: "diet_1", title: "Mestre Cuca de Ouro 1", description: "Registrou 5 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_2": { id: "diet_2", title: "Foco Inteligente 2", description: "Registrou 10 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_3": { id: "diet_3", title: "Cardápio Disciplinado 3", description: "Registrou 15 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_4": { id: "diet_4", title: "Gourmet Cirúrgico 4", description: "Registrou 20 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_5": { id: "diet_5", title: "Nutrição Fit 5", description: "Registrou 25 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_6": { id: "diet_6", title: "Metabolismo de Bronze 6", description: "Registrou 30 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_7": { id: "diet_7", title: "Balança de Ouro 7", description: "Registrou 35 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_8": { id: "diet_8", title: "Chef Inteligente 8", description: "Registrou 40 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_9": { id: "diet_9", title: "Atleta Disciplinado 9", description: "Registrou 45 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_10": { id: "diet_10", title: "Cozinha Cirúrgico 10", description: "Registrou 50 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_11": { id: "diet_11", title: "Digestão Fit 11", description: "Registrou 55 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_12": { id: "diet_12", title: "Paladar de Bronze 12", description: "Registrou 60 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_13": { id: "diet_13", title: "Mestre Cuca de Ouro 13", description: "Registrou 65 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_14": { id: "diet_14", title: "Foco Inteligente 14", description: "Registrou 70 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_15": { id: "diet_15", title: "Cardápio Disciplinado 15", description: "Registrou 75 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_16": { id: "diet_16", title: "Gourmet Cirúrgico 16", description: "Registrou 80 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_17": { id: "diet_17", title: "Nutrição Fit 17", description: "Registrou 85 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_18": { id: "diet_18", title: "Metabolismo de Bronze 18", description: "Registrou 90 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_19": { id: "diet_19", title: "Balança de Ouro 19", description: "Registrou 95 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_20": { id: "diet_20", title: "Chef Inteligente 20", description: "Registrou 100 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_21": { id: "diet_21", title: "Atleta Disciplinado 21", description: "Registrou 105 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_22": { id: "diet_22", title: "Cozinha Cirúrgico 22", description: "Registrou 110 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_23": { id: "diet_23", title: "Digestão Fit 23", description: "Registrou 115 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_24": { id: "diet_24", title: "Paladar de Bronze 24", description: "Registrou 120 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_25": { id: "diet_25", title: "Mestre Cuca de Ouro 25", description: "Registrou 125 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_26": { id: "diet_26", title: "Foco Inteligente 26", description: "Registrou 130 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_27": { id: "diet_27", title: "Cardápio Disciplinado 27", description: "Registrou 135 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_28": { id: "diet_28", title: "Gourmet Cirúrgico 28", description: "Registrou 140 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_29": { id: "diet_29", title: "Nutrição Fit 29", description: "Registrou 145 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_30": { id: "diet_30", title: "Metabolismo de Bronze 30", description: "Registrou 150 refeições precisas.", icon: "🍎", type: "bronze", color: "from-orange-400 to-orange-600" },
  "diet_31": { id: "diet_31", title: "Balança de Ouro 31", description: "Registrou 155 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_32": { id: "diet_32", title: "Chef Inteligente 32", description: "Registrou 160 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_33": { id: "diet_33", title: "Atleta Disciplinado 33", description: "Registrou 165 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_34": { id: "diet_34", title: "Cozinha Cirúrgico 34", description: "Registrou 170 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_35": { id: "diet_35", title: "Digestão Fit 35", description: "Registrou 175 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_36": { id: "diet_36", title: "Paladar de Bronze 36", description: "Registrou 180 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_37": { id: "diet_37", title: "Mestre Cuca de Ouro 37", description: "Registrou 185 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_38": { id: "diet_38", title: "Foco Inteligente 38", description: "Registrou 190 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_39": { id: "diet_39", title: "Cardápio Disciplinado 39", description: "Registrou 195 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_40": { id: "diet_40", title: "Gourmet Cirúrgico 40", description: "Registrou 200 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_41": { id: "diet_41", title: "Nutrição Fit 41", description: "Registrou 205 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_42": { id: "diet_42", title: "Metabolismo de Bronze 42", description: "Registrou 210 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_43": { id: "diet_43", title: "Balança de Ouro 43", description: "Registrou 215 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_44": { id: "diet_44", title: "Chef Inteligente 44", description: "Registrou 220 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_45": { id: "diet_45", title: "Atleta Disciplinado 45", description: "Registrou 225 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_46": { id: "diet_46", title: "Cozinha Cirúrgico 46", description: "Registrou 230 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_47": { id: "diet_47", title: "Digestão Fit 47", description: "Registrou 235 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_48": { id: "diet_48", title: "Paladar de Bronze 48", description: "Registrou 240 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_49": { id: "diet_49", title: "Mestre Cuca de Ouro 49", description: "Registrou 245 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_50": { id: "diet_50", title: "Foco Inteligente 50", description: "Registrou 250 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_51": { id: "diet_51", title: "Cardápio Disciplinado 51", description: "Registrou 255 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_52": { id: "diet_52", title: "Gourmet Cirúrgico 52", description: "Registrou 260 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_53": { id: "diet_53", title: "Nutrição Fit 53", description: "Registrou 265 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_54": { id: "diet_54", title: "Metabolismo de Bronze 54", description: "Registrou 270 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_55": { id: "diet_55", title: "Balança de Ouro 55", description: "Registrou 275 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_56": { id: "diet_56", title: "Chef Inteligente 56", description: "Registrou 280 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_57": { id: "diet_57", title: "Atleta Disciplinado 57", description: "Registrou 285 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_58": { id: "diet_58", title: "Cozinha Cirúrgico 58", description: "Registrou 290 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_59": { id: "diet_59", title: "Digestão Fit 59", description: "Registrou 295 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_60": { id: "diet_60", title: "Paladar de Bronze 60", description: "Registrou 300 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_61": { id: "diet_61", title: "Mestre Cuca de Ouro 61", description: "Registrou 305 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_62": { id: "diet_62", title: "Foco Inteligente 62", description: "Registrou 310 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_63": { id: "diet_63", title: "Cardápio Disciplinado 63", description: "Registrou 315 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_64": { id: "diet_64", title: "Gourmet Cirúrgico 64", description: "Registrou 320 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_65": { id: "diet_65", title: "Nutrição Fit 65", description: "Registrou 325 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_66": { id: "diet_66", title: "Metabolismo de Bronze 66", description: "Registrou 330 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_67": { id: "diet_67", title: "Balança de Ouro 67", description: "Registrou 335 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_68": { id: "diet_68", title: "Chef Inteligente 68", description: "Registrou 340 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_69": { id: "diet_69", title: "Atleta Disciplinado 69", description: "Registrou 345 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_70": { id: "diet_70", title: "Cozinha Cirúrgico 70", description: "Registrou 350 refeições precisas.", icon: "🍎", type: "silver", color: "from-slate-300 to-slate-500" },
  "diet_71": { id: "diet_71", title: "Digestão Fit 71", description: "Registrou 355 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_72": { id: "diet_72", title: "Paladar de Bronze 72", description: "Registrou 360 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_73": { id: "diet_73", title: "Mestre Cuca de Ouro 73", description: "Registrou 365 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_74": { id: "diet_74", title: "Foco Inteligente 74", description: "Registrou 370 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_75": { id: "diet_75", title: "Cardápio Disciplinado 75", description: "Registrou 375 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_76": { id: "diet_76", title: "Gourmet Cirúrgico 76", description: "Registrou 380 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_77": { id: "diet_77", title: "Nutrição Fit 77", description: "Registrou 385 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_78": { id: "diet_78", title: "Metabolismo de Bronze 78", description: "Registrou 390 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_79": { id: "diet_79", title: "Balança de Ouro 79", description: "Registrou 395 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_80": { id: "diet_80", title: "Chef Inteligente 80", description: "Registrou 400 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_81": { id: "diet_81", title: "Atleta Disciplinado 81", description: "Registrou 405 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_82": { id: "diet_82", title: "Cozinha Cirúrgico 82", description: "Registrou 410 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_83": { id: "diet_83", title: "Digestão Fit 83", description: "Registrou 415 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_84": { id: "diet_84", title: "Paladar de Bronze 84", description: "Registrou 420 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_85": { id: "diet_85", title: "Mestre Cuca de Ouro 85", description: "Registrou 425 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_86": { id: "diet_86", title: "Foco Inteligente 86", description: "Registrou 430 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_87": { id: "diet_87", title: "Cardápio Disciplinado 87", description: "Registrou 435 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_88": { id: "diet_88", title: "Gourmet Cirúrgico 88", description: "Registrou 440 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_89": { id: "diet_89", title: "Nutrição Fit 89", description: "Registrou 445 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_90": { id: "diet_90", title: "Metabolismo de Bronze 90", description: "Registrou 450 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_91": { id: "diet_91", title: "Balança de Ouro 91", description: "Registrou 455 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_92": { id: "diet_92", title: "Chef Inteligente 92", description: "Registrou 460 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_93": { id: "diet_93", title: "Atleta Disciplinado 93", description: "Registrou 465 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_94": { id: "diet_94", title: "Cozinha Cirúrgico 94", description: "Registrou 470 refeições precisas.", icon: "🍎", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "diet_95": { id: "diet_95", title: "Digestão Fit 95", description: "Registrou 475 refeições precisas.", icon: "🍎", type: "platinum", color: "from-purple-400 to-purple-600" },
  "diet_96": { id: "diet_96", title: "Paladar de Bronze 96", description: "Registrou 480 refeições precisas.", icon: "🍎", type: "platinum", color: "from-purple-400 to-purple-600" },
  "diet_97": { id: "diet_97", title: "Mestre Cuca de Ouro 97", description: "Registrou 485 refeições precisas.", icon: "🍎", type: "platinum", color: "from-purple-400 to-purple-600" },
  "diet_98": { id: "diet_98", title: "Foco Inteligente 98", description: "Registrou 490 refeições precisas.", icon: "🍎", type: "platinum", color: "from-purple-400 to-purple-600" },
  "diet_99": { id: "diet_99", title: "Cardápio Disciplinado 99", description: "Registrou 495 refeições precisas.", icon: "🍎", type: "platinum", color: "from-purple-400 to-purple-600" },
  "diet_100": { id: "diet_100", title: "Gourmet Cirúrgico 100", description: "Registrou 500 refeições precisas.", icon: "🍎", type: "platinum", color: "from-purple-400 to-purple-600" },
  "water_1": { id: "water_1", title: "Guardião Gelado 1", description: "Bateu a meta de água 2 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_2": { id: "water_2", title: "Guardião Oceânico 2", description: "Bateu a meta de água 4 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_3": { id: "water_3", title: "Guardião Transparente 3", description: "Bateu a meta de água 6 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_4": { id: "water_4", title: "Guardião Cristalino 4", description: "Bateu a meta de água 8 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_5": { id: "water_5", title: "Guardião Fluvial 5", description: "Bateu a meta de água 10 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_6": { id: "water_6", title: "Guardião Puro 6", description: "Bateu a meta de água 12 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_7": { id: "water_7", title: "Guardião Profundo 7", description: "Bateu a meta de água 14 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_8": { id: "water_8", title: "Guardião Aquático 8", description: "Bateu a meta de água 16 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_9": { id: "water_9", title: "Guardião Fluido 9", description: "Bateu a meta de água 18 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_10": { id: "water_10", title: "Guardião Infinito 10", description: "Bateu a meta de água 20 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_11": { id: "water_11", title: "Guardião Sereno 11", description: "Bateu a meta de água 22 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_12": { id: "water_12", title: "Guardião Gelado 12", description: "Bateu a meta de água 24 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_13": { id: "water_13", title: "Guardião Oceânico 13", description: "Bateu a meta de água 26 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_14": { id: "water_14", title: "Guardião Transparente 14", description: "Bateu a meta de água 28 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_15": { id: "water_15", title: "Guardião Cristalino 15", description: "Bateu a meta de água 30 vezes.", icon: "💧", type: "bronze", color: "from-orange-400 to-orange-600" },
  "water_16": { id: "water_16", title: "Guardião Fluvial 16", description: "Bateu a meta de água 32 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_17": { id: "water_17", title: "Guardião Puro 17", description: "Bateu a meta de água 34 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_18": { id: "water_18", title: "Guardião Profundo 18", description: "Bateu a meta de água 36 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_19": { id: "water_19", title: "Guardião Aquático 19", description: "Bateu a meta de água 38 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_20": { id: "water_20", title: "Guardião Fluido 20", description: "Bateu a meta de água 40 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_21": { id: "water_21", title: "Guardião Infinito 21", description: "Bateu a meta de água 42 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_22": { id: "water_22", title: "Guardião Sereno 22", description: "Bateu a meta de água 44 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_23": { id: "water_23", title: "Guardião Gelado 23", description: "Bateu a meta de água 46 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_24": { id: "water_24", title: "Guardião Oceânico 24", description: "Bateu a meta de água 48 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_25": { id: "water_25", title: "Guardião Transparente 25", description: "Bateu a meta de água 50 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_26": { id: "water_26", title: "Guardião Cristalino 26", description: "Bateu a meta de água 52 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_27": { id: "water_27", title: "Guardião Fluvial 27", description: "Bateu a meta de água 54 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_28": { id: "water_28", title: "Guardião Puro 28", description: "Bateu a meta de água 56 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_29": { id: "water_29", title: "Guardião Profundo 29", description: "Bateu a meta de água 58 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_30": { id: "water_30", title: "Guardião Aquático 30", description: "Bateu a meta de água 60 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_31": { id: "water_31", title: "Guardião Fluido 31", description: "Bateu a meta de água 62 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_32": { id: "water_32", title: "Guardião Infinito 32", description: "Bateu a meta de água 64 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_33": { id: "water_33", title: "Guardião Sereno 33", description: "Bateu a meta de água 66 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_34": { id: "water_34", title: "Guardião Gelado 34", description: "Bateu a meta de água 68 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_35": { id: "water_35", title: "Guardião Oceânico 35", description: "Bateu a meta de água 70 vezes.", icon: "💧", type: "silver", color: "from-slate-300 to-slate-500" },
  "water_36": { id: "water_36", title: "Guardião Transparente 36", description: "Bateu a meta de água 72 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_37": { id: "water_37", title: "Guardião Cristalino 37", description: "Bateu a meta de água 74 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_38": { id: "water_38", title: "Guardião Fluvial 38", description: "Bateu a meta de água 76 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_39": { id: "water_39", title: "Guardião Puro 39", description: "Bateu a meta de água 78 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_40": { id: "water_40", title: "Guardião Profundo 40", description: "Bateu a meta de água 80 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_41": { id: "water_41", title: "Guardião Aquático 41", description: "Bateu a meta de água 82 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_42": { id: "water_42", title: "Guardião Fluido 42", description: "Bateu a meta de água 84 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_43": { id: "water_43", title: "Guardião Infinito 43", description: "Bateu a meta de água 86 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_44": { id: "water_44", title: "Guardião Sereno 44", description: "Bateu a meta de água 88 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_45": { id: "water_45", title: "Guardião Gelado 45", description: "Bateu a meta de água 90 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_46": { id: "water_46", title: "Guardião Oceânico 46", description: "Bateu a meta de água 92 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_47": { id: "water_47", title: "Guardião Transparente 47", description: "Bateu a meta de água 94 vezes.", icon: "💧", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "water_48": { id: "water_48", title: "Guardião Cristalino 48", description: "Bateu a meta de água 96 vezes.", icon: "💧", type: "platinum", color: "from-purple-400 to-purple-600" },
  "water_49": { id: "water_49", title: "Guardião Fluvial 49", description: "Bateu a meta de água 98 vezes.", icon: "💧", type: "platinum", color: "from-purple-400 to-purple-600" },
  "water_50": { id: "water_50", title: "Guardião Puro 50", description: "Bateu a meta de água 100 vezes.", icon: "💧", type: "platinum", color: "from-purple-400 to-purple-600" },
  "streak_workout_1": { id: "streak_workout_1", title: "Faísca do Foco 1", description: "Treinou 5 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_2": { id: "streak_workout_2", title: "Incêndio do Foco 2", description: "Treinou 10 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_3": { id: "streak_workout_3", title: "Explosão do Foco 3", description: "Treinou 15 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_4": { id: "streak_workout_4", title: "Chama do Foco 4", description: "Treinou 20 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_5": { id: "streak_workout_5", title: "Combustão do Foco 5", description: "Treinou 25 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_6": { id: "streak_workout_6", title: "Vulcanismo do Foco 6", description: "Treinou 30 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_7": { id: "streak_workout_7", title: "Fogo do Foco 7", description: "Treinou 35 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_8": { id: "streak_workout_8", title: "Faísca do Foco 8", description: "Treinou 40 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_9": { id: "streak_workout_9", title: "Incêndio do Foco 9", description: "Treinou 45 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_10": { id: "streak_workout_10", title: "Explosão do Foco 10", description: "Treinou 50 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_11": { id: "streak_workout_11", title: "Chama do Foco 11", description: "Treinou 55 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_12": { id: "streak_workout_12", title: "Combustão do Foco 12", description: "Treinou 60 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_13": { id: "streak_workout_13", title: "Vulcanismo do Foco 13", description: "Treinou 65 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_14": { id: "streak_workout_14", title: "Fogo do Foco 14", description: "Treinou 70 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_15": { id: "streak_workout_15", title: "Faísca do Foco 15", description: "Treinou 75 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_16": { id: "streak_workout_16", title: "Incêndio do Foco 16", description: "Treinou 80 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_17": { id: "streak_workout_17", title: "Explosão do Foco 17", description: "Treinou 85 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_18": { id: "streak_workout_18", title: "Chama do Foco 18", description: "Treinou 90 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_19": { id: "streak_workout_19", title: "Combustão do Foco 19", description: "Treinou 95 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_20": { id: "streak_workout_20", title: "Vulcanismo do Foco 20", description: "Treinou 100 dias seguidos.", icon: "🔥", type: "silver", color: "from-slate-300 to-slate-500" },
  "streak_workout_21": { id: "streak_workout_21", title: "Fogo do Foco 21", description: "Treinou 105 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_22": { id: "streak_workout_22", title: "Faísca do Foco 22", description: "Treinou 110 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_23": { id: "streak_workout_23", title: "Incêndio do Foco 23", description: "Treinou 115 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_24": { id: "streak_workout_24", title: "Explosão do Foco 24", description: "Treinou 120 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_25": { id: "streak_workout_25", title: "Chama do Foco 25", description: "Treinou 125 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_26": { id: "streak_workout_26", title: "Combustão do Foco 26", description: "Treinou 130 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_27": { id: "streak_workout_27", title: "Vulcanismo do Foco 27", description: "Treinou 135 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_28": { id: "streak_workout_28", title: "Fogo do Foco 28", description: "Treinou 140 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_29": { id: "streak_workout_29", title: "Faísca do Foco 29", description: "Treinou 145 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_30": { id: "streak_workout_30", title: "Incêndio do Foco 30", description: "Treinou 150 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_31": { id: "streak_workout_31", title: "Explosão do Foco 31", description: "Treinou 155 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_32": { id: "streak_workout_32", title: "Chama do Foco 32", description: "Treinou 160 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_33": { id: "streak_workout_33", title: "Combustão do Foco 33", description: "Treinou 165 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_34": { id: "streak_workout_34", title: "Vulcanismo do Foco 34", description: "Treinou 170 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_35": { id: "streak_workout_35", title: "Fogo do Foco 35", description: "Treinou 175 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_36": { id: "streak_workout_36", title: "Faísca do Foco 36", description: "Treinou 180 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_37": { id: "streak_workout_37", title: "Incêndio do Foco 37", description: "Treinou 185 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_38": { id: "streak_workout_38", title: "Explosão do Foco 38", description: "Treinou 190 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_39": { id: "streak_workout_39", title: "Chama do Foco 39", description: "Treinou 195 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_40": { id: "streak_workout_40", title: "Combustão do Foco 40", description: "Treinou 200 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_41": { id: "streak_workout_41", title: "Vulcanismo do Foco 41", description: "Treinou 205 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_42": { id: "streak_workout_42", title: "Fogo do Foco 42", description: "Treinou 210 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_43": { id: "streak_workout_43", title: "Faísca do Foco 43", description: "Treinou 215 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_44": { id: "streak_workout_44", title: "Incêndio do Foco 44", description: "Treinou 220 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_45": { id: "streak_workout_45", title: "Explosão do Foco 45", description: "Treinou 225 dias seguidos.", icon: "🔥", type: "gold", color: "from-yellow-400 to-yellow-600" },
  "streak_workout_46": { id: "streak_workout_46", title: "Chama do Foco 46", description: "Treinou 230 dias seguidos.", icon: "🔥", type: "platinum", color: "from-purple-400 to-purple-600" },
  "streak_workout_47": { id: "streak_workout_47", title: "Combustão do Foco 47", description: "Treinou 235 dias seguidos.", icon: "🔥", type: "platinum", color: "from-purple-400 to-purple-600" },
  "streak_workout_48": { id: "streak_workout_48", title: "Vulcanismo do Foco 48", description: "Treinou 240 dias seguidos.", icon: "🔥", type: "platinum", color: "from-purple-400 to-purple-600" },
  "streak_workout_49": { id: "streak_workout_49", title: "Fogo do Foco 49", description: "Treinou 245 dias seguidos.", icon: "🔥", type: "platinum", color: "from-purple-400 to-purple-600" },
  "streak_workout_50": { id: "streak_workout_50", title: "Faísca do Foco 50", description: "Treinou 250 dias seguidos.", icon: "🔥", type: "platinum", color: "from-purple-400 to-purple-600" },
  "legend_1": { id: "legend_1", title: "A Lenda Nasce", description: "Desbloqueou os troféus básicos de iniciação.", icon: "👑", type: "platinum", color: "from-purple-400 to-purple-600" },
  "legend_2": { id: "legend_2", title: "Voto de Silêncio", description: "100 dias no foco total, sem falhar.", icon: "⚡", type: "platinum", color: "from-purple-400 to-purple-600" },
  "legend_3": { id: "legend_3", title: "Olimpo Alcançado", description: "6 meses inteiros dominando o plano.", icon: "🏛️", type: "platinum", color: "from-purple-400 to-purple-600" },
  "legend_4": { id: "legend_4", title: "Muralha de Aço", description: "Registrou mais de 1000 treinos e sobreviveu.", icon: "🏰", type: "platinum", color: "from-purple-400 to-purple-600" },
  "legend_5": { id: "legend_5", title: "Máquina Perfeita", description: "1 ano sem errar os macros ou os treinos.", icon: "🤖", type: "platinum", color: "from-purple-400 to-purple-600" }
};

export async function unlockAchievement(userId: string, achievementId: string) {
  if (!userId) return;
  
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    let currentAchievements: string[] = [];
    if (userSnap.exists()) {
      currentAchievements = userSnap.data().achievements || [];
    }
    
    if (!currentAchievements.includes(achievementId)) {
      // Unlock this achievement
      await setDoc(userRef, { achievements: arrayUnion(achievementId) }, { merge: true });
      
      const ach = ACHIEVEMENTS[achievementId];
      if (!ach) return;
      
      // Vibrate if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 100, 200]);
      }
      
      // Play a sound if possible (standard html5 audio, assuming generic success sound)
      try {
        const audio = new Audio('https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3'); // A generic ping
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {}
      
      // Show fancy toast
      toast.custom((t) => (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          onClick={() => toast.dismiss(t)}
          className="relative w-full overflow-hidden rounded-2xl border-2 border-[#F27D26] bg-card p-4 shadow-2xl cursor-pointer pointer-events-auto"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F27D26] to-transparent animate-pulse" />
          <div className="flex gap-4 items-start">
            <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-3xl shadow-inner bg-gradient-to-tr ${ach.color}`}>
              {ach.icon}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-1 text-[#F27D26]">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Troféu ${ach.type}</span>
              </div>
              <h4 className="font-bold text-base leading-tight mb-1 text-foreground">{ach.title}</h4>
              <p className="text-sm text-muted-foreground leading-snug">{ach.description}</p>
            </div>
          </div>
        </motion.div>
      ), { duration: 6000 });
    }
  } catch (err) {
    console.error("Failed to unlock achievement", err);
  }
}
