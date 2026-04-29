export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  completed: boolean;
  detailedSets?: ExerciseSet[];
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: string;
}

export interface DailyIntake {
  date: string;
  items: FoodItem[];
}
