import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { collection, addDoc, doc } from 'firebase/firestore';
import { PaperProvider, Button, TextInput } from 'react-native-paper';
import DropDown from "react-native-paper-dropdown";
import { Camera, CameraType } from 'expo-camera';

import {db} from "../firebaseConfig"




const AddFoodScreen = () => {
  const [foodName, setFoodName] = useState(""); 
  const [quantity, setQuantity] = useState(""); 
  const [expiryDate, setExpiryDate] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [category, setCategory] = useState(""); 
  
  //To hide or show dropdown -Faiz
  const [showDropDown, setShowDropDown] = useState(false);
  //List for the category. Want more categories? Add here -Faiz
  const categoryList = [
    {
      label: 'Beverages',
      value: 'Beverages',
    },
    {
      label: 'Snack',
      value: 'Snack',
    },
    {
      label: 'Dairy',
      value: 'Dairy',
    },
    {
      label: 'Meat',
      value: 'Meat',
    },
    {
      label: 'Canned Food',
      value: 'Canned Food',
    },
    {
      label: 'Frozen Food',
      value: 'Frozen Food',
    },
    {
      label: 'Condiments',
      value: 'Condiments',
    },
  ]

  //Camera Stuff -Faiz
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  //Toggle Camera Visibility -Faiz
  const toggleCamera = () => {
    setCameraVisible(!cameraVisible);
  };

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    hideDatePicker();
    setExpiryDate(date)
    console.log(expiryDate)
    console.log(date)
  };
  
    
  const handleAddFood = async () => {
    try {
      // Create a new document object
      const foodData = {
        foodName: foodName,
        quantity: quantity,
        expiryDate: expiryDate,
        category: category
      };
  
      const docRef = await addDoc(collection(db, 'foodCollection'), foodData);
      console.log('Document written with ID: ', docRef.id);

      setFoodName("");
      setQuantity("");
      setExpiryDate("");
      setCategory("");
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }; 

    


  //Below are displayed when permissions are not granted -Faiz
  if (!permission) {
    // Camera permissions are still loading -Faiz
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet -Faiz
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button mode="contained-tonal" buttonColor="green" onPress={requestPermission}>Grant Permission</Button>
      </View>
    );
  }

  //Changes Camera type, whether it's the front camera or back camera -Faiz
  function toggleCameraType() {
    setCameraType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  return (
    <PaperProvider>
      <ScrollView style={{backgroundColor: "lightgreen"}}>
        <View style={{flex: 1, justifyContent: "flex-start"}}>
        {/* Below will display either an empty view or the camera preview based on cameraVisible variable -Faiz*/}
        {cameraVisible ? (          
          <Camera style={styles.camera} type={cameraType}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
            </View>
          </Camera>) : (<View></View>)}
          
          {/* This button will show camera preview on press. In the future it could navigate to a new Camera screen perhaps -Faiz*/}
          <View style={styles.buttonC}>
            <Button icon="camera" mode="contained-tonal" buttonColor="green" onPress={toggleCamera}>Scan Image</Button>
          </View>

          <TextInput
            style={styles.input2}
            value={foodName}
            onChangeText={setFoodName}
            label="Enter Food Name"
            mode='flat'
          />

          <TextInput
            style={styles.input2}
            value={quantity}
            onChangeText={setQuantity}
            label="Enter Quantity"
            keyboardType="number-pad"
          />
          
          <SafeAreaView style={styles.input2}>
            <DropDown dropDownContainerHeight={300} label={'Category'} mode='flat' visible={showDropDown} showDropDown={() => setShowDropDown(true)} onDismiss={() => setShowDropDown(false)} value={category} setValue={setCategory} list={categoryList} dropDownStyle={styles.dropDownStyle}/>
          </SafeAreaView>

          <View style={styles.buttonC}>
            <Button mode="contained-tonal" buttonColor="green" onPress={showDatePicker}>Choose Expiry date</Button>
          </View>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            value={expiryDate}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />

          <View style={styles.submitButton}>
            <Button icon="upload" mode="contained-tonal" buttonColor="green" onPress={handleAddFood}>Add</Button>
          </View>

        </View>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 10,
    height: 40,
    margin: 12,
    padding: 10,
    borderWidth: 1,
    backgroundColor: "white"
  },
  input2: {
    margin: 12,
    borderWidth: 1,
    width: '95%',
    marginVertical: 10,
  },
  submitButton: {
    borderRadius: 10,
    padding: 10,
    margin: 100,
    marginVertical: 100,
    width: '50%'
  },
  buttonC: {
    borderRadius: 10,
    padding: 10,
    margin:5
  },
  //This changes the position of the dropdown, for some reason by default the dropdown is in the middle of the screen -Faiz
  dropDownStyle: {
    marginTop: -50,
  },
  //Below are all for the camera styles -Faiz
  camera: {
    flex: 1,
    marginHorizontal: 50,
    marginVertical: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default AddFoodScreen;