import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function GetStarted() {
  return (
    <div className="overflow-x-hidden">
      <div className="min-h-screen overflow-y-auto">
        {/* Hero Section - Maintained original styling */}
        <div className="w-screen p-4 md:p-8 h-auto md:h-[52rem] bg-white">
          <div className="flex flex-col md:flex-row items-center h-full">
            <div className="flex-1">
              <p className="pt-4 md:pt-20 pl-4 md:pl-20 font-montserrat text-[20px] md:text-[24px] font-light mb-4 text-center md:text-left text-gray-900">
                Fuel Your Health with AI-Powered Nutrition Tracking
              </p>
              <h1 className="pl-4 md:pl-20 font-montserrat font-semibold text-[32px] md:text-[45px] text-center md:text-left text-gray-900">
                Packed with powerful <br className="hidden md:block" />
                features to fuel your health <br className="hidden md:block" />
                journey—effortlessly
              </h1>
              <div className="flex justify-center md:justify-start md:pl-60">
                <Link to="/signup">
                  <Button className="mt-10 h-14 px-8 text-lg">
                    Get Started!
                  </Button>
                </Link>
              </div>
            </div>
            {/* Added image to the right */}
            <div className="flex-1 flex justify-center mt-8 md:mt-20">
              <img
                src="/src/assets/image.png"
                alt="AI Nutrition Tracking"
                className="h-72 sm:h-80 md:h-[30rem] lg:h-[25rem] object-contain"
              />
            </div>
          </div>
        </div>

        {/* Feature Sections - Maintained original colors and dimensions */}
        <div className="flex flex-col bg-white p-4 md:p-8 space-y-16">
          {[
            {
              title: "Balance your Diet like a Pro",
              text: "Gain insights into your calorie and macronutrient intake — including proteins, fats, and carbs — to help you make informed dietary choices and maintain a balanced nutrition profile..",
              img: "src/assets/image_3.png",
              alt: "balance_pro",
              reverse: false,
            },
            {
              title: "Analyze Your Meals, Master Your Diet",
              text: "Take control of your health—analyze every meal, track essential nutrients, and make informed dietary choices for a healthier lifestyle.",
              img: "src/assets/image_2.jpeg",
              alt: "analyze",
              reverse: true,
            },
            {
              title: "Instant, Accurate and Effortless Nutrition Tracking",
              text: "Simply snap a photo of your meal, and our advanced AI will analyze the food, detect ingredients, and provide a detailed calorie and nutrient breakdown.",
              img: "src/assets/image_1.png",
              alt: "nutrition_tracking",
              reverse: false,
            },
          ].map((section, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                section.reverse ? "md:flex-row-reverse" : "md:flex-row"
              } bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white rounded-xl items-center min-h-[28rem] p-6 md:p-10 shadow-lg`}
            >
              {/* Text */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-montserrat font-semibold text-[26px] md:text-[38px] mb-4">
                  {section.title}
                </h1>
                <p className="font-lora text-[17px] md:text-[20px] font-light max-w-xl mx-auto md:mx-0">
                  {section.text}
                </p>
              </div>

              {/* Image */}
              <div className="flex-1 flex justify-center mt-6 md:mt-0">
                <img
                  className="h-52 sm:h-64 md:h-72 lg:h-80 object-contain"
                  src={section.img}
                  alt={section.alt}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}