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
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { db, storage } from "../firebaseConfig";
import {
  getDoc,
  doc,
  onSnapshot,
  query,
  collection,
  deleteDoc,
  setDoc,
  updateDoc,
  writeBatch,
  addDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import {
  Icon,
  Button,
  IconButton,
  MD3Colors,
  Divider,
  PaperProvider,
  RadioButton,
  TextInput,
} from "react-native-paper";
import Slider from "@react-native-community/slider";
import { ref, uploadBytesResumable } from "firebase/storage";
import AuthContext from "./AuthContext";
import * as ImageManipulator from "expo-image-manipulator";
import { Rating } from 'react-native-ratings';

const Stack = createNativeStackNavigator();

const windowHeight = Dimensions.get("window").height;
const modalheight = windowHeight - 80;
//A temporary Array that holds all fruit information -Faiz
var fruitInformation = [];

//Obsolete due to combined function -Faiz
// Delay function that returns a Promise -Faiz
//const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//This handles Inference, makes a http request using flask to our app.py python. -Faiz
//inserts image and sends it to python, the image will then be used for computer vision -Don
const handleInference = async (uri, loginID) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });
    const data = {
      base64: base64,
    };
    console.log(JSON.stringify(base64));
    //Faiz Home ip address 192.168.18.24
    //Faiz School ip address 10.175.21.102
    //Faiz Hotspot ip address 192.168.13.224
    const response = await fetch("http://192.168.18.24:5000/predict", {
      //Don
      //fetch("http://192.168.31.1:5000/image", {
      //use FLASK IP in app.py -Don
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        const jsonData = data;

        jsonData.forEach((fruit) => {
          fruitInformation.push(fruit);
        });

        console.log(fruitInformation);
        uploadFruitInformation(loginID);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } catch (error) {
    console.log("Error: ", error);
  }
};
const dateToDayConversion = (givenDate) => {
  currentDate = new Date();
  expiryDate = givenDate.toDate();
  const timeDifference = expiryDate - currentDate;
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return daysDifference;
};

