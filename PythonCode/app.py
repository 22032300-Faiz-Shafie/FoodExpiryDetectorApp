from flask import Flask, request
from PIL import Image
from io import BytesIO
import base64
import uuid
app = Flask(__name__)
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

@app.route("/")
def hello_world():
    return "<p>Hello, Worlds!</p>"

#use own IP address. Run Flask by pressing the "Run Python File" on top left  -Don
if __name__ == "__main__":
    app.run(host="192.168.31.1", port=5000, debug=True) 