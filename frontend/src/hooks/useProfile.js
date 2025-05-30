import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

export const useProfile = () => {
  const { user, loading: authLoading, error: authError } = useAuth(); // Get user and loading state from useAuth
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null); // State to store profile fetching errors

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return; // Wait for auth to be ready

      // Check for authError or user being null
      if (authError) {
        setProfileError("Authentication error. Please log in again."); // Handle auth error
        setLoading(false);
        return;
      }

      if (!user) {
        setProfileError("No user found. Please log in."); // Handle case where user is not available
        setLoading(false);
        return;
      }

      // Proceed to fetch the profile if everything is ready
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          setProfileError("Error fetching profile: " + error.message); // Handle profile fetch error
          console.error("Error fetching profile:", error);
        } else {
          setProfile(data); // Successfully fetched profile
        }
      } catch (err) {
        setProfileError("An unexpected error occurred while fetching profile.");
        console.error("Unexpected error:", err);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, authLoading, authError]); // Trigger effect when user or authLoading changes

  return { profile, loading, profileError }; // Return profile, loading, and profileError
};
