import keras
import cv2
import numpy as np
from tensorflow.python.keras.layers import Dense
from tensorflow.keras.utils import img_to_array
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelBinarizer

image="SinglePineapple1.jpg"
image_path="PythonCode\\InferenceCode\\customtestimages\\" + image

modelPath="PythonCode\\InferenceCode\\imageClassificationModels\\PineappleModelV1.keras"
model = load_model(modelPath, custom_objects=None, compile=True, safe_mode=True)
model.compile(optimizer=model.optimizer, loss=model.loss, metrics=model.metrics, steps_per_execution=1)

# load the image
image = cv2.imread(image_path)
# pre-process the image for classification
IMAGE_DIMS = (224, 224, 3)
image = cv2.resize(image, (IMAGE_DIMS[0], IMAGE_DIMS[1]))
image = image.astype("float") / 255.0
image = img_to_array(image)
image = np.expand_dims(image, axis=0)
print(model.summary())

labels=[1,2,3,4,5,6,7]
lb = LabelBinarizer()
labels = lb.fit_transform(labels)

# classify the input image
print("[INFO] classifying image...")
proba = model.predict(image)
idx = np.argmax(proba)
label = lb.classes_[idx]

print("pineapple was bought " + str(label) +" days ago")