function EditFood({ itemID }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [version, setVersion] = useState(1);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [expiryInDays, setExpiryInDays] = useState(0);
  const [sliderMaxLength, setSliderMaxLength] = useState(0);
  const [sliderCurrentLength, setSliderCurrentLength] = useState(0);
  const [sliderCurrentLengthBefore, setSliderCurrentLengthBefore] = useState(0);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { loginID } = useContext(AuthContext);
  const [aiAccuracyRemarkValue, setAiAccuracyRemarkValue] = useState("");
  const [aiSatisfactionResultValue, setAiSatisfactionResultValue] = useState(0);

  const handleIconClick = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  useEffect(() => {
    if (modalVisible && itemID) {
      fetchEditingFoodData(itemID);
    }
  }, [modalVisible, itemID]);

  const fetchEditingFoodData = async (itemID) => {
    const docRef = doc(db, "foodCollection", itemID);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    setVersion(data.version);

    setFoodName(data.foodName);
    setQuantity(data.quantity.toString());
    setImageUri(data.fruitImageURI.toString());
    const daysUntilExpiry = dateToDayConversion(data.expiryDate);
    setExpiryInDays(daysUntilExpiry);
    //edit

    let maxLength;
    let ripeLength;
    if (data.foodName === "Mango") {
      maxLength = 16;
      ripeLength = 8;
    } else if (data.foodName === "Pineapple") {
      maxLength = 13;
      ripeLength = 6;
    } else if (data.foodName === "Avocado") {
      maxLength = 8;
      ripeLength = 5;
    }
    setSliderMaxLength(maxLength);
    const currentLength = maxLength - daysUntilExpiry;
    setSliderCurrentLength(currentLength);
    setSliderCurrentLengthBefore(currentLength);
  };

  const compressImageUri = async (imageUri) => {
    const compressedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [],
      { compress: 0.2, format: ImageManipulator.SaveFormat.JPEG }
    );
    const base64 = await FileSystem.readAsStringAsync(compressedImage.uri, {
      encoding: "base64",
    });
    const compressedImageUri = `data:image/jpg;base64,${base64}`;
    return compressedImageUri;
  };

  const incrementpoints = async (loginID) => {
    try {
      const PointDocRef = doc(db, "loginInformation", loginID);
      await updateDoc(PointDocRef, {
        points: increment(1),
        gems: increment(10),
      });
      console.log(`Points incremented successfully for document ${loginID}`);
    } catch (error) {
      console.error(error);
      console.log("are you here" + loginID);
    }
  };

  const handleEditFood = async () => {
    const newExpiryInDays = sliderMaxLength - sliderCurrentLength;
    const newExpiryDate = new Date(
      Date.now() + newExpiryInDays * 24 * 60 * 60 * 1000
    );

    let newRipeness = "";
    let daysUntilRipe = 0;
    if (foodName === "Mango") {
      if (newExpiryInDays > 8) {
        newRipeness = "Underripe";
        daysUntilRipe = newExpiryInDays - 8;
      } else if (newExpiryInDays > 0 && newExpiryInDays <= 8) {
        newRipeness = "Ripe";
        daysUntilRipe = newExpiryInDays - 8;
      } else {
        newRipeness = "Overripe";
        daysUntilRipe = newExpiryInDays - 8;
      }
    } else if (foodName === "Pineapple") {
      if (newExpiryInDays > 7) {
        newRipeness = "Underripe";
        daysUntilRipe = newExpiryInDays - 7;
      } else if (newExpiryInDays > 0 && newExpiryInDays <= 7) {
        newRipeness = "Ripe";
        daysUntilRipe = newExpiryInDays - 7;
      } else {
        newRipeness = "Overripe";
        daysUntilRipe = newExpiryInDays - 7;
      }
    } else if (foodName === "Avocado") {
      if (newExpiryInDays > 3) {
        newRipeness = "Underripe";
        daysUntilRipe = newExpiryInDays - 3;
      } else if (newExpiryInDays > 0 && newExpiryInDays <= 3) {
        newRipeness = "Ripe";
        daysUntilRipe = newExpiryInDays - 3;
      } else {
        newRipeness = "Overripe";
        daysUntilRipe = newExpiryInDays - 3;
      }
    }

    const compressedImageUriAfterEdit = await compressImageUri(imageUri);

    const newRipeningDate = new Date(
      Date.now() + daysUntilRipe * 24 * 60 * 60 * 1000
    );
    try {
      const editHistoryRef = collection(
        db,
        "foodCollection",
        itemID,
        "editHistory"
      );
      const docRef = doc(db, "foodCollection", itemID);
      const docSnap = await getDoc(docRef);
      const currentVersion = docSnap.data().version;
      const newVersion = currentVersion + 1;
      await setDoc(doc(editHistoryRef), {
        foodNameAfterEdit: foodName,

        quantityAfterEdit: parseInt(quantity),

        fruitImageUriAfterEdit: compressedImageUriAfterEdit,

        currentRipenessStatusAfterEdit: newRipeness,
        expiryDateAfterEdit: newExpiryDate,
        futureRipeningDateAfterEdit: newRipeningDate,
        version: newVersion,

        aiAccuracyRemark: aiAccuracyRemarkValue,
        aiSatisfactionResult: aiSatisfactionResultValue,


        editedAt: serverTimestamp(), // Timestamp of when the edit was made
      });

      await updateDoc(doc(db, "foodCollection", itemID), {
        foodName: foodName,
        quantity: parseInt(quantity),
        expiryDate: newExpiryDate,
        fruitImageURI: imageUri,
        currentRipenessStatus: newRipeness,
        futureRipeningDate: newRipeningDate,
        version: increment(1),

        aiAccuracyRemark: aiAccuracyRemarkValue,
        aiSatisfactionResult: aiSatisfactionResultValue,
      });
      incrementpoints(loginID);
      setModalVisible(false);
      if (newRipeness != "Overripe") {
        Alert.alert("edited successfully!\n+10 gems +1 Exp");
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleCancelEdit = () => {
    setSliderCurrentLength(sliderCurrentLengthBefore);
    setModalVisible(false);
  };

  const takePhoto = async (setImageUri, loginID) => {
    const cameraResp = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.2,
      allowsEditing: false,
    });

    if (!cameraResp.canceled) {
      try {
        const compressedImage = await ImageManipulator.manipulateAsync(
          cameraResp.assets[0].uri,
          [],
          { compress: 0.3, format: ImageManipulator.SaveFormat.JPEG }
        );
        const base64 = await FileSystem.readAsStringAsync(compressedImage.uri, {
          encoding: "base64",
        });

        const base64Image = `data:image/jpg;base64,${base64}`;
        setImageUri(base64Image);
      } catch (error) {
        console.error("Error reading file:", error);
      }
    } else {
      console.log("Camera was canceled");
    }
  };

  return (
    <PaperProvider>
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Edit Fruit</Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                  marginTop: 20,
                }}
              >
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Image
                    style={{
                      width: 120,
                      height: 120,
                      resizeMode: "contain",
                      marginBottom: 10,
                    }}
                    source={{ uri: imageUri }}
                  />
                  <Button
                    icon="camera"
                    mode="contained-tonal"
                    buttonColor="green"
                    onPress={() => takePhoto(setImageUri, loginID)}
                  >
                    Edit Photo
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 23, fontWeight: "bold" }}>
                    Choose Fruit
                  </Text>
                  <RadioButton.Group
                    onValueChange={(newFoodName) => {
                      setFoodName(newFoodName);
                      let newMaxLength;
                      if (newFoodName === "Mango") {
                        newMaxLength = 16;
                      } else if (newFoodName === "Pineapple") {
                        newMaxLength = 13;
                      } else if (newFoodName === "Avocado") {
                        newMaxLength = 8;
                      }
                      setSliderMaxLength(newMaxLength);
                      setSliderCurrentLength(newMaxLength - expiryInDays);
                    }}
                    value={foodName}
                  >
                    <RadioButton.Item label="Pineapple" value="Pineapple" />
                    <RadioButton.Item label="Mango" value="Mango" />
                    <RadioButton.Item label="Avocado" value="Avocado" />
                  </RadioButton.Group>
                </View>
              </View>
              <TextInput
                style={styles.input2}
                value={quantity}
                onChangeText={setQuantity}
                label="Enter Quantity"
                keyboardType="number-pad"
                mode="flat"
              />
              <Text
                style={{ fontSize: 17, paddingBottom: 10, fontWeight: "bold" }}
              >
                Adjust slider to indicate fruit ripeness
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Text>Unripe</Text>
                <Slider
                  style={{ width: 200, height: 40 }}
                  minimumValue={0}
                  maximumValue={sliderMaxLength}
                  value={sliderCurrentLength}
                  step={1}
                  minimumTrackTintColor="black"
                  maximumTrackTintColor="#000000"
                  onValueChange={(value) => setSliderCurrentLength(value)}
                />
                <Text>Overripe</Text>
              </View>
              <Text style={{ fontSize: 15 }}>
                {(() => {
                  if (foodName === "Mango") {
                    if (sliderCurrentLength < 8) {
                      return `Ripens in ${8 - sliderCurrentLength} days`;
                    } else {
                      return `Best before in ${
                        sliderMaxLength - sliderCurrentLength
                      } days`;
                    }
                  } else if (foodName === "Pineapple") {
                    if (sliderCurrentLength < 6) {
                      return `Ripens in ${6 - sliderCurrentLength} days`;
                    } else {
                      return `Best before in ${
                        sliderMaxLength - sliderCurrentLength
                      } days`;
                    }
                  } else if (foodName === "Avocado") {
                    if (sliderCurrentLength < 5) {
                      return `Ripens in ${5 - sliderCurrentLength} days`;
                    } else {
                      return `Best before in ${
                        sliderMaxLength - sliderCurrentLength
                      } days`;
                    }
                  }
                })()}
              </Text>
              <TextInput
                style={styles.input2}
                value={aiAccuracyRemarkValue}
                onChangeText={setAiAccuracyRemarkValue}
                label="Enter Remarks For AI Result"
                mode="flat"
              />
              <Text style={{ fontSize: 17, paddingBottom: 10, marginTop: 10, fontWeight: "bold" }}>AI Result Satisfaction</Text>
              <Rating 
              type='star'
              ratingCount={5}
              imageSize={50}
              onFinishRating={(rate) => setAiSatisfactionResultValue(rate)}
              startingValue={0}
              style={{marginBottom: 10}}
              jumpValue={0.5}
              fractions={1}
              showRating
              />
              <View style={{ marginTop: 10 }}>
                <Button
                  icon="upload"
                  mode="contained-tonal"
                  buttonColor="green"
                  onPress={handleEditFood}
                >
                  Save
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        <IconButton
          icon="square-edit-outline"
          iconColor={MD3Colors.neutral10}
          size={30}
          onPress={() => setModalVisible(true)}
        />
      </View>
    </PaperProvider>
  );
}

