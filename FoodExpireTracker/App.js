import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Image, ScrollView, Button, FlatList, SafeAreaView} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddFoodScreen from "./Screens/AddFoodScreen";
import {db} from "./firebaseConfig"
import { doc, onSnapshot, query, collection, deleteDoc} from "firebase/firestore";

const Stack = createNativeStackNavigator();
const logoImg = require("./assets/favicon.png");
const addImg = require("./assets/add.png")



function FetchFoodData() {
  const [foodsfetch, setFoodsfetch] = useState([]);
  const foodsCol = collection(db, "foodCollection");

  useEffect(() => {
    const q = query(foodsCol);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const foods = [];
      querySnapshot.forEach((doc) => {
        foods.push({
          id: doc.id,
          data: doc.data()
        });
      });
      setFoodsfetch(foods);
    
    });

    return () => unsubscribe();
  }, []);

  return (
    //Currently has issue with adding date. Ui needs improvement. 
    <FlatList 
      data={foodsfetch}
      renderItem={({ item }) => {

        return (
          <SafeAreaView >
          <View key={item.id}  style={{backgroundColor:"white",margin:10}}>
            <Text>{item.data.foodName}</Text>
            <Text>{item.data.quantity}</Text>
            <Button title="delete" onPress={() => deleteDoc(doc(db, "foodCollection", item.id))}  />
    
          </View>
        </SafeAreaView>
        );
      }}
    />
  );
}


export default function App() {
  return (
    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="addFoodScreen" component={AddFoodScreen} options={{ headerStyle: { backgroundColor: 'green' },title:"Add food" }} />
    </Stack.Navigator>
  </NavigationContainer>
);

}



const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.backGround}>
      <ScrollView>
        <View style={{ flex: 1, height: 200, backgroundColor: "lightgreen", borderRadius: 30 }}>
          <StatusBar backgroundColor="green" barStyle="default" />
          <Text style={{ textAlign: "center", fontSize: 20, paddingTop: 40 }}>Elsa's List</Text>
          <Image source={logoImg} style={{ width: 100, height: 100, alignSelf: "center" }} />
        </View>
   <View><FetchFoodData/></View>
      </ScrollView>
      <View style={styles.addFoodButton}>
          <Pressable onPress={() => navigation.navigate("addFoodScreen")}>
            <Image source={addImg} style={{ width: 70, height: 70 }} />
          </Pressable>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backGround: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "lightgrey",
  }, 
  addFoodButton: {
    position: "absolute",
    bottom: 20,
    right: 20
  },
  input:{
   height: 40,
   margin: 12,
   padding: 10,
   borderWidth: 1
},text: {
  fontSize: 30,
  padding: 10
}

});

