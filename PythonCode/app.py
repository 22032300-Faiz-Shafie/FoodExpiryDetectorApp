from flask import Flask, request
from PIL import Image
from io import BytesIO
import base64
import uuid
app = Flask(__name__)
import torch
import cv2
from IPython.display import Image, clear_output, display
import pathlib
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath



    
#adds image from camera to image folder, which is then used for computer vision -Don
@app.route('/image', methods=['POST'])

def add_Image():
    try:
        data = request.json 
        base64_image = data.get('base64') 
        decodedData = base64.b64decode((base64_image)) 
        image = Image.open(BytesIO(decodedData)) 
        image.save("images/newImage"+ str(uuid.uuid4())+".jpg", "JPEG") #the image here might not need to be stored, and instead just goes into computer vision directly -Don
        return "success"   
    except Exception as e:
        print(e)
        return "failed"

#Runs Inference -Faiz
@app.route('/predict', methods=['GET'])
def predict():
    try:
        #Don
        #model = torch.hub.load('.', 'custom', path="C:\\2024_SEM1\\FoodExpiryDetectorApp\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\best.pt", source='local')
        #imagePath = "C:\\2024_SEM1\\FoodExpiryDetectorApp\\PythonCode\\images\\SinglePineapple1.jpg"     
        model = torch.hub.load('.', 'custom', path="C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\best2.pt", source='local')
        imagePath = "C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images\\SinglePineapple1.jpg"
        image = cv2.imread(imagePath)
        image_resized = cv2.resize(image, (416, 416))
        image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
        results = model(image_rgb)
        fruit_classes = {}
        data = results.pandas().xyxy[0]

        for fruitClass in data['name']:
            fruit_classes[fruitClass] = fruit_classes.get(fruitClass, 0) + 1

        for x in fruit_classes:
            if fruit_classes.get(x) > 0:
                splitFruit_Ripeness= str(x).split("_")

                print("fruitName: "+splitFruit_Ripeness[0]+"\n"
                    "ripeness: "+splitFruit_Ripeness[1]+"\n"
                    "quantity: "+str(fruit_classes.get(x))+"\n")
            else:
                print (x+" has less than zero occurences\n")

        return "success"

    except Exception as e:
        print(e)
        return "failed"


#use own IP address. Run Flask by pressing the "Run Python File" on top left  -Don
if __name__ == "__main__":
    app.run(host="192.168.18.24", port=5000, debug=True) 
    #Don
    #app.run(host="192.168.31.1", port=5000, debug=True) 
