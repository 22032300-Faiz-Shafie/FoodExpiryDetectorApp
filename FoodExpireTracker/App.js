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
  serverTimestamp,
  setDoc,
  increment,
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
import { Rating } from 'react-native-ratings';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications
const Stack = createNativeStackNavigator();
const logoImg = require("./assets/download-removebg-preview.png");
const addImg = require("./assets/add.png");

//fetches all food with isadded as true, so that only added foods are displayed -Don
function FetchFoodData() {
  const [foodsfetch, setFoodsfetch] = useState([]);
  const foodsCol = collection(db, "foodCollection");
  const { loginID } = useContext(AuthContext);
  const filteringFoodItems = [];
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
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
      if (dateToDayConversion(fruit.data.expiryDate) <= 0) {
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
        if (
          food.data.isadded === true &&
          food.data.userID === loginID &&
          food.data.isDeleted == false
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFoodsfetch(filteringFoodItems);
      alertFunction(filteringFoodItems);
    });

    return () => unsubscribe();
  }, []);
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
    const [aiAccuracyRemarkValue, setAiAccuracyRemarkValue] = useState("");
    const [aiSatisfactionResultValue, setAiSatisfactionResultValue] = useState(0);

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
        const docRef = doc(db, "foodCollection", itemID);
        const docSnap = await getDoc(docRef);
        const currentVersion = docSnap.data().version;
        const newVersion = currentVersion + 1;
        const editHistoryRef = collection(
          db,
          "foodCollection",
          itemID,
          "editHistory"
        );
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
          aiAccuracyRemark: aiAccuracyRemarkValue,
          aiSatisfactionResult: aiSatisfactionResultValue,
          version: increment(1),
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
                  style={{
                    fontSize: 17,
                    paddingBottom: 10,
                    fontWeight: "bold",
                  }}
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
  const makeDelete = useCallback((item) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (itemToDelete) {
      await updateDoc(doc(db, "foodCollection", itemToDelete.id), {
        isDeleted: true,
        DeleteTimestamp: serverTimestamp(),
      });
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  }, [itemToDelete]);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [IsDropdownVisible, SetIsDropdownVisible] = useState(false);
  const handleIconClick = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handlePress = () => {
    SetIsDropdownVisible(!IsDropdownVisible);
  }
  const [menuVisible, setMenuVisible] = useState(false);



  const handleButtonClick = (item) => {
    1;
    console.log(`Button ${item} clicked`);
    setIsDropdownVisible(false); // Close the dropdown after a button is clicked
  };

  const [visibleComponent, setVisibleComponent] = useState(null);

  const handleToggleWarningDashboardVisibility = (component) => {
    setVisibleComponent(component);
  };

  const handlesort = (component) => {
    setVisibleComponent(component);
  };


  return (
    <View>
      <Provider>
        <View style={styles.container}>
          <View
            style={[
              styles.container,
              { flexDirection: "row", justifyContent: "flex-end" },
            ]}
          >
            <View style={{ position: "absolute", left: 8 }}>
              <IconButton
                icon="sort-variant"
                iconColor={MD3Colors.neutral10}
                size={30}
                onPress={handlePress}
              />
            </View>
            <Modal
              transparent={true}
              visible={IsDropdownVisible}
              animationType="fade"
              onRequestClose={() => SetIsDropdownVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalBackground}
                activeOpacity={1}
                onPressOut={() => SetIsDropdownVisible(false)}
              >
                <View style={styles.dropdownContainer}>
                  <Button
                    mode="contained"
                    buttonColor="#00FF00"
                    textColor={MD3Colors.neutral10}
                    onPress={() =>
                      handlesort("most")
                    }
                  >
                    Most time left
                  </Button>
                  <Button
                    mode="contained"
                    buttonColor="#FF0000"
                    textColor={MD3Colors.neutral10}
                    onPress={() =>
                      handlesort("least")
                    }
                  >
                    Least time left
                  </Button>
                </View>
                <View>
                  {visibleComponent === "most" && <MostTimeleft />}
                  {visibleComponent === "least" && <LeastTimeleft />}
                </View>
                <IconButton
                icon="close"
                iconColor={MD3Colors.neutral10}
                size={30}
                onPress={() => SetIsDropdownVisible(false)}
                containerColor="white"
                style={{ marginTop: 20, borderRadius: 50 }}
              />
              </TouchableOpacity>
            </Modal>
            <IconButton
              icon="filter-outline"
              iconColor={MD3Colors.neutral10}
              size={30}
              onPress={handleIconClick}
            />
          </View>
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
                  onPress={() =>
                    handleToggleWarningDashboardVisibility("expired")
                  }
                >
                  Inedible
                </Button>
                <Button
                  mode="contained"
                  buttonColor="#FFD700"
                  textColor={MD3Colors.neutral10}
                  onPress={() =>
                    handleToggleWarningDashboardVisibility("expiring3")
                  }
                >
                  Best before 3 days or more
                </Button>
                <Button
                  mode="contained"
                  buttonColor="#00FF00"
                  textColor={MD3Colors.neutral10}
                  onPress={() =>
                    handleToggleWarningDashboardVisibility("expiring5")
                  }
                >
                  Best before 5 days or more
                </Button>
                <Button
                  mode="contained"
                  textColor={MD3Colors.neutral10}
                  onPress={() =>
                    handlesort("mango")
                  }
                >
                  Mango
                </Button>
                <Button
                  mode="contained"
                  textColor={MD3Colors.neutral10}
                  onPress={() =>
                    handlesort("avacado")
                  }
                >
                  Avocado
                </Button>
                <Button
                  mode="contained"
                  textColor={MD3Colors.neutral10}
                  onPress={() =>
                    handlesort("pineapple")
                  }
                >
                  Pineapple
                </Button>
              </View>
              
              <View>
                {visibleComponent === "expired" && <CheckExpired />}
                {visibleComponent === "expiring3" && <CheckExpiryDate />}
                {visibleComponent === "expiring5" && <CheckExpiryDate5 />}
                {visibleComponent === "mango" && <Mango />}
                {visibleComponent === "avacado" && <Avocado />}
                {visibleComponent === "pineapple" && <Pineapple />}
              </View>
              <IconButton
                icon="close"
                iconColor={MD3Colors.neutral10}
                size={30}
                onPress={() => setIsDropdownVisible(false)}
                containerColor="white"
                style={{ marginTop: 20, borderRadius: 50 }}
              />
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
                  height: 200
                }}
              >
                <View style={styles.imageContainer}>
                  <Image
                    style={styles.image}
                    source={{ uri: item.data.fruitImageURI }}
                  ></Image>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: "bold", textDecorationLine: "underline" }}>
                    {item.data.foodName}

                    <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
                  </Text>
                  {item.data.currentRipenessStatus === "Underripe" ? (
                    <View>
                      <Text style={styles.listText}>
                        <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                        {item.data.currentRipenessStatus}
                      </Text>
                      <Text style={styles.listText}>
                        <Text style={{ fontWeight: "bold" }}>Ripens in:{"\n"}</Text>
                        {dateToDayConversion(item.data.futureRipeningDate)} Days ({item.data.futureRipeningDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                      </Text>
                      <Text style={styles.listText}>
                        <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                        {dateToDayConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                      </Text>
                    </View>
                  ) : null}
                  {item.data.currentRipenessStatus === "Ripe" ? (
                    <View>
                      <Text style={styles.listText}>
                        <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                        {item.data.currentRipenessStatus}
                      </Text>
                      <Text style={styles.listText}>
                        <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                        {dateToDayConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                      </Text>
                    </View>
                  ) : null}
                  {item.data.currentRipenessStatus === "Overripe" ? (
                    <View>
                      <Text style={styles.listText}>
                        <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                        {item.data.currentRipenessStatus}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={{ flexDirection: "column" }}>
                  <IconButton
                    icon="information"
                    iconColor={"blue"}
                    size={30}
                    style={{ marginBottom: -10 }}
                    onPress={() => browserFunction(item)}
                  />
                  <IconButton
                    icon="delete"
                    iconColor={MD3Colors.error50}
                    size={30}
                    onPress={() => makeDelete(item)}
                  />


                  <View style={{ marginTop: 10 }}>
                    <EditFood itemID={item.id} />
                  </View>
                </View>
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
            </SafeAreaView>
          );
        }}
      />
    </View>
  );
}
function Mango (){
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  
  const dateToDaysConversion = (givenDate) => {
    currentDate = new Date();
    expiryDate = givenDate.toDate();
    const timeDifference = expiryDate - currentDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
  };

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
          food.data.foodName.includes("Mango") &&
          food.data.isadded == true &&
          food.data.userID === loginID &&
          food.data.isDeleted == false
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFilteredFoodItems(filteringFoodItems);
    });
    return () => unsubscribe();
  }, []);
  const [modalVisible, setModalVisible] = useState(true);
  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{ flexDirection: "row", marginBottom: 10, marginTop: 100 }}
        >
          <Icon source={"alert-circle"} size={35} />
          <Text style={{ fontSize: 25 }}>
            Mango:{" "}
          </Text>
        </View>
        <FlatList
          data={filteredFoodItems}
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
                    height: 200
                  }}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.image}
                      source={{ uri: item.data.fruitImageURI }}
                    ></Image>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", textDecorationLine: "underline" }}>
                      {item.data.foodName}

                      <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
                    </Text>
                    {item.data.currentRipenessStatus === "Underripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripens in:{"\n"}</Text>
                          {dateToDaysConversion(item.data.futureRipeningDate)} Days ({item.data.futureRipeningDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Ripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Overripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </SafeAreaView>
            );
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 5,
            marginTop: 20,
          }}
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <Text style={{ fontSize: 18, color: "white" }}>Close</Text>
        </TouchableOpacity>
      </View>

    </Modal>

  );
};

