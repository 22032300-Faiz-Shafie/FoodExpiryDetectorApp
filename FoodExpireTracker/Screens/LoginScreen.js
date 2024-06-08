import {View, Text, ScrollView, StyleSheet} from "react-native";
import {Button, PaperProvider, TextInput, IconButton}from "react-native-paper";
import React, { useState} from "react";

function LoginScreen({navigation}) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [secureTextEntry, setSecureTextEntry] = React.useState(true);

    //Toggle whether the secureentry is true to false, which helps obscure password -Faiz
    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

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
                    <Button icon="login" mode="contained-tonal" buttonColor="green" >Login</Button>
                </View>
                <View>
                    <Button onPress={() => navigation.navigate("signUpScreen")}>Don't Have An Account? Sign Up Here!</Button>
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