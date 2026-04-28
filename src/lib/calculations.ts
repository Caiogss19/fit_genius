export const calculateTDEE = (
  gender: 'male' | 'female',
  weight: number,
  height: number,
  age: number,
  activityLevel: string
) => {
  // Mifflin-St Jeor Equation
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
};

export const calculateMacros = (calories: number, goal: string) => {
  let p = 0.3; // protein
  let c = 0.4; // carbs
  let f = 0.3; // fat

  if (goal === 'lose') {
    p = 0.4;
    c = 0.3;
    f = 0.3;
  } else if (goal === 'gain') {
    p = 0.25;
    c = 0.5;
    f = 0.25;
  }

  return {
    protein: Math.round((calories * p) / 4),
    carbs: Math.round((calories * c) / 4),
    fat: Math.round((calories * f) / 9),
  };
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('pt-BR').format(num);
};
