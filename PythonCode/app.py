from flask import Flask, request, jsonify
import PIL.Image
from io import BytesIO
import base64
import uuid
app = Flask(__name__)
#import torch
import cv2
import subprocess
import os
import shutil
import json
import re
import pathlib
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

#REQUIRE PERSONALIZED CHANGE. Location of hubconf needed for first AI Model, utilize your own absolute path -Faiz
hubconfLocation = "C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\InferenceCode\\yolov5"

#REQUIRE PERSONALIZED CHANGE. Location of your own image folder, utilize your own absolute path -Faiz
imageFilePath = "C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images"

#Variable that holds the path of the image folder, keeps track of the image that's saved and infered upon -Faiz
storedImageFilePath = imageFilePath + "\\newImage" + str(uuid.uuid4())+".jpg"
#testImageFilePath = "C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\InferenceCode\\customtestimages\\Media.jpg"
storedImageFilePath = imageFilePath + "\\newImage" + ".jpg"     

#adds image from camera to image folder, which is then used for computer vision -Don
@app.route('/image', methods=['POST'])

def add_Image():
    try:
        data = request.json 
        base64_image = data.get('base64') 
        decodedData = base64.b64decode((base64_image)) 
        image = PIL.Image.open(BytesIO(decodedData)) 
        image.save(storedImageFilePath, "JPEG") #the image here might not need to be stored, and instead just goes into computer vision directly -Don
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
        #model = torch.hub.load(hubconfLocation, 'custom', path="C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\best2.pt", source='local')

        #Change directory to the working directory -Faiz
        CDWorkingDirectoryCommand = "C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\"

        os.chdir(CDWorkingDirectoryCommand)
        print(f'Current working directory: {os.getcwd()}\n')

        image = cv2.imread(storedImageFilePath)
        image_rotate = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
        image_resized = cv2.resize(image_rotate, (384, 512))
        newProcessedImageLocation = "C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images\\processedImage.jpg"

        #Save preprocessed image to original image, overwriting it -Faiz
        cv2.imwrite(newProcessedImageLocation, image_resized)
        
        #Loading the lastest model using detect -Faiz
        modelCommand = "python detect.py --weights C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\best12.pt --img 512 --agnostic --conf 0.10"
        modelCommandSource = modelCommand + " --source " + newProcessedImageLocation
        modelCommandProject = modelCommandSource + " --project C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\AIResultImages --save-crop --save-txt"

        commandResult2 = subprocess.run(modelCommandProject, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        if commandResult2.returncode == 0:
            print("\nCommand executed successfully!\n")
        else:
            print("\nError in running command:\n")
            print(commandResult2.stderr)


        #Extract classes from result -Faiz
        imageResultsFolderPath = "C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\AIResultImages"

        def expiryDayFinder(fruitClass):
            fruitClassSplitted = fruitClass.split('_')
            fruit_name = fruitClassSplitted[0]
            currentRipenessDay = int(fruitClassSplitted[1])
            expiryInDays = 0
            currentRipenessStatus = ""


            if(fruit_name == "Mango"):
                if(currentRipenessDay < 8):
                    currentRipenessStatus = "Underripe"
                    expiryInDays = 8 - currentRipenessDay

                elif(currentRipenessDay >= 8 and currentRipenessDay < 16):
                    currentRipenessStatus = "Ripe"
                    expiryInDays = 8 - currentRipenessDay

                else:
                    currentRipenessStatus = "Overripe"
                    expiryInDays = 0

            elif(fruit_name == "Pineapple"):
                if(currentRipenessDay < 6):
                    currentRipenessStatus = "Underripe"
                    expiryInDays = 6 - currentRipenessDay

                elif(currentRipenessDay >= 6 and currentRipenessDay < 13):
                    currentRipenessStatus = "Ripe"
                    expiryInDays = 13 - currentRipenessDay

                else:
                    currentRipenessStatus = "Overripe"
                    expiryInDays = 0

            return expiryInDays, currentRipenessStatus

        #List containing all different listing results -Faiz
        fruit_class_names = []
    
        # Loop through the highest folder which is the exp folder -Faiz
        for exp_folder in os.listdir(imageResultsFolderPath):

            # Full path of each exp folder -Faiz
            exp_folder_path = os.path.join(imageResultsFolderPath, exp_folder)

            # Check and ensure if it's a directory to prevent any bugs -Faiz
            if os.path.isdir(exp_folder_path):
                # Path to the crops directory inside the experiment folder -Faiz
                crops_folder_path = os.path.join(exp_folder_path, 'crops')
                # Check and ensure if the crops folder exists in case the ai fails to detect -Faiz
                if os.path.exists(crops_folder_path) and os.path.isdir(crops_folder_path):
                    # Loop through each fruit class folder in the crops directory -Faiz
                    for fruit_class in os.listdir(crops_folder_path):

                        #Variables needed to store various information regarding the results -Faiz
                        fruit_quantity = 0
                        fruit_name = ""
                        expiryInDays = 0
                        currentRipenessStatus = ""

                        # Full path of the fruit class folder
                        fruit_class_path = os.path.join(crops_folder_path, fruit_class)
                        # Check if it's a directory -Faiz
                        if os.path.isdir(fruit_class_path):
                            # Add the fruit class name to the list -Faiz
                            for images in os.listdir(fruit_class_path):
                                fruit_quantity = fruit_quantity + 1

                            fruit_name = re.sub(r'_\d+', '', fruit_class)

                            expiryInDays, currentRipenessStatus = expiryDayFinder(fruit_class)

                            class_info = {
                                    "name": fruit_name,
                                    "class": fruit_class,
                                    "quantity": fruit_quantity,
                                    "expiryInDays": expiryInDays,
                                    "currentRipenessStatus": currentRipenessStatus
                                    }
                            fruit_class_names.append(class_info)
    
        print(fruit_class_names)

        # Saving the results to a JSON file -Faiz
        # with open('C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\InferenceCode\\fruit_class_details.json', 'w') as json_file:
        #     json.dump(fruit_class_names, json_file, indent=4)  

        #Delete all results after utilizing AI Model -Faiz
        for exp_folder in os.listdir(imageResultsFolderPath):
            exp_folder_path = os.path.join(imageResultsFolderPath, exp_folder)
            # Check if it's a directory that exists -Faiz
            if os.path.isdir(exp_folder_path):
                try:
                    # Remove the folder and sub folder contents -Faiz
                    shutil.rmtree(exp_folder_path)
                    print(f"\nDeleted {exp_folder_path}\n")
                except Exception as e:
                    print(f"\nFailed to delete {exp_folder_path}: {e}\n")

        #Remove unneeded files -Faiz
        if os.path.isfile("C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images\\newImage.jpg"):
            os.remove("C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images\\newImage.jpg")
            print("newImage removed")

        #Remove unneeded files -Faiz
        if os.path.isfile("C:\\Users\\22032300\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\PythonCode\\images\\processedImage.jpg"):
            os.remove("C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images\\processedImage.jpg")
            print("processedImage removed")

        #Everything below obsolete unless switching back to torch -Faiz
        #image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
        #results = model(image_rgb)
        #fruit_classes = {}
        # data = results.pandas().xyxy[0]

        # for fruitClass in data['name']:
        #     fruit_classes[fruitClass] = fruit_classes.get(fruitClass, 0) + 1

        # for x in fruit_classes:
        #     if fruit_classes.get(x) > 0:
        #         splitFruit_Ripeness= str(x).split("_")

        #         print("fruitName: "+splitFruit_Ripeness[0]+"\n"
        #             "ripeness: "+splitFruit_Ripeness[1]+"\n"
        #             "quantity: "+str(fruit_classes.get(x))+"\n")
        #     else:
        #         print (x+" has less than zero occurences\n")

        return jsonify(fruit_class_names)

    except Exception as e:
        print(e)
        return "failed"


#use own IP address. Run Flask by pressing the "Run Python File" on top left  -Don
if __name__ == "__main__":
    app.run(host="192.168.18.24", port=5000, debug=True) 
    #Don
    #app.run(host="192.168.31.1", port=5000, debug=True) 
