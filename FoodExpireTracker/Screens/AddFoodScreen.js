import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";


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
  const handleNumber = (text) => { 
      if (!isNaN(text)) { 
          setNumber(text); 
      } 
  }; 
  const handleAddFood = (date) => {
    // later add to firebase db, now use to verify form works correctly
    console.log('Name:', foodName);
    console.log('Quantity:', quantity);
    console.log('Expiry Date:', expiryDate); 

    
  

  };
  return (
    <View style={{backgroundColor:"lightgreen",  flex: 1,
    justifyContent: "flex-start"}}>
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
       <Button style={{padding:100}} title="Choose Expiry date" onPress={showDatePicker} />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        value={expiryDate}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
     </View>
     <View style={styles.buttonC}>
      <Button title ="Submit" onPress={handleAddFood}/>
      </View>
 </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 10,
    height: 40,
    margin: 12,
    padding: 10,
    borderWidth: 1,
    backgroundColor: "white"
  }, buttonC: {
    borderRadius: 10,
    padding: 10,
    margin:5
  }
});

export default AddFoodScreen;
