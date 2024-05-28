import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ScrollView,
  FlatList,
  SafeAreaView,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { db } from "../firebaseConfig";
import {
  doc,
  onSnapshot,
  query,
  collection,
  deleteDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  Icon,
  Button,
  IconButton,
  MD3Colors,
  Divider,
  PaperProvider,
} from "react-native-paper";

const Stack = createNativeStackNavigator();
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
    //use FLASK IP in app.py -Don
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  }).then(() => {
    console.log("food added");
  });
};
//code to take photo -Don
const takePhoto = async (setImageUri) => {
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
  } else {
    console.log("Camera was canceled");
  }
};

//fetches all food with isadded as false, to enable users to confirm before they add, or delete to not add, gives user more control -Don
//should add edit button in the future -Don
function FetchFoodData() {
  const [foodsfetch, setFoodsfetch] = useState([]);
  const foodsCol = collection(db, "foodCollection");

  //This a combines both makeAllAdded function and handleInference function, activated by the confirm all button. -Faiz
  const combinedAdded = async () =>{
    makeAllAdded();
    handleInference();
  }

  //This handles Inference, makes a http request using flask to our app.py python. -Faiz
  const handleInference = async () => {
    try{
      //Utilize own ip address and port. -Faiz
      const response = await fetch("http://192.168.18.24:5000/predict", {
        method: 'GET',
      });

      const data = await response.json();
    }
    catch(error){
      console.log("Error: ",error);
    }
  }

  const makeAllAdded = async () => {
    const updateBatch = writeBatch(db);
    for (const item of foodsfetch) {
      updateBatch.update(doc(db, "foodCollection", item.id), {
        isadded: true,
      });
    }

    await updateBatch.commit();
  };
  const makeAdded = (id) => {
    updateDoc(doc(db, "foodCollection", id), {
      isadded: true,
    });
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
      querySnapshot.forEach((doc) => {
        foods.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setFoodsfetch(foods);
      for (const food of foods) {
        if (food.data.isadded == false) {
          filteringFoodItems.push(food);
        }
      }
      setFoodsfetch(filteringFoodItems);
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
            onPress={combinedAdded}
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
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                      {item.data.foodName}

                      <Text style={{ fontSize: 16 }}>
                        {" "}
                        x{item.data.quantity}
                      </Text>
                    </Text>
                    <Text>{item.data.category}</Text>
                    <Text>expires in: </Text>
                    <Text>
                      expires on:{" "}
                      {item.data.expiryDate.toDate().toLocaleString()}
                    </Text>
                  </View>
                  <IconButton
                    size={30}
                    icon="check"
                    onPress={() => makeAdded(item.id)}
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
              onPress={() => takePhoto(setImageUri)}
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
});
