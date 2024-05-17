from flask import Flask, request
from PIL import Image
from io import BytesIO
import base64
import uuid
app = Flask(__name__)
#adds image from camera to image folder. needs to add more error handling
@app.route('/image', methods=['POST'])

def add_Image():
    try:
        data = request.json 
        base64_image = data.get('base64') #gets the base64 from the JSON
        decodedData = base64.b64decode((base64_image)) #gets binarydata
        image = Image.open(BytesIO(decodedData)) #creates PIL image
        #uses image to save the decodedData as jpg, and jnto image directory. If possible find better way to make pictures have different names other than uuid 
        image.save("images/newImage"+ str(uuid.uuid4())+".jpg", "JPEG") 
        return "success"


        
    except Exception as e:
        print(e)
        return "failed"

@app.route("/")
def hello_world():
    return "<p>Hello, Worlds!</p>"

if __name__ == "__main__":
    app.run(host='192.168.31.1', port=3000, debug=True) #use own IP
