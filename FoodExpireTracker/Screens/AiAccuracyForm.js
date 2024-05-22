import { StyleSheet, Text, View, Pressable, Image, ScrollView, FlatList, SafeAreaView} from 'react-native';
import DropDown from "react-native-paper-dropdown";
import React, { useState, useEffect } from 'react';
import { PaperProvider, Button, TextInput } from 'react-native-paper';
import { doc, onSnapshot, query, collection, deleteDoc, addDoc, updateDoc} from "firebase/firestore";
import {db} from "../firebaseConfig"
import Slider from '@react-native-community/slider';

export default function App(){
    const foodsCol = collection(db, "foodCollection");
    const fruitAiAccuracyFormReportsCol = collection(db, "fruitAiAccuracyFormReports");
    const [showDropDown, setShowDropDown] = useState(false);
    const [fruit, setFruit] = useState([]);
    const [selectedFruit, setSelectedFruit] = useState('');
    const [aiAccuracyRemark, setAiAccuracyRemark] = useState(""); 
    const [sliderValue, setSliderValue] = useState(0);
    const [dropdownKey, setDropdownKey] = useState(0);
    const [aiAccuracyReport, setAiAccuracyReport] = useState([]);
    const [aiAccuracyReportRefId, setAiAccuracyReportRefId] = useState("");
    const [isAiAccuracyReportRefIdVisible, setIsAiAccuracyReportRefIdVisible] = useState(false);
    const [newAiAccuracyReportRefId, setNewAiAccuracyReportRefId] = useState("");
    
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
                        id: fruit.id,
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
    
    //Fetch Fruit Ai Accuracy Reports Data -Faiz
    useEffect(() => {
        const q = query(fruitAiAccuracyFormReportsCol);
        const fetchData = async () => {
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const aiReportList  = [];
                querySnapshot.forEach((doc) => {
                    aiReportList.push({
                        id: doc.id,
                        data: doc.data()
                    })
                });

                setAiAccuracyReport(aiReportList);
            });
            return () => unsubscribe();
        }

        fetchData();
    }, [])

    //Updates Document Object with the new fields that were selected before hitting submit -Faiz
    const handleEditFruitAccuracyScore = async () =>{
        try{
            const fruitScoreData = {
                aiAccuracyScore: sliderValue,
                aiAccuracyRemark: aiAccuracyRemark
            };

            for(const fruitObject of fruit){
                if(selectedFruit == fruitObject.value){
                    const docRef = await updateDoc(doc(db, "foodCollection", fruitObject.id), fruitScoreData);
                    console.log(`Document ${fruitObject.id} updated`);
                }
            }

            setShowDropDown(false);
            setSelectedFruit('');
            setAiAccuracyRemark("");
            setSliderValue(0);
            setDropdownKey(prevKey => prevKey + 1);
        }
        catch(error){
            console.error('Error updating document: ', error);
        }


    }

    const handleAddAiFruitAccuracyReport = async () =>{
        try{

            for(const fruitObject of fruit){
                if(selectedFruit == fruitObject.value){{
                    const fruitScoreData = {
                        fruitReferenceId: fruitObject.id,
                        aiAccuracyScore: sliderValue,
                        aiAccuracyRemark: aiAccuracyRemark
                    }

                    const docRef = await addDoc(collection(db, 'fruitAiAccuracyFormReports'), fruitScoreData);
                    console.log("The following Ai Accuracy Form Report Document was written with ID: ", docRef.id);
                    setNewAiAccuracyReportRefId(docRef.id);
                }}
            }

            setAiAccuracyReportRefId("");
            setShowDropDown(false);
            setSelectedFruit('');
            setAiAccuracyRemark("");
            setSliderValue(0);
            setDropdownKey(prevKey => prevKey + 1);
            setIsAiAccuracyReportRefIdVisible(true);
        }
        catch(error){
            console.error('Error Adding Document: ', error);
        }
    }
    
    //Still Deciding on how to implement Accuracy Score and using what metric. For now the Accuracy Form contains: Dropdown list including fruits from database, remark text input, and accuracy rating. -Faiz
    return(
        <PaperProvider>
        <ScrollView style={{backgroundColor: "lightgreen"}}>
            <View>
                <TextInput 
                style={styles.input2}
                value={aiAccuracyReportRefId}
                onChangeText={setAiAccuracyReportRefId}
                label="Enter Reference ID (If Updating Or Deleting)"
                mode='flat'
                />
            </View>
            <View>
                <SafeAreaView style={styles.input2}>
                <DropDown key={dropdownKey} dropDownContainerHeight={150} label={'Fruit'} mode='flat' visible={showDropDown} showDropDown={() => setShowDropDown(true)} onDismiss={() => setShowDropDown(false)} value={selectedFruit} setValue={setSelectedFruit} list={fruit} dropDownStyle={styles.dropDownStyle}/>
                </SafeAreaView>
            </View>
            <View>
                <TextInput 
                style={styles.input2}
                value={aiAccuracyRemark}
                onChangeText={setAiAccuracyRemark}
                label="Enter Remarks"
                mode='flat'
                />
            </View>
            <View style={styles.input2}>
                <Text style={styles.text}>Accuracy Rating: {sliderValue.toFixed(1)}%</Text>
                <Slider minimumValue={0} maximumValue={100} step={1.0} value={sliderValue} onValueChange={value => setSliderValue(value)} style={styles.input2} minimumTrackTintColor="green" maximumTrackTintColor="green" thumbTintColor="green"/>
            </View>
            <View style={styles.submitButton}>
                <Button icon="upload" mode="contained-tonal" buttonColor="green" onPress={handleAddAiFruitAccuracyReport}>Submit</Button>
            </View>
            <View style={styles.updateButton}>
                <Button icon="update" mode="contained-tonal" buttonColor="cyan" onPress={handleEditFruitAccuracyScore}>Update</Button>
            </View>
            <View style={styles.deleteButton}>
                <Button icon="delete" mode="contained-tonal" buttonColor="red" onPress={handleEditFruitAccuracyScore}>Delete</Button>
            </View>
            <View>
                {isAiAccuracyReportRefIdVisible ? (
                    <View style={styles.input2}> 
                        <Text>Thank you for submitting a Fruit Ai Accuracy Form Report. Here is the Reference ID: {newAiAccuracyReportRefId}</Text> 
                    </View>
                ): null}
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
    backgroundColor: "white"
    },
    text: {
        marginHorizontal: 12,
    },
    submitButton: {
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 100,
        marginTop: 10,
        width: '50%'
    },
    updateButton: {
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 100,
        marginTop: 5,
        width: '50%'
    },
    deleteButton: {
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 100,
        marginTop: 5,
        width: '50%'
    },
})
