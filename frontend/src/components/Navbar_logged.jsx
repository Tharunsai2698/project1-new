import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const fetchProfileName = async () => {
    if (!user || !user.id) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (data?.full_name) {
      sessionStorage.setItem("full_name", data.full_name);
      setFullName(data.full_name);
    } else {
      console.warn("Full name not found in DB", error);
    }
  };

  const handleLogout = async () => {
    sessionStorage.clear();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  useEffect(() => {
    const cachedName = sessionStorage.getItem("full_name");
    if (cachedName) {
      setFullName(cachedName);
    } else {
      fetchProfileName();
    }

    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-dropdown")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user]);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/detect", label: "Detect" },
    { to: "/mealplan", label: "Meal Plan" },
    { to: "/history", label: "History" },
  ];

  const buttonWidth = fullName
    ? `${Math.min(Math.max(fullName.length * 10, 120), 300)}px`
    : "120px";

  return (
    <header className="fixed top-0 z-50 w-full px-6 py-5 bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
        {/* Logo */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 12 }}
          className="flex items-center space-x-3"
        >
          <img
            src="src/assets/logo.png"
            alt="Nutrical Logo"
            className="w-10 h-10 mix-blend-screen"
          />
          <span className="font-montserrat text-3xl font-bold text-white">
            NUTRICAL
          </span>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map(({ to, label }, index) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="relative"
            >
              <Link
                to={to}
                className={`text-lg font-medium transition-colors duration-300 ${
                  path.startsWith(to)
                    ? "text-white font-semibold"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {label}
                {path.startsWith(to) && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-[-22px] left-0 right-0 h-1 bg-amber-50 rounded-"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}

          {/* Profile Dropdown */}
          <div className="relative profile-dropdown ml-4">
            <Button
              variant="outline"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center text-white border-white hover:bg-gray-700 transition-all"
              style={{
                minWidth: buttonWidth,
                height: "42px",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              <User className="w-5 h-5 mr-3 text-white" />
              <span className="truncate max-w-[180px]">
                {fullName || "Loading..."}
              </span>
            </Button>

            {dropdownOpen && (
              <div className="absolute top-14 right-0 bg-black shadow-lg rounded-md w-48 z-50 overflow-hidden border border-white">
                <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                  <button className="w-full text-left px-4 py-3 text-white hover:bg-neutral-800">
                    Profile Details
                  </button>
                </Link>
                <button
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-neutral-800"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Icon */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          <Menu className="w-8 h-8" />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 px-4 space-y-3 bg-gray-900 rounded-md shadow-lg py-3">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block py-3 text-lg relative ${
                path.startsWith(to)
                  ? "text-white font-semibold"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {label}
              {path.startsWith(to) && (
                <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-500" />
              )}
            </Link>
          ))}
          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="block text-white py-3 hover:text-gray-300 text-lg"
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left text-red-400 py-3 hover:text-red-500 text-lg"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}