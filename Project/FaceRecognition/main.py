import dlib
import os
from skimage import io
from scipy.spatial import distance
import cv2
import json
import sounddevice as sd
import wavio
import speech_recognition as sr

path = './train'
json_file = 'faces.json'

# Ensure the 'train' directory exists
if not os.path.exists(path):
    os.makedirs(path)


# Load existing faces from JSON file if it exists
def load_faces():
    if os.path.exists(json_file):
        try:
            with open(json_file, 'r') as f:
                content = f.read().strip()
                if content:  # Check if the content is not empty
                    return json.loads(content)  # Load JSON if valid
                else:
                    print("JSON file is empty, returning empty dictionary.")
                    return {}  # Return an empty dictionary
        except json.JSONDecodeError:
            print("JSON file is corrupted or invalid. Returning empty dictionary.")
            return {}  # Return an empty dictionary on error
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
    fs = 44100  # Sample rate
    seconds = 3  # Duration of recording
    print("Recording...")
    myrecording = sd.rec(int(seconds * fs), samplerate=fs, channels=2)
    sd.wait()  # Wait until recording is finished
    wavio.write(filename, myrecording, fs, sampwidth=2)  # Save as WAV file
    print("Recording complete.")


def recognize_voice():
    r = sr.Recognizer()
    record_audio("temp.wav")  # Record audio to temp.wav
    with sr.AudioFile("temp.wav") as source:
        audio = r.record(source)  # Read the entire audio file
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


def mainFunc():
    print("Start Capture")
    faces = load_faces()  # Load existing faces
    id = list(faces.keys())
    face_descriptor = []

    print("All base: ", end='')
    print(id)

    sp = dlib.shape_predictor('./shape_predictor_68_face_landmarks.dat')
    facerec = dlib.face_recognition_model_v1('./dlib_face_recognition_resnet_model_v1.dat')  # Load the trained models

    # Extract descriptors from the saved photos
    detector = dlib.get_frontal_face_detector()
    imagePaths = [os.path.join(path, f) for f in os.listdir(path)]
    imagePaths.sort()

    for imagePath in imagePaths:
        img = io.imread(imagePath)
        dets = detector(img, 1)

        for k, d in enumerate(dets):
            shape = sp(img, d)

        descriptor = facerec.compute_face_descriptor(img, shape)
        face_descriptor.append(descriptor)

    cap = cv2.VideoCapture(0)  # Turn on webcam with OpenCV

    while True:
        ret, img = cap.read()  # We take the image from the webcam
        dets_webcam = detector(img, 1)

        if len(dets_webcam) > 0:  # Check if any faces are detected
            for k, d in enumerate(dets_webcam):
                shape = sp(img, d)

                # Draw rectangle around the detected face
                x1 = d.left()
                y1 = d.top()
                x2 = d.right()
                y2 = d.bottom()
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)  # Draw rectangle around face

            face_descriptor2 = facerec.compute_face_descriptor(img, shape)

            flag = True
            for i in range(len(face_descriptor)):
                a = distance.euclidean(face_descriptor[i], face_descriptor2)
                if a < 0.6:  # If recognized
                    print(f"Known: {id[i]}")
                    flag = False
                    break  # Break after finding the first match

            if flag:  # If unknown
                print('Unknown')
                name = recognize_voice()  # Use voice recognition to get the name
                if name:
                    save_face_image(name)
                    faces[name] = f'./train/{name}.jpg'  # Save the new face image path
                    id.append(name)  # Add new name to the list
                    face_descriptor.append(face_descriptor2)  # Save the face descriptor
                    save_faces(faces)  # Save faces to JSON file

        else:
            print("No face detected")

        # Display the webcam image
        cv2.imshow("Webcam", img)  # Show the image with the detected face

        # Break the loop if the 'q' key is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


# Start the face recognition system
mainFunc()
