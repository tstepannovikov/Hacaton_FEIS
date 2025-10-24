from PIL import Image, ImageOps, ImageFilter
import numpy as np
from tensorflow.keras.models import load_model

model = load_model("emnist_model.h5")

def label_to_char(label):
    return chr(label + 65)

def preprocess_image(image_path):
    img = Image.open(image_path).convert("L")

    if np.mean(img) > 127:
        img = ImageOps.invert(img)

    img = img.point(lambda p: p > 128 and 255)

    return img

def segment_characters(pil_img):
    img_array = np.array(pil_img)

    from scipy.ndimage import label, find_objects

    binary = (img_array > 0).astype(np.uint8)
    labeled_array, num_features = label(binary)
    slices = find_objects(labeled_array)

    boxes = []
    for sl in slices:
        y1, y2 = sl[0].start, sl[0].stop
        x1, x2 = sl[1].start, sl[1].stop
        boxes.append((x1, y1, x2, y2))

    boxes = sorted(boxes, key=lambda b: b[0])
    return boxes

def predict_custom_array(img_array):
    img = Image.fromarray(img_array)

    img.thumbnail((20, 20), Image.Resampling.LANCZOS)

    canvas = Image.new("L", (28, 28), color=0)

    left = (28 - img.width) // 2
    top = (28 - img.height) // 2
    canvas.paste(img, (left, top))

    if np.mean(canvas) > 127:
        canvas = ImageOps.invert(canvas)

    img_array = np.array(canvas).astype("float32") / 255.0
    img_input = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_input)
    predicted_class = np.argmax(prediction)
    return label_to_char(predicted_class)

def recognize_text(image_path):
    img = preprocess_image(image_path)
    boxes = segment_characters(img)
    text = ""
    prev_x2 = None
    for x1, y1, x2, y2 in boxes:
        if prev_x2 is not None and x1 - prev_x2 > 10:
            text += " "
        char_img = img.crop((x1, y1, x2, y2))
        char_array = np.array(char_img)
        symbol = predict_custom_array(char_array)
        text += symbol
        prev_x2 = x2
    return text

print("Распознанный текст:", recognize_text("image.jpeg"))