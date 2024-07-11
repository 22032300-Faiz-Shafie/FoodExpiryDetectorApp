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
} from "react-native";
import DropDown from "react-native-paper-dropdown";
import React, { useState, useEffect, useContext } from "react";
import { PaperProvider, Button, TextInput } from "react-native-paper";
import {
  doc,
  onSnapshot,
  query,
  collection,
  deleteDoc,
  addDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import Slider from "@react-native-community/slider";
import * as Clipboard from "expo-clipboard";
import AuthContext from "./AuthContext";

export default function App() {
  const foodsCol = collection(db, "foodCollection");
  const fruitAiAccuracyFormReportsCol = collection(
    db,
    "fruitAiAccuracyFormReports"
  );
  const [showDropDown, setShowDropDown] = useState(false);
  const [fruit, setFruit] = useState([]);
  const [selectedFruit, setSelectedFruit] = useState("");
  const [aiAccuracyRemark, setAiAccuracyRemark] = useState("");
  const [sliderValue, setSliderValue] = useState(0);
  const [dropdownKey, setDropdownKey] = useState(0);
  const [aiAccuracyReport, setAiAccuracyReport] = useState([]);
  const [aiAccuracyReportRefId, setAiAccuracyReportRefId] = useState("");
  const [isAiAccuracyReportRefIdVisible, setIsAiAccuracyReportRefIdVisible] =
    useState(false);
  const [newAiAccuracyReportRefId, setNewAiAccuracyReportRefId] = useState("");
  const { loginID } = useContext(AuthContext);
  const [availableFruitsList] = useState(["Mango", "Pineapple", "Avocado"]);
  const [fruitDropDownList, setFruitDropDownList] = useState([]);
  const [mangoRefIDList, setMangoRefIDList] = useState([]);
  const [pineappleRefIDList, setPineappleRefIDList] = useState([]);
  const [avocadoRefIDList, setAvocadoRefIDList] = useState([]);
  const [selectedFruitRefID, setSelectedFruitRefID] = useState("");
  const [showDropDown2, setShowDropDown2] = useState(false);

  //Fetch Fruit Data to populate dropdown list -Faiz
  useEffect(() => {
    const q = query(foodsCol);
    const fetchData = async () => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fruitList = [];
        const fruitListDropDown = [];
        const tempFruitListDropDown = [];
        const tempMangoRefIDList = [];
        const tempPineappleRefIDList = [];
        const tempAvocadoRefIDList = [];

        querySnapshot.forEach((doc) => {
          fruitList.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        for (const fruit of fruitList) {
          //Added Authentication filter and isAdded filter for drop down fruit list -Faiz
          if (fruit.data.isadded === true && fruit.data.userID === loginID) {
            fruitListDropDown.push({
              id: fruit.id,
              label: fruit.data.foodName,
              value: fruit.data.foodName,
            });

            if (fruit.data.foodName == "Mango") {
              tempMangoRefIDList.push({
                label: fruit.id,
                value: fruit.id,
              });
            }

            if (fruit.data.foodName == "Pineapple") {
              tempPineappleRefIDList.push({
                label: fruit.id,
                value: fruit.id,
              });
            }

            if (fruit.data.foodName == "Avocado") {
              tempAvocadoRefIDList.push({
                label: fruit.id,
                value: fruit.id,
              });
            }
          }
        }

        for (const fruit of availableFruitsList) {
          tempFruitListDropDown.push({
            label: fruit,
            value: fruit,
          });
        }

        setFruit(fruitListDropDown);
        setFruitDropDownList(tempFruitListDropDown);
        setMangoRefIDList(tempMangoRefIDList);
        setPineappleRefIDList(tempPineappleRefIDList);
        setAvocadoRefIDList(tempAvocadoRefIDList);
      });

      return () => unsubscribe();
    };

    fetchData();
  }, []);

  //Fetch Fruit Ai Accuracy Reports Data -Faiz
  useEffect(() => {
    const q = query(fruitAiAccuracyFormReportsCol);
    const fetchData = async () => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const aiReportList = [];
        querySnapshot.forEach((doc) => {
          aiReportList.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setAiAccuracyReport(aiReportList);
      });
      return () => unsubscribe();
    };

    fetchData();
  }, []);

  //Updates Document Object with the new fields that were selected before hitting update button -Faiz
  const handleUpdateAiFruitAccuracyReport = async () => {
    try {
      for (const fruitObject of fruit) {
        if (selectedFruitRefID == fruitObject.id) {
          for (const AiReport of aiAccuracyReport) {
            if (aiAccuracyReportRefId === AiReport.id) {
              const fruitScoreData = {
                fruitReferenceId: fruitObject.id,
                aiAccuracyScore: sliderValue,
                aiAccuracyRemark: aiAccuracyRemark,
              };

              const docRef = await updateDoc(
                doc(db, "fruitAiAccuracyFormReports", AiReport.id),
                fruitScoreData
              );
              console.log(`Document ${AiReport.id} updated`);
            }
          }
        }
      }

      setAiAccuracyReportRefId("");
      setShowDropDown(false);
      setSelectedFruit("");
      setAiAccuracyRemark("");
      setSliderValue(0);
      setDropdownKey((prevKey) => prevKey + 1);
      setSelectedFruitRefID("");
      setShowDropDown2(false);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  const incrementpoints = async (loginID) => {
    try {
      const PointDocRef = doc(db, "loginInformation", loginID);
      await updateDoc(PointDocRef, {
        points: increment(1),
      });
      console.log(`Points incremented successfully for document ${loginID}`);
    } catch (error) {
      console.error(error);
      console.log("are you here" + loginID);
    }
  };

  const handleSubmitButton = async () => {
    await incrementpoints(loginID);
    await handleAddAiFruitAccuracyReport();
  };

  //Creates a Document Object with the fields that were selected and then adds them to the database -Faiz
  const handleAddAiFruitAccuracyReport = async () => {
    try {
      for (const fruitObject of fruit) {
        if (selectedFruitRefID == fruitObject.id) {
          {
            const fruitScoreData = {
              fruitReferenceId: fruitObject.id,
              aiAccuracyScore: sliderValue,
              aiAccuracyRemark: aiAccuracyRemark,
            };

            const docRef = await addDoc(
              collection(db, "fruitAiAccuracyFormReports"),
              fruitScoreData
            );
            console.log(
              "The following Ai Accuracy Form Report Document was written with ID: ",
              docRef.id
            );

            //This copies the Reference ID to the user's clipboard to easily update or delete in the future, clipboard must be enabled from the user's siide though for this to work -Faiz
            await Clipboard.setStringAsync(docRef.id);
            Alert.alert(
              "Copied to Clipboard",
              `Reference Id: "${docRef.id}" has been copied to your clipboard.`
            );

            setNewAiAccuracyReportRefId(docRef.id);
          }
        }
      }

      setAiAccuracyReportRefId("");
      setShowDropDown(false);
      setSelectedFruit("");
      setAiAccuracyRemark("");
      setSliderValue(0);
      setDropdownKey((prevKey) => prevKey + 1);
      setIsAiAccuracyReportRefIdVisible(true);
      setSelectedFruitRefID("");
      setShowDropDown2(false);
    } catch (error) {
      console.error("Error Adding Document: ", error);
    }
  };

  //Deletes a Document Object specified by their document reference id -Faiz
  const handleDeleteAiFruitAccuracyReport = async () => {
    try {
      for (const AiReport of aiAccuracyReport) {
        if (aiAccuracyReportRefId === AiReport.id) {
          const docRef = await deleteDoc(
            doc(db, "fruitAiAccuracyFormReports", AiReport.id)
          );
          console.log(`Document ${AiReport.id} deleted`);
        }
      }

      setAiAccuracyReportRefId("");
      setShowDropDown(false);
      setSelectedFruit("");
      setAiAccuracyRemark("");
      setSliderValue(0);
      setDropdownKey((prevKey) => prevKey + 1);
      setSelectedFruitRefID("");
      setShowDropDown2(false);
    } catch (error) {
      console.log("Error Deleting Document: ", error);
    }
  };

  //Still Deciding on how to implement Accuracy Score and using what metric. For now the Accuracy Form contains: Dropdown list including fruits from database, remark text input, and accuracy rating. -Faiz
  return (
    <PaperProvider>
      <ScrollView style={{ backgroundColor: "lightgreen" }}>
        <View>
          {isAiAccuracyReportRefIdVisible ? (
            <View style={styles.input2}>
              <Text>
                Thank you for submitting a Fruit Ai Accuracy Form Report. Here
                is the Reference ID: {newAiAccuracyReportRefId}
              </Text>
            </View>
          ) : null}
        </View>
        <View>
          <TextInput
            style={styles.input2}
            value={aiAccuracyReportRefId}
            onChangeText={setAiAccuracyReportRefId}
            label="Enter Reference ID (If Updating Or Deleting)"
            mode="flat"
          />
        </View>
        <View>
          <SafeAreaView style={styles.input2}>
            <DropDown
              key={dropdownKey}
              dropDownContainerHeight={150}
              label={"Fruit"}
              mode="flat"
              visible={showDropDown}
              showDropDown={() => setShowDropDown(true)}
              onDismiss={() => setShowDropDown(false)}
              value={selectedFruit}
              setValue={setSelectedFruit}
              list={fruitDropDownList}
              dropDownStyle={styles.dropDownStyle}
            />
          </SafeAreaView>
        </View>
        <View>
          {selectedFruit === "Mango" ? (
            <SafeAreaView style={styles.input2}>
              <DropDown
                key={dropdownKey}
                dropDownContainerHeight={150}
                label={"Fruit Reference ID"}
                mode="flat"
                visible={showDropDown2}
                showDropDown={() => setShowDropDown2(true)}
                onDismiss={() => setShowDropDown2(false)}
                value={selectedFruitRefID}
                setValue={setSelectedFruitRefID}
                list={mangoRefIDList}
                dropDownStyle={styles.dropDownStyle}
              />
            </SafeAreaView>
          ) : null}
          {selectedFruit === "Pineapple" ? (
            <SafeAreaView style={styles.input2}>
              <DropDown
                key={dropdownKey}
                dropDownContainerHeight={150}
                label={"Fruit Reference ID"}
                mode="flat"
                visible={showDropDown2}
                showDropDown={() => setShowDropDown2(true)}
                onDismiss={() => setShowDropDown2(false)}
                value={selectedFruitRefID}
                setValue={setSelectedFruitRefID}
                list={pineappleRefIDList}
                dropDownStyle={styles.dropDownStyle}
              />
            </SafeAreaView>
          ) : null}
          {selectedFruit === "Avocado" ? (
            <SafeAreaView style={styles.input2}>
              <DropDown
                key={dropdownKey}
                dropDownContainerHeight={150}
                label={"Fruit Reference ID"}
                mode="flat"
                visible={showDropDown2}
                showDropDown={() => setShowDropDown2(true)}
                onDismiss={() => setShowDropDown2(false)}
                value={selectedFruitRefID}
                setValue={setSelectedFruitRefID}
                list={avocadoRefIDList}
                dropDownStyle={styles.dropDownStyle}
              />
            </SafeAreaView>
          ) : null}
        </View>
        <View>
          <TextInput
            style={styles.input2}
            value={aiAccuracyRemark}
            onChangeText={setAiAccuracyRemark}
            label="Enter Remarks"
            mode="flat"
          />
        </View>
        <View style={styles.input2}>
          <Text style={styles.text}>
            Accuracy Rating: {sliderValue.toFixed(1)}%
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={100}
            step={1.0}
            value={sliderValue}
            onValueChange={(value) => setSliderValue(value)}
            style={styles.input2}
            minimumTrackTintColor="green"
            maximumTrackTintColor="green"
            thumbTintColor="green"
          />
        </View>
        <View style={styles.submitButton}>
          <Button
            icon="upload"
            mode="contained-tonal"
            buttonColor="green"
            onPress={handleSubmitButton}
          >
            Submit
          </Button>
        </View>
        <View style={styles.updateButton}>
          <Button
            icon="update"
            mode="contained-tonal"
            buttonColor="cyan"
            onPress={handleUpdateAiFruitAccuracyReport}
          >
            Update
          </Button>
        </View>
        <View style={styles.deleteButton}>
          <Button
            icon="delete"
            mode="contained-tonal"
            buttonColor="red"
            onPress={handleDeleteAiFruitAccuracyReport}
          >
            Delete
          </Button>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  input2: {
    margin: 12,
    borderWidth: 1,
    width: "95%",
    marginVertical: 10,
    backgroundColor: "white",
  },
  //This changes the position of the dropdown, for some reason by default the dropdown is in the middle of the screen -Faiz
  dropDownStyle: {
    marginTop: -50,
    backgroundColor: "white",
  },
  text: {
    marginHorizontal: 12,
  },
  submitButton: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 50,
    marginTop: 10,
    width: "75%",
  },
  updateButton: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 50,
    marginTop: 5,
    width: "75%",
  },
  deleteButton: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 50,
    marginTop: 5,
    width: "75%",
  },
});
