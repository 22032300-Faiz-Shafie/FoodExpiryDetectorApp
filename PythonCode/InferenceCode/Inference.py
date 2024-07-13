#import torch
import cv2
#from IPython.display import Image, clear_output, display
import pathlib
import subprocess
import os
import shutil
import json
import re
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

#WARNING: you must run this python file under the yolov5 folder and utilize absolute path for loading any path required -Faiz

#Inference using torch api -Faiz
#Infinite while loop to make it easier to do multiple Inferences -Faiz
while True:
    #Loading the 1st model using torch, utilize absolute path to the location of the model -Faiz
    #model = torch.hub.load('.', 'custom', path="C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\best.pt", source='local')

    #Loading the 2nd model using torch, utilize absolute path to the location of the model -Faiz
    #model = torch.hub.load('.', 'custom', path="C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\best2.pt", source='local')

    #Takes input from user to run which jpg image file -Faiz
    #speecificImage = input("Enter the file name without the format: ")

    #Load the image, utilize absolute path to the location of the image which is inside customtestimages folder -Faiz
    #image_path = "C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\customtestimages\\" + speecificImage + ".jpg" # or file, Path, PIL, OpenCV, numpy, list

    #Change directory to the working directory -Faiz
    CDWorkingDirectoryCommand = "C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\"

    os.chdir(CDWorkingDirectoryCommand)
    print(f'Current working directory: {os.getcwd()}\n')

    #Added and drag and drop method which is far easier, just open the customtestimages folder and drag it to the terminal. Also made it so that you type exit, it will end progrram. -Faiz
    dragAndDropImage = input("Drag and drop image here: \n")
    if(dragAndDropImage == "exit"):
        break

    #Process image using cv2 -Faiz
    #Read image -Faiz
    image = cv2.imread(dragAndDropImage)

    #Resize image to 416x416 -Faiz
    image_resized = cv2.resize(image, (384, 512))

    #Restore colour to image -Faiz
    #image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)

    #Save preprocessed image to original image, overwriting it -Faiz
    cv2.imwrite(dragAndDropImage, image_resized)

    #Loading the lastest model using detect -Faiz
    modelCommand = "python detect.py --weights C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\best12.pt --img 512 --agnostic --conf 0.10"
    modelCommandSource = modelCommand + " --source " + dragAndDropImage
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
                # Loop through each fruit class folder in the crops directory
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
    with open('C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\InferenceCode\\fruit_class_details.json', 'w') as json_file:
        json.dump(fruit_class_names, json_file, indent=4)  

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


    
    

    #Everything below is obsolete unless switching back to using torch -Faiz
    # Inference
    #results = model(image_rgb)

    # Show results
    #results.show()

    #fruit_classes = {}
   # Results turned in pandas dataframe -Don
    #data = results.pandas().xyxy[0]

    # for fruitClass in data['name']:
    #     fruit_classes[fruitClass] = fruit_classes.get(fruitClass, 0) + 1

    # #use the values below to add to firestore -Don
    # for x in fruit_classes:
    #     if fruit_classes.get(x) > 0:
    #         splitFruit_Ripeness= str(x).split("_")

    #         print("fruitName: "+splitFruit_Ripeness[0]+"\n"
    #                 "ripeness: "+splitFruit_Ripeness[1]+"\n"
    #                 "quantity: "+str(fruit_classes.get(x))+"\n")
    #     else:
    #         print (x+" has less than zero occurences\n")
    

    #Ending the infinite while loop -Faiz
    #done = input("Are you done? (yes/no): ")
    #if(done == "yes" or done == "y" or done == "Yes" or done == "Y"):
    #    break