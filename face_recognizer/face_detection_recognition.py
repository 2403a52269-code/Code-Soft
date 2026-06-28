"""
Task 5: Face Detection and Recognition
========================================
A professional AI application that detects and recognizes faces in images or videos.

HOW IT WORKS:
  - Detection  : OpenCV Haar Cascade (no compilation needed, runs on CPU)
  - Recognition: DeepFace (pip install deepface) – uses pre-trained deep learning
                 models (ArcFace, Facenet, VGG-Face) downloaded automatically.

INSTALL (no compilation needed):
    pip install opencv-python deepface numpy

USAGE:
    python face_detection_recognition.py
    → Edit the three flags at the bottom of main() to switch modes.
"""

import cv2
import numpy as np
import os
import json
import shutil
from pathlib import Path


# ─────────────────────────────────────────────────────────────────────────────
# Optional dependency: DeepFace
# ─────────────────────────────────────────────────────────────────────────────
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False
    print("[WARNING] DeepFace not installed. Recognition is disabled.")
    print("          Run:  pip install deepface")


# ─────────────────────────────────────────────────────────────────────────────
# Configuration  (edit here to tune behaviour)
# ─────────────────────────────────────────────────────────────────────────────
CONFIG = {
    # Haar Cascade
    "haar_cascade_path": cv2.data.haarcascades + "haarcascade_frontalface_default.xml",
    "scale_factor"     : 1.1,
    "min_neighbors"    : 5,
    "min_face_size"    : (30, 30),

    # DeepFace recognition
    "model_name"         : "ArcFace",    # ArcFace | Facenet | VGG-Face | DeepID
    "distance_metric"    : "cosine",     # cosine | euclidean | euclidean_l2
    "recognition_threshold": 0.40,       # Lower = stricter (cosine distance)

    # Paths
    "known_faces_dir" : "known_faces",   # sub-folder per person, e.g. known_faces/Alice/
    "db_representations": "representations_arcface.pkl",  # auto-created by DeepFace
    "output_dir"      : "output",

    # Drawing
    "font"            : cv2.FONT_HERSHEY_SIMPLEX,
    "color_known"     : (0, 200, 100),   # green
    "color_unknown"   : (0, 80, 220),    # red-ish
    "text_color"      : (255, 255, 255),
}


# ─────────────────────────────────────────────────────────────────────────────
# Face Detector  – Haar Cascade (fast, CPU-only, no GPU/compilation needed)
# ─────────────────────────────────────────────────────────────────────────────
class FaceDetector:
    """Detect faces using OpenCV's built-in Haar Cascade classifier."""

    def __init__(self, cascade_path: str):
        if not os.path.exists(cascade_path):
            raise FileNotFoundError(f"Cascade XML not found: {cascade_path}")
        self.clf = cv2.CascadeClassifier(cascade_path)

    def detect(self, bgr_frame: np.ndarray) -> list[tuple[int, int, int, int]]:
        """Return list of (x, y, w, h) face bounding boxes."""
        gray = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        faces = self.clf.detectMultiScale(
            gray,
            scaleFactor=CONFIG["scale_factor"],
            minNeighbors=CONFIG["min_neighbors"],
            minSize=CONFIG["min_face_size"],
            flags=cv2.CASCADE_SCALE_IMAGE,
        )
        return [tuple(f) for f in faces] if len(faces) > 0 else []


# ─────────────────────────────────────────────────────────────────────────────
# Face Recognizer  – DeepFace (ArcFace / Facenet, weights auto-downloaded)
# ─────────────────────────────────────────────────────────────────────────────
class FaceRecognizer:
    """
    Recognise faces by comparing against a database of labelled images.

    Directory layout expected:
        known_faces/
            Alice/
                photo1.jpg
                photo2.jpg
            Bob/
                photo1.jpg
    """

    def __init__(self, db_path: str):
        self.db_path = db_path
        self.db_ready = os.path.isdir(db_path) and any(
            f.suffix.lower() in {".jpg", ".jpeg", ".png"}
            for f in Path(db_path).rglob("*")
        )
        if not self.db_ready:
            print(f"[INFO] No known faces found in '{db_path}'. "
                  "Recognition will label everyone 'Unknown'.")
        elif not DEEPFACE_AVAILABLE:
            print("[INFO] DeepFace unavailable; recognition disabled.")

    def recognize(self, bgr_frame: np.ndarray, boxes: list[tuple]) -> list[str]:
        """
        For each detected face box, crop it, query DeepFace, and return a name.
        Falls back to 'Unknown' on any error.
        """
        if not DEEPFACE_AVAILABLE or not self.db_ready:
            return ["Unknown"] * len(boxes)

        names = []
        for (x, y, w, h) in boxes:
            face_crop = bgr_frame[y: y + h, x: x + w]
            try:
                results = DeepFace.find(
                    img_path=face_crop,
                    db_path=self.db_path,
                    model_name=CONFIG["model_name"],
                    distance_metric=CONFIG["distance_metric"],
                    enforce_detection=False,
                    silent=True,
                )
                # results is a list of DataFrames, one per face found in crop
                if results and not results[0].empty:
                    top = results[0].iloc[0]
                    dist_col = f"{CONFIG['model_name']}_{CONFIG['distance_metric']}"
                    distance = top.get(dist_col, 1.0)
                    if distance <= CONFIG["recognition_threshold"]:
                        # Extract person name from the matched file path
                        matched_path = top.get("identity", "")
                        name = Path(matched_path).parent.name
                        names.append(name)
                    else:
                        names.append("Unknown")
                else:
                    names.append("Unknown")
            except Exception as e:
                print(f"[WARN] Recognition error: {e}")
                names.append("Unknown")

        return names