function Pineapple (){
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  
  const dateToDaysConversion = (givenDate) => {
    currentDate = new Date();
    expiryDate = givenDate.toDate();
    const timeDifference = expiryDate - currentDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
  };

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
          food.data.foodName.includes("Pineapple") &&
          food.data.isadded == true &&
          food.data.userID === loginID &&
          food.data.isDeleted == false
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFilteredFoodItems(filteringFoodItems);
    });
    return () => unsubscribe();
  }, []);
  const [modalVisible, setModalVisible] = useState(true);
  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{ flexDirection: "row", marginBottom: 10, marginTop: 100 }}
        >
          <Icon source={"alert-circle"} size={35} />
          <Text style={{ fontSize: 25 }}>
            Pineapple:{" "}
          </Text>
        </View>
        <FlatList
          data={filteredFoodItems}
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
                    height: 200
                  }}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.image}
                      source={{ uri: item.data.fruitImageURI }}
                    ></Image>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", textDecorationLine: "underline" }}>
                      {item.data.foodName}

                      <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
                    </Text>
                    {item.data.currentRipenessStatus === "Underripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripens in:{"\n"}</Text>
                          {dateToDaysConversion(item.data.futureRipeningDate)} Days ({item.data.futureRipeningDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Ripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Overripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </SafeAreaView>
            );
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 5,
            marginTop: 20,
          }}
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <Text style={{ fontSize: 18, color: "white" }}>Close</Text>
        </TouchableOpacity>
      </View>

    </Modal>

  );
};
function Avocado (){
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  
  const dateToDaysConversion = (givenDate) => {
    currentDate = new Date();
    expiryDate = givenDate.toDate();
    const timeDifference = expiryDate - currentDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
  };
  
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
          food.data.foodName.includes("Avocado") &&
          food.data.isadded == true &&
          food.data.userID === loginID &&
          food.data.isDeleted == false
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFilteredFoodItems(filteringFoodItems);
    });
    return () => unsubscribe();
  }, []);
  const [modalVisible, setModalVisible] = useState(true);
  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{ flexDirection: "row", marginBottom: 10, marginTop: 100 }}
        >
          <Icon source={"alert-circle"} size={35} />
          <Text style={{ fontSize: 25 }}>
            Avocado:{" "}
          </Text>
        </View>
        <FlatList
          data={filteredFoodItems}
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
                    height: 200
                  }}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.image}
                      source={{ uri: item.data.fruitImageURI }}
                    ></Image>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", textDecorationLine: "underline" }}>
                      {item.data.foodName}

                      <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
                    </Text>
                    {item.data.currentRipenessStatus === "Underripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripens in:{"\n"}</Text>
                          {dateToDaysConversion(item.data.futureRipeningDate)} Days ({item.data.futureRipeningDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Ripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Overripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </SafeAreaView>
            );
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 5,
            marginTop: 20,
          }}
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <Text style={{ fontSize: 18, color: "white" }}>Close</Text>
        </TouchableOpacity>
      </View>

    </Modal>

  );
};

