import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Pressable, Image, ScrollView, Button} from 'react-native';
//this is just the logo for now. change later
const logoImg = require("./assets/favicon.png");

export default function App() {
  return (


      <View style={styles.backGround}>
      <ScrollView>
      <View style={{flex:1,height:200,backgroundColor:"lightgreen", borderRadius:30}}>
        <StatusBar backgroundColor="lightgreen" barStyle="default"/>
        <Text style={{textAlign:"center", fontSize:20, paddingTop:20}}>Elsa's List</Text>
        <Image source={logoImg} style={{width:100, height:100,alignSelf:"center"}}/>
      </View>
      </ScrollView>
      </View>
  
 
  );
}

const styles = StyleSheet.create({
  backGround: { 
    flex: 1, 
    justifyContent: "flex-start", 
    backgroundColor: "#FFF5F5F5", 
  }
});