# ─────────────────────────────────────────────────────────────────────────────
# Drawing helpers
# ─────────────────────────────────────────────────────────────────────────────

def draw_detections(
    frame: np.ndarray,
    boxes: list[tuple],
    names: list[str] | None = None,
) -> np.ndarray:
    """Draw bounding boxes and name labels onto a copy of frame."""
    out = frame.copy()
    for i, (x, y, w, h) in enumerate(boxes):
        name  = names[i] if names else "Face"
        color = CONFIG["color_known"] if name != "Unknown" else CONFIG["color_unknown"]

        cv2.rectangle(out, (x, y), (x + w, y + h), color, 2)

        label = f"  {name}  "
        (tw, th), _ = cv2.getTextSize(label, CONFIG["font"], 0.6, 1)
        cv2.rectangle(out, (x, y - th - 10), (x + tw, y), color, -1)
        cv2.putText(out, label, (x, y - 5),
                    CONFIG["font"], 0.6, CONFIG["text_color"], 1, cv2.LINE_AA)

    cv2.putText(out, f"Faces: {len(boxes)}", (12, 30),
                CONFIG["font"], 0.8, (255, 255, 255), 2, cv2.LINE_AA)
    return out


# ─────────────────────────────────────────────────────────────────────────────
# Pipeline – single image
# ─────────────────────────────────────────────────────────────────────────────

def process_image(
    image_path: str,
    detector: FaceDetector,
    recognizer: FaceRecognizer,
) -> None:
    frame = cv2.imread(image_path)
    if frame is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")

    boxes = detector.detect(frame)
    print(f"[Image] {len(boxes)} face(s) detected.")

    names = recognizer.recognize(frame, boxes) if boxes else []
    result = draw_detections(frame, boxes, names or None)

    os.makedirs(CONFIG["output_dir"], exist_ok=True)
    stem    = Path(image_path).stem
    out_path = os.path.join(CONFIG["output_dir"], f"result_{stem}.jpg")
    cv2.imwrite(out_path, result)
    print(f"[Image] Saved → {out_path}")

    cv2.imshow("Result (any key to close)", result)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


# ─────────────────────────────────────────────────────────────────────────────
# Pipeline – webcam / video file
# ─────────────────────────────────────────────────────────────────────────────

def process_video(
    source: int | str,
    detector: FaceDetector,
    recognizer: FaceRecognizer,
    recognition_every_n_frames: int = 8,
) -> None:
    """
    Detect every frame; run the heavier recognition step every N frames
    to keep the stream smooth.
    """
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        raise IOError(f"Cannot open: {source}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    w   = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h   = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    os.makedirs(CONFIG["output_dir"], exist_ok=True)
    out_path = os.path.join(CONFIG["output_dir"], "result_video.mp4")
    writer   = cv2.VideoWriter(out_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))

    cached_names: list[str] = []
    frame_idx = 0
    print("[Video] Press 'q' to stop.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        boxes = detector.detect(frame)

        if frame_idx % recognition_every_n_frames == 0:
            cached_names = recognizer.recognize(frame, boxes)

        names = cached_names if len(boxes) == len(cached_names) else None
        result = draw_detections(frame, boxes, names)
        writer.write(result)

        cv2.imshow("Face Detection & Recognition  [q = quit]", result)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
        frame_idx += 1

    cap.release()
    writer.release()
    cv2.destroyAllWindows()
    print(f"[Video] Saved → {out_path}")


# ─────────────────────────────────────────────────────────────────────────────
# Synthetic demo – works with zero real media
# ─────────────────────────────────────────────────────────────────────────────

def run_demo(detector: FaceDetector) -> None:
    """Create a synthetic frame to verify drawing helpers without real images."""
    print("\n[Demo] Generating synthetic test frame...")
    frame = np.full((480, 640, 3), (25, 25, 35), dtype=np.uint8)
    cv2.ellipse(frame, (320, 240), (90, 110), 0, 0, 360, (200, 175, 155), -1)
    cv2.putText(frame, "Task 5 – Synthetic Demo", (90, 45),
                CONFIG["font"], 0.9, (180, 180, 180), 2)

    fake_boxes = [(230, 130, 180, 220)]
    fake_names = ["Demo Person"]
    result = draw_detections(frame, fake_boxes, fake_names)

    os.makedirs(CONFIG["output_dir"], exist_ok=True)
    out = os.path.join(CONFIG["output_dir"], "demo_result.jpg")
    cv2.imwrite(out, result)
    print(f"[Demo] Saved → {out}")

    cv2.imshow("Demo (any key to close)", result)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


# ─────────────────────────────────────────────────────────────────────────────
# Entry point  – edit the three flags below to switch modes
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  Task 5 – Face Detection & Recognition")
    print("=" * 60)

    detector   = FaceDetector(CONFIG["haar_cascade_path"])
    recognizer = FaceRecognizer(CONFIG["known_faces_dir"])

    # ── Set ONE of these to activate a mode ──────────────────────────────────
    IMAGE_PATH = ""       # e.g. "photo.jpg"
    VIDEO_PATH = ""       # e.g. "clip.mp4"
    USE_WEBCAM = True    # True → opens camera index 0
    # ─────────────────────────────────────────────────────────────────────────

    if IMAGE_PATH and os.path.exists(IMAGE_PATH):
        process_image(IMAGE_PATH, detector, recognizer)

    elif USE_WEBCAM:
        process_video(0, detector, recognizer)

    elif VIDEO_PATH and os.path.exists(VIDEO_PATH):
        process_video(VIDEO_PATH, detector, recognizer)

    else:
        print("[INFO] No media specified – running synthetic demo.")
        run_demo(detector)

    print(f"\n[Done] Outputs saved to: {CONFIG['output_dir']}/")


if __name__ == "__main__":
    main()
