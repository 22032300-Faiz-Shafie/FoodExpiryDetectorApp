import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Image, ScrollView, FlatList, SafeAreaView} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {db} from "../firebaseConfig"
import { doc, onSnapshot, query, collection, deleteDoc, updateDoc, writeBatch} from "firebase/firestore";
import {Icon, Button, IconButton, MD3Colors, Divider, PaperProvider} from 'react-native-paper';

const Stack = createNativeStackNavigator();
const sendToPython = async (uri) =>{
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' }); //encode uri to base64 before sending
  //wraps base64 data in "base64" key
  const data = { 
    base64: base64
  };
  console.log (JSON.stringify(base64))
  fetch('http://192.168.31.1:3000/image',{ //use FLASK IP
    method: 'POST',
    headers: {"content-type": "application/json"},
    body: JSON.stringify(data)
   
  }).then (()=>{
    console.log("food added")
  })
}
//code to take photo 
const takePhoto = async () => {
  const cameraResp = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 1,
    allowsEditing: false,
  });

  if (!cameraResp.canceled) {
    console.log(cameraResp.assets[0].uri); //to test the URI
    sendToPython(cameraResp.assets[0].uri) 

  } else {
    console.log('Camera was canceled');
  }
};


function FetchFoodData() {
  const [foodsfetch, setFoodsfetch] = useState([]);
  const foodsCol = collection(db, "foodCollection");

//confirms all foods at once and sets isadded to true
  const makeAllAdded = async () => {
    const updateBatch = writeBatch(db);
    for (const item of foodsfetch){
      updateBatch.update(doc(db, "foodCollection", item.id), {
      isadded: true
    }
  );
}

await updateBatch.commit();
  }
  const makeAdded = (id) => {
    updateDoc(doc(db, "foodCollection", id), {
      isadded: true
    });
  }

  const makeAllDeleted = async () => {
    const deleteBatch = writeBatch(db);
    for (const item of foodsfetch){
      deleteBatch.delete(doc(db, "foodCollection", item.id), {
    }
  );
}
await deleteBatch.commit();
  }
 
  useEffect(() => {
      const q = query(foodsCol);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const foods = [];
      const filteringFoodItems = []
      querySnapshot.forEach((doc) => {
        foods.push({
          id: doc.id,
          data: doc.data()
        });
      });
      setFoodsfetch(foods);
      for(const food of foods){
 
        if(food.data.isadded==false){
       filteringFoodItems.push(food);
        }
        
      }
      setFoodsfetch(filteringFoodItems);
    });
 
    return () => unsubscribe();
  }, []);
 
  return (
    <PaperProvider>
    <View style ={{flex:1}}>
    <FlatList
      data={foodsfetch}
      renderItem={({ item }) => {
 
        return (
          <SafeAreaView >
         <View key={item.id} style={{backgroundColor: "white", flexDirection: 'row', alignItems: 'center', padding:10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.4,
      shadowRadius: 4,
     
      elevation: 4,
         }}>
    <View style={{ flex: 1 }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.data.foodName}
 
        <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
        </Text>
        <Text>{item.data.category}</Text>
        <Text>expires in: </Text>
        <Text>expires on: {item.data.expiryDate.toDate().toLocaleString()}</Text>
    </View >
    <IconButton 
    size={30}
    icon="check"
    onPress={() => makeAdded(item.id)}
     />
    <IconButton
        icon="delete"
        iconColor={MD3Colors.error50}
        size={30}
        onPress={() => deleteDoc(doc(db, "foodCollection", item.id))}
    />
    
    <Divider/>
   
</View>
        </SafeAreaView>
        );
      }}
    />
  <View style={{justifyContent: "center"}}>
      <Button icon="check" mode="contained-tonal" buttonColor="green" onPress={makeAllAdded}>Confirm All</Button>
      <Button icon="delete" mode="contained-tonal" buttonColor="red" onPress={makeAllDeleted}>delete All</Button>
    </View>
    </View>
    </PaperProvider>
  );

}

 
export default function App() {
  return (
    <PaperProvider>
    <View style={styles.backGround}>
      <ScrollView>
        <View style={{ flex: 1, height: 200, backgroundColor: "lightgreen",  borderBottomLeftRadius: 30, borderBottomRightRadius: 30}}>
          <StatusBar backgroundColor="green" barStyle="default" />
          <Text style={{ textAlign: "center", fontSize: 20, paddingTop: 40 }}></Text>
          <View style={styles.buttonC}>
            <Button icon="camera" mode="contained-tonal" buttonColor="green" onPress={takePhoto}>take photo</Button>
          </View>
        </View>
        <View style ={{alignSelf: "center"}}><Text style={{fontSize: 25}}>confirm foods to add</Text></View>
   <View><FetchFoodData/></View>
      </ScrollView>
        </View>
      </PaperProvider>
  )}
  
 
const styles = StyleSheet.create({
  backGround: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "white",
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
}, buttonC: {
  borderRadius: 10,
  padding: 10,
  margin:5
}
 
});
 
 
