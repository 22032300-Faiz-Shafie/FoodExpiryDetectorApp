import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useContext, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ScrollView,
  FlatList,
  SafeAreaView,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddFoodScreen from "./Screens/AddFoodScreen";
import AiAccuracyForm from "./Screens/AiAccuracyForm";
import LoginScreen from "./Screens/LoginScreen";
import Gamify from "./Screens/Gamify";
import SignUpScreen from "./Screens/SignUpScreen";
import Slider from "@react-native-community/slider";
import { db } from "./firebaseConfig";
import {
  doc,
  onSnapshot,
  query,
  collection,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import {
  Icon,
  Button,
  IconButton,
  MD3Colors,
  Divider,
  FAB,
  PaperProvider,
  TextInput,
  RadioButton,
  Menu,
  Provider,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { AuthProvider } from "./Screens/AuthContext";
import AuthContext from "./Screens/AuthContext";
import { TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";


const Stack = createNativeStackNavigator();
const logoImg = require("./assets/download-removebg-preview.png");
const addImg = require("./assets/add.png");

//fetches all food with isadded as true, so that only added foods are displayed -Don
function FetchFoodData() {
  const [foodsfetch, setFoodsfetch] = useState([]);
  const foodsCol = collection(db, "foodCollection");
  const { loginID } = useContext(AuthContext);
  const filteringFoodItems = [];

  //Function that helps do date comparison and produces the days remaining. Helpful for expiryDate and RipeningDate in particular -Faiz
  const dateToDayConversion = (givenDate) => {
    currentDate = new Date();
    expiryDate = givenDate.toDate();
    const timeDifference = expiryDate - currentDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
  };

  //An alert function that notifies user when fruits in the fruit list have been expired -Faiz
  const alertFunction = async (fruits) => {
    for (const fruit of fruits) {
      if (dateToDayConversion(fruit.data.expiryDate) === 0) {
        Alert.alert(
          "Confirm Action",
          `${fruit.data.foodName} is already past Best Before Date.`,
          [
            {
              text: "Dismiss",
            },
          ],
          { cancelable: false }
        );
      }
    }
  };

  const browserFunction = async (fruit) => {
    if (fruit.data.foodName === "Pineapple") {
      let result = await WebBrowser.openBrowserAsync(
        "https://www.nutritionvalue.org/Pineapple%2C_raw_63141010_nutritional_value.html?utm_source=share-by-url"
      );
      console.log(result);
    } else if (fruit.data.foodName === "Mango") {
      result = await WebBrowser.openBrowserAsync(
        "https://www.nutritionvalue.org/Mango%2C_raw_63129010_nutritional_value.html?utm_source=share-by-url"
      );
      console.log(result);
    } else if (fruit.data.foodName === "Avocado") {
      result = await WebBrowser.openBrowserAsync(
        "https://www.nutritionvalue.org/Avocado%2C_raw_63105010_nutritional_value.html?utm_source=share-by-url"
      );
      console.log(result);
    }
  };


  /*const filterFunction = async (filteringFoodItems, days) => {
     function CheckExpiry() {
       const foodsCol = collection(db, "foodCollection");
       const [filteredFoodItems, setFilteredFoodItems] = useState([]);
       var today = new Date();
       const FiveDaysFromNow = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
       const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
       const daysDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
       const { loginID } = useContext(AuthContext);

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
           for (const food of foods) {
             if (
               food.data.expiryDate.toDate() <= daysDate &&
               food.data.expiryDate.toDate() > today &&
               food.data.isadded == true &&
               food.data.userID === loginID
             ) {
               filteringFoodItems.push(food);
             }
             setFilteredFoodItems(filteringFoodItems);
           }
         });

         return () => unsubscribe();
       }, []);

       return (
         <View>
           <View
             style={{ flexDirection: "row", marginBottom: 10, marginTop: 10 }}
           >
             <Icon source={"alert-circle"} size={35} />
             <Text style={{ fontSize: 25 }}>
               Fruits that are expiring in 5 days:{" "}
             </Text>
           </View>
           <FlatList
             data={filteredFoodItems}
             renderItem={({ item }) => {
               return (
                 <SafeAreaView style={{ borderWidth: 1, marginHorizontal: 5 }}>
                   <Text
                     key={item.id}
                    style={{ fontSize: 15, padding: 0, marginHorizontal: 5 }}
                  >
                     FRUIT NAME: {item.data.foodName}
                   </Text>
                   <Text
                     style={{ fontSize: 15, padding: 0, marginHorizontal: 5 }}
                   >
                     EXPIRATION DAY:{" "}
                     {item.data.expiryDate.toDate().toLocaleString()}
                   </Text>
                 </SafeAreaView>
               );
             }}
           />
         </View>
       );
     }
     return filteringFoodItems;
     };*/

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
        if (food.data.isadded === true && food.data.userID === loginID) {
          filteringFoodItems.push(food);
          //filteringFoodItems = filterFunction(filteringFoodItems);
        }
      }
      setFoodsfetch(filteringFoodItems);
      alertFunction(filteringFoodItems);
    });

    return () => unsubscribe();
  }, []);
  function EditFood({ itemID }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [foodName, setFoodName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [imageUri, setImageUri] = useState("");
    const [expiryInDays, setExpiryInDays] = useState(0);
    const [sliderMaxLength, setSliderMaxLength] = useState(0);
    const [sliderCurrentLength, setSliderCurrentLength] = useState(0);
    const [sliderCurrentLengthBefore, setSliderCurrentLengthBefore] =
      useState(0);
    const [editImage, setEditImage] = useState(null);

    useEffect(() => {
      if (modalVisible && itemID) {
        fetchEditingFoodData(itemID);
      }
    }, [modalVisible, itemID]);

    const fetchEditingFoodData = async (itemID) => {
      const docRef = doc(db, "foodCollection", itemID);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      setFoodName(data.foodName);
      setQuantity(data.quantity.toString());
      setImageUri(data.fruitImageURI.toString());
      const daysUntilExpiry = dateToDayConversion(data.expiryDate);
      setExpiryInDays(daysUntilExpiry);

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
        } else {
          newRipeness = "Overripe";
        }
      } else if (foodName === "Pineapple") {
        if (newExpiryInDays > 7) {
          newRipeness = "Underripe";
          daysUntilRipe = newExpiryInDays - 7;
        } else if (newExpiryInDays > 0 && newExpiryInDays <= 7) {
          newRipeness = "Ripe";
        } else {
          newRipeness = "Overripe";
        }
      } else if (foodName === "Avocado") {
        if (newExpiryInDays > 3) {
          newRipeness = "Underripe";
          daysUntilRipe = newExpiryInDays - 3;
        } else if (newExpiryInDays > 0 && newExpiryInDays <= 3) {
          newRipeness = "Ripe";
        } else {
          newRipeness = "Overripe";
        }
      }
      const newRipeningDate = new Date(
        Date.now() + daysUntilRipe * 24 * 60 * 60 * 1000
      );
      try {
        await updateDoc(doc(db, "foodCollection", itemID), {
          foodName: foodName,
          quantity: parseInt(quantity),
          expiryDate: newExpiryDate,
          fruitImageURI: imageUri,
          currentRipenessStatus: newRipeness,
          futureRipeningDate: newRipeningDate,
        });
        setModalVisible(false);
        if (newRipeness != "Overripe") {
          Alert.alert("Food details updated successfully!");
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
          const base64 = await FileSystem.readAsStringAsync(
            compressedImage.uri,
            {
              encoding: "base64",
            }
          );

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
                        resizeMode: "cover",
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
                    <Text style={{ fontSize: 23 }}>Choose Fruit</Text>
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
                />
                <Text style={{ fontSize: 23, paddingBottom: 10 }}>
                  Enter ripeness
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
                        return `Best before in ${sliderMaxLength - sliderCurrentLength
                          } days`;
                      }
                    } else if (foodName === "Pineapple") {
                      if (sliderCurrentLength < 6) {
                        return `Ripens in ${6 - sliderCurrentLength} days`;
                      } else {
                        return `Best before in ${sliderMaxLength - sliderCurrentLength
                          } days`;
                      }
                    } else if (foodName === "Avocado") {
                      if (sliderCurrentLength < 5) {
                        return `Ripens in ${5 - sliderCurrentLength} days`;
                      } else {
                        return `Best before in ${sliderMaxLength - sliderCurrentLength
                          } days`;
                      }
                    }
                  })()}
                </Text>
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

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleIconClick = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleButtonClick = (item) => {
    1;
    console.log(`Button ${item} clicked`);
    setIsDropdownVisible(false); // Close the dropdown after a button is clicked
  };

  /*function WarningDashboardVisibility() {
    /*const [isWarningDashboardVisible, setIsWarningDashboardVisible] =
      useState(false);
  
    const handleToggleWarningDashboardVisibility = async () => {
      if (isWarningDashboardVisible === false) {
        setIsWarningDashboardVisible(true);
      } else {
        setIsWarningDashboardVisible(false);
      }
    };
  
    return (
      <View>
        <View style={{ flexDirection: "row" }}>
          <View>
            <Button onPress={handleToggleWarningDashboardVisibility}>
              Expired
            </Button>
          </View>
          <View>
            <Button onPress={handleToggleWarningDashboardVisibility}>
              Expiring in 3 days
            </Button>
          </View>
          <View>
            <Button onPress={handleToggleWarningDashboardVisibility}>
              Expiring in 5 days
            </Button>
          </View>
        </View>
        <View>
          {isWarningDashboardVisible ? <CheckExpired /> : <CheckExpiryDate />}
        </View>
      </View>
    ); */

  const [visibleComponent, setVisibleComponent] = useState(null);

  const handleToggleWarningDashboardVisibility = (component) => {
    setVisibleComponent(component);
  };

  return (
    <View>
      <Provider>
        <View style={styles.container}>
          <IconButton
            icon="sort-variant"
            iconColor={MD3Colors.neutral10}
            size={30}
            onPress={handleIconClick}
          />
          <Modal
            transparent={true}
            visible={isDropdownVisible}
            animationType="fade"
            onRequestClose={() => setIsDropdownVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalBackground}
              activeOpacity={1}
              onPressOut={() => setIsDropdownVisible(false)}
            >
              <View style={styles.dropdownContainer}>
                <Button
                  mode="contained"
                  buttonColor="#FF0000"
                  textColor={MD3Colors.neutral10}
                  onPress={() => handleToggleWarningDashboardVisibility("expired")}
                >
                  Inedible
                </Button>
                <Button
                  mode="contained"
                  buttonColor="#FFD700"
                  textColor={MD3Colors.neutral10}
                  onPress={() => handleToggleWarningDashboardVisibility("expiring3")}
                >
                  Best before 3 days
                </Button>
                <Button
                  mode="contained"
                  buttonColor="#00FF00"
                  textColor={MD3Colors.neutral10}
                  onPress={() => handleToggleWarningDashboardVisibility("expiring5")}
                >
                  Best before 5 days and more
                </Button>
              </View>
              <View>
                {visibleComponent === "expired" && <CheckExpired />}
                {visibleComponent === "expiring3" && <CheckExpiryDate />}
                {visibleComponent === "expiring5" && <CheckExpiryDate5 />}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </Provider>
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
                  //padding: 10,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,

                  elevation: 4,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Image
                    style={styles.image}
                    source={{ uri: item.data.fruitImageURI }}
                  ></Image>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    {item.data.foodName}

                    <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
                  </Text>
                  {item.data.currentRipenessStatus === "Underripe" ? (
                    <View>
                      <Text>
                        Ripens in:{" "}
                        {dateToDayConversion(item.data.futureRipeningDate)} Days
                      </Text>
                      <Text>
                        Ripens on:{" "}
                        {item.data.futureRipeningDate
                          .toDate()
                          .toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                      </Text>
                      <Text>
                        Best Before{" (days)"}:{" "}
                        {dateToDayConversion(item.data.expiryDate)} Days
                      </Text>
                      <Text>
                        Best Before:{" "}
                        {item.data.expiryDate.toDate().toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  ) : null}
                  {item.data.currentRipenessStatus === "Ripe" ? (
                    <View>
                      <Text>
                        Best Before{" (days)"}:{" "}
                        {dateToDayConversion(item.data.expiryDate)} Days
                      </Text>
                      <Text>
                        Best Before:{" "}
                        {item.data.expiryDate.toDate().toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  ) : null}
                  {/* <Text>expires in:</Text>
                  <Text>
                    expires on: {item.data.expiryDate.toDate().toLocaleString()}
                  </Text> */}
                </View>
                <IconButton
                  icon="information"
                  iconColor={"blue"}
                  size={30}
                  style={{ marginRight: -20 }}
                  onPress={() => browserFunction(item)}
                />
                <IconButton
                  icon="delete"
                  iconColor={MD3Colors.error50}
                  size={30}
                  onPress={() => deleteDoc(doc(db, "foodCollection", item.id))}
                />

                <Divider />
                <View style={{ marginLeft: -25 }}>
                  <EditFood itemID={item.id} />
                </View>
              </View>
            </SafeAreaView>
          );
        }}
      />
    </View>
  );
}

