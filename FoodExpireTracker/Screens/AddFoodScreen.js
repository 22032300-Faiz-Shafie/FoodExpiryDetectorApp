import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ScrollView,
  FlatList,
  SafeAreaView,
  Alert
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { db, storage } from "../firebaseConfig";
import {
  doc,
  onSnapshot,
  query,
  collection,
  deleteDoc,
  updateDoc,
  writeBatch,
  addDoc
} from "firebase/firestore";
import {
  Icon,
  Button,
  IconButton, 
  MD3Colors,
  Divider,
  PaperProvider,
} from "react-native-paper";
import { ref, uploadBytesResumable} from "firebase/storage";
import AuthContext from "./AuthContext";

const Stack = createNativeStackNavigator();

//A temporary Array that holds all fruit information -Faiz
var fruitInformation = [];

// Delay function that returns a Promise
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


//This handles Inference, makes a http request using flask to our app.py python. -Faiz
const handleInference = async (loginID) => {

  try {
    //Utilize own ip address and port. -Faiz
    const response = await fetch("http://192.168.18.24:5000/predict");
    const jsonData = await response.json(); 
    

    // Loop through each item in the jsonData array and put them into fruitInformation array -Faiz
    jsonData.forEach(fruit => {
      fruitInformation.push(fruit)
    });

    console.log(fruitInformation);
    uploadFruitInformation(loginID);
  }

  catch (error) {
    console.log("Error: ", error);
  }
};

//This function upload fruitinformation collected from inference into firebase database, officially adding them -Faiz
const uploadFruitInformation = async (loginID) => {
  try{
    for(const fruit of fruitInformation){
      const futureExpiryDate = new Date();
      futureExpiryDate.setDate(futureExpiryDate.getDate() + fruit.expiryInDays);
      const futureRipeningDate = new Date();
      futureRipeningDate.setDate(futureRipeningDate.getDate() + fruit.ripenessInDays);


      const fruitData = {
        fruitClass: fruit.class,
        currentRipenessStatus: fruit.currentRipenessStatus,
        expiryDate: futureExpiryDate,
        expiryInDays: fruit.expiryInDays,
        foodName: fruit.name,
        quantity: fruit.quantity,
        isadded: false, 
        fruitImageURI: fruit.fruitDateURI,
        userID: loginID,
        futureRipeningDate: futureRipeningDate,
        ripenessInDays: fruit.ripenessInDays
      };
     
      const docRef = await addDoc(
        collection(db, "foodCollection"),fruitData
      );
      console.log(
        "The following Fruit Information has been uploaded: ", docRef.id
      );

    }

    //Empty Array as fruit information has already been transferred to firebase -Faiz
    fruitInformation = []
  }
  catch(error){
    console.log("Error: ", error)
  }

}

//This uploads an image of the fruit to the Firebase storage. It converts the uri of the image into a blob before uploading it. Right now it's obsolete but in the future this could be a better storage option rather than firestore -Faiz
// const uploadFruitImageToFirebase = async(uri, docRefID) => {
//   try{
//     //Convert uri into a blob which is one of the suitable format type to upload files to firebase storage -Faiz
//     const response = await fetch(uri);
//     const blob = await response.blob();
    
//     // Create a reference to the file in Firebase Storage -Faiz
//     const storageRef = ref(storage, "images/" + docRefID + ".jpg");

//     const uploadTask = uploadBytesResumable(storageRef, blob);

//     uploadTask.on(
//       'state_changed',
//       snapshot => {
//         // Observe the progess of uploading the image -Faiz
//         console.log(`Progress: ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`);
//       },
//       error => {
//         console.error('Error Uploading Fruit Image: ', error);
//       },
//       () => {
//         console.log('Image uploaded successfully!');
//       }
//     );
//   }
//   catch(error){
//     console.error("Error Uploading Fruit Image: ", error);
//   }
// }

