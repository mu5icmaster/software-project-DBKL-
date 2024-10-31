# compare-face.py
import sys
from PIL import Image
from deepface import DeepFace

def convert_to_jpeg(image_path):
    """Converts the image to JPEG format if not already in JPEG format."""
    if not image_path.lower().endswith((".jpg", ".jpeg")):
        try:
            img = Image.open(image_path)
            jpeg_path = image_path.rsplit('.', 1)[0] + ".jpg"
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
        print("Error: One of the images could not be converted to JPEG.")
        return

    try:
        # Perform face verification
        result = DeepFace.verify(image1_path, image2_path, model_name="VGG-Face")
        print("Face match found" if result["verified"] else "No match")
    except Exception as e:
        print(f"Error during face verification: {e}")

if __name__ == "__main__":
    # Ensure both image paths are provided as arguments
    if len(sys.argv) < 3:
        print("Error: Please provide paths for two images.")
    else:
        compare_faces(sys.argv[1], sys.argv[2])
