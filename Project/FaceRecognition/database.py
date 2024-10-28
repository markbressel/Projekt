from pymongo import MongoClient
import cv2
import base64

# MongoDB kapcsolat létrehozása
client = MongoClient("mongodb://localhost:27017/")  # Az URL-t szükség szerint módosíthatod
db = client["face_database"]  # Adatbázis neve
collection = db["faces"]  # Kollekció neve

def save_face_to_db(face_image, face_id):
    # A képet Base64 kódolással átalakítjuk szöveggé
    _, buffer = cv2.imencode(".png", face_image)
    face_base64 = base64.b64encode(buffer).decode("utf-8")

    # Ellenőrizzük, hogy az arc már létezik-e az adatbázisban
    if collection.find_one({"face_id": face_id}):
        print(f"Face with ID {face_id} already exists in the database.")
        return
    
    # Új arc hozzáadása az adatbázishoz
    collection.insert_one({
        "face_id": face_id,
        "image_data": face_base64
    })
    print(f"Face with ID {face_id} saved to the database.")

# A detektált arcokat itt hívhatod meg
def detect_and_save_faces(image):
    dets = detector(image, 0)  # arcok detektálása

    if dets:
        for i, det in enumerate(dets):
            # Detektált arc körbevágása
            x1, y1, x2, y2 = int(det.left()), int(det.top()), int(det.right()), int(det.bottom())
            face_image = image[y1:y2, x1:x2]

            # Egyedi ID generálása az archoz
            face_id = f"face_{i}_{int(time.time())}"
            save_face_to_db(face_image, face_id)
