import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Navbar_logged";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./components/AuthProvider";
import NavbarHero from "./components/Navbar_hero";

// Pages
import GetStarted from "./pages/GetStarted";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DetectPage from "./pages/FoodDetection";
import History from "./pages/History";
import ProfilePage from "./pages/Profile";
import MealPlan from "./pages/MealPlan";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/Aboutus";
import HowItWorks from "./pages/Howitworks";
import ResetPassword from "./pages/ForgotPassword"; // Add this import

// Toast Notifications
import { Toaster } from "react-hot-toast";

// Modified NormalizePath to preserve URL parameters
function NormalizePath() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't normalize paths that contain access tokens (password reset)
    if (location.pathname.toLowerCase().includes('forgot-password')) return;
    
    const lowerPath = location.pathname.toLowerCase();
    if (location.pathname !== lowerPath) {
      navigate(lowerPath + location.search, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

// Layout with conditional Navbar/Footer
function Layout() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const navbarHeroPaths = ["/", "/aboutus", "/howitworks"];
  const navbarOnlyPaths = ["/dashboard", "/detect", "/mealplan", "/history", "/profile"];
  const footerPaths = ["/", "/aboutus", "/howitworks"];

  const showNavbarHero = navbarHeroPaths.includes(path);
  const showNavbar = navbarOnlyPaths.includes(path) || navbarHeroPaths.includes(path);
  const showFooter = footerPaths.includes(path);

  return (
    <div className="flex flex-col min-h-screen">
      <NormalizePath />
      {showNavbarHero ? <NavbarHero /> : showNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<GetStarted />} />
          <Route path="/dashboard" element={<ProtectedRoute element={Home} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/detect" element={<ProtectedRoute element={DetectPage} />} />
          <Route path="/mealplan" element={<ProtectedRoute element={MealPlan} />} />
          <Route path="/history" element={<ProtectedRoute element={History} />} />
          <Route path="/profile" element={<ProtectedRoute element={ProfilePage} />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/howitworks" element={<HowItWorks />} />
          <Route path="/forgot-password" element={<ResetPassword />} /> {/* Add this route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

// Main App wrapped in AuthProvider
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}