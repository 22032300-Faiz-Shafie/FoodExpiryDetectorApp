from flask import Flask, request
from PIL import Image
from io import BytesIO
import base64
import uuid
app = Flask(__name__)

#This section probably not the best idea, probably should use JSON instead to put data into firestore
#later edit in your own expiry days for your fruits -Don
# fruit_expiry_days = {
#     "Mango_Overripe": 1,
#     "Mango_Ripe": 5,
#     "Mango_Unripe": 8,
#     "Pineapple_Overripe": 1,
#     "Pineapple_Ripe": 1,
#     "Pineapple_Unripe": 1,
#     "Apple_Overripe": 1,
#     "Apple_Ripe": 1,
#     "Apple_Unripe": 1
   
# }
# results ="9 Apple_Unripe"
# def ExtractFruit_Class(results):
#  for fruit_class in fruit_expiry_days:

#      if fruit_class in results:
#       splitFruit_Ripeness= str(fruit_class).split("_")
#       data = {"foodName": splitFruit_Ripeness[0], "ripeness": splitFruit_Ripeness[1]}
#       print(splitFruit_Ripeness[0]+splitFruit_Ripeness[1])
    
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



#use own IP address. Run Flask by pressing the "Run Python File" on top left  -Don
if __name__ == "__main__":
    app.run(host="192.168.31.1", port=5000, debug=True) 
