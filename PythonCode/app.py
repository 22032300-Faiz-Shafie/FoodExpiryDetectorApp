from flask import Flask, request, jsonify
import PIL.Image
from io import BytesIO
import base64
#import uuid
app = Flask(__name__)
#import torch
import cv2
import subprocess
import os
import shutil
#import json
import re
import pathlib
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

#REQUIRE PERSONALIZED CHANGE. Location of hubconf needed for first AI Model, utilize your own absolute path -Faiz
hubconfLocation = "C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\InferenceCode\\yolov5"

#REQUIRE PERSONALIZED CHANGE. Location of your own image folder, utilize your own absolute path -Faiz
imageFilePath = "C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images"

#Variable that holds the path of the image folder, keeps track of the image that's saved and infered upon -Faiz
#storedImageFilePath = imageFilePath + "\\newImage" + str(uuid.uuid4())+".jpg"
#testImageFilePath = "C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\InferenceCode\\customtestimages\\Media3.jpg"
storedImageFilePath = imageFilePath + "\\newImage" + ".jpg"     

#Obsolete, combined with handleInference function for better performance -Faiz
#adds image from camera to image folder, which is then used for computer vision -Don
# @app.route('/image', methods=['POST'])
# def add_Image():
#     try:
#         data = request.json 
#         base64_image = data.get('base64') 
#         decodedData = base64.b64decode((base64_image)) 
#         image = PIL.Image.open(BytesIO(decodedData)) 
#         image.save(storedImageFilePath, "JPEG") #the image here might not need to be stored, and instead just goes into computer vision directly -Don
#         return "success"   
#     except Exception as e:
#         print(e)
#         return "failed"

