
import cv2
import uuid
import numpy as np
from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from firebase_config import bucket

# Initialize FastAPI
app = FastAPI()

origins = [
    "http://localhost:8081",
    "http://localhost:8001",
    "http://localhost:8000",
    "http://localhost:8081/upload-image"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the pre-trained Haar Cascade model for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def upload_to_firebase(image_bytes, folder, user_id, file_prefix):
    """
    Upload an image to Firebase Storage and return its public URL.
    """
    file_name = f"users/{user_id}/{folder}/{file_prefix}_{uuid.uuid4().hex}.png"
    blob = bucket.blob(file_name)
    blob.upload_from_string(image_bytes, content_type="image/png")
    blob.make_public()
    return blob.public_url

@app.post("/upload/")
async def upload_image(file: UploadFile = File(...), user_id: str = Form(...)):
    try:
        print(f"Received file: {file.filename}")
        print(f"Received user_id: {user_id}")
    except Exception as e:
        print(f"Error in upload endpoint: {e}")
        return {"error": f"Error: {e}"}, 500
    """
    Upload an image to Firebase Storage and crop faces detected in the image.
    """
    if not file or not user_id:
        return {"error": "File or user_id is missing"}, 400

    try:
        # Read the uploaded file
        contents = await file.read()
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Convert the image to bytes for upload
        _, buffer = cv2.imencode(".png", img)
        image_bytes = buffer.tobytes()

        # Upload the original image
        original_image_url = upload_to_firebase(image_bytes, "images", user_id, "original")

        # Detect faces in the image
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        cropped_urls = []

        # Crop and upload each detected face
        for i, (x, y, w, h) in enumerate(faces):
            face_img = img[y:y + h, x:x + w]  # Crop the face
            _, face_buffer = cv2.imencode(".png", face_img)
            cropped_url = upload_to_firebase(face_buffer.tobytes(), "cropped_images", user_id, f"cropped_{i}")
            cropped_urls.append(cropped_url)

        return {
            "message": "Image processed successfully.",
            "original_image_url": original_image_url,
            "cropped_images": cropped_urls,
        }

    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}, 500

@app.get("/get-images/")
async def get_images(user_id: str):
    """
    Retrieve uploaded images for a specific user from Firebase Storage.
    """
    try:
        user_folder = f"users/{user_id}/images"
        blobs = bucket.list_blobs(prefix=user_folder)
        image_urls = [blob.public_url for blob in blobs if blob.name.endswith(".png")]
        return {"images": image_urls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/get-cropped-images/")
async def get_cropped_images(user_id: str):
    """
    Retrieve cropped images for a specific user from Firebase Storage.
    """
    try:
        user_folder = f"users/{user_id}/cropped_images"
        blobs = bucket.list_blobs(prefix=user_folder)
        cropped_urls = [blob.public_url for blob in blobs if blob.name.endswith(".png")]
        return {"cropped_images": cropped_urls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/")
def root():
    """
    Basic HTML interface for testing uploads.
    """
    return {
        "message": "Welcome to the Face Detection and Cropping API!",
        "endpoints": [
            "/upload/ (POST): Upload an image and detect/crop faces.",
            "/get-images/ (GET): Get uploaded images for a user.",
            "/get-cropped-images/ (GET): Get cropped images for a user.",
        ],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)