import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      toast.error(
        error.status === 400 || error.name === "AuthApiError"
          ? "Invalid email or password."
          : error.message || "Login failed."
      );
    } else {
      toast.success("Login successful!");
      sessionStorage.setItem("authtoken", data.session.access_token);
      navigate(from, { replace: true });
    }
  };

  const handlePasswordReset = async () => {
    if (!forgotEmail) {
      toast.error("Please enter your email.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: "http://localhost:5173/forgot-password",
    });

    if (error) {
      toast.error(error.message || "Something went wrong.");
    } else {
      toast.success("Password reset link sent!");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4 overflow-auto">

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 sm:p-8"
      >
        <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Login
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full"
            />
          </div>

          <Button type="submit" className="w-full mt-2">
            Sign In
          </Button>
        </div>

        {/* Forgot Password Dialog */}
        <div className="mt-4 text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Forgot Password?
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                  Enter your email to receive a password reset link.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <Button onClick={handlePasswordReset} className="w-full">
                  Send Reset Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sign Up */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Don’t have an account?{" "}
          <Link to="/Signup">
            <Button variant="default" className="text-white dark:text-blue-400 px-1">
              Sign Up
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
