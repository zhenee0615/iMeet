import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import cv2
from deepface import DeepFace
import requests

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return "Welcome to the Enhanced Flask API"

@app.route('/face_recognition', methods=['POST'])
def perform_face_verification():
    try:
        payload = request.get_json()
        captured_frame = payload['image_data']
        profile_image_path = payload['profile_image_url']

        decoded_frame = base64.b64decode(captured_frame)
        frame_image = Image.open(BytesIO(decoded_frame))
        frame_array = np.array(frame_image)
        frame_rgb = cv2.cvtColor(frame_array, cv2.COLOR_BGR2RGB)

        if not analyze_texture(frame_rgb):
            return jsonify({"error": "Detected potential spoofing due to blur or low texture."})
        
        detected_faces = DeepFace.extract_faces(img_path=frame_rgb, enforce_detection=True, detector_backend='opencv', anti_spoofing=True)
        if not detected_faces:
            return jsonify({"error": "No face detected in the frame."})
        if not detected_faces[0].get("is_real", False):
            return jsonify({"error": "Detected spoofing attack!"})
        
        if profile_image_path.startswith('http'):
            response = requests.get(profile_image_path)
            if response.status_code != 200:
                return jsonify({"error": "Unable to fetch profile image from the provided URL."})
            reference_image = np.array(Image.open(BytesIO(response.content)))
        else:
            reference_image = cv2.imread(profile_image_path)
            if reference_image is None:
                return jsonify({"error": "Profile image not found at the specified path."})
        
        reference_image_rgb = cv2.cvtColor(reference_image, cv2.COLOR_BGR2RGB)

        comparison_result = DeepFace.verify(img1_path=frame_rgb, img2_path=reference_image_rgb, model_name="Facenet512")
        logger.info(comparison_result)

        if comparison_result["verified"]:
            return jsonify({
                "match": True,
                "anti_spoofing": True
            })
        else :
            return jsonify({
                "match": False,
                "anti_spoofing": True
            })

    except Exception as error:
        return jsonify({"error": "Unable to detect face."})
    
def analyze_texture(frame_rgb):
    gray_frame = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2GRAY)
    laplacian_var = cv2.Laplacian(gray_frame, cv2.CV_64F).var()
    return laplacian_var > 100
    
if __name__ == '__main__':
    app.run(port=5001, debug=True)