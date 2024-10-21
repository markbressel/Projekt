import dlib
import cv2
from scipy.spatial import distance
import threading
import time


shape_predictor_path = 'Project/FaceRecognition/shape_predictor_68_face_landmarks.dat'
face_recognition_model_path = 'Project/FaceRecognition/dlib_face_recognition_resnet_model_v1.dat'

# Initialize the shape predictor and face recognition model
sp = dlib.shape_predictor(shape_predictor_path)
facerec = dlib.face_recognition_model_v1(face_recognition_model_path)
detector = dlib.get_frontal_face_detector()

# Known faces database (empty for now)
known_ids = []
face_descriptors = []

# Global flag to manage face recognition timing
last_recognition_time = 0
recognition_interval = 2  # Minimum time between face recognitions (in seconds)

# Thread function to recognize faces
def recognize_face_thread(img, shape, face_descriptors, known_ids):
    global last_recognition_time
    face_descriptor = facerec.compute_face_descriptor(img, shape)

    for i, known_descriptor in enumerate(face_descriptors):
        dist = distance.euclidean(known_descriptor, face_descriptor)
        if dist < 0.6:
            print(f"Known: {known_ids[i]}")
            break

    last_recognition_time = time.time()

# Function to detect and recognize faces
def detect_and_recognize_faces(cap, face_descriptors, known_ids, skip_frames=5):
    global last_recognition_time
    frame_count = 0

    while True:
        ret, img = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % skip_frames != 0:
            continue

        # Resize frame to reduce computation
        img_small = cv2.resize(img, (0, 0), fx=0.5, fy=0.5)
        dets = detector(img_small, 0)

        if len(dets) > 0:
            for det in dets:
                shape = sp(img, det)

                # Scale face rectangle coordinates back to the original size
                x1 = int(det.left() * 2)   # Scale x1
                y1 = int(det.top() * 2)    # Scale y1
                x2 = int(det.right() * 2)  # Scale x2
                y2 = int(det.bottom() * 2) # Scale y2

                # Draw rectangle around the face
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)

                # Display "Face Detected" label below the rectangle
                cv2.putText(img, "Face Detected", (x1, y2 + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

                # Perform recognition only if enough time has passed since the last recognition
                current_time = time.time()
                if current_time - last_recognition_time > recognition_interval:
                    threading.Thread(target=recognize_face_thread, args=(img, shape, face_descriptors, known_ids)).start()

        else:
            # No face detected, display "Unknown"
            cv2.putText(img, "Unknown", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # Display the frame
        cv2.imshow('Webcam', img)

        # Exit if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# Main function to start the camera and detection
def main():
    # Open webcam
    cap = cv2.VideoCapture(0)

    # Set camera resolution to 1920x1080
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

    # Increase FPS limit for smoother feed
    cap.set(cv2.CAP_PROP_FPS, 240)

    # Start face detection and recognition
    detect_and_recognize_faces(cap, face_descriptors, known_ids)

if __name__ == "__main__":
    main()