#Runs Inference -Faiz
@app.route('/predict', methods=['POST'])
def predict():
    try:
        #Don
        #model = torch.hub.load('.', 'custom', path="C:\\2024_SEM1\\FoodExpiryDetectorApp\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\best.pt", source='local')
        #imagePath = "C:\\2024_SEM1\\FoodExpiryDetectorApp\\PythonCode\\images\\SinglePineapple1.jpg"     
        #model = torch.hub.load(hubconfLocation, 'custom', path="C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\best2.pt", source='local')

        data = request.json 
        base64_image = data.get('base64') 
        decodedData = base64.b64decode((base64_image)) 
        image = PIL.Image.open(BytesIO(decodedData)) 
        image.save(storedImageFilePath, "JPEG") #the image here might not need to be stored, and instead just goes into computer vision directly -Don

        #REQUIRE PERSONALIZED CHANGE. Change directory to the working directory. This is because the files and folders required to run the AI model are located in yolov5 repo folder. -Faiz
        CDWorkingDirectoryCommand = "C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\InferenceCode\\yolov5\\"

        os.chdir(CDWorkingDirectoryCommand)
        print(f'Current working directory: {os.getcwd()}\n')

        #Image preprocessing for AI Model. AI Model can't accept non-preprocessed Images -Faiz
        image = cv2.imread(storedImageFilePath)

        #Obsolete. Rotation and Resizing not needed as AI Model works best with 9:16 aspect ratio images. Resizing would change the aspect ratio -Faiz
        #image_rotate = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
        #image_resized = cv2.resize(image_rotate, (768, 1024))

        #Location of the processed image to be used by AI Model -Faiz
        newProcessedImageLocation = "C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images\\processedImage.jpg"

        #Save preprocessed image to the location specified -Faiz
        cv2.imwrite(newProcessedImageLocation, image)
        
        #Loading the lastest model using detect.py, utilizing the model using subprocess module so that it can run the AI model command -Faiz
        modelCommand = "python detect.py --weights C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\FruitRipenessDetector620.pt --agnostic --conf 0.10"
        modelCommandSource = modelCommand + " --source " + newProcessedImageLocation
        modelCommandProject = modelCommandSource + " --project C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\AIResultImages --save-crop --save-txt"
        
        #The actual running of the command after everything is specified including location of processed image and the location of the results folder -Faiz
        commandResult2 = subprocess.run(modelCommandProject, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        if commandResult2.returncode == 0:  
            print("\nFirst AI Model Command executed successfully!\n")
        else:
            print("\nError in running First AI Model command:\n")
            print(commandResult2.stderr)


        #Extract classes from result -Faiz
        imageResultsFolderPath = "C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\AIResultImages"

        #This is a function to find expiry days and ripeness day by taking the result folder's name and using the class day to calculate further the expiry days and ripeness day -Faiz
        def expiryDayFinder(fruitClass):
            fruitClassSplitted = fruitClass.split('_')
            fruit_name = fruitClassSplitted[0]
            currentRipenessDay = int(fruitClassSplitted[1])
            expiryInDays = 0
            ripenessInDays = 0
            currentRipenessStatus = ""


            if(fruit_name == "Mango"):
                if(currentRipenessDay < 8):
                    currentRipenessStatus = "Underripe"
                    ripenessInDays = 8 - currentRipenessDay
                    expiryInDays = 16 - currentRipenessDay
                elif(currentRipenessDay >= 8 and currentRipenessDay < 16):
                    currentRipenessStatus = "Ripe"
                    ripenessInDays = 0 
                    expiryInDays = 16 - currentRipenessDay
                else:
                    currentRipenessStatus = "Overripe"
                    ripenessInDays = 0
                    expiryInDays = 0
            elif(fruit_name == "Pineapple"):
                if(currentRipenessDay < 6):
                    currentRipenessStatus = "Underripe"
                    ripenessInDays = 6 - currentRipenessDay
                    expiryInDays = 13 - currentRipenessDay
                elif(currentRipenessDay >= 6 and currentRipenessDay < 13):
                    currentRipenessStatus = "Ripe"
                    ripenessInDays = 0
                    expiryInDays = 13 - currentRipenessDay
                else:
                    currentRipenessStatus = "Overripe"
                    ripenessInDays = 0
                    expiryInDays = 0
            elif(fruit_name == "Avocado"):
                if(currentRipenessDay < 5):
                    currentRipenessStatus = "Underripe"
                    ripenessInDays = 5 - currentRipenessDay
                    expiryInDays = 8 - currentRipenessDay
                elif(currentRipenessDay >= 5 and currentRipenessDay < 8):
                    currentRipenessStatus = "Ripe"
                    ripenessInDays = 0
                    expiryInDays = 8 - currentRipenessDay
                else:
                    currentRipenessStatus = "Overripe"
                    ripenessInDays = 0
                    expiryInDays = 0


            return expiryInDays, currentRipenessStatus, ripenessInDays

        #Function to find family of Mango. This will only run if the fruit name is Mango, ensuring that only mango will use the second AI Model. The code here is very similar to the code in the First AI Model. -Faiz
        def mangoFamilyFinder(mangoImage):

            fruitFamily = ""

            aiModel2Command = "python detect.py --weights C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\mangoFruitFamilyDetector2.pt --agnostic --conf 0.50"
            aiModel2CommandSource = aiModel2Command + " --source " + mangoImage
            aiModel2Project = aiModel2CommandSource + " --project C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\FruitFamilyResults --save-crop --save-txt"
            commandResult3 = subprocess.run(aiModel2Project, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            if commandResult3.returncode == 0:
                print("\nSecond AI Model Command executed successfully!\n")
            else:
                print("\nError in running Second AI Model command:\n")
                print(commandResult2.stderr)
            
            secondModelImageResults = "C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\FruitFamilyResults"
            
            for exp_folder in os.listdir(secondModelImageResults):
                exp_folder_path = os.path.join(secondModelImageResults, exp_folder)

                if os.path.isdir(exp_folder_path):
                    crops_folder_path = os.path.join(exp_folder_path, 'crops')

                    if os.path.exists(crops_folder_path) and os.path.isdir(crops_folder_path):
                        for fruit_Family in os.listdir(crops_folder_path):

                            fruitFamily = ""

                            # Full path of the fruit class folder -Faiz
                            fruit_family_path = os.path.join(crops_folder_path, fruit_Family)

                            if os.path.isdir(fruit_family_path):
                                fruitFamily = re.sub(r'_', ' ', fruit_Family)



            return fruitFamily


        #List containing all different listing results -Faiz
        fruitInformation = []

        #Code below are a set of code designed to extract the results of the AI model which comes in the form of folders. I extracted the results and put them into an array before sending it back to the React Native Application -Faiz
        # Loop through the highest folder in the folder structure which is the exp folder -Faiz
        for exp_folder in os.listdir(imageResultsFolderPath):

            # Full path of each exp folder -Faiz
            exp_folder_path = os.path.join(imageResultsFolderPath, exp_folder)

            # Check and ensure if it's a directory to prevent any bugs -Faiz
            if os.path.isdir(exp_folder_path):
                # Path to the crops directory inside the exp folder -Faiz
                crops_folder_path = os.path.join(exp_folder_path, 'crops')
                # Check and ensure if the crops folder exists in case the ai fails to detect because the crops folder won't exist if the AI fails to detect -Faiz
                if os.path.exists(crops_folder_path) and os.path.isdir(crops_folder_path):
                    # Loop through each fruit class folder in the crops directory -Faiz
                    for fruit_class in os.listdir(crops_folder_path):

                        #Variables needed to store various information regarding the results -Faiz
                        #Number of fruits -Faiz
                        fruit_quantity = 0

                        #Name of the fruit -Faiz
                        fruit_name = ""

                        #How many days till it overripes -Faiz
                        expiryInDays = 0

                        #How many days till it ripens -Faiz
                        ripenessInDays = 0

                        #Current status of the ripeness -Faiz
                        currentRipenessStatus = ""

                        #Image URI -Faiz
                        data_uri = ""

                        # Full path of the fruit class folder -Faiz
                        fruit_class_path = os.path.join(crops_folder_path, fruit_class)
                        # Check if it's a directory -Faiz
                        if os.path.isdir(fruit_class_path):
                            fruit_name = re.sub(r'_\d+', '', fruit_class)

                            # Add the fruit class name to the list -Faiz
                            for Images in os.listdir(fruit_class_path):
                                fruitFamily = ""

                                #Counting the quantity of fruits there are by counting the amount of images of a single fruit class -Faiz
                                fruit_quantity = fruit_quantity + 1

                                #Converting image into uri -Faiz
                                fruitImagePath = fruit_class_path + "\\" + Images
                                fruitImage = PIL.Image.open(fruitImagePath)

                                buffered = BytesIO()
                                fruitImage.save(buffered, format="JPEG")
                                fruitImage_data = buffered.getvalue()

                                base64_encoded = base64.b64encode(fruitImage_data).decode('utf-8')

                                data_uri = f'data:image/jpeg;base64,{base64_encoded}'

                                #Conditional statement, if the fruit is a mango run the second ai model -Faiz
                                if(fruit_name == "Mango"):
                                    fruitFamily = mangoFamilyFinder(fruitImagePath)

                            #Fill the variables listed using the expiryDayFinder function -Faiz
                            expiryInDays, currentRipenessStatus, ripenessInDays = expiryDayFinder(fruit_class)
                            #This is a fruit object. It has all the fields that a fruit listing would need -Faiz
                            class_info = {
                                    "name": fruit_name,
                                    "class": fruit_class,
                                    "quantity": fruit_quantity,
                                    "expiryInDays": expiryInDays,
                                    "currentRipenessStatus": currentRipenessStatus,
                                    "fruitDateURI": data_uri,
                                    "ripenessInDays": ripenessInDays,
                                    "fruitFamily": fruitFamily 
                                    }
                            fruitInformation.append(class_info)
    
        print(fruitInformation)

        #Obsolete. Currently existing as a troubleshooting function. Instead of saving and creating a JSON file, the information is instead sent back directly to the React Native as JSON file in one go -Faiz
        # Saving the results to a JSON file -Faiz
        # with open('C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\InferenceCode\\fruit_class_details.json', 'w') as json_file:
        #     json.dump(fruitInformation, json_file, indent=4)  

        #A variable that holds the location of the second AI model results. This is used later to help delete the contents inside after a prediction has been made -Faiz
        secondModelImageResults = "C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\FruitFamilyResults"

        #Delete all results from the first AI Model after utilizing first AI Model -Faiz
        #loop through the exp folders - Faiz
        for exp_folder in os.listdir(imageResultsFolderPath):
            #get the full directory of the specific exp folder -Faiz
            exp_folder_path = os.path.join(imageResultsFolderPath, exp_folder)
            # Check if it's a directory that exists -Faiz
            if os.path.isdir(exp_folder_path):
                try:
                    # Remove the folder and sub folder contents -Faiz
                    shutil.rmtree(exp_folder_path)
                    print(f"\nDeleted {exp_folder_path}\n")
                except Exception as e:
                    print(f"\nFailed to delete {exp_folder_path}: {e}\n")
        #Delete all results from the second AI Model after utilizing second AI Model -Faiz
        #loop through the exp folders - Faiz
        for exp_folder in os.listdir(secondModelImageResults):
            #get the full directory of the specific exp folder -Faiz
            exp_folder_path = os.path.join(secondModelImageResults, exp_folder)
            # Check if it's a directory that exists -Faiz
            if os.path.isdir(exp_folder_path):
                try:
                    # Remove the folder and sub folder contents -Faiz
                    shutil.rmtree(exp_folder_path)
                    print(f"\nDeleted {exp_folder_path}\n")
                except Exception as e:
                    print(f"\nFailed to delete {exp_folder_path}: {e}\n")

        #Remove unneeded images -Faiz
        if os.path.isfile("C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images\\newImage.jpg"):
            os.remove("C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images\\newImage.jpg")
            print("newImage removed")

        #Remove unneeded images -Faiz
        if os.path.isfile("C:\\Users\\placeholder\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\PythonCode\\images\\processedImage.jpg"):
            os.remove("C:\\Users\\placeholder\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images\\processedImage.jpg")
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

        #Return a json of the fruit information, that was created based on the AI result, back to the React Native application -Faiz
        return jsonify(fruitInformation)

    except Exception as e:
        print(e)
        return "failed"


#use own IP address. Run Flask by pressing the "Run Python File" on top left  -Don
if __name__ == "__main__":
    #Faiz home ip address
    app.run(host="192.168.18.24", port=5000, debug=True) 
    #Faiz school ip address
    #app.run(host="10.175.21.102", port=5000, debug=True) 
    #Faiz hotspot ip address
    #app.run(host="192.168.65.224", port=5000, debug=True) 
    #Don
    #app.run(host="192.168.31.1", port=5000, debug=True) 
