import { View, Text, ScrollView, StyleSheet, Alert} from "react-native";
import {
  Button,
  PaperProvider,
  TextInput,
  IconButton,
} from "react-native-paper";
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import {
  doc,
  onSnapshot,
  query,
  collection,
  deleteDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";

function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  //Toggle whether the secureentry is true to false, which helps obscure password -Faiz
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  //Adds newly created user login information to the database -Faiz
  const handleAddLoginInformation = async () => {
    const specialCharRegex = /[^a-zA-Z0-9]/;
    if(username.length > 3 && username.length < 30){
      if(password.length >= 8){
        if(!specialCharRegex.test(password)){
          try {
            const loginData = {
              username: username,
              password: password,
              points: 0,
              gems: 0,
            };
      
            const docRef = await addDoc(
              collection(db, "loginInformation"),
              loginData
            );
            console.log(
              "The following Login Information Document was written with ID: ",
              docRef.id
            );
      
            setUsername("");
            setPassword("");
            navigation.navigate("Home");
            Alert.alert(
              "Confirm Action",
              "You have successfully created a new account, you may now login.",
              [
                {
                  text: "Dismiss",
                },
              ],
              { cancelable: false }
            );
          } catch (error) {
            console.error("Error Adding Document: ", error);
          }
        }
        else{
          Alert.alert(
            "Confirm Action",
            "Invalid Password, Password must not contain any special characters.",
            [
              {
                text: "Dismiss",
              },
            ],
            { cancelable: false }
          );
        }
      }
    else{
      Alert.alert(
        "Confirm Action",
        "Invalid Password, Password has to be 8 characters or greater.",
        [
          {
            text: "Dismiss",
          },
        ],
        { cancelable: false }
      );
    }
    }
    else{
      Alert.alert(
        "Confirm Action",
        "Invalid Username, Username has to be greater than 3 characters and shorter than 30 characters.",
        [
          {
            text: "Dismiss",
          },
        ],
        { cancelable: false }
      );
    }
    
  };

  //Sign Up Screen UI -Faiz
  return (
    <PaperProvider>
      <ScrollView style={{ backgroundColor: "lightgreen" }}>
        <View>
          <TextInput
            style={styles.textInput}
            value={username}
            onChangeText={setUsername}
            label="Enter Username"
            mode="flat"
          />
        </View>
        <View>
          <TextInput
            style={styles.textInput}
            value={password}
            onChangeText={setPassword}
            label="Enter Password"
            mode="flat"
            secureTextEntry={secureTextEntry}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? "eye" : "eye-off"}
                onPress={toggleSecureEntry}
              />
            }
          />
        </View>
        <View style={styles.signUpButton}>
          <Button
            icon="arrow-right"
            mode="contained-tonal"
            buttonColor="green"
            onPress={handleAddLoginInformation}
          >
            Sign Up
          </Button>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  textInput: {
    margin: 12,
    borderWidth: 1,
    width: "95%",
    marginVertical: 10,
  },
  signUpButton: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 50,
    marginTop: 10,
    width: "75%",
  },
});

export default SignUpScreen;