function MostTimeleft() {
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  
  const { loginID } = useContext(AuthContext);
  
  const dateToDaysConversion = (givenDate) => {
    currentDate = new Date();
    expiryDate = givenDate.toDate();
    const timeDifference = expiryDate - currentDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
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
      for (const food of foods) {
        if (
          food.data.isadded == true &&
          food.data.userID === loginID &&
          food.data.isDeleted == false
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFilteredFoodItems(filteringFoodItems);
    });
    return () => unsubscribe();
  }, []);
  const [modalVisible, setModalVisible] = useState(true);
  const sortbydateascending=[...filteredFoodItems].sort((a, b) => a.data.expiryDate - b.data.expiryDate);
  const sortbydatedescending=[...filteredFoodItems].sort((a, b) => b.data.expiryDate - a.data.expiryDate);
  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{ flexDirection: "row", marginBottom: 10, marginTop: 100 }}
        >
          <Icon source={"alert-circle"} size={35} />
          <Text style={{ fontSize: 25 }}>
            Most time left:{" "}
          </Text>
        </View>
        <FlatList
          data={sortbydatedescending}
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
                    height: 200
                  }}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.image}
                      source={{ uri: item.data.fruitImageURI }}
                    ></Image>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", textDecorationLine: "underline" }}>
                      {item.data.foodName}

                      <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
                    </Text>
                    {item.data.currentRipenessStatus === "Underripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripens in:{"\n"}</Text>
                          {dateToDaysConversion(item.data.futureRipeningDate)} Days ({item.data.futureRipeningDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Ripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Overripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </SafeAreaView>
            );
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 5,
            marginTop: 20,
          }}
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <Text style={{ fontSize: 18, color: "white" }}>Close</Text>
        </TouchableOpacity>
      </View>

    </Modal>

  );
};

