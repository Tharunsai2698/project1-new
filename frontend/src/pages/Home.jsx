import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from "@/hooks/useProfile";
import { toast } from 'react-hot-toast';
import { useAuth } from "@/components/AuthProvider";

const nutrientColors = {
  protein: "#10b981",
  carbs: "#3b82f6",
  fats: "#facc15",
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CircleProgress = ({ value, label, color, tooltip }) => {
  const [strokeOffset, setStrokeOffset] = useState(226.2);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStrokeOffset(226.2 - (226.2 * value) / 100);
      setAnimationComplete(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center group">
      <div className="relative w-20 h-20 sm:w-28 sm:h-28">
        <svg className="w-full h-full rotate-[-90deg]">
          <circle
            cx="50%"
            cy="50%"
            r="36%"
            stroke="#e5e7eb"
            strokeWidth="10%"
            fill="none"
          />
          <circle
            cx="50%"
            cy="50%"
            r="36%"
            stroke={color}
            strokeWidth="10%"
            strokeDasharray="226.2"
            strokeDashoffset={strokeOffset}
            fill="none"
            style={{
              transition: "stroke-dashoffset 1s ease",
              opacity: animationComplete ? 1 : 0,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-base font-bold">
          {value}%
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-700">{label}</p>
      {tooltip && (
        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded shadow-lg text-xs mt-8">
          {tooltip}
        </div>
      )}
    </div>
  );
};


const DetectFood = () => {
  const { profile, loading: profileLoading } = useProfile();
  const [view, setView] = useState("week");
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [mealHistory, setMealHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userGoals, setUserGoals] = useState(null);
  const [error, setError] = useState(null);
  const { user, loading1 } = useAuth();


  const calculateUserRequirements = async () => {
    try {
      if (!profile) {
        return {
          calories: 2000,
          protein: 75,
          carbs: 225,
          fat: 56
        };
      }

      const requestData = {
        age: profile?.age || 30,
        weight: profile?.weight || 70,
        height: profile?.height || 175,
        gender: profile?.gender || 'male',
        activity_level: profile?.activity_level || 'moderate',
        goal: profile?.goal || 'balanced',
        meal_preference: profile?.meal_preference || 'vegetarian'
      };

      const res = await axios.post(
        "http://localhost:5050/calculate-requirements",
        requestData
      );

      return {
        calories: res.data.calories,
        protein: res.data.protein,
        carbs: res.data.carbs,
        fat: res.data.fat
      };
    } catch (error) {
      console.error(`Calculation failed: ${error.response?.data?.error || error.message}`);
      return {
        calories: 2000,
        protein: 75,
        carbs: 225,
        fat: 56
      };
    }
  };

  // Calculate nutrition totals
  const { todayTotals, weeklyTotals, monthlyTotals } = useMemo(() => {
  const emptyTotals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
  
  if (!mealHistory.length) {
    return {
      todayTotals: emptyTotals,
      weeklyTotals: emptyTotals,
      monthlyTotals: emptyTotals
    };
  }

  const todayLocalDate = new Date().toLocaleDateString('en-CA');
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return {
    todayTotals: mealHistory
      .filter(meal => new Date(meal.consumed_at).toLocaleDateString('en-CA') === todayLocalDate)
      .reduce((acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fats || 0),
      }), { ...emptyTotals }),

    weeklyTotals: mealHistory
      .filter(meal => new Date(meal.consumed_at) >= oneWeekAgo)
      .reduce((acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fats || 0),
      }), { ...emptyTotals }),

    monthlyTotals: mealHistory
      .filter(meal => new Date(meal.consumed_at) >= oneMonthAgo)
      .reduce((acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fats || 0),
      }), { ...emptyTotals })
  };
}, [mealHistory]);

  // Calculate percentages with proper safeguards
  const calculatePercentage = (consumed, goal) => {
    if (!goal || goal <= 0) return 0;
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };
const todayPercentage = calculatePercentage(todayTotals.calories, userGoals?.calories || 1);
// Add || 1 to prevent division by zero
  const weeklyPercentage = calculatePercentage(weeklyTotals.calories, userGoals?.calories ? userGoals.calories * 7 : 0);
  const monthlyPercentage = calculatePercentage(monthlyTotals.calories, userGoals?.calories ? userGoals.calories * 30 : 0);

  const proteinPercentage = calculatePercentage(todayTotals.protein, userGoals?.protein || 1);
