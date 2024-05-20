import { StyleSheet, Text, View, Pressable, Image, ScrollView, FlatList, SafeAreaView} from 'react-native';
import DropDown from "react-native-paper-dropdown";
import React, { useState, useEffect } from 'react';
import { PaperProvider, Button, TextInput } from 'react-native-paper';
import { doc, onSnapshot, query, collection, deleteDoc} from "firebase/firestore";
import {db} from "../firebaseConfig"
import Slider from '@react-native-community/slider';

export default function App(){
    const foodsCol = collection(db, "foodCollection");
    const [showDropDown, setShowDropDown] = useState(false);
    const [fruit, setFruit] = useState([]);
    const [selectedFruit, setSelectedFruit] = useState('');
    const [remark, setRemark] = useState(""); 
    const [sliderValue, setSliderValue] = useState(0);
    
    //Fetch Fruit Data to populate dropdown list -Faiz
    useEffect(() => {
        const q = query(foodsCol);
        const fetchData = async () => {
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fruitList = [];
                const fruitListDropDown = [];
                querySnapshot.forEach((doc) => {
                    fruitList.push({
                    id: doc.id,
                    data: doc.data()
                  })
                });

                for(const fruit of fruitList){
                    fruitListDropDown.push({
                        label: fruit.data.foodName,
                        value: fruit.data.foodName,
                    })
                }
                
                setFruit(fruitListDropDown);
              });
            
            return () => unsubscribe();  
        }
  
        fetchData();
      }, []);

    
    //Still Deciding on how to implement Accuracy Score and using what metric. For now the Accuracy Form contains: Dropdown list including fruits from database, remark text input, and accuracy rating. -Faiz
    return(
        <PaperProvider>
        <ScrollView style={{backgroundColor: "lightgreen"}}>
            <View>
                <SafeAreaView style={styles.input2}>
                <DropDown dropDownContainerHeight={150} label={'Fruit'} mode='flat' visible={showDropDown} showDropDown={() => setShowDropDown(true)} onDismiss={() => setShowDropDown(false)} value={selectedFruit} setValue={setSelectedFruit} list={fruit} dropDownStyle={styles.dropDownStyle}/>
                </SafeAreaView>
            </View>
            <View>
                <TextInput 
                style={styles.input2}
                value={remark}
                onChangeText={setRemark}
                label="Enter Remarks"
                mode='flat'
                />
            </View>
            <View style={styles.input2}>
                <Text style={styles.text}>Accuracy Rating: {sliderValue.toFixed(1)}%</Text>
                <Slider minimumValue={0} maximumValue={100} step={1.0} value={sliderValue} onValueChange={value => setSliderValue(value)} style={styles.input2} minimumTrackTintColor="green" maximumTrackTintColor="green" thumbTintColor="green"/>
            </View>
            <View style={styles.submitButton}>
                <Button icon="upload" mode="contained-tonal" buttonColor="green">Submit</Button>
            </View>
        </ScrollView>
        </PaperProvider>
    )
}

const styles = StyleSheet.create({
    input2: {
        margin: 12,
        borderWidth: 1,
        width: '95%',
        marginVertical: 10,
        backgroundColor: "white",
    },
    //This changes the position of the dropdown, for some reason by default the dropdown is in the middle of the screen -Faiz
    dropDownStyle: {
    marginTop: -50,
    },
    text: {
        marginHorizontal: 12,
    },
    submitButton: {
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 100,
        marginVertical: 10,
        width: '50%'
    },
})
