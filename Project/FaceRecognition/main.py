import dlib
import os
from skimage import io
from scipy.spatial import distance
import cv2
import json
import sounddevice as sd
import wavio
import speech_recognition as sr
import threading
import time

path = './train'
json_file = 'faces.json'
frame_skip = 2  # Number of frames to skip for processing

# Ensure the 'train' directory exists
if not os.path.exists(path):
    os.makedirs(path)

# Load existing faces from JSON file if it exists
def load_faces():
    if os.path.exists(json_file):
        try:
            with open(json_file, 'r') as f:
                content = f.read().strip()
                if content:
                    return json.loads(content)
                else:
                    print("JSON file is empty, returning empty dictionary.")
                    return {}
        except json.JSONDecodeError:
            print("JSON file is corrupted or invalid. Returning empty dictionary.")
            return {}
    return {}

# Save faces to JSON file
def save_faces(faces):
    with open(json_file, 'w') as f:
        json.dump(faces, f)

def save_face_image(name):
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    if ret:
        cv2.imwrite(f'./train/{name}.jpg', frame)
    cap.release()

def record_audio(filename):
    fs = 44100
    seconds = 3
    print("Recording...")
    myrecording = sd.rec(int(seconds * fs), samplerate=fs, channels=2)
    sd.wait()  # Wait until recording is finished
    wavio.write(filename, myrecording, fs, sampwidth=2)
    print("Recording complete.")

def recognize_voice():
    r = sr.Recognizer()
    record_audio("temp.wav")  # Record audio to temp.wav
    with sr.AudioFile("temp.wav") as source:
        audio = r.record(source)
        try:
            name = r.recognize_google(audio)
            print(f"You said: {name}")
            return name
        except sr.UnknownValueError:
            print("Sorry, I could not understand the audio.")
            return None
        except sr.RequestError:
            print("Could not request results from Google Speech Recognition service.")
            return None

def detect_and_recognize_faces(cap, faces, id, face_descriptor):
    sp = dlib.shape_predictor('./shape_predictor_68_face_landmarks.dat')
    facerec = dlib.face_recognition_model_v1('./dlib_face_recognition_resnet_model_v1.dat')
    detector = dlib.get_frontal_face_detector()

    while True:
        ret, img = cap.read()
        if not ret:
            break

        # Resize the image to speed up processing
        img = cv2.resize(img, (640, 480))
        dets_webcam = detector(img, 1)

        if len(dets_webcam) > 0:
            for k, d in enumerate(dets_webcam):
                shape = sp(img, d)

                # Draw rectangle around the detected face
                x1 = d.left()
                y1 = d.top()
                x2 = d.right()
                y2 = d.bottom()
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)

            face_descriptor2 = facerec.compute_face_descriptor(img, shape)

            flag = True
            for i in range(len(face_descriptor)):
                a = distance.euclidean(face_descriptor[i], face_descriptor2)
                if a < 0.6:
                    print(f"Known: {id[i]}")
                    flag = False
                    break

            if flag:
                print('Unknown')
                name = recognize_voice()
                if name:
                    save_face_image(name)
                    faces[name] = f'./train/{name}.jpg'
                    id.append(name)
                    face_descriptor.append(face_descriptor2)
                    save_faces(faces)

        else:
            print("No face detected")

        # Display the webcam image
        cv2.imshow("Webcam", img)

        # Break the loop if the 'q' key is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

def mainFunc():
    print("Start Capture")
    faces = load_faces()
    id = list(faces.keys())
    face_descriptor = []

    print("All base: ", end='')
    print(id)

    # Extract descriptors from the saved photos
    sp = dlib.shape_predictor('./shape_predictor_68_face_landmarks.dat')
    facerec = dlib.face_recognition_model_v1('./dlib_face_recognition_resnet_model_v1.dat')
    detector = dlib.get_frontal_face_detector()
    imagePaths = [os.path.join(path, f) for f in os.listdir(path)]
    imagePaths.sort()

    for imagePath in imagePaths:
        img = io.imread(imagePath)
        dets = detector(img, 1)

        if dets:
            for k, d in enumerate(dets):
                shape = sp(img, d)
                descriptor = facerec.compute_face_descriptor(img, shape)
                face_descriptor.append(descriptor)
        else:
            print(f"No face detected in image: {imagePath}")

    cap = cv2.VideoCapture(0)

    # Start the detection and recognition thread
    detection_thread = threading.Thread(target=detect_and_recognize_faces, args=(cap, faces, id, face_descriptor))
    detection_thread.start()

    # Wait for the thread to finish (it won't in this case since it's an infinite loop)
    detection_thread.join()

# Start the face recognition system
mainFunc()
