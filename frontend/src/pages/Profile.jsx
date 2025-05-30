import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";

// Mapping objects for display values
const mealPreferenceMap = {
  veg: "Vegetarian",
  non_veg: "Non-Vegetarian",
  vegan: "Vegan",
  eggetarian: "Eggetarian",
};

const goalMap = {
  balanced: "Balanced",
  bulk: "Bulk",
  cut: "Cut",
  weight_loss: "Weight Loss",
};

const activityLevelMap = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Light (exercise 1-3 days/week)",
  moderate: "Moderate (exercise 3-5 days/week)",
  active: "Active (exercise 6-7 days/week)",
  very_active: "Very Active (hard exercise 6-7 days/week)",
};

const ProfilePage = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    age: "",
    height: "",
    weight: "",
    meal_preference: "",
    health_conditions: "",
    goal: "",
    activity_level: "",
  });
  const [errors, setErrors] = useState({
    age: "",
    height: "",
    weight: ""
  });

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile({
        fullName: data.full_name || "",
        email: data.email || "",
        age: data.age ? String(data.age) : "",
        height: data.height ? String(data.height) : "",
        weight: data.weight ? String(data.weight) : "",
        meal_preference: data.meal_preference || "",
        health_conditions: data.health_conditions || "",
        goal: data.goal || "",
        activity_level: data.activity_level || "",
      });
    }
  };

  useEffect(() => {
    if (!authLoading && !authError && user) {
      fetchProfile();
    }
  }, [authLoading, authError, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // For numeric fields, only allow numbers
    if (["age", "height", "weight"].includes(name)) {
      if (value === "" || /^[0-9\b]+$/.test(value)) {
        setProfile({ ...profile, [name]: value });
      }
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const validateFields = () => {
    const newErrors = {
      age: "",
      height: "",
      weight: ""
    };

    let isValid = true;

    // Age validation (0-120 years)
    const ageNum = Number(profile.age);
    if (profile.age && isNaN(ageNum)) {
      newErrors.age = "Age must be a number";
      isValid = false;
    } else if (profile.age && (ageNum < 0 || ageNum > 120)) {
      newErrors.age = "Please enter a valid age (0-120 years)";
      isValid = false;
    }

    // Height validation (100-220 cm)
    const heightNum = Number(profile.height);
    if (profile.height && isNaN(heightNum)) {
      newErrors.height = "Height must be a number";
      isValid = false;
    } else if (profile.height && (heightNum < 100 || heightNum > 220)) {
      newErrors.height = "Please enter a valid height (100-220 cm)";
      isValid = false;
    }

    // Weight validation (20-150 kg)
    const weightNum = Number(profile.weight);
    if (profile.weight && isNaN(weightNum)) {
      newErrors.weight = "Weight must be a number";
      isValid = false;
    } else if (profile.weight && (weightNum < 20 || weightNum > 150)) {
      newErrors.weight = "Please enter a valid weight (20-150 kg)";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!user) return;

    if (!validateFields()) {
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.fullName,
        age: profile.age ? Number(profile.age) : null,
        height: profile.height ? Number(profile.height) : null,
        weight: profile.weight ? Number(profile.weight) : null,
        meal_preference: profile.meal_preference,
        health_conditions: profile.health_conditions,
        goal: profile.goal,
        activity_level: profile.activity_level,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile!");
      console.error("Update error:", error);
    } else {
      toast.success("Profile updated successfully!");
      setEditMode(false);
      fetchProfile(); // Refresh the profile data
    }
  };

  const renderProfileFields = () => (
    <div className="space-y-8">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={profile.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          disabled={!editMode}
          className="mt-1"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          value={profile.email}
          disabled
          className="mt-1"
        />
      </div>

      {/* Age, Height, Weight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            type="text"
            inputMode="numeric"
            value={profile.age}
            onChange={handleChange}
            placeholder="0-120 years"
            disabled={!editMode}
            className="mt-1"
          />
          {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            name="height"
            type="text"
            inputMode="numeric"
            value={profile.height}
            onChange={handleChange}
            placeholder="100-220 cm"
            disabled={!editMode}
            className="mt-1"
          />
          {errors.height && <p className="text-sm text-red-500">{errors.height}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            name="weight"
            type="text"
            inputMode="numeric"
            value={profile.weight}
            onChange={handleChange}
            placeholder="20-150 kg"
            disabled={!editMode}
            className="mt-1"
          />
          {errors.weight && <p className="text-sm text-red-500">{errors.weight}</p>}
        </div>
      </div>

      {/* Meal Preference */}
      <div className="space-y-2">
        <Label htmlFor="meal_preference">Meal Preference</Label>
        {editMode ? (
          <Select
            value={profile.meal_preference}
            onValueChange={(val) =>
              setProfile({ ...profile, meal_preference: val })
            }
          >
            <SelectTrigger id="meal_preference" className="mt-1">
              <SelectValue placeholder="Select meal preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="veg">Vegetarian</SelectItem>
              <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
              <SelectItem value="vegan">Vegan</SelectItem>
              <SelectItem value="eggetarian">Eggetarian</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <p className="bg-muted px-3 py-2 rounded-md text-sm border mt-1">
            {mealPreferenceMap[profile.meal_preference] || "Not specified"}
          </p>
        )}
      </div>

      {/* Health Conditions */}
      <div className="space-y-2">
        <Label htmlFor="health_conditions">Health Conditions</Label>
        <Input
          id="health_conditions"
          name="health_conditions"
          value={profile.health_conditions}
          onChange={handleChange}
          placeholder="e.g., Diabetes, Thyroid, None"
          disabled={!editMode}
          className="mt-1"
        />
      </div>

      {/* Goal */}
      <div className="space-y-2">
        <Label htmlFor="goal">Goal</Label>
        {editMode ? (
          <Select
            value={profile.goal}
            onValueChange={(val) => setProfile({ ...profile, goal: val })}
          >
            <SelectTrigger id="goal" className="mt-1">
              <SelectValue placeholder="Select your goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="bulk">Bulk (Muscle Gain)</SelectItem>
              <SelectItem value="cut">Cut (Fat Loss)</SelectItem>
              <SelectItem value="weight_loss">Weight Loss</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <p className="bg-muted px-3 py-2 rounded-md text-sm border mt-1">
            {goalMap[profile.goal] || "Not specified"}
          </p>
        )}
      </div>

      {/* Activity Level */}
      <div className="space-y-2">
        <Label htmlFor="activity_level">Activity Level</Label>
        {editMode ? (
          <Select
            value={profile.activity_level}
            onValueChange={(val) =>
              setProfile({ ...profile, activity_level: val })
            }
          >
            <SelectTrigger id="activity_level" className="mt-1">
              <SelectValue placeholder="Select your activity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
              <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
              <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
              <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
              <SelectItem value="very_active">Very Active (hard exercise 6-7 days/week)</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <p className="bg-muted px-3 py-2 rounded-md text-sm border mt-1">
            {activityLevelMap[profile.activity_level] || "Not specified"}
          </p>
        )}
      </div>
    </div>
  );

  if (authLoading) return <div>Loading...</div>;
  if (authError) return <div>Error: {authError.message}</div>;

  return (
    <div className="min-h-screen mt-30 pl-90">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">
          {editMode ? "EDIT PROFILE" : "MY PROFILE"}
        </h1>
        {editMode ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={() => setEditMode(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="bg-muted/20 rounded-2xl p-8 shadow-sm">
        {renderProfileFields()}
      </div>
    </div>
  );
};

export default ProfilePage;