import cv2
import dlib
from scipy.spatial import distance
import threading
import time
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import HTMLResponse
import numpy as np
import os
from database import save_face_to_db

# Paths to pre-trained models
shape_predictor_path = 'shape_predictor_68_face_landmarks.dat'
face_recognition_model_path = 'dlib_face_recognition_resnet_model_v1.dat'

# Initialize FastAPI app
app = FastAPI()

# Initialize dlib models
sp = dlib.shape_predictor(shape_predictor_path)
facerec = dlib.face_recognition_model_v1(face_recognition_model_path)
detector = dlib.get_frontal_face_detector()

# Known faces database
known_ids = []
face_descriptors = []
saved_faces = []  # Store saved face images

# Global variables for face recognition timing
last_recognition_time = 0
recognition_interval = 2  # Minimum interval between recognitions in seconds


# Recognize faces in a separate thread
def recognize_face_thread(img, shape):
    global last_recognition_time
    face_descriptor = facerec.compute_face_descriptor(img, shape)

    for i, known_descriptor in enumerate(face_descriptors):
        dist = distance.euclidean(known_descriptor, face_descriptor)
        if dist < 0.6:  # Match threshold
            print(f"Recognized: {known_ids[i]}")
            break

    last_recognition_time = time.time()


# Detect and recognize faces in an image
def detect_and_recognize_faces(image: np.ndarray):
    global last_recognition_time

    dets = detector(image, 0)

    if len(dets) > 0:
        for det in dets:
            shape = sp(image, det)

            # Draw rectangle around the face
            x1, y1, x2, y2 = int(det.left()), int(det.top()), int(det.right()), int(det.bottom())
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

            # Perform recognition if interval has passed
            current_time = time.time()
            if current_time - last_recognition_time > recognition_interval:
                threading.Thread(target=recognize_face_thread, args=(image, shape)).start()

            # Save detected face
            face_image = image[y1:y2, x1:x2]  # Extract the face region
            saved_faces.append(face_image)  # Store the face image

    else:
        print("No face detected")


# Save detected faces to a database with unique IDs
def detect_and_save_faces(image):
    dets = detector(image, 0)

    if dets:
        for i, det in enumerate(dets):
            x1, y1, x2, y2 = int(det.left()), int(det.top()), int(det.right()), int(det.bottom())
            face_image = image[y1:y2, x1:x2]

            face_id = f"face_{i}_{int(time.time())}"
            save_face_to_db(face_image, face_id)


# FastAPI endpoint: Upload an image for face detection and recognition
@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    detect_and_recognize_faces(img)

    return {"filename": file.filename}


# FastAPI endpoint: Save detected faces to disk
@app.post("/save_faces/")
async def save_faces():
    if saved_faces:
        for idx, face in enumerate(saved_faces):
            cv2.imwrite(f"detected_face_{idx}.png", face)  # Save each face image
        return {"message": "Faces saved successfully"}
    return {"message": "No faces detected to save"}


# FastAPI HTML interface
@app.get("/")
def main():
    content = """
    <html>
        <body>
            <h1>Upload an Image for Face Detection</h1>
            <form action="/upload/" enctype="multipart/form-data" method="post">
            <input name="file" type="file" />
            <input type="submit" value="Upload" />
            </form>
            <form action="/save_faces/" method="post">
            <input type="submit" value="Save Detected Faces" />
            </form>
        </body>
    </html>
    """
    return HTMLResponse(content=content)


# Main entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
