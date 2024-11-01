# compare-face.py
import sys
import os
import json
from PIL import Image
from deepface import DeepFace

def convert_to_jpeg(image_path):
    """Converts the image to JPEG format if not already in JPEG format."""
    if not image_path.lower().endswith((".jpg", ".jpeg")):
        jpeg_path = image_path.rsplit('.', 1)[0] + ".jpg"
        if os.path.exists(jpeg_path):
            print(f"JPEG file already exists for {image_path}, using {jpeg_path}")
            return jpeg_path
        try:
            img = Image.open(image_path)
            img.convert("RGB").save(jpeg_path, "JPEG")
            print(f"Converted {image_path} to {jpeg_path}")
            return jpeg_path
        except Exception as e:
            print(f"Error converting {image_path} to JPEG: {e}")
            return None
    return image_path

def compare_faces(image1_path, image2_path):
    # Convert images to JPEG if needed
    image1_path = convert_to_jpeg(image1_path)
    image2_path = convert_to_jpeg(image2_path)

    if not image1_path or not image2_path:
        print(
            json.dumps({"error": "One of the images could not be converted to JPEG."})
        )
        return

    try:
        # Perform face verification
        result = DeepFace.verify(image1_path, image2_path, model_name="VGG-Face")
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    # Ensure both image paths are provided as arguments
    if len(sys.argv) < 3:
        print("Error: Please provide paths for two images.")
    else:
        compare_faces(sys.argv[1], sys.argv[2])
