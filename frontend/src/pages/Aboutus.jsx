import React from "react"; 
import { Link } from "react-router-dom";

const Button = ({ children, size = "base", className = "", ...props }) => {
  const sizeClasses = {
    xl: "text-xl py-3 px-8",
    "2xl": "text-2xl py-4 px-10",
    "3xl": "text-3xl py-5 px-12",
    "4xl": "text-4xl py-6 px-14"
  };
  
  return (
    <button
      className={`font-medium rounded-lg transition-colors duration-300 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const AboutUs = () => {
  return (
    <div className="w-screen bg-white min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-12 overflow-x-hidden">
      <div className="max-w-4xl w-full py-12 sm:py-16">
        {/* Header with subtle decoration */}
        <div className="text-center mb-12 mt-16">
           <h1 className="text-4xl sm:text-5xl font-bold font-montserrat text-gray-800">
            About <span className="text-primary">NutriCal</span>
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-blue-400 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* About the Company with card-like section */}
        <div className="bg-gray-50 rounded-xl p-8 shadow-sm mb-12 border border-gray-100">
          <h2 className="text-2xl font-semibold font-montserrat text-gray-800 mb-6 text-center">
            Our Vision
          </h2>
          <div className="text-gray-600 font-lora space-y-6 text-lg leading-relaxed">
            <p className="text-center italic text-gray-500 mb-6">
              "Empowering health through intelligent nutrition tracking"
            </p>
            <p>
              NutriCal is an AI-powered nutrition and calorie tracking platform that helps users monitor their meals through food image analysis—starting with a focus on Indian cuisine.
            </p>
            <p>
              By combining state-of-the-art models like YOLOv8 and SAM with curated nutritional databases, we enable users to track macronutrients and portion sizes with ease.
            </p>
            <p>
              NutriCal aims to make smart nutrition accessible, personalized, and simple to use—bridging the gap between technology, culture, and individual health goals.
            </p>
          </div>
        </div>

        {/* Who We Are & Our Values - Professional presentation */}
        <div className="space-y-16">
          {/* Who We Are with team illustration concept */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3 flex justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-50 to-primary-50 flex items-center justify-center border-2 border-primary/20">
                <svg className="w-20 h-20 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl sm:text-3xl font-semibold font-montserrat text-gray-800 mb-4">
                Who We Are
              </h2>
              <p className="text-gray-600 font-lora text-lg leading-relaxed">
                NutriCal was created by a group of developers and health enthusiasts who saw the need for a culturally aware, AI-powered nutrition tracker designed specifically for real-world food detection.
              </p>
              <p className="text-gray-600 font-lora text-lg leading-relaxed mt-4">
                We're focused on making food recognition accurate for diverse diets and lifestyles, starting with Indian meal types, and extending to global cuisine in future iterations.
              </p>
            </div>
          </div>

          {/* Our Values with icon list */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold font-montserrat text-gray-800 mb-8 text-center">
              Our Core Principles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "💡",
                  title: "Scientific Integrity",
                  desc: "All nutritional data is derived from verified sources like IFCT and validated with clinical guidance."
                },
                {
                  icon: "🔍",
                  title: "Transparency",
                  desc: "We clearly document how our AI models detect and analyze food to ensure informed use."
                },
                {
                  icon: "🛡️",
                  title: "Privacy First",
                  desc: "Your personal data stays encrypted and is never sold—your control, your nutrition."
                },
                {
                  icon: "🚀",
                  title: "Continuous Innovation",
                  desc: "We continuously improve based on model updates, nutrition science, and user insights."
                }
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-semibold font-montserrat text-primary mb-2">{item.title}</h3>
                  <p className="text-gray-600 font-lora">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Join Us - Call to action */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-50 to-primary-50 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-semibold font-montserrat text-gray-800 mb-4">
            Ready to Transform Your Nutrition?
          </h2>
          <p className="text-gray-600 font-lora text-lg max-w-2xl mx-auto mb-8">
            Join a growing community of individuals and professionals using NutriCal for personalized, image-based nutrition tracking.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/signup" className="inline-flex justify-center">
              <Button size="4xl" className="bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg">
                Get Started Now
              </Button>
            </Link>
            <a
              href="mailto:aakash123ash@gmail.com?subject=Inquiry%20About%20Your%20Services&body=Hello%20Aakash,%0D%0A%0D%0AI%20would%20like%20to%20inquire%20about..."
              className="inline-flex justify-center"
            >
              <Button 
                size="4xl" 
                className="border-2 border-primary text-white hover:bg-primary/10 shadow-sm hover:shadow-md"
              >
                Contact Our Team
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;