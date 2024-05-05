import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { collection, addDoc, doc } from 'firebase/firestore';
import { PaperProvider, Button, TextInput } from 'react-native-paper';

import {db} from "../firebaseConfig"




const AddFoodScreen = () => {
  const [foodName, setFoodName] = useState(""); 
  const [quantity, setQuantity] = useState(""); 
  const [expiryDate, setExpiryDate] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
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
        expiryDate: expiryDate
      };
  
      const docRef = await addDoc(collection(db, 'foodCollection'), foodData);
      console.log('Document written with ID: ', docRef.id);

      setFoodName("");
      setQuantity("");
      setExpiryDate("");
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }; 

  return (
    <PaperProvider>
      <ScrollView>
        <View style={{backgroundColor: "lightgreen", flex: 1, justifyContent: "flex-start"}}>
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
            label="Enter quantity"
            keyboardType="number-pad"
          />
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
            <Button icon="upload" mode="contained-tonal" buttonColor="green" onPress={handleAddFood}>Submit</Button>
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
    marginVertical: 475,
    width: '50%'
  },
  buttonC: {
    borderRadius: 10,
    padding: 10,
    margin:5
  }
});

export default AddFoodScreen;