#import torch
import cv2
#from IPython.display import Image, clear_output, display
import pathlib
import subprocess
import os
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
    print(f'Current working directory: {os.getcwd()}')

    #Added and drag and drop method which is far easier, just open the customtestimages folder and drag it to the terminal. Also made it so that you type exit, it will end progrram. -Faiz
    dragAndDropImage = input("Drag and drop image here: ")
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

    #Loading the lastest model using detect 
    modelCommand = "python detect.py --weights C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\\PythonCode\\InferenceCode\\yolov5\\runs\\train\\yolov5s_results\\weights\\best12.pt --img 512 --agnostic --conf 0.10 --source /content/drive/MyDrive/SDAAI/Data/FruitFolder/testimages/download.jpg --project /content/drive/MyDrive/SDAAI/Data/FruitFolder/ --save-crop --save-txt"
    modelCommandSource = modelCommand + " --source " + dragAndDropImage
    modelCommandProject = modelCommandSource + " --project C:\\Users\\22032300\\Documents\\FoodExpiryDetectorApp\\FoodExpiryDetectorApp\\PythonCode\\images --save-crop --save-txt"

    commandResult2 = subprocess.run(modelCommandProject, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    if commandResult2.returncode == 0:
        print("Command executed successfully!")
    else:
        print("Error in running command:")
        print(commandResult2.stderr)

    #Extract classes from result
    

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