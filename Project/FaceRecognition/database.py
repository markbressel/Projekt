import cv2
import uuid
from firebase_admin import credentials, storage
import firebase_admin
from firebase_config import bucket

def save_face_to_firebase(face_image, user_id):
    """
    Save a cropped face image to Firebase Storage in the `cropped_images` folder for the user.
    """
    _, buffer = cv2.imencode(".png", face_image)
    image_bytes = buffer.tobytes()

    # Create a unique filename in Firebase
    file_name = f"users/{user_id}/cropped_images/cropped_{uuid.uuid4().hex}.png"
    blob = bucket.blob(file_name)

    # Upload the file
    blob.upload_from_string(image_bytes, content_type='image/png')

    # Return the public URL
    blob.make_public()
    return blob.public_url

def get_cropped_images(user_id):
    """
    Retrieve all cropped images for a specific user from Firebase Storage.
    """
    user_folder = f"users/{user_id}/cropped_images"
    blobs = bucket.list_blobs(prefix=user_folder)
    
    # Collect public URLs for each blob
    return [blob.public_url for blob in blobs if blob.name.endswith(".png")]
