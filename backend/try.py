import openai
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True, methods=["GET", "POST", "OPTIONS"])

# Configure OpenAI (Together.ai)
openai.api_key = os.getenv("TOGETHER_API_KEY")
openai.api_base = "https://api.together.xyz/v1"

# Valid Together.ai models
VALID_MODELS = [
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "togethercomputer/llama-2-70b-chat",
    "gpt2",
    "gpt-j-6b"
]

print("API Key Loaded:", bool(openai.api_key))

def calculate_nutrition_requirements(profile):
    """Calculate nutritional requirements based on user profile"""
    try:
        # Get values with defaults
        weight = float(profile.get('weight', 70))  # Default 70kg
        height = float(profile.get('height', 175))  # Default 175cm
        age = int(profile.get('age', 30))  # Default 30 years
        gender = profile.get('gender', 'male')
        activity_level = profile.get('activity_level', 'moderate')
        goal = profile.get('goal', 'balanced')
        
        # Calculate BMR (Harris-Benedict equation)
        if gender == 'male':
            bmr = 10 * weight + 6.25 * height - 5 * age + 5
        else:
            bmr = 10 * weight + 6.25 * height - 5 * age - 161

        
        # Calculate TDEE based on activity level
        activity_multipliers = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "very_active": 1.9
        }
        tdee = bmr * activity_multipliers.get(activity_level, 1.2)
        
        # Adjust for goals
        goal_adjustments = {
            "weight_loss": -500,
            "cut": -300,
            "balanced": 0,
            "bulk": 300,
            "weight_gain": 500
        }
        calories = tdee + goal_adjustments.get(goal, 0)
        
        # Calculate macros
        protein_multiplier = 1.8 if goal in ['bulk', 'cut'] else 1.2
        protein = weight * protein_multiplier
        
        return {
            "calories": round(calories),
            "protein": round(protein),
            "carbs": round((calories * 0.45) / 4),  # 45% of calories from carbs
            "fat": round((calories * 0.25) / 9)     # 25% of calories from fat
        }
    except Exception as e:
        raise ValueError(f"Calculation error: {str(e)}")

@app.route('/generate-meal-plan', methods=['POST'])
def generate_meal_plan():
    data = request.get_json()
    print("\n[DEBUG] Received payload:", json.dumps(data, indent=2))
    content = None  # Initialize content variable

    try:
        # Determine nutrition values
        if all(k in data for k in ['calories', 'protein', 'carbs', 'fat']):
            nutrition = {
                "calories": int(data['calories']),
                "protein": int(data['protein']),
                "carbs": int(data['carbs']),
                "fat": int(data['fat'])
            }
        else:
            nutrition = calculate_nutrition_requirements(data)

        # Extract parameters
        diet = data.get("meal_preference", "vegetarian")
        region = data.get("region", "South Indian")
        health_conditions = data.get("health_conditions", "")
        goal = data.get("goal", "balanced")
        prompt = f"""Generate a {diet} Indian meal plan with {region} preference.
Nutritional Targets (NUMBERS ONLY - NO UNITS):
- Calories: {nutrition['calories']}
- Protein: {nutrition['protein']}
- Carbs: {nutrition['carbs']}
- Fat: {nutrition['fat']}

Health Conditions: {health_conditions or 'None'}
Goal: {goal}

IMPORTANT:
1. Return ONLY valid JSON format
2. Use numbers only for nutritional values (no units)
3. Include all required sections
4. For each dish, include a 'quantity' field with the amount to consume (e.g., "1 bowl", "2 slices")

JSON Format:
{{
  "breakfast": [
    {{
      "dish": "name",
      "quantity": "1 bowl",
      "calories": 300,
      "protein": 15,
      "carbs": 45,
      "fat": 5
    }}
  ],
  "lunch": [...],
  "snacks": [...],
  "dinner": [...],
  "nutrition_summary": {{
    "total_calories": 1800,
    "total_protein": 60,
    "total_carbs": 200,
    "total_fat": 50
  }},
  "shopping_list": ["item1", "item2"]
}}"""

        try:
            print("\n[DEBUG] Sending prompt to AI...")
            response = openai.ChatCompletion.create(
                model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2000
            )
            content = response["choices"][0]["message"]["content"]
            print("\n[DEBUG] Raw AI Response:\n", content)

            # Clean and parse response
            json_str = content[content.find('{'):content.rfind('}')+1]
            json_str = re.sub(r'(\d+)\s*g', r'\1', json_str)  # Remove 'g' from numbers
            
            try:
                plan_dict = json.loads(json_str)
            except json.JSONDecodeError as e:
                # Try to fix common JSON issues
                json_str = json_str.replace('\n', '\\n').replace('\t', '\\t')
                plan_dict = json.loads(json_str)

            # Validate and convert numbers
            required_meals = ["breakfast", "lunch", "snacks", "dinner"]
            if not all(meal in plan_dict for meal in required_meals):
                raise ValueError("Missing required meal sections")

            for meal in required_meals:
                for item in plan_dict.get(meal, []):
                    for nutrient in ['calories', 'protein', 'carbs', 'fat']:
                        if nutrient in item:
                            item[nutrient] = int(float(item[nutrient]))

            if 'nutrition_summary' not in plan_dict:
                plan_dict['nutrition_summary'] = calculate_totals(plan_dict)
            else:
                for key in ['total_calories', 'total_protein', 'total_carbs', 'total_fat']:
                    if key in plan_dict['nutrition_summary']:
                        plan_dict['nutrition_summary'][key] = int(float(plan_dict['nutrition_summary'][key]))

            return jsonify({
                "plan": plan_dict,
                "nutrition_requirements": nutrition
            })

        except Exception as e:
            return jsonify({
                "error": "AI response processing failed",
                "message": str(e),
                "debug_info": {
                    "prompt": prompt,
                    "response": content if content else "No response generated"
                }
            }), 500

    except Exception as e:
        return jsonify({
            "error": "Request processing failed",
            "message": str(e),
            "debug_info": {
                "input_data": data,
                "prompt": prompt if 'prompt' in locals() else "Prompt not generated"
            }
        }), 400

def calculate_totals(plan):
    """Calculate nutrition totals if not provided by AI"""
    meals = ["breakfast", "lunch", "snacks", "dinner"]
    totals = {
        "total_calories": 0,
        "total_protein": 0,
        "total_carbs": 0,
        "total_fat": 0
    }
    
    for meal in meals:
        for item in plan.get(meal, []):
            totals["total_calories"] += item.get("calories", 0)
            totals["total_protein"] += item.get("protein", 0)
            totals["total_carbs"] += item.get("carbs", 0)
            totals["total_fat"] += item.get("fat", 0)
    
    return totals

@app.route('/calculate-requirements', methods=['POST'])
def calculate_requirements():
    try:
        data = request.get_json()
        requirements = calculate_nutrition_requirements(data)
        return jsonify(requirements)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "api_key_configured": bool(openai.api_key),
        "valid_models": VALID_MODELS
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)