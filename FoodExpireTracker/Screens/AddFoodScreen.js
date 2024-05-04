import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { collection, addDoc, doc } from 'firebase/firestore';


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
    <View style={{backgroundColor:"lightgreen",  flex: 1, justifyContent: "flex-start"}}>
      <TextInput
        style={styles.input}
        value={foodName}
        onChangeText={setFoodName}
        placeholder="Enter food name"
      />
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Enter quantity"
        keyboardType="number-pad"
      />
      <View style={styles.buttonC}>
        <Button title="Choose Expiry date" onPress={showDatePicker} />
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        value={expiryDate}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      <View style={styles.buttonC}>
        <Button title="Submit" onPress={handleAddFood}/>
      </View>
    </View>
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
  buttonC: {
    borderRadius: 10,
    padding: 10,
    margin:5
  }
});

export default AddFoodScreen;