function CheckExpiryDate5() {
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  var today = new Date();
  const FiveDaysFromNow = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
  const three = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const { loginID } = useContext(AuthContext);

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
      for (const food of foods) {
        if (
          food.data.expiryDate.toDate() > three &&
          food.data.expiryDate.toDate() > today &&
          food.data.isadded == true &&
          food.data.userID === loginID
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFilteredFoodItems(filteringFoodItems);
    });

    return () => unsubscribe();
  }, []);
  
  return (
    <View>
    
      <View style={{ flexDirection: "row", marginBottom: 10, marginTop: 100}}>
        <Icon source={"alert-circle"} size={35} />
        <Text style={{ fontSize: 25}}>
          Fruits that are spoiling in 5 days or more:{" "}
        </Text>
      </View>
      <FlatList
        data={filteredFoodItems}
        renderItem={({ item }) => {
          return (
            <SafeAreaView style={{ borderWidth: 1, marginHorizontal: 5, backgroundColor: 'white'}}>
              <Text
                key={item.id}
                style={{ fontSize: 15, padding: 0, marginHorizontal: 5 }}
              >
                FRUIT NAME: {item.data.foodName}
              </Text>
              <Text style={{ fontSize: 15, padding: 0, marginHorizontal: 5 }}>
                EXPIRATION DAY: {item.data.expiryDate.toDate().toLocaleString()}
              </Text>
            </SafeAreaView>
          );
        }}
      />
    </View>
  );
}
//This function queries and retrieves information from the database, from there it will compare each item's expiration date with a date that is set 3 days from now, if an expiration date falls within 3 days it will add it to the filtered array from there the filtered array of expiring items will be displayed in a flatlist -Faiz
function CheckExpiryDate() {
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  var today = new Date();
  const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const { loginID } = useContext(AuthContext);

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
      for (const food of foods) {
        if (
          food.data.expiryDate.toDate() <= threeDaysFromNow &&
          food.data.expiryDate.toDate() > today &&
          food.data.isadded == true &&
          food.data.userID === loginID
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFilteredFoodItems(filteringFoodItems);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View>
      <View style={{ flexDirection: "row", marginBottom: 10, marginTop: 100 }}>
        <Icon source={"alert-circle"} size={35} />
        <Text style={{ fontSize: 25 }}>
          Fruits that are spoiling in 3 days:{" "}
        </Text>
      </View>
      <FlatList
        data={filteredFoodItems}
        renderItem={({ item }) => {
          return (

            <SafeAreaView style={{ borderWidth: 1, marginHorizontal: 5}}>
              
              <Text
                key={item.id}
                style={{ fontSize: 15, padding: 0, marginHorizontal: 5 }}
              >
                FRUIT NAME: {item.data.foodName}
              </Text>
              <Text style={{ fontSize: 15, padding: 0, marginHorizontal: 5 }}>
                EXPIRATION DAY: {item.data.expiryDate.toDate().toLocaleString()}
              </Text>
            
            </SafeAreaView>
  );
}}
/>
    </View >
  );
}
function CheckExpired() {
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  var today = new Date();
  const { loginID } = useContext(AuthContext);

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
      for (const food of foods) {
        if (
          food.data.expiryDate.toDate() < today &&
          food.data.isadded == true &&
          food.data.userID === loginID
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFilteredFoodItems(filteringFoodItems);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View>
      <View style={{ flexDirection: "row", marginBottom: 10, marginTop: 100 }}>
        <Icon source={"alert-circle"} size={35} />
        <Text style={{ fontSize: 25 }}>Fruits that are spoilt: </Text>
      </View>
      <FlatList
        data={filteredFoodItems}
        renderItem={({ item }) => {
          return (
            <SafeAreaView style={{ borderWidth: 1, marginHorizontal: 5 }}>
              <Text
                key={item.id}
                style={{ fontSize: 15, padding: 0, marginHorizontal: 5 }}
              >
                FRUIT NAME: {item.data.foodName}
              </Text>
              <Text style={{ fontSize: 15, padding: 0, marginHorizontal: 5 }}>
                EXPIRATION DAY: {item.data.expiryDate.toDate().toLocaleString()}
              </Text>
            </SafeAreaView>
          );
        }}
      />
    </View>
  );
}

/*function WarningDashboardVisibility() {
  /*const [isWarningDashboardVisible, setIsWarningDashboardVisible] =
    useState(false);

  const handleToggleWarningDashboardVisibility = async () => {
    if (isWarningDashboardVisible === false) {
      setIsWarningDashboardVisible(true);
    } else {
      setIsWarningDashboardVisible(false);
    }
  };

  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        <View>
          <Button onPress={handleToggleWarningDashboardVisibility}>
            Expired
          </Button>
        </View>
        <View>
          <Button onPress={handleToggleWarningDashboardVisibility}>
            Expiring in 3 days
          </Button>
        </View>
        <View>
          <Button onPress={handleToggleWarningDashboardVisibility}>
            Expiring in 5 days
          </Button>
        </View>
      </View>
      <View>
        {isWarningDashboardVisible ? <CheckExpired /> : <CheckExpiryDate />}
      </View>
    </View>
  ); 
  
  const [visibleComponent, setVisibleComponent] = useState(null);

  const handleToggleWarningDashboardVisibility = (component) => {
    setVisibleComponent(component);
  };

  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        <View>
          <Button
            onPress={() => handleToggleWarningDashboardVisibility("expired")}
          >
            <Text style={{ color: "red" }}>Expired</Text>
          </Button>
        </View>
        <View>
          <Button
            onPress={() => handleToggleWarningDashboardVisibility("expiring3")}
          >
            <Text style={{ color: "yellow" }}>Expiring in 3 days</Text>
          </Button>
        </View>
        <View>
          <Button
            onPress={() => handleToggleWarningDashboardVisibility("expiring5")}
          >
            <Text style={{ color: "green" }}>Expiring in 5 days</Text>
          </Button>
        </View>
      </View>
      <View>
        {visibleComponent === "expired" && <CheckExpired />}
        {visibleComponent === "expiring3" && <CheckExpiryDate />}
        {visibleComponent === "expiring5" && <CheckExpiryDate5 />}
      </View>
    </View>
  );
}
*/
export default function App() {
  return (
    //add new screens here for navigation -Don
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="addFoodScreen"
            component={AddFoodScreen}
            options={{
              headerStyle: { backgroundColor: "green" },
              title: "Add food",
            }}
          />
          <Stack.Screen
            name="aiAccuracyForm"
            component={AiAccuracyForm}
            options={{
              headerStyle: { backgroundColor: "green" },
              title: "AI Accuracy Form",
            }}
          />
          <Stack.Screen
            name="gamify"
            component={Gamify}
            options={{
              headerStyle: { backgroundColor: "green" },
              title: "Points and achievements",
            }}
          />
          <Stack.Screen
            name="loginScreen"
            component={LoginScreen}
            options={{
              headerStyle: { backgroundColor: "green" },
              title: "Login Screen",
            }}
          />
          <Stack.Screen
            name="signUpScreen"
            component={SignUpScreen}
            options={{
              headerStyle: { backgroundColor: "green" },
              title: "Sign Up Screen",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

const HomeScreen = ({ navigation }) => {
  const { isLoggedIn, logout } = useContext(AuthContext);

  //Handles logout, calls upon logout method which sets isLoggedIn to false. -Faiz
  const handleLogout = () => {
    logout();
    Alert.alert("", "You Have Successfully Logged Out");
  };

  return (
    <View style={styles.backGround}>
      <ScrollView>
        <View
          style={{
            flex: 1,
            height: 200,
            backgroundColor: "lightgreen",
            borderRadius: 30,
          }}
        >
          <StatusBar backgroundColor="green" barStyle="default" />
          <View style={{ paddingTop: 35, alignItems: "left", height: 55 }}>
            <IconButton
              icon="trophy"
              mode="contained-tonal"
              buttonColor="yellow"
              onPress={() => navigation.navigate("gamify")}
            ></IconButton>
          </View>
          <Text style={{ textAlign: "center", fontSize: 20 }}>Fruit List</Text>
          <Image
            source={logoImg}
            style={{ width: 100, height: 100, alignSelf: "center" }}
          />
        </View>
        <View>{isLoggedIn ? <FetchFoodData /> : null}</View>

      </ScrollView>
      {isLoggedIn ? (
        <View style={styles.addFoodButton}>
          <FAB
            icon="plus"
            rippleColor="purple"
            onPress={() => navigation.navigate("addFoodScreen")}
          />
        </View>
      ) : null}
      {isLoggedIn ? (
        <View style={styles.aiAccuracyFormButton}>
          <FAB
            icon="ballot"
            rippleColor="purple"
            onPress={() => navigation.navigate("aiAccuracyForm")}
          />
        </View>
      ) : null}
      {!isLoggedIn ? (
        <View style={styles.loginButton}>
          <FAB
            icon="login"
            rippleColor="purple"
            onPress={() => navigation.navigate("loginScreen")}
          />
        </View>
      ) : null}
      {isLoggedIn ? (
        <View style={styles.loginButton}>
          <FAB icon="logout" rippleColor="purple" onPress={handleLogout} />
        </View>
      ) : null}
    </View>
  );
};

const windowHeight = Dimensions.get("window").height;
const modalheight = windowHeight - 200;
const styles = StyleSheet.create({
  backGround: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "white",
  },
  addFoodButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
  },
  aiAccuracyFormButton: {
    position: "absolute",
    bottom: 150,
    right: 20,
  },
  loginButton: {
    position: "absolute",
    bottom: 10,
    right: 20,
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
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },

  modalText: {
    textAlign: "center",
    fontSize: 35,
  },
  input2: {
    margin: 12,
    borderWidth: 1,
    width: "95%",
    marginVertical: 10,
  },
  image: {
    width: 110,
    height: 150,
    resizeMode: "contain",
  },
});
