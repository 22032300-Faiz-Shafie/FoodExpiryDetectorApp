import {View, Text, ScrollView, StyleSheet} from "react-native";
import {Button, PaperProvider, TextInput, IconButton}from "react-native-paper";
import React, { useState} from "react";
import {db} from "../firebaseConfig"
import { doc, onSnapshot, query, collection, deleteDoc, addDoc, updateDoc} from "firebase/firestore";

function SignUpScreen({navigation}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [secureTextEntry, setSecureTextEntry] = React.useState(true);

    //Toggle whether the secureentry is true to false, which helps obscure password -Faiz
    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    //Adds newly created user login information to the database -Faiz
    const handleAddLoginInformation = async () =>{
        try{

            const loginData = {
                username: username,
                password: password,
            }

            const docRef = await addDoc(collection(db, 'loginInformation'), loginData);
            console.log("The following Login Information Document was written with ID: ", docRef.id);

            setUsername("");
            setPassword("");
        }
        catch(error){
            console.error('Error Adding Document: ', error);
        }
    }

    //Sign Up Screen UI -Faiz
    return(
        <PaperProvider>
            <ScrollView style={{backgroundColor: "lightgreen"}}>
                <View>
                    <TextInput 
                    style={styles.textInput}
                    value={username}
                    onChangeText={setUsername}
                    label="Enter Username"
                    mode='flat'
                    />
                </View>
                <View>
                    <TextInput 
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                    label="Enter Password"
                    mode='flat'
                    secureTextEntry={secureTextEntry}
                    right={<TextInput.Icon icon={secureTextEntry ? "eye" : "eye-off"} onPress={toggleSecureEntry}/>}
                    />
                </View>
                <View style={styles.signUpButton}>
                    <Button icon="arrow-right" mode="contained-tonal" buttonColor="green" onPress={handleAddLoginInformation}>Sign Up</Button>
                </View>
                <View>
                    <Button onPress={() => navigation.navigate("loginScreen")}>Already have an account? Login Here!</Button>
                </View>
            </ScrollView>
        </PaperProvider>
    )
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
        width: '75%'
    },
})

export default SignUpScreen;