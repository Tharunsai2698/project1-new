'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@supabase/auth-helpers-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from "@/components/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Utensils } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function DetectPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [mealType, setMealType] = useState('breakfast');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleImageChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = e.target.files[0];
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleDetect = async () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (description) formData.append('description', description);

      const response = await fetch('http://localhost:5050/api/detect-food', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to detect food');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // Transform the response data to match frontend expectations
      const transformedData = {
        meal_name: data.meal_name || 'Detected Meal',
        totalCalories: data.total?.calories || 0,
        protein: data.total?.protein_g || 0,
        carbs: data.total?.carbs_g || 0,
        fats: data.total?.fats_g || 0,
        foods: data.foods || [] // Detailed food items
      };

      setResultData(transformedData);
      setShowResult(true); // Explicitly open the dialog
    } catch (error) {
      console.error('Detection error:', error);
      toast.error(error.message || 'Failed to detect food items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!user) {
      toast.error('Please sign in to save meals');
      return;
    }
  
    if (!file || !resultData) {
      toast.error('No data to save');
      return;
    }
  
    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
  
      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(filePath, file);
  
        if (uploadError) throw uploadError;
  
      // Get public URL
  
      // Save meal data
      // After the meal insert part:
const { data: mealData, error: mealError } = await supabase.from('meal_history').insert({
  user_id: user.id,
  meal_type: mealType,
  meal_name: resultData.meal_name,
  image_path: filePath,
  calories: resultData.totalCalories,
  protein: resultData.protein,
  carbs: resultData.carbs,
  fats: resultData.fats,
  consumed_at: new Date().toISOString(),
})
.select('id')
.single();

if (mealError) throw new Error(mealError.message);

// Insert food items if they exist
if (resultData.foods && resultData.foods.length > 0) {
const { error: foodsError } = await supabase.from('meal_foods').insert(resultData.foods.map(food => ({
    meal_id: mealData.id,
    name: food.name,
    weight_g: food.weight_g,
    calories: food.calories,
    protein_g: food.protein_g,
    carbs_g: food.carbs_g,
    fats_g: food.fats_g,
  })));

if (foodsError) throw new Error(foodsError.message);
}
  
      toast.success('Meal saved successfully!');
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save meal');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultData(null);
    setDescription('');
    setShowResult(false);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4 overflow-auto">
      <Card className="rounded-2xl shadow-lg w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Utensils className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Food Detection</h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Food Image
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 cursor-pointer"
                />
              </label>
            </div>

            {previewUrl && (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-64 h-64 object-cover rounded-xl border shadow-sm"
                />
                <Textarea
                  placeholder="Meal description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleDetect}
                disabled={!file || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Detecting...
                  </span>
                ) : 'Detect Food Items'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Dialog - Moved outside the card */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
  <DialogContent className="rounded-2xl min-w-[60vw] h-[83vh] max-w-9xl">
    {/* Wrapper div with padding */}
    <div className="p-6 h-full flex flex-col">
      <DialogHeader>
        <DialogTitle>Detection Result</DialogTitle>
        <DialogDescription>
          Here's what we found in your meal:
        </DialogDescription>
      </DialogHeader>

      {resultData && (
        <div className="space-y-6 flex-1 overflow-y-auto"> {/* Added flex-1 and overflow */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">{resultData.meal_name}</h3>
            
            {/* Food items with scroll */}
            <div className="space-y-2">
              <h4 className="font-medium">Food Items:</h4>
              <div className="grid grid-cols-2 gap-3 max-h-[35vh] overflow-y-auto pr-4">
                {resultData.foods.map((food, index) => (
                  <Card key={index} className="p-3 h-fit">
                    <div className="flex justify-between">
                      <span className="font-medium">{food.name}</span>
                      <span>{food.weight_g}g</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2 text-sm text-muted-foreground">
                      <div>{food.calories} kcal</div>
                      <div>P: {food.protein_g}g</div>
                      <div>C: {food.carbs_g}g</div>
                      <div>F: {food.fats_g}g</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Total nutrition - fixed position */}
            <Card className="p-4 bg-primary/5 border-primary">
              <div className="flex justify-between font-medium">
                <span>Total Nutrition</span>
                <span>{resultData.totalCalories} kcal</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                <div>Protein: {resultData.protein}g</div>
                <div>Carbs: {resultData.carbs}g</div>
                <div>Fats: {resultData.fats}g</div>
              </div>
            </Card>
          </div>

          {/* Bottom controls - stays at bottom */}
          <div className="grid grid-cols-2 gap-4 pt-2 mt-auto"> {/* Added mt-auto */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Meal Type</label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSaveMeal}
              className="w-full self-end"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save to History'}
            </Button>
          </div>
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}