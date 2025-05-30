import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NavbarHero = () => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const linkVariants = {
    hover: { scale: 1.05, textShadow: "0px 0px 8px rgba(255,255,255,0.2)" },
    tap: { scale: 0.95 },
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 }
  };

  const navLinks = [
    { to: "/", label: "Home", delay: 0.1 },
    { to: "/aboutus", label: "About Us", delay: 0.2 },
    { to: "/howitworks", label: "How It Works", delay: 0.3 }
  ];

  return (
    <header className="w-full px-6 py-6 sm:py-7 bg-gradient-to-r from-gray-800 via-gray-900 to-black fixed top-0 z-50 shadow-md text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 12 }}
        >
         <Link to="/" className="flex items-center space-x-3 group transition-all duration-300">
  <img
    src="src\assets\logo.png" // 🔁 replace this with your actual logo path
    alt="Nutrical Logo"
    className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-105 mix-blend-screen"
  />
  <span className="font-montserrat text-3xl md:text-4xl font-bold text-white group-hover:text-gray-300">
    NUTRICAL
  </span>
</Link>

        </motion.div>

        {/* Mobile menu button placeholder */}
        <button className="md:hidden text-white focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-10">
          {navLinks.map(({ to, label, delay }) => (
            <motion.div
              key={to}
              variants={linkVariants}
              initial="initial"
              animate="animate"
              transition={{ delay }}
            >
              <Link
                to={to}
                className={`text-lg xl:text-xl font-medium font-montserrat transition-colors duration-300 ${
                  path === to ? "text-white font-semibold" : "text-gray-300 hover:text-white"
                }`}
              >
                <motion.span
                  whileHover="hover"
                  whileTap="tap"
                  variants={linkVariants}
                  className="block"
                >
                  {label}
                </motion.span>
              </Link>
            </motion.div>
          ))}

          {/* Sign Up Button */}
         <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
>
  <Link to="/signup">
    <Button className="text-lg xl:text-xl px-5 py-2 rounded-xl shadow-md transition-all duration-300 ">
      Sign Up
    </Button>
  </Link>
</motion.div>

        </nav>
      </div>
    </header>
  );
};

export default NavbarHero;