//This function upload fruitinformation collected from inference into firebase database, officially adding them -Faiz
const uploadFruitInformation = async (loginID) => {
  try {
    for (const fruit of fruitInformation) {
      const futureExpiryDate = new Date();
      futureExpiryDate.setDate(futureExpiryDate.getDate() + fruit.expiryInDays);
      const futureRipeningDate = new Date();
      futureRipeningDate.setDate(
        futureRipeningDate.getDate() + fruit.ripenessInDays
      );
      const compressedImage = await ImageManipulator.manipulateAsync(
        fruit.fruitDateURI,
        [],
        { compress: 0.1, format: ImageManipulator.SaveFormat.JPEG }
      );
      const base64CompressedImage = await FileSystem.readAsStringAsync(
        compressedImage.uri,
        {
          encoding: "base64",
        }
      );
      const base64CompressedImageFull = `data:image/jpg;base64,${base64CompressedImage}`;

      const fruitData = {
        fruitClass: fruit.class,
        currentRipenessStatus: fruit.currentRipenessStatus,
        expiryDate: futureExpiryDate,
        foodName: fruit.name,
        quantity: fruit.quantity,
        isadded: false,
        fruitImageURI: base64CompressedImageFull,
        userID: loginID,
        futureRipeningDate: futureRipeningDate,
        fruitFamily: fruit.fruitFamily,
        version: 1,
        isDeleted: false,
      };

      const docRef = await addDoc(collection(db, "foodCollection"), fruitData);
      console.log(
        "The following Fruit Information has been uploaded: ",
        docRef.id
      );

      try {
        const docSnap = await getDoc(docRef);
        const currentVersion = docSnap.data().version;
        const newVersion = currentVersion + 1;
        const newItemID = docRef.id;
        const editHistoryRef = collection(
          db,
          "foodCollection",
          newItemID,
          "editHistory"
        );
        await setDoc(doc(editHistoryRef), {
          foodNameAfterEdit: fruit.name,

          quantityAfterEdit: fruit.quantity,

          fruitImageUriAfterEdit: base64CompressedImageFull,

          currentRipenessStatusAfterEdit: fruit.currentRipenessStatus,
          expiryDateAfterEdit: futureExpiryDate,
          futureRipeningDateAfterEdit: futureRipeningDate,
          version: 1,

          editedAt: serverTimestamp(), // Timestamp of when the edit was made
        });
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }

    //Empty Array as fruit information has already been transferred to firebase -Faiz
    fruitInformation = [];
  } catch (error) {
    console.log("Error: ", error);
  }
};

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
// const sendToPython = async (uri) => {
//   const base64 = await FileSystem.readAsStringAsync(uri, {
//     encoding: "base64",
//   });
//   const data = {
//     base64: base64,
//   };
//   console.log(JSON.stringify(base64));
//   fetch("http://192.168.18.24:5000/image", {
//     //Don
//     //fetch("http://192.168.31.1:5000/image", {
//     //use FLASK IP in app.py -Don
//     method: "POST",
//     headers: { "content-type": "application/json" },
//     body: JSON.stringify(data),
//   }).then(() => {
//     console.log("food added");
//   });
// };
//code to take photo -Don Added LoginID so that other functions can take use of that -Faiz
const takePhoto = async (setImageUri, loginID) => {
  const cameraResp = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 1,
    allowsEditing: false,
  });

  if (!cameraResp.canceled) {
    const uri = cameraResp.assets[0].uri;
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ rotate: 180 }, { flip: ImageManipulator.FlipType.Vertical }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImageUri(manipResult.uri);
    console.log(manipResult.uri);
    //sendToPython(uri);
    //await delay(14000);
    handleInference(manipResult.uri, loginID);
    //uploadFruitImageToFirebase(uri);
  } else {
    console.log("Camera was canceled");
  }
};
const pickImage = async (setImageUri, loginID) => {
  // No permissions request is necessary for launching the image library
  const cameraResp = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: false,
    aspect: [4, 3],
    quality: 1,
  });

  if (!cameraResp.canceled) {
    const uri = cameraResp.assets[0].uri;
    setImageUri(uri);
    handleInference(uri, loginID);
  }
};

