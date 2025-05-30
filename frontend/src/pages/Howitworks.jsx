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

const HowItWorks = () => {
  return (
    <div className="w-screen bg-white min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-12 overflow-x-hidden">
      <div className="max-w-4xl w-full py-12 sm:py-16 mt-16">
        {/* Header with subtle decoration */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold font-montserrat text-gray-800">
            How <span className="text-primary">NutriCal</span> Works
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-blue-400 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Introduction */}
        <div className="bg-gray-50 rounded-xl p-8 shadow-sm mb-12 border border-gray-100">
          <h2 className="text-2xl font-semibold font-montserrat text-gray-800 mb-6 text-center">
            Simple, Powerful Nutrition Tracking
          </h2>
          <div className="text-gray-600 font-lora space-y-6 text-lg leading-relaxed text-center">
            <p>
              NutriCal uses intelligent food detection to make nutrition tracking effortless. 
              With just a few taps, you can understand what you're eating and how it impacts your health.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-16">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3 flex justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-50 to-primary-50 flex items-center justify-center border-2 border-primary/20">
                <span className="text-6xl text-primary">1</span>
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl sm:text-3xl font-semibold font-montserrat text-gray-800 mb-4">
                Snap a Photo
              </h2>
              <p className="text-gray-600 font-lora text-lg leading-relaxed">
                Take a picture of your meal using our easy-to-use camera interface. 
                Whether it’s a homemade dish or something from a restaurant, NutriCal can handle it.
              </p>
              <p className="text-gray-600 font-lora text-lg leading-relaxed mt-4">
                <span className="font-semibold text-primary">Pro Tip:</span> Good lighting and a clear angle help get the best results.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/3 flex justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-50 to-primary-50 flex items-center justify-center border-2 border-primary/20">
                <span className="text-6xl text-primary">2</span>
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl sm:text-3xl font-semibold font-montserrat text-gray-800 mb-4">
                Let the AI Detect Your Food
              </h2>
              <p className="text-gray-600 font-lora text-lg leading-relaxed">
                NutriCal automatically recognizes the food items in your photo and estimates portion sizes, even for complex meals.
              </p>
              <p className="text-gray-600 font-lora text-lg leading-relaxed mt-4">
                The app adjusts for regional recipes and ingredients, giving you culturally relevant results.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3 flex justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-50 to-primary-50 flex items-center justify-center border-2 border-primary/20">
                <span className="text-6xl text-primary">3</span>
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl sm:text-3xl font-semibold font-montserrat text-gray-800 mb-4">
                See Instant Nutrition Insights
              </h2>
              <p className="text-gray-600 font-lora text-lg leading-relaxed">
                Get a clear breakdown of your meal — including calories, macros, and key nutrients. 
                You can also see allergen info when applicable.
              </p>
              <p className="text-gray-600 font-lora text-lg leading-relaxed mt-4">
                <span className="font-semibold text-primary">Bonus:</span> Set your health goals and track progress with personalized recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Behind */}
        <div className="mt-16 bg-gray-50 rounded-xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-semibold font-montserrat text-gray-800 mb-6 text-center">
            What Powers NutriCal
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold font-montserrat text-primary mb-3">Smart Food Detection</h3>
              <p className="text-gray-600 font-lora">
                NutriCal can recognize thousands of common and regional foods with impressive accuracy, thanks to its advanced image understanding.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold font-montserrat text-primary mb-3">Reliable Nutrition Data</h3>
              <p className="text-gray-600 font-lora">
                Our app pulls from verified nutritional sources, refreshed regularly to ensure you always get the most up-to-date information.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-50 to-primary-50 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-semibold font-montserrat text-gray-800 mb-4">
            Ready to Experience Smart Nutrition Tracking?
          </h2>
          <p className="text-gray-600 font-lora text-lg max-w-2xl mx-auto mb-8">
           Join a growing community of individuals and professionals using NutriCal for personalized, image-based nutrition tracking.      </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/signup" className="inline-flex justify-center">
              <Button size="4xl" className="bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg">
                Get Started Now
              </Button>
            </Link>
            <Link to="/demo" className="inline-flex justify-center">
              <Button size="4xl" class="text-white bg-black">       See Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;