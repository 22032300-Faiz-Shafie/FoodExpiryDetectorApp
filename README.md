# Fruit Expiry Detector

## About
This is a React Native mobile application developed by three Republic Polytechnic students as their Final Year Project.
This **React Native** app leverages **artificial intelligence** and **computer vision** technology to help users track and manage their fruits' ripeness and date of expiration.  
The application uses a **YOLOv5** computer vision model trained to assess the ripeness of **mangoes, pineapples, and avocados**, providing specific day estimates of the fruit's expiry date. After scanning a fruit, users can **verify, modify, or discard** the AI's assessment.  

Once confirmed, the fruit's details—including its **name, estimated days until ripeness/overripeness, estimated date until ripeness/overripeness, and image**—are saved to a **tracking list**.  
The **tracking list** features **list management capabilities**, allowing users to **view, edit, and delete** fruit entries as needed, ensuring they can effectively monitor their fruits' freshness over time. To enhance user engagement, the app includes **gamification features** that reward users with **points** for managing their fruit items and **badges** for completing various tasks. These points can be redeemed in a **mock rewards store**.
  
The application uses **Firebase** as its backend database for list data, **Python** for computer vision processing, and **Flask** to establish communication between the frontend and backend components.  

## Images
![image](https://github.com/user-attachments/assets/3fdfea56-a261-4528-b3c1-4c3b04ca1bb7)

## Test and download the model
https://universe.roboflow.com/fypproject-mzn8i/fruitexpirydetector

## Built With

* [![React Native][ReactNative.js]][ReactNative-url]
* [![Python][Python.org]][Python-url]
* [![Flask][Flask.pallets]][Flask-url]
* [![Firebase][Firebase.google]][Firebase-url]
* [![YOLOv5][YOLOv5.github]][YOLOv5-url]

### Frontend

- **React Native**: For building the mobile application’s user interface

### Backend

- **Python**: Handles processing for computer vision
- **Flask**: Communicates communication between the frontend and backend.
- **YOLOv5**: An object detection model tailored to analyze and estimate fruit ripeness.

### Database

- **Firebase**: Provides a scalable and secure cloud database to store data.

## How It Works

1. **Image Capture**: Users upload or take a photo of the fruit using the mobile application.
2. **Model Processing**: The image is sent to the backend, where the YOLOv5 model analyzes the ripeness. Communication between frontend and backend is done through Flask
3. **Result Display**: The application displays the fruit's current ripeness status and estimates days until the next stage.
4. **User Input**: users can either confirm, delete or edit The outputted result. If confirmed, The fruit and it's details get transferred to a tracking list.

## Installation and Setup
Check out the Installation guide word document for the installation guide



[ReactNative.js]: https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[ReactNative-url]: https://reactnative.dev/
[Python.org]: https://img.shields.io/badge/Python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54
[Python-url]: https://www.python.org/
[Flask.pallets]: https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/
[Firebase.google]: https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white
[Firebase-url]: https://firebase.google.com/
[YOLOv5.github]: https://img.shields.io/badge/YOLOv5-0769AD?style=for-the-badge&logo=github&logoColor=white
[YOLOv5-url]: https://github.com/ultralytics/yolov5

