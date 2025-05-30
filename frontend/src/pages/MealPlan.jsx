import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useProfile } from "@/hooks/useProfile";

export default function MealPlan() {
  const { profile } = useProfile();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState(null);
  const [manualMode, setManualMode] = useState(false);

  // State for manual inputs
  const [formData, setFormData] = useState({
    diet: profile?.meal_preference || "vegetarian",
    region: "South Indian",
    calories: 2000,
    protein: 75,
    carbs: 225,
    fat: 56
  });

  // Update form data when profile changes
  useEffect(() => {
    if (profile && !manualMode) {
      calculateRequirements();
    }
  }, [profile, manualMode]);

  const calculateRequirements = async () => {
    try {
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

      setRequirements(res.data);
      setFormData(prev => ({
        ...prev,
        calories: res.data.calories,
        protein: res.data.protein,
        carbs: res.data.carbs,
        fat: res.data.fat
      }));
    } catch (error) {
      toast.error(`Calculation failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      const requestData = {
        ...profile,
        meal_preference: formData.diet,
        region: formData.region,
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat
      };
  
      const res = await axios.post(
        "http://localhost:5050/generate-meal-plan",
        requestData
      );
      
      if (res.data?.error) {
        console.error("Backend error:", res.data.error);
        console.log("Debug info:", res.data.debug_info);
        toast.error(res.data.error);
        return;
      }
  
      if (res.data?.plan) {
        setPlan(res.data.plan);
        setRequirements(res.data.nutrition_requirements);
        toast.success("Meal plan generated successfully!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error:", {
        message: error.message,
        response: error.response?.data
      });
      toast.error(error.response?.data?.error || "Failed to generate meal plan");
    } finally {
      setLoading(false);
    }
  };
  
  // In your manual input fields:

  return (
    <div className="px-50 py-20 w-full mx-auto space-y-6">
      <div className="mt-10 w-full max-w-7xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Personalized Meal Planner</h1>

        {/* Nutrition Summary */}
        {requirements && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <h2 className="text-lg font-semibold">
                {manualMode ? "Your Custom Nutrition Targets" : "Your Daily Nutrition Targets"}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Calories</p>
                  <p className="text-xl font-bold">{requirements.calories} kcal</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-xl font-bold">{requirements.protein}g</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-xl font-bold">{requirements.carbs}g</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Fat</p>
                  <p className="text-xl font-bold">{requirements.fat}g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div>
            <Label>Diet Type</Label>
            <Select 
              value={formData.diet} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, diet: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a diet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="eggetarian">Eggetarian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Region</Label>
            <Select 
              value={formData.region} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="South Indian">South Indian</SelectItem>
                <SelectItem value="North Indian">North Indian</SelectItem>
                <SelectItem value="East Indian">East Indian</SelectItem>
                <SelectItem value="West Indian">West Indian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <Button 
              variant={!manualMode ? "default" : "outline"} 
              onClick={() => setManualMode(false)}
            >
              Auto Calculation
            </Button>
            <Button 
              variant={manualMode ? "default" : "outline"} 
              onClick={() => setManualMode(true)}
            >
              Manual Input
            </Button>
          </div>

          {manualMode ? (
            <>
              <div>
                <Label>Calories (kcal)</Label>
                <Input type="number"
                name="calories"
                value={formData.calories}
                onChange={(e) => setFormData({...formData, calories: parseInt(e.target.value) || 0})}
                min={1000}
                max={5000}
                />
              </div>
              <div>
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleInputChange}
                  min={0}
                  max={500}
                />
              </div>
              <div>
                <Label>Carbs (g)</Label>
                <Input
                  type="number"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleInputChange}
                  min={0}
                  max={1000}
                />
              </div>
              <div>
                <Label>Fat (g)</Label>
                <Input
                  type="number"
                  name="fat"
                  value={formData.fat}
                  onChange={handleInputChange}
                  min={0}
                  max={300}
                />
              </div>
            </>
          ) : (
            <div className="col-span-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Using calculated nutrition targets based on your profile
              </p>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-6">
          <Button 
            onClick={generatePlan} 
            disabled={loading} 
            className="w-full max-w-xs"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Generate Meal Plan"
            )}
          </Button>
        </div>

        {plan && (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Nutrition Summary</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Calories</p>
            <p className="text-xl font-bold">
              {plan.nutrition_summary?.total_calories || 'N/A'} kcal
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Protein</p>
            <p className="text-xl font-bold">
              {plan.nutrition_summary?.total_protein || 'N/A'}g
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Carbs</p>
            <p className="text-xl font-bold">
              {plan.nutrition_summary?.total_carbs || 'N/A'}g
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Fat</p>
            <p className="text-xl font-bold">
              {plan.nutrition_summary?.total_fat || 'N/A'}g
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    {['breakfast', 'lunch', 'snacks', 'dinner'].map((meal) => (
  <Card key={meal}>
    <CardHeader>
      <h2 className="text-xl font-semibold capitalize">{meal}</h2>
    </CardHeader>
    <CardContent className="space-y-4">
      {plan[meal]?.length > 0 ? (
        plan[meal].map((item, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{item.dish}</h3>
              {item.quantity && (
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {item.quantity}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
              <span>Calories: {item.calories} kcal</span>
              <span>Protein: {item.protein}g</span>
              <span>Carbs: {item.carbs}g</span>
              <span>Fat: {item.fat}g</span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground text-center py-4">
          No {meal} items planned
        </p>
      )}
    </CardContent>
  </Card>
))}
  </div>
)}
      </div>
    </div>
  );
}