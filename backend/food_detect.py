from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import google.generativeai as genai
from PIL import Image
import io
import json
from dotenv import load_dotenv
import os
import logging
from typing import Optional, Dict
from datetime import datetime
from flask_cors import CORS
 # Add this line
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()
# Configuration
API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Model initialization
model = genai.GenerativeModel("gemini-1.5-flash")

app = Flask(__name__)
CORS(app) 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image(file_stream):
    """Validate and convert file stream to PIL Image."""
    try:
        image = Image.open(io.BytesIO(file_stream))
        
        # Basic image validation
        if image.width > 5000 or image.height > 5000:
            raise ValueError("Image dimensions too large")
            
        return image
    except Exception as e:
        logger.error(f"Image validation error: {str(e)}")
        raise ValueError("Invalid image file")

def build_prompt(user_description: Optional[str] = None) -> str:
    """Build the prompt for Gemini with optional user description."""
    base_prompt = """
You are a nutrition AI specializing in Indian cuisine. Given the food image:

1. Identify all visible food items (use common Indian food names)
2. Estimate quantities in grams (100-150g for sides, 200-300g for mains)
3. Calculate nutritional values per standard recipes
4. Return results in strict JSON format:

{
  "meal_name": "string (meal description)",
  "foods": [
    {
      "name": "string",
      "weight_g": number,
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fats_g": number
    }
  ],
  "total": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fats_g": number
  }
}

Rules:
- Never include explanations or non-JSON text
- If unsure, make reasonable estimates
"""
    if user_description:
        base_prompt += f'\n\nUser notes: "{user_description}"'
    
    return base_prompt

@app.route('/api/detect-food', methods=['POST'])
def detect_food():
    """Endpoint for food detection."""
    try:
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
            
        file = request.files['image']
        description = request.form.get('description', '')
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        if file and allowed_file(file.filename):
            # Read file into memory
            file_stream = file.read()
            
            # Validate image
            try:
                image = validate_image(file_stream)
            except ValueError as e:
                return jsonify({"error": str(e)}), 400
                
            # Generate prompt
            prompt = build_prompt(description)
            
            # Call Gemini API
            logger.info("Calling Gemini API for food detection")
            response = model.generate_content([prompt, image], stream=False)
            
            # Parse response
            try:
                # Sometimes Gemini responses include markdown backticks
                json_str = response.text.strip()
                if json_str.startswith('```json'):
                    json_str = json_str[7:-3].strip()  # Remove ```json and ```
                elif json_str.startswith('```'):
                    json_str = json_str[3:-3].strip()  # Remove ```
                
                result = json.loads(json_str)
                
                # Validate the response structure
                if "foods" not in result:
                    raise ValueError("Response missing required 'foods' field")
                
                # Calculate totals if not provided
                if "total" not in result:
                    result["total"] = {
                        "calories": sum(f.get("calories", 0) for f in result["foods"]),
                        "protein_g": sum(f.get("protein_g", 0) for f in result["foods"]),
                        "carbs_g": sum(f.get("carbs_g", 0) for f in result["foods"]),
                        "fats_g": sum(f.get("fats_g", 0) for f in result["foods"])
                    }
                    
                # Add meal name if not provided
                if "meal_name" not in result:
                    result["meal_name"] = " + ".join(f.get("name", "unknown") for f in result["foods"][:3])
                    if len(result["foods"]) > 3:
                        result["meal_name"] += " + more"
                
                return jsonify(result)
                
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Failed to parse Gemini response: {str(e)}")
                logger.error(f"Response content: {response.text}")
                return jsonify({
                    "error": "Failed to parse detection results",
                    "details": str(e),
                    "raw_response": response.text
                }), 500
                
        return jsonify({"error": "Invalid file type"}), 400
        
    except Exception as e:
        logger.error(f"Food detection error: {str(e)}")
        return jsonify({"error": "Food detection service unavailable"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)