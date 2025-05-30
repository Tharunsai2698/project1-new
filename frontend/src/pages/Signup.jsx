import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SignupFlow() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: "",
    age: "",
    height: "",
    weight: "",
    mealPref: "",
    health: "",
    goal: "",
    activity: "",
  });

  useEffect(() => {
    const checkEmail = async () => {
      if (!email) return;
      const { data } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      setEmailExists(!!data);
    };

    const delayCheck = setTimeout(checkEmail, 500);
    return () => clearTimeout(delayCheck);
  }, [email]);

  const handlePasswordSubmit = () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setStep("profile");
  };

  const validateProfile = () => {
    const newErrors = {};
  
    // Full name validation
    if (!profile.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
  
    // Age validation (0-120 years)
    const ageNum = parseInt(profile.age);
    if (isNaN(ageNum)) {
      newErrors.age = "Age must be a number";
    } else if (ageNum < 0 || ageNum > 120) {
      newErrors.age = "Please enter a valid age (0-120 years)";
    }
  
    // Height validation (100-220 cm)
    const heightNum = parseInt(profile.height);
    if (isNaN(heightNum)) {
      newErrors.height = "Height must be a number";
    } else if (heightNum < 100 || heightNum > 220) {
      newErrors.height = "Please enter a valid height (100-220 cm)";
    }
  
    // Weight validation (20-150 kg)
    const weightNum = parseInt(profile.weight);
    if (isNaN(weightNum)) {
      newErrors.weight = "Weight must be a number";
    } else if (weightNum < 20 || weightNum > 150) {
      newErrors.weight = "Please enter a valid weight (20-150 kg)";
    }
  
    // Meal preference validation
    if (!profile.mealPref) {
      newErrors.mealPref = "Meal preference is required";
    }
  
    // Goal validation
    if (!profile.goal) {
      newErrors.goal = "Goal is required";
    }
  
    // Activity level validation
    if (!profile.activity) {
      newErrors.activity = "Activity level is required";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateProfile()) {
      return;
    }

    setLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError || !signUpData.user) {
        throw signUpError || new Error("Unknown error during signup");
      }

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: signUpData.user.id,
        email: signUpData.user.email,
        full_name: profile.fullName,
        age: parseInt(profile.age),
        height: parseInt(profile.height),
        weight: parseInt(profile.weight),
        meal_preference: profile.mealPref,
        health_conditions: profile.health,
        goal: profile.goal,
        activity_level: profile.activity,
      });

      if (profileError) {
        throw profileError;
      }

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Error: " + (error.message || "Failed to create account"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-background px-4">
      <div className="max-w-md w-full p-6 space-y-6 bg-white dark:bg-card text-gray-900 dark:text-card-foreground rounded-2xl shadow-xl border border-border">
        <h2 className="text-2xl font-bold text-center">
          {step === "email" && "Create an Account"}
          {step === "password" && "Set a Password"}
          {step === "profile" && "Tell us about you"}
        </h2>

        {step === "email" && (
          <div className="space-y-4">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {emailExists && (
              <p className="text-sm text-red-500">User already exists.</p>
            )}
            <Button
              className="w-full"
              onClick={() => setStep("password")}
              disabled={!email || emailExists}
            >
              Continue
            </Button>
            <p className="text-sm text-center mt-2 text-muted-foreground">
              Already have an account?{" "}
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
              >
                Login here
              </span>
            </p>
          </div>
        )}

        {step === "password" && (
          <div className="space-y-4">
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>
            <Button
              className="w-full"
              onClick={handlePasswordSubmit}
              disabled={!password || !confirmPassword}
            >
              Submit Password
            </Button>
          </div>
        )}

        {step === "profile" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Enter your name"
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>
              <div>
                <Label htmlFor="mealPref">Meal Preference</Label>
                <Select
                  value={profile.mealPref}
                  onValueChange={(val) => setProfile({ ...profile, mealPref: val })}
                >
                  <SelectTrigger id="mealPref">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">Vegetarian</SelectItem>
                    <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="eggetarian">Eggetarian</SelectItem>
                  </SelectContent>
                </Select>
                {errors.mealPref && <p className="text-sm text-red-500">{errors.mealPref}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="120"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  placeholder="0-120"
                />
                {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="100"
                  max="220"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  placeholder="100-220"
                />
                {errors.height && <p className="text-sm text-red-500">{errors.height}</p>}
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="20"
                  max="150"
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                  placeholder="20-150"
                />
                {errors.weight && <p className="text-sm text-red-500">{errors.weight}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="health">Health Conditions</Label>
              <Input
                id="health"
                value={profile.health}
                onChange={(e) => setProfile({ ...profile, health: e.target.value })}
                placeholder="Any health issues (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal">Goal</Label>
                <Select
                  value={profile.goal}
                  onValueChange={(val) => setProfile({ ...profile, goal: val })}
                >
                  <SelectTrigger id="goal">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="bulk">Muscle Gain</SelectItem>
                    <SelectItem value="balanced">Maintenance</SelectItem>
                    <SelectItem value="cut">Cut</SelectItem>
                  </SelectContent>
                </Select>
                {errors.goal && <p className="text-sm text-red-500">{errors.goal}</p>}
              </div>
              <div>
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  value={profile.activity}
                  onValueChange={(val) => setProfile({ ...profile, activity: val })}
                >
                  <SelectTrigger id="activity">
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Lightly Active</SelectItem>
                    <SelectItem value="moderate">Moderately Active</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="very_active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
                {errors.activity && <p className="text-sm text-red-500">{errors.activity}</p>}
              </div>
            </div>

            <Button className="w-full" onClick={handleSignup} disabled={loading}>
              {loading ? "Creating Profile..." : "Finish Signup"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}