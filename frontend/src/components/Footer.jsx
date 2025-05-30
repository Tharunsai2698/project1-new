import React from "react";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white py-10 mt-10 overflow-hidden">
      {/* Animated Background Waves */}
      <div className="absolute inset-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#1f2937"
            fillOpacity="1"
            d="M0,160L48,165.3C96,171,192,181,288,186.7C384,192,480,192,576,186.7C672,181,768,171,864,149.3C960,128,1056,96,1152,96C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="relative container mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About */}
          <div>
            <h1 className="text-3xl font-bold font-montserrat mb-2">NUTRICAL</h1>
            <p className="text-base">Snap. Track. Thrive.</p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-center">
  <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
  <ul className="space-y-2">
    <li>
      <a
        href="/"
        className="hover:text-gray-400 transition-colors duration-300"
      >
        Home
      </a>
    </li>
    <li>
      <a
        href="/aboutus"
        className="hover:text-gray-400 transition-colors duration-300"
      >
        About
      </a>
    </li>
    <li>
      <a
        href="mailto:aakash123ash@gmail.com"
        className="hover:text-gray-400 transition-colors duration-300"
      >
        Contact
      </a>
    </li>
  </ul>
</div>
          {/* Column 3: Social Media */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-lg font-semibold mb-2">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="transform hover:-translate-y-1 transition-transform duration-300"
                aria-label="Facebook"
              >
                <Facebook />
              </a>
              <a
                href="#"
                className="transform hover:-translate-y-1 transition-transform duration-300"
                aria-label="Twitter"
              >
                <Twitter />
              </a>
              <a
                href="#"
                className="transform hover:-translate-y-1 transition-transform duration-300"
                aria-label="Instagram"
              >
                <Instagram />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          © {new Date().getFullYear()} NutriCal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}