function LeastTimeleft() {
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  
  const { loginID } = useContext(AuthContext);
  
  const dateToDaysConversion = (givenDate) => {
    currentDate = new Date();
    expiryDate = givenDate.toDate();
    const timeDifference = expiryDate - currentDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
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
      for (const food of foods) {
        if (
          food.data.isadded == true &&
          food.data.userID === loginID &&
          food.data.isDeleted == false
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFilteredFoodItems(filteringFoodItems);
    });
    return () => unsubscribe();
  }, []);
  const [modalVisible, setModalVisible] = useState(true);
  const sortbydateascending=[...filteredFoodItems].sort((a, b) => a.data.expiryDate - b.data.expiryDate);
 
  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{ flexDirection: "row", marginBottom: 10, marginTop: 100 }}
        >
          <Icon source={"alert-circle"} size={35} />
          <Text style={{ fontSize: 25 }}>
            Least time left:{" "}
          </Text>
        </View>
        <FlatList
          data={sortbydateascending}
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
                    height: 200
                  }}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.image}
                      source={{ uri: item.data.fruitImageURI }}
                    ></Image>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", textDecorationLine: "underline" }}>
                      {item.data.foodName}

                      <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
                    </Text>
                    {item.data.currentRipenessStatus === "Underripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripens in:{"\n"}</Text>
                          {dateToDaysConversion(item.data.futureRipeningDate)} Days ({item.data.futureRipeningDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Ripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Overripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </SafeAreaView>
            );
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 5,
            marginTop: 20,
          }}
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <Text style={{ fontSize: 18, color: "white" }}>Close</Text>
        </TouchableOpacity>
      </View>

    </Modal>

  );
};