//fetches all food with isadded as false, to enable users to confirm before they add, or delete to not add, gives user more control -Don
//should add edit button in the future -Don
function FetchFoodData() {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [foodsfetch, setFoodsfetch] = useState([]);
  const [allFruitsFetch, setAllFruitsFetch] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const foodsCol = collection(db, "foodCollection");
  const { loginID } = useContext(AuthContext);

  //Function that helps do date comparison and produces the days remaining. Helpful for expiryDate and RipeningDate in particular -Faiz
  const dateToDayConversion = (givenDate) => {
    currentDate = new Date();
    expiryDate = givenDate.toDate();
    const timeDifference = expiryDate - currentDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
  };

  //This function checks the fruit that is being added if it's considered a waste or not, warns the user if they would like to proceed -Faiz
  const trackWastage = async (item) => {
    var waste = false;

    allFruitsFetch.forEach((fruit) => {
      if (
        fruit.data.foodName === item.data.foodName &&
        dateToDayConversion(fruit.data.expiryDate) > 0 &&
        fruit.data.isadded === true && fruit.data.isDeleted === false
      ) {
        waste = true;
      }
    });

    return new Promise((resolve) => {
      if (waste === true) {
        Alert.alert(
          "Confirm Action",
          `${item.data.foodName} already exists within your list and is still within best before date. Do you still want to add?`,
          [
            {
              text: "Yes",
              onPress: () => {
                addFruit(item);
                resolve();
              },
            },
            {
              text: "No",
              onPress: () => {
                resolve();
              },
              style: "cancel",
            },
          ],
          { cancelable: false }
        );
      } else {
        addFruit(item);
      }
    });
  };

  //Extension of Don's code to ensure correct execution of wastage tracking adding fruit -Faiz
  const addFruit = async (item) => {
    updateDoc(doc(db, "foodCollection", item.id), {
      isadded: true,
    });
  };

  const handleDelete = async () => {
    if (itemToDelete === "all") {
      const deleteBatch = writeBatch(db);
      for (const item of foodsfetch) {
        const docRef = doc(db, "foodCollection", item.id);
        deleteBatch.update(docRef, { isDeleted: true, DeleteTimestamp: serverTimestamp() });
      }
      await deleteBatch.commit();
    } else if (itemToDelete) {
      await updateDoc(doc(db, "foodCollection", itemToDelete.id), {
        isDeleted: true,
        DeleteTimestamp: serverTimestamp(),
      });
    }
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const makeDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const makeAllDeleted = () => {
    setItemToDelete("all");
    setDeleteModalVisible(true);
  };

  const makeAdded = (item) => {
    trackWastage(item);
  };
  const makeAllAdded = async () => {
    const updateBatch = writeBatch(db);
    for (const item of foodsfetch) {
      updateBatch.update(doc(db, "foodCollection", item.id), {
        isadded: true,
      });
    }

    await updateBatch.commit();
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
        if (food.data.isadded == false && food.data.isDeleted == false && food.data.userID === loginID) {
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
                    marginHorizontal: 5,
                    borderRadius: 5,
                    borderWidth: 0.5,
                    height: 200
                  }}
                >
                  <View style={styles.imageContainer}>
                      <Image
                        style={styles.image}
                        source={{ uri: item.data.fruitImageURI }}
                      ></Image>
                  </View>
                  <View style={{ flex: 1, marginRight: -100 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", textDecorationLine: "underline"}}>
                      {item.data.foodName}

                      <Text style={{ fontSize: 16 }}>
                        {" "}
                        x{item.data.quantity}
                      </Text>
                    </Text>
                    {item.data.currentRipenessStatus === "Underripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{fontWeight: "bold"}}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{fontWeight: "bold"}}>Ripens in:{"\n"}</Text>
                          {dateToDayConversion(item.data.futureRipeningDate)} Days ({item.data.futureRipeningDate.toDate().toLocaleString("en-GB", {day: "2-digit",month: "2-digit",year: "numeric",})}) 
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{fontWeight: "bold"}}>Best Before:{"\n"}</Text>
                          {dateToDayConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", {day: "2-digit",month: "2-digit",year: "numeric",})})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Ripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{fontWeight: "bold"}}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{fontWeight: "bold"}}>Best Before:{"\n"}</Text>
                          {dateToDayConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", {day: "2-digit",month: "2-digit",year: "numeric",})})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Overripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{fontWeight: "bold"}}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                      </View>
                    ) : null}
                    {item.data.fruitFamily != "" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{fontWeight: "bold"}}>Fruit Family:{"\n"}</Text>
                          {item.data.fruitFamily}
                        </Text>
                      </View>
                    ) : null}
                </View>
                  <View style={{ flexDirection: "column" }}>
                    <IconButton
                      size={30}
                      icon="check"
                      onPress={() => makeAdded(item)}
                      style={{marginBottom: -10}}
                    />
                    <IconButton
                      icon="delete"
                      iconColor={MD3Colors.error50}
                      size={30}
                      onPress={() => makeDelete(item)}
                      style={{marginBottom: 20}}
                    />
                    <View>
                      <EditFood itemID={item.id} />
                    </View>
                  </View>
                  <Divider />
                </View>
              </SafeAreaView>
            );
          }}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => {
            setDeleteModalVisible(!deleteModalVisible);
          }}
        >
          <View style={styles.deleteCenteredView}>
            <View style={styles.deleteModalView}>
              <Text>Are you sure you want to delete?</Text>
              <View style={{ flexDirection: "row" }}>
                <IconButton
                  iconColor={MD3Colors.primary50}
                  icon="check"
                  size={30}
                  onPress={handleDelete}
                />
                <IconButton
                  icon="close"
                  iconColor={MD3Colors.error50}
                  size={30}
                  onPress={() => setDeleteModalVisible(false)}
                />
              </View>
            </View>
          </View>
        </Modal>
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
            <View style={{ paddingHorizontal: 2 }}>
              <Button
                icon="view-gallery"
                mode="contained-tonal"
                buttonColor="green"
                onPress={() => pickImage(setImageUri, loginID)}
              ></Button>
            </View>
            <View style={{ paddingHorizontal: 2 }}>
              <Button
                icon="camera"
                mode="contained-tonal"
                buttonColor="green"
                onPress={() => takePhoto(setImageUri, loginID)}
              ></Button>
            </View>
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

    flexDirection: "row",
    justifyContent: "center",
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
    width: '100%',
    height: '100%',
    resizeMode: "contain",
  },
  imageContainer: {
    width: 125,
    height: 150,
    overflow: 'hidden',
    marginRight: 5
  },
  modalText: {
    textAlign: "center",
    fontSize: 35,
    fontWeight: "bold",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    shadowColor: "#000",
    width: 400,
    height: modalheight,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input2: {
    margin: 12,
    borderWidth: 1,
    width: "90%",
    height: 50,
    marginVertical: 10,
  },
  deleteModalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  listText: {
    fontSize: 16, 
  },
});
