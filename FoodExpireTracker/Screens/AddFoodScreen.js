import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

const AddFoodScreen = () => {
  const [foodName, setFoodName] = useState(""); 
  const [quantity, setQuantity] = useState(""); 
  
  const handleNumber = (text) => { 
      if (!isNaN(text)) { 
          setNumber(text); 
      } 
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
  }
});

export default AddFoodScreen;