function CheckExpiryDate5() {
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  var today = new Date();
  //const FiveDaysFromNow = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
  const three = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const { loginID } = useContext(AuthContext);
  const dateToDaysConversion = (givenDate) => {
    currentDate = new Date();
    expiryDate = givenDate.toDate();
    const timeDifference = expiryDate - currentDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
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
      for (const food of foods) {
        if (
          food.data.expiryDate.toDate() > three &&
          food.data.expiryDate.toDate() > today &&
          food.data.isadded == true &&
          food.data.userID === loginID &&
          food.data.isDeleted == false
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFilteredFoodItems(filteringFoodItems);
    });

    return () => unsubscribe();
  }, []);
  const [modalVisible, setModalVisible] = useState(true);

  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{ flexDirection: "row", marginBottom: 10, marginTop: 100 }}
        >
          <Icon source={"alert-circle"} size={35} />
          <Text style={{ fontSize: 25 }}>
            Fruits that are spoiling in 5 days or more:{" "}
          </Text>
        </View>
        <FlatList
          data={filteredFoodItems}
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
                    height: 200
                  }}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.image}
                      source={{ uri: item.data.fruitImageURI }}
                    ></Image>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", textDecorationLine: "underline" }}>
                      {item.data.foodName}

                      <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
                    </Text>
                    {item.data.currentRipenessStatus === "Underripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripens in:{"\n"}</Text>
                          {dateToDaysConversion(item.data.futureRipeningDate)} Days ({item.data.futureRipeningDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Ripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Overripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </SafeAreaView>
            );
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 5,
            marginTop: 20,
          }}
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <Text style={{ fontSize: 18, color: "white" }}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
//This function queries and retrieves information from the database, from there it will compare each item's expiration date with a date that is set 3 days from now, if an expiration date falls within 3 days it will add it to the filtered array from there the filtered array of expiring items will be displayed in a flatlist -Faiz
function CheckExpiryDate() {
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  var today = new Date();
  const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const { loginID } = useContext(AuthContext);
  const dateToDaysConversion = (givenDate) => {
    currentDate = new Date();
    expiryDate = givenDate.toDate();
    const timeDifference = expiryDate - currentDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
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
      for (const food of foods) {
        if (
          food.data.expiryDate.toDate() <= threeDaysFromNow &&
          food.data.expiryDate.toDate() > today &&
          food.data.isadded == true &&
          food.data.userID === loginID &&
          food.data.isDeleted == false
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFilteredFoodItems(filteringFoodItems);
    });

    return () => unsubscribe();
  }, []);

  const [modalVisible, setModalVisible] = useState(true);

  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{ flexDirection: "row", marginBottom: 10, marginTop: 100 }}
        >
          <Icon source={"alert-circle"} size={35} />
          <Text style={{ fontSize: 25 }}>
            Fruits that are spoiling in 3 days or more:{" "}
          </Text>
        </View>
        <FlatList
          data={filteredFoodItems}
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
                    height: 200
                  }}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.image}
                      source={{ uri: item.data.fruitImageURI }}
                    ></Image>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", textDecorationLine: "underline" }}>
                      {item.data.foodName}

                      <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
                    </Text>
                    {item.data.currentRipenessStatus === "Underripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripens in:{"\n"}</Text>
                          {dateToDaysConversion(item.data.futureRipeningDate)} Days ({item.data.futureRipeningDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Ripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Overripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </SafeAreaView>
            );
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 5,
            marginTop: 20,
          }}
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <Text style={{ fontSize: 18, color: "white" }}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
function CheckExpired() {
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  var today = new Date();
  const { loginID } = useContext(AuthContext);
  const dateToDaysConversion = (givenDate) => {
    currentDate = new Date();
    expiryDate = givenDate.toDate();
    const timeDifference = expiryDate - currentDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
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
      for (const food of foods) {
        if (
          food.data.expiryDate.toDate() < today &&
          food.data.isadded == true &&
          food.data.userID === loginID &&
          food.data.isDeleted == false
        ) {
          filteringFoodItems.push(food);
        }
      }
      setFilteredFoodItems(filteringFoodItems);
    });

    return () => unsubscribe();
  }, []);

  const [modalVisible, setModalVisible] = useState(true);

  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{ flexDirection: "row", marginBottom: 10, marginTop: 100 }}
        >
          <Icon source={"alert-circle"} size={35} />
          <Text style={{ fontSize: 25 }}>Fruits that are spoilt: </Text>
        </View>
        <FlatList
          data={filteredFoodItems}
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
                    height: 200
                  }}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.image}
                      source={{ uri: item.data.fruitImageURI }}
                    ></Image>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", textDecorationLine: "underline" }}>
                      {item.data.foodName}

                      <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
                    </Text>
                    {item.data.currentRipenessStatus === "Underripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripens in:{"\n"}</Text>
                          {dateToDaysConversion(item.data.futureRipeningDate)} Days ({item.data.futureRipeningDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Ripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Best Before:{"\n"}</Text>
                          {dateToDaysConversion(item.data.expiryDate)} Days ({item.data.expiryDate.toDate().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", })})
                        </Text>
                      </View>
                    ) : null}
                    {item.data.currentRipenessStatus === "Overripe" ? (
                      <View>
                        <Text style={styles.listText}>
                          <Text style={{ fontWeight: "bold" }}>Ripeness Status:{"\n"}</Text>
                          {item.data.currentRipenessStatus}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </SafeAreaView>
            );
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 5,
            marginTop: 20,
          }}
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <Text style={{ fontSize: 18, color: "white" }}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

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
              title: "Progress and rewards",
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
  const [ isLegendInformationViewable, setIsLegendInformationViewable] = useState(false); 

  //Handles logout, calls upon logout method which sets isLoggedIn to false. -Faiz
  const handleLogout = () => {
    logout();
    Alert.alert("", "You Have Successfully Logged Out");
  };

  //Hanles legend information Button -Faiz
  const handleLegendInformation = () => {
    setIsLegendInformationViewable(!isLegendInformationViewable);
  }

  //Handles legend information view -Faiz
  const LegendInformationModalView = () => {  

    return(
      <Modal
      animationType="slide"
      transparent={true}
      visible={isLegendInformationViewable}
      onRequestClose={() => {
        setIsLegendInformationViewable(!isLegendInformationViewable);
      }}
    >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <ScrollView>
          <Text style={styles.modalText}>Help Information</Text>
          <View style={{flexDirection: "column", alignItems: "center", padding: 20, marginHorizontal: 20}}>
          {/* <View style={{borderWidth: 1, borderRadius: 25}}>
            <Image source={require("./assets/LegendSort.jpg")} style={styles.legendImage}/>
          </View> */}
            <Text style={{fontSize: 30, fontWeight: "bold", textDecorationLine: "underline"}}>Main Menu</Text>
            <View style={{marginTop: 5, alignItems: "center"}}>
              <IconButton icon="trophy" style={{borderWidth: 1, borderRadius: 25}}/>
              <Text>This is the gamify button. Want to compete against others through giving feedbacks? Includes leaderboard, badges and rewards!</Text>
            </View>
            <View style={{marginTop: 20, alignItems: "center"}}>
              <IconButton icon="sort-variant" style={{borderWidth: 1, borderRadius: 25}}/>
              <Text>This is the sort button. It helps sort your fruit list the way you want it!</Text>
            </View>
            <View style={{marginTop: 20, alignItems: "center"}}>
              <IconButton icon="filter-outline" style={{borderWidth: 1, borderRadius: 25}}/>
              <Text>This is the filter button. It helps filter your fruit list based on your preferences!</Text>
            </View>
            <Text style={{fontSize: 30, fontWeight: "bold", textDecorationLine: "underline", marginTop: 30}}>Fruit Listings</Text>
            <View style={{marginTop: 5, alignItems: "center"}}>
              <IconButton icon="information" style={{borderWidth: 1, borderRadius: 25}}/>
              <Text>This is the nutrional information button. Want to know more about the fruit? Click here</Text>
            </View>
            <View style={{marginTop: 20, alignItems: "center"}}>
              <IconButton icon="delete" style={{borderWidth: 1, borderRadius: 25}}/>
              <Text>This is the delete button. It removes a fruit listing from your fruit list.</Text>
            </View>
            <View style={{marginTop: 20, alignItems: "center"}}>
              <IconButton icon="square-edit-outline" style={{borderWidth: 1, borderRadius: 25}}/>
              <Text>This is the edit button. AI made a mistake on something? Edit here manually, help give us feedback to improve our service!</Text>
            </View>
            <Text style={{fontSize: 30, fontWeight: "bold", textDecorationLine: "underline", marginTop: 30}}>Floating Action Buttons</Text>
            <View style={{marginTop: 5, alignItems: "center"}}>
              <IconButton icon="information" style={{borderWidth: 1, borderRadius: 25}}/>
              <Text>This is the nutrional information button. Want to know more about the fruit? Click here</Text>
            </View>
            <View style={{marginTop: 20, alignItems: "center"}}>
              <IconButton icon="square-edit-outline" style={{borderWidth: 1, borderRadius: 25}}/>
              <Text>This is the edit button. AI made a mistake on something? Edit here manually, help give us feedback to improve our service!</Text>
            </View>
            <View style={{marginTop: 20, alignItems: "center"}}>
              <IconButton icon="square-edit-outline" style={{borderWidth: 1, borderRadius: 25}}/>
              <Text>This is the edit button. AI made a mistake on something? Edit here manually, help give us feedback to improve our service!</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>

    </Modal>
    )
  }

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
          {isLoggedIn && 
            <View style={{position: "absolute", right: -5, top: 28}}>
              <IconButton icon="help-circle" size={35} onPress={() => handleLegendInformation()}/>
            </View>
          }
          <Text style={{ textAlign: "center", fontSize: 20 }}>Fruit List</Text>
          <Image
            source={logoImg}
            style={{ width: 100, height: 100, alignSelf: "center" }}
          />
        </View>
        <View>{isLoggedIn ? <FetchFoodData /> : null}</View>
        {LegendInformationModalView()}
      </ScrollView>
      {isLoggedIn ? (
        <View style={styles.addFoodButton}>
          <FAB
            icon="plus"
            rippleColor="green"
            onPress={() => navigation.navigate("addFoodScreen")}
            style={{ backgroundColor: "green" }}
            color="black"
          />
        </View>
      ) : null}
      {isLoggedIn ? (
        <View style={styles.aiAccuracyFormButton}>
          <FAB
            icon="ballot"
            rippleColor="green"
            onPress={() => navigation.navigate("aiAccuracyForm")}
            style={{ backgroundColor: "green" }}
            color="black"
          />
        </View>
      ) : null}
      {!isLoggedIn ? (
        <View style={styles.loginButton}>
          <FAB
            icon="login"
            rippleColor="green"
            onPress={() => navigation.navigate("loginScreen")}
            style={{ backgroundColor: "green" }}
            color="black"
          />
        </View>
      ) : null}
            {!isLoggedIn ? (
        <View style={styles.signUpButton}>
          <FAB
            icon="account-plus"
            rippleColor="green"
            onPress={() => navigation.navigate("signUpScreen")}
            style={{ backgroundColor: "green" }}
            color="black"
          />
        </View>
      ) : null}
      {isLoggedIn ? (
        <View style={styles.logoutButton}>
          <FAB
            icon="logout"
            rippleColor="green"
            onPress={handleLogout}
            style={{ backgroundColor: "green" }}
            color="black"
          />
        </View>
      ) : null}
    </View>
  );
};


const windowHeight = Dimensions.get("window").height;
const modalheight = windowHeight - 80;
const styles = StyleSheet.create({
  backGround: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "white",
  },
  addFoodButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
  },
  aiAccuracyFormButton: {
    position: "absolute",
    bottom: 30,
    right: 160,
  },
  logoutButton: {
    position: "absolute",
    bottom: 30,
    right: 320,
  },
  loginButton: {
    position: "absolute",
    bottom: 10,
    right: 20,
  },
  signUpButton: {
    position: "absolute",
    bottom: 80,
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
    fontWeight: "bold",
  },
  input2: {
    margin: 12,
    borderWidth: 1,
    width: "90%",
    height: 50,
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: "contain",
  },
  imageContainer: {
    width: 100,
    height: 100,
    overflow: 'hidden',
    marginRight: 10
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
    fontSize: 18
  }
});
