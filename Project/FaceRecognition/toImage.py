import base64
import cv2
import numpy as np
from pymongo import MongoClient

# MongoDB kapcsolat
client = MongoClient("mongodb://localhost:27017/")
db = client["face_database"]
collection = db["faces"]

# Kép lekérdezése
def display_saved_faces():
    for document in collection.find():
        # Base64 dekódolás és kép megjelenítése
        face_base64 = document["image_data"]
        face_id = document["face_id"]

        # Dekódolás
        img_data = base64.b64decode(face_base64)
        np_arr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Kép megjelenítése
        cv2.imshow(f"Face ID: {face_id}", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

display_saved_faces()
