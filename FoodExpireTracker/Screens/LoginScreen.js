import {View, Text, ScrollView, StyleSheet, Alert} from "react-native";
import {Button, PaperProvider, TextInput, IconButton}from "react-native-paper";
import React, { useEffect, useState, useContext} from "react";
import AuthContext from './AuthContext';
import { doc, onSnapshot, query, collection, deleteDoc, addDoc, updateDoc} from "firebase/firestore";
import {db} from "../firebaseConfig"

function LoginScreen({navigation}) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [secureTextEntry, setSecureTextEntry] = React.useState(true);
    const loginInformationCol = collection(db, "loginInformation");
    const { login, isLoggedIn, loggingInID } = useContext(AuthContext);
    const [loginInformation, setLoginInformation] = useState([]);
    const [loginFound, setLoginFound] = React.useState(false);

    //Toggle whether the secureentry is true to false, which helps obscure password -Faiz
    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    //Takes login information from database and stores them in loginInformation array -Faiz
    useEffect(() => {
        const q = query(loginInformationCol);
        const fetchData = async () => {
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const loginInformationList = [];
                querySnapshot.forEach((doc) => {
                    loginInformationList.push({
                    id: doc.id,
                    data: doc.data()
                  })
                });

                setLoginInformation(loginInformationList);
            });

            return () => unsubscribe();  
        }
        fetchData();
    })

    //Handles login, compares values with those that are found in the loginInformation array, if a match is found, login method will be called which sets isLoggedIn to true -Faiz
    const handleLogin = () => {

        for(const loginObject of loginInformation){
            if(loginObject.data.username === username && loginObject.data.password === password){
                login();
                loggingInID(loginObject.id);
                setLoginFound(true);
                Alert.alert("","You Have Successfully Logged In");
                navigation.navigate('Home');
                return;
            }
        }

        if(loginFound === false){
            Alert.alert("", "Invalid Login Credentials");
        }
    }

    //LoginScreen UI -Faiz
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
                <View style={styles.loginButton}>
                    <Button icon="login" mode="contained-tonal" buttonColor="green" onPress={handleLogin}>Login</Button>
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
    loginButton: {
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 50,
        marginTop: 10,
        width: '75%'
    },
})

export default LoginScreen; 