//inserts image and sends it to python, the image will then be used for computer vision -Don
const sendToPython = async (uri) => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });
  const data = {
    base64: base64,
  };
  console.log(JSON.stringify(base64));
  fetch("http://192.168.18.24:5000/image", {
    //Don
    //fetch("http://192.168.31.1:5000/image", {
    //use FLASK IP in app.py -Don
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  }).then(() => {
    console.log("food added");
  });
};
//code to take photo -Don Added LoginID so that other functions can take use of that -Faiz
const takePhoto = async (setImageUri, loginID) => {
  const cameraResp = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 1,
    allowsEditing: false,
  });

  if (!cameraResp.canceled) {
    const uri = cameraResp.assets[0].uri;
    setImageUri(uri);
    console.log(uri);
    sendToPython(uri);
    await delay(2000);
    handleInference(loginID);
    //uploadFruitImageToFirebase(uri);
  } else {
    console.log("Camera was canceled");
  }
};

//fetches all food with isadded as false, to enable users to confirm before they add, or delete to not add, gives user more control -Don
//should add edit button in the future -Don
function FetchFoodData() {
  const [foodsfetch, setFoodsfetch] = useState([]);
  const [allFruitsFetch, setAllFruitsFetch] = useState([]);
  const foodsCol = collection(db, "foodCollection");

  //This function checks the fruit that is being added if it's considered a waste or not, warns the user if they would like to proceed -Faiz
  const trackWastage = async (item) => {
    const minDaysToConsiderWaste = 3;
    var waste = false; 

    allFruitsFetch.forEach(fruit => {

      if(fruit.data.foodName === item.data.foodName && fruit.data.expiryInDays > minDaysToConsiderWaste && fruit.data.isadded === true){
        waste = true; 
      }
    });
    
    return new Promise((resolve) => {
      if(waste === true){
        Alert.alert(
          "Confirm Action",
          `${item.data.foodName} already exists within your list and has a bestbefore date of ${minDaysToConsiderWaste} days or more. Do you still want to add?`,
          [
            { text: 'Yes', onPress: () => {addFruit(item); resolve();} },
            {
              text: 'No',
              onPress: () => {resolve();},
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      }
      else{
        addFruit(item);
      }
    })
    
  }

  //Extension of Don's code to ensure correct execution of wastage tracking adding fruit -Faiz
  const addFruit = async (item) => {
      updateDoc(doc(db, "foodCollection", item.id), {
        isadded: true,
      });
  };

  const makeAllAdded = async () => {
    //const updateBatch = writeBatch(db);
    for (const item of foodsfetch) {
      await trackWastage(item);
    }

    //await updateBatch.commit();
  };
  const makeAdded = (item) => {
    trackWastage(item);
  };

  const makeAllDeleted = async () => {
    const deleteBatch = writeBatch(db);
    for (const item of foodsfetch) {
      deleteBatch.delete(doc(db, "foodCollection", item.id), {});
    }
    await deleteBatch.commit();
  };

  useEffect(() => {
    const q = query(foodsCol);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const foods = [];
      const filteringFoodItems = [];
      const allFruitItems = [];
      querySnapshot.forEach((doc) => {
        foods.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setFoodsfetch(foods);
      for (const food of foods) {
        allFruitItems.push(food);
        if (food.data.isadded == false) {
          filteringFoodItems.push(food);
        }
      }
      setFoodsfetch(filteringFoodItems);
      setAllFruitsFetch(allFruitItems);
    });

    return () => unsubscribe();
  }, []);

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        <View style={styles.buttonContainer}>
          <Button
            icon="check"
            mode="contained-tonal"
            Type="contained"
            buttonColor="lightgreen"
            onPress={makeAllAdded}
          >
            Confirm All
          </Button>
          <Button
            icon="delete"
            mode="contained-tonal"
            buttonColor="red"
            onPress={makeAllDeleted}
          >
            delete All
          </Button>
        </View>
        <FlatList
          data={foodsfetch}
          renderItem={({ item }) => {
            return (
              <SafeAreaView>
                <View
                  key={item.id}
                  style={{
                    backgroundColor: "white",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                    marginHorizontal: 5,
                    borderRadius: 5,
                    borderWidth: 0.5
                  }}
                >
                  <View style={{ flex: 1 }}>
                      <View style={{ flex: 1 }}>
                        <Image
                          style={styles.image}
                          source={{ uri: item.data.fruitImageURI }}
                        ></Image>
                      </View>
                    <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                      {item.data.foodName}

                      <Text style={{ fontSize: 16 }}>
                        {" "}
                        x{item.data.quantity}
                      </Text>
                    </Text>
                    {item.data.currentRipenessStatus === "Underripe" ? (<View> 
                      <Text>Ripens in: {item.data.ripenessInDays} Days</Text> 
                      <Text>Ripens on: {item.data.futureRipeningDate.toDate().toLocaleString('en-GB', {       day: '2-digit',       month: '2-digit',       year: 'numeric' })}</Text> 
                      <Text>Best Before{" (days)"}: {item.data.expiryInDays} Days</Text> 
                      <Text>Best Before: {item.data.expiryDate.toDate().toLocaleString('en-GB', {       day: '2-digit',       month: '2-digit',       year: 'numeric' })}</Text> 
                      </View>) : null}
                    {item.data.currentRipenessStatus === "Ripe" ? (<View> 
                      <Text>Best Before{" (days)"}: {item.data.expiryInDays} Days</Text> 
                      <Text>Best Before: {item.data.expiryDate.toDate().toLocaleString('en-GB', {       day: '2-digit',       month: '2-digit',       year: 'numeric' })}</Text> 
                      </View>) : null}
                    {/* <Text>expires in:{" "}
                          {item.data.expiryInDays}
                    </Text>
                    <Text>
                      expires on:{" "}
                      {item.data.expiryDate.toDate().toLocaleString()}
                    </Text> */}
                    <Text>
                      Current Ripeness Status:{" "}
                      {item.data.currentRipenessStatus}
                    </Text>
                  </View>
                  <IconButton
                    size={30}
                    icon="check"
                    onPress={() => makeAdded(item)}
                  />
                  <IconButton
                    icon="delete"
                    iconColor={MD3Colors.error50}
                    size={30}
                    onPress={() =>
                      deleteDoc(doc(db, "foodCollection", item.id))
                    }
                  />

                  <Divider />
                </View>
              </SafeAreaView>
            );
          }}
        />
      </View>
    </PaperProvider>
  );
}

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const { loginID } = useContext(AuthContext);

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View
            style={{
              flex: 1,
              height: 200,
              backgroundColor: "lightgreen",
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
            }}
          >
            <StatusBar backgroundColor="green" barStyle="default" />
            <View style={{ padding: 10 }}>
              {imageUri && (
                <Image
                  source={{ uri: imageUri, alignItems: "center" }}
                  style={styles.displayImage}
                />
              )}
            </View>
          </View>
          <View style={styles.takePhotoButton}>
            <Button
              icon="camera"
              mode="contained-tonal"
              buttonColor="green"
              onPress={() => takePhoto(setImageUri, loginID)}
            >
              Take Photo
            </Button>
          </View>
          <View>
            <FetchFoodData />
          </View>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "white",
  },
  takePhotoButton: {
    flex: 1,
    justifyContent: "flex-end",
    marginHorizontal: 40,
    paddingTop: 10,
  },
  input: {
    height: 40,
    margin: 12,
    padding: 10,
    borderWidth: 1,
  },
  text: {
    fontSize: 30,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "white",
  },
  displayImage: {
    height: 180,
    resizeMode: "contain",
  },
  image: {
    width: 140,
    height: 140,
    resizeMode:"cover"
  },
});