const carbsPercentage = calculatePercentage(todayTotals.carbs, userGoals?.carbs || 1); 
const fatsPercentage = calculatePercentage(todayTotals.fats, userGoals?.fats || 1);
  // Prepare today's meals data
  const todayMeals = useMemo(() => {
  const todayLocalDate = new Date().toLocaleDateString('en-CA');
  const todayEntries = mealHistory.filter(meal => 
    new Date(meal.consumed_at).toLocaleDateString('en-CA') === todayLocalDate
  );
    const meals = {
      breakfast: { calories: 0, protein: 0, carbs: 0, fats: 0 },
      lunch: { calories: 0, protein: 0, carbs: 0, fats: 0 },
      dinner: { calories: 0, protein: 0, carbs: 0, fats: 0 },
      snack: { calories: 0, protein: 0, carbs: 0, fats: 0 }
    };

    todayEntries.forEach(meal => {
      if (meals[meal.meal_type]) {
        meals[meal.meal_type].calories += meal.calories || 0;
        meals[meal.meal_type].protein += meal.protein || 0;
        meals[meal.meal_type].carbs += meal.carbs || 0;
        meals[meal.meal_type].fats += meal.fats || 0;
      }
    });

    return [
      {
        label: "Breakfast",
        consumedCalories: meals.breakfast.calories,
        protein: meals.breakfast.protein,
        carbs: meals.breakfast.carbs,
        fats: meals.breakfast.fats,
      },
      {
        label: "Lunch",
        consumedCalories: meals.lunch.calories,
        protein: meals.lunch.protein,
        carbs: meals.lunch.carbs,
        fats: meals.lunch.fats,
      },
      {
        label: "Dinner",
        consumedCalories: meals.dinner.calories,
        protein: meals.dinner.protein,
        carbs: meals.dinner.carbs,
        fats: meals.dinner.fats,
      }
    ].filter(meal => meal.consumedCalories > 0);
  }, [mealHistory]);

 const chartData = useMemo(() => {
  if (!userGoals || !mealHistory.length) return [];

  if (view === 'week') {
    const weekData = [];
    const now = new Date();
    // Get local date string (accounts for timezone)
    const todayLocalDate = now.toLocaleDateString('en-CA');
    
    // Calculate the previous Sunday (or current day if it's Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (currentWeekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Create array for all 7 days of the week starting from Sunday
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      // Get local date string for comparison
      const dayLocalDate = day.toLocaleDateString('en-CA');
      
      // Only include meals that match the exact local date
      const dayMeals = mealHistory.filter(meal => {
        const mealDate = new Date(meal.consumed_at);
        const mealLocalDate = mealDate.toLocaleDateString('en-CA');
        return mealLocalDate === dayLocalDate;
      });
      
      const mealTotals = {
        breakfast: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        lunch: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        dinner: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        snack: { calories: 0, protein: 0, carbs: 0, fats: 0 }
      };
      
      dayMeals.forEach(meal => {
        if (mealTotals[meal.meal_type]) {
          mealTotals[meal.meal_type].calories += meal.calories || 0;
          mealTotals[meal.meal_type].protein += meal.protein || 0;
          mealTotals[meal.meal_type].carbs += meal.carbs || 0;
          mealTotals[meal.meal_type].fats += meal.fats || 0;
        }
      });
      
      const totalCalories = Object.values(mealTotals).reduce((sum, meal) => sum + meal.calories, 0);
      
      weekData.push({
        day: dayNames[i],
        date: dayLocalDate,
        isToday: dayLocalDate === todayLocalDate,
        breakfast: Math.round(mealTotals.breakfast.calories),
        lunch: Math.round(mealTotals.lunch.calories),
        dinner: Math.round(mealTotals.dinner.calories),
        totalCalories: Math.round(totalCalories),
        protein: Math.round(Object.values(mealTotals).reduce((sum, meal) => sum + meal.protein, 0)),
        carbs: Math.round(Object.values(mealTotals).reduce((sum, meal) => sum + meal.carbs, 0)),
        fats: Math.round(Object.values(mealTotals).reduce((sum, meal) => sum + meal.fats, 0)),
        percentage: calculatePercentage(totalCalories, userGoals.calories),
      });
    }
    
    return weekData;
  } else {
    // Month view logic
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
    
    const monthData = [];
    const todayLocalDate = now.toLocaleDateString('en-CA');
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), day);
      const dateLocal = currentDate.toLocaleDateString('en-CA');
      
      const dayMeals = mealHistory.filter(meal => {
        const mealDate = new Date(meal.consumed_at);
        return mealDate.toLocaleDateString('en-CA') === dateLocal;
      });
      
      const mealTotals = {
        breakfast: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        lunch: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        dinner: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        snack: { calories: 0, protein: 0, carbs: 0, fats: 0 }
      };
      
      dayMeals.forEach(meal => {
        if (mealTotals[meal.meal_type]) {
          mealTotals[meal.meal_type].calories += meal.calories || 0;
          mealTotals[meal.meal_type].protein += meal.protein || 0;
          mealTotals[meal.meal_type].carbs += meal.carbs || 0;
          mealTotals[meal.meal_type].fats += meal.fats || 0;
        }
      });
      
      const totalCalories = Object.values(mealTotals).reduce((sum, meal) => sum + meal.calories, 0);
      
      monthData.push({
        day: `${day}`,
        date: dateLocal,
        isToday: dateLocal === todayLocalDate,
        breakfast: Math.round(mealTotals.breakfast.calories),
        lunch: Math.round(mealTotals.lunch.calories),
        dinner: Math.round(mealTotals.dinner.calories),
        totalCalories: Math.round(totalCalories),
        protein: Math.round(Object.values(mealTotals).reduce((sum, meal) => sum + meal.protein, 0)),
        carbs: Math.round(Object.values(mealTotals).reduce((sum, meal) => sum + meal.carbs, 0)),
        fats: Math.round(Object.values(mealTotals).reduce((sum, meal) => sum + meal.fats, 0)),
        percentage: calculatePercentage(totalCalories, userGoals.calories),
      });
    }
    
    return monthData;
  }
}, [view, currentWeekOffset, currentMonthOffset, mealHistory, userGoals]);
  // Fetch data on mount
  useEffect(() => {
    if (!user || profileLoading) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try sessionStorage first for instant load
        const savedGoals = sessionStorage.getItem('nutritionGoals');
        if (savedGoals) {
          setUserGoals(JSON.parse(savedGoals));
        }

        // Fetch in parallel
        const [historyResponse, requirements] = await Promise.all([
          supabase
            .from('meal_history')
            .select('*')
            .eq('user_id', user.id)
            .order('consumed_at', { ascending: false }),
          
          calculateUserRequirements()
        ]);

        // Process meal history
        if (historyResponse.error) throw historyResponse.error;
        setMealHistory(historyResponse.data || []);

        // Process goals
        const updatedGoals = {
          calories: requirements.calories,
          protein: requirements.protein,
          carbs: requirements.carbs,
          fats: requirements.fat
        };

        setUserGoals(updatedGoals);
        sessionStorage.setItem('nutritionGoals', JSON.stringify(updatedGoals));
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        
        // Final fallback if we have no goals at all
        if (!userGoals) {
          setUserGoals({
            calories: 2000,
            protein: 75,
            carbs: 225,
            fats: 56
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile, profileLoading]);

  const refreshGoals = async () => {
    try {
      const requirements = await calculateUserRequirements();
      const updatedGoals = {
        calories: requirements.calories,
        protein: requirements.protein,
        carbs: requirements.carbs,
        fats: requirements.fat
      };

      setUserGoals(updatedGoals);
      sessionStorage.setItem('nutritionGoals', JSON.stringify(updatedGoals));
      toast.success('Nutrition goals updated successfully');
    } catch (error) {
      toast.error(`Failed to update goals: ${error.message}`);
    }
  };

  // Navigation handlers
  const handlePrev = () => {
    if (view === 'week') {
      setCurrentWeekOffset(prev => prev - 1);
    } else {
      setCurrentMonthOffset(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (view === 'week') {
      if (currentWeekOffset < 0) {
        setCurrentWeekOffset(prev => Math.min(prev + 1, 0));
      }
    } else {
      if (currentMonthOffset < 0) {
        setCurrentMonthOffset(prev => Math.min(prev + 1, 0));
      }
    }
  };

  const isNextDisabled = () => {
    if (view === 'week') {
      return currentWeekOffset >= 0;
    } else {
      return currentMonthOffset >= 0;
    }
  };

  const isPrevDisabled = () => false;

  // Date display helpers
  const getDisplayedDateRange = () => {
  if (view === 'week') {
    const now = new Date();
    // Get the Sunday of the current week (or offset week)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (currentWeekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // Format dates without year if same year, with year if different
    const sameYear = startOfWeek.getFullYear() === endOfWeek.getFullYear();
    const startStr = `${startOfWeek.getDate()} ${months[startOfWeek.getMonth()]}`;
    const endStr = `${endOfWeek.getDate()} ${months[endOfWeek.getMonth()]}${sameYear ? '' : ` ${endOfWeek.getFullYear()}`}`;
    
    return `${startStr} - ${endStr}`;
  } else {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
    
    return `1 ${months[targetDate.getMonth()]} - ${daysInMonth} ${months[targetDate.getMonth()]}`;
  }
};const getDisplayedPeriod = () => {
  if (view === 'week') {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (currentWeekOffset * 7));
    
    if (currentWeekOffset === 0) {
      return "Current Week";
    } else if (currentWeekOffset === -1) {
      return "Last Week";
    } else {
      return `${Math.abs(currentWeekOffset)} weeks ago`;
    }
  } else {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    const isCurrentMonth = currentMonthOffset === 0;
    return `${months[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  }
};

  // Meal goal calculation
 const calculateMealGoalCalories = (mealLabel, totalCalories) => {
  if (!totalCalories) return 0;
  
  const mealPercentages = {
    breakfast: 0.35,  // 35%
    lunch: 0.40,      // 40%
    dinner: 0.25      // 25%
  };
  
  const percentage = mealPercentages[mealLabel.toLowerCase()] || 0;
  return Math.round(percentage * totalCalories);
};
  if (loading || profileLoading || !userGoals) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-center p-4 bg-red-100 rounded-lg">
          <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <p className="text-sm text-red-500 mt-2">Using default nutrition values</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-screen mx-auto bg-neutral-300">
      <div className="mt-22 grid grid-cols-1 sm:grid-cols-2 gap-10 items-start">
        <Card className="w-full h-full transition-all transform hover:scale-105 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl text-indigo-600">Today / Weekly / Monthly Overall %</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around text-center gap-20">
           <CircleProgress 
  label="Today" 
  value={todayPercentage} 
  color="#6366f1" 
  tooltip={`${todayTotals.calories || 0} / ${userGoals?.calories || 0} kcal`}
/>
            <CircleProgress 
              label="Week" 
              value={weeklyPercentage} 
              color="#10b981" 
              tooltip={`${weeklyTotals.calories} / ${userGoals.calories * 7} kcal`}
            />
            <CircleProgress 
              label="Month" 
              value={monthlyPercentage} 
              color="#f59e0b" 
              tooltip={`${monthlyTotals.calories} / ${userGoals.calories * 30} kcal`}
            />
          </CardContent>
        </Card>

        <Card className="w-full h-full transition-all transform hover:scale-105 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base text-center text-indigo-600">Today's Nutrient Intake %</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around text-center gap-20">
            <CircleProgress 
              label="Protein" 
              value={proteinPercentage} 
              color={nutrientColors.protein} 
              tooltip={`${todayTotals.protein}g / ${userGoals.protein}g`}
            />
            <CircleProgress 
              label="Carbs" 
              value={carbsPercentage} 
              color={nutrientColors.carbs} 
              tooltip={`${todayTotals.carbs}g / ${userGoals.carbs}g`}
            />
            <CircleProgress 
              label="Fats" 
              value={fatsPercentage} 
              color={nutrientColors.fats} 
              tooltip={`${todayTotals.fats}g / ${userGoals.fats}g`}
            />
          </CardContent>
        </Card>
      </div>
<div className="grid grid-cols-1 md:grid-cols-[692px_1fr] gap-10">
  <Card className=" transition-all transform hover:scale-105 shadow-lg">
    <CardHeader>
      <CardTitle className="text-lg text-center text-indigo-600">Meal-wise Nutrient Intake</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 px-4 py-6">
            {todayMeals.map((meal, i) => {
              const mealGoalCalories = calculateMealGoalCalories(meal.label, userGoals.calories);
              const progressBarPercentage = calculatePercentage(meal.consumedCalories, mealGoalCalories);

              return (
                <div key={i} className="p-4 bg-white rounded-lg shadow-md transform transition-all hover:scale-105">
                  <div className="flex justify-between text-xs mb-2">
                    <span>{meal.label}</span>
                    <span>{progressBarPercentage}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-green-400 transition-all duration-1000 ease-in-out"
                      style={{
                        width: `${progressBarPercentage}%`,
                      }}
                    ></div>
                  </div>

                  <div className="text-xs text-gray-600">
                    Required: {mealGoalCalories} kcal | Consumed: {Math.round(meal.consumedCalories)} kcal
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    <div>Protein: {Math.round(meal.protein)}g</div>
                    <div>Carbs: {Math.round(meal.carbs)}g</div>
                    <div>Fats: {Math.round(meal.fats)}g</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="transition-all transform hover:scale-105 shadow-lg">
          <CardHeader className="flex flex-col md:flex-row md:justify-between items-center gap-2 text-indigo-600">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="default" 
                  onClick={handlePrev} 
                  size="icon"
                  disabled={isPrevDisabled()}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold capitalize">
                  {getDisplayedPeriod()}
                </span>
                <Button 
                  variant="default" 
                  onClick={handleNext} 
                  size="icon"
                  disabled={isNextDisabled()}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-500 text-center">
                {getDisplayedDateRange()}
              </div>
            </CardTitle>
            <div className="space-x-2">
              <Button variant={view === "week" ? "default" : "outline"} onClick={() => setView("week")}>
                Week
              </Button>
              <Button variant={view === "month" ? "default" : "outline"} onClick={() => setView("month")}>
                Month
              </Button>
              <Button 
                variant="outline" 
                onClick={refreshGoals}
                className="ml-2"
              >
                Refresh Goals
              </Button>
            </div>
          </CardHeader>

        <CardContent>
  <ResponsiveContainer width="100%" height={500}>
   <BarChart 
  data={chartData} 
  className="w-full h-full"
  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
>
  <XAxis 
    dataKey="day" 
    tick={{ fontSize: 12 }}
    label={{ 
      value: view === 'week' ? 'Day of Week' : 'Day of Month', 
      position: 'insideBottom', 
      offset: -30,
      fontSize: 14
    }}
  />
  <YAxis 
    domain={[0, 'dataMax']}
    tickCount={6}
    tick={{ fontSize: 12 }}
    label={{ 
      value: 'Calories (kcal)', 
      angle: -90, 
      position: 'insideLeft',
      fontSize: 14
    }}
  />
  <Tooltip
    content={({ payload }) => {
      if (payload && payload.length > 0) {
        const data = payload[0].payload;
        return (
          <div className="bg-white p-2 shadow-md rounded">
            <div className="font-semibold">{data.day}</div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#FFA07A] mr-2"></div>
              <div>Breakfast: {data.breakfast} kcal</div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#98FB98] mr-2"></div>
              <div>Lunch: {data.lunch} kcal</div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#87CEFA] mr-2"></div>
              <div>Dinner: {data.dinner} kcal</div>
            </div>
            <div className="mt-2 pt-2 border-t">
              <div>Total: {data.totalCalories} kcal</div>
              <div>Protein: {data.protein}g</div>
              <div>Carbs: {data.carbs}g</div>
              <div>Fats: {data.fats}g</div>
            </div>
          </div>
        );
      }
      return null;
    }}
  />
  <Bar dataKey="breakfast" fill="#FFA07A" name="Breakfast" />
  <Bar dataKey="lunch" fill="#98FB98" name="Lunch" />
  <Bar dataKey="dinner" fill="#87CEFA" name="Dinner" />
</BarChart>

  </ResponsiveContainer>
</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetectFood;