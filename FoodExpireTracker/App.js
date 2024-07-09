import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useContext} from "react";
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
import SignUpScreen from "./Screens/SignUpScreen";
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
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { AuthProvider } from './Screens/AuthContext';
import AuthContext from './Screens/AuthContext';

const Stack = createNativeStackNavigator();
const logoImg = require("./assets/favicon.png");
const addImg = require("./assets/add.png");
//fetches all food with isadded as true, so that only added foods are displayed -Don
function FetchFoodData() {
  const [foodsfetch, setFoodsfetch] = useState([]);
  const foodsCol = collection(db, "foodCollection");
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
      setFoodsfetch(foods);
      for (const food of foods) {
        if (food.data.isadded === true && food.data.userID === loginID) {
          filteringFoodItems.push(food);
        }
      }
      setFoodsfetch(filteringFoodItems);
    });

    return () => unsubscribe();
  }, []);
  {
    /*allows user to edit fruit details. for now only name and quantity can be edited plan to add in the future
1)ability to edit ripeness later
2)display expiry date
3)error handling
 -Don*/
  }
  function EditFood({ itemID }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [foodName, setFoodName] = useState("");
    const [quantity, setQuantity] = useState("");

    useEffect(() => {
      fetchEditingFoodData(itemID);
    }, [itemID]);

    const fetchEditingFoodData = async (itemID) => {
      const docRef = doc(db, "foodCollection", itemID);
      const docSnap = await getDoc(docRef);
      setFoodName(docSnap.data().foodName);
      setQuantity(docSnap.data().quantity.toString());
    };
    const handleEditFood = async () => {
      try {
        await updateDoc(doc(db, "foodCollection", itemID), {
          foodName: foodName,
          quantity: parseInt(quantity),
        });
        console.log(foodName);
        console.log(quantity);
        setFoodName("");
        setQuantity("");
        setModalVisible(false);
        Alert.alert("Food details updated successfully!");
      } catch (error) {
        console.error("Error updating document: ", error);
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
              </View>
              <View style={{ marginTop: 50 }}>
                <Text style={{ fontSize: 23 }}>choose fruit</Text>
              </View>
              <RadioButton.Group
                onValueChange={(newFoodName) => setFoodName(newFoodName)}
                value={foodName}
              >
                <RadioButton.Item label="Pineapple" value="Pineapple" />
                <RadioButton.Item label="Mango" value="Mango" />
                <RadioButton.Item label="Apple" value="Apple" />
              </RadioButton.Group>
              <TextInput
                style={styles.input2}
                value={quantity}
                onChangeText={setQuantity}
                label="Enter Quantity"
                keyboardType="number-pad"
              />
              <Button
                icon="upload"
                mode="contained-tonal"
                buttonColor="green"
                onPress={handleEditFood}
              >
                Edit
              </Button>
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
  return (
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
                padding: 10,
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
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                  {item.data.foodName}

                  <Text style={{ fontSize: 16 }}> x{item.data.quantity}</Text>
                </Text>

                <Text> 
                  expires in: 
                </Text>
                <Text>
                  expires on: {item.data.expiryDate.toDate().toLocaleString()}
                </Text>
              </View>

              <IconButton
                icon="delete"
                iconColor={MD3Colors.error50}
                size={30}
                onPress={() => deleteDoc(doc(db, "foodCollection", item.id))}
              />

              <Divider />
              <View style={{ marginLeft: -15 }}>
                <EditFood itemID={item.id} />
              </View>
            </View>
          </SafeAreaView>
        );
      }}
    />
  );
}

function CheckExpiryDate5() {
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  var today = new Date();
  const FiveDaysFromNow = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

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
          food.data.expiryDate.toDate() <= FiveDaysFromNow &&
          food.data.expiryDate.toDate() > today &&
          food.data.isadded == true
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
      <View style={{ flexDirection: "row", marginBottom: 10, marginTop: 10 }}>
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
          food.data.isadded == true
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
      <View style={{ flexDirection: "row", marginBottom: 10, marginTop: 10 }}>
        <Icon source={"alert-circle"} size={35} />
        <Text style={{ fontSize: 25 }}>
          Fruits that are expiring in 3 days:{" "}
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
function CheckExpired() {
  const foodsCol = collection(db, "foodCollection");
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  var today = new Date();
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
          food.data.isadded == true
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
      <View style={{ flexDirection: "row", marginBottom: 10, marginTop: 10 }}>
        <Icon source={"alert-circle"} size={35} />
        <Text style={{ fontSize: 25 }}>Fruits that are expired: </Text>
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

function WarningDashboardVisibility() {
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
      <View style={{ flexDirection: 'row' }}>
        <View>
          <Button onPress={() => handleToggleWarningDashboardVisibility('expired')}>
            Expired
          </Button>
        </View>
        <View>
          <Button onPress={() => handleToggleWarningDashboardVisibility('expiring3')}>
            Expiring in 3 days
          </Button>
        </View>
        <View>
          <Button onPress={() => handleToggleWarningDashboardVisibility('expiring5')}>
            Expiring in 5 days
          </Button>
        </View>
      </View>
      <View>
        {visibleComponent === 'expired' && <CheckExpired />}
        {visibleComponent === 'expiring3' && <CheckExpiryDate />}
        {visibleComponent === 'expiring5' && <CheckExpiryDate5 />}
      </View>
    </View>
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
        name="loginScreen"
        component={LoginScreen}
        options={{
          headerStyle: {backgroundColor: "green"},
          title: "Login Screen",
        }}
        />
        <Stack.Screen
        name="signUpScreen"
        component={SignUpScreen}
        options={{
          headerStyle: {backgroundColor: "green"},
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
    Alert.alert("","You Have Successfully Logged Out");
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
          <Text style={{ textAlign: "center", fontSize: 20, paddingTop: 40 }}>
            Fruit List
          </Text>
          <Image
            source={logoImg}
            style={{ width: 100, height: 100, alignSelf: "center" }}
          />
        </View>
        <View>
          {isLoggedIn ? <FetchFoodData /> : null}
        </View>
        <View>
          {isLoggedIn ? <WarningDashboardVisibility /> : null}
        </View>
      </ScrollView>
      { isLoggedIn ? 
      (<View style={styles.addFoodButton}>
        <FAB
          icon="plus"
          rippleColor="purple"
          onPress={() => navigation.navigate("addFoodScreen")}
        />
      </View>) : null
      }
      { isLoggedIn ? 
      (<View style={styles.aiAccuracyFormButton}>
        <FAB
          icon="ballot"
          rippleColor="purple"
          onPress={() => navigation.navigate("aiAccuracyForm")}
        />
      </View>) : null
      }
      { !isLoggedIn ?
      (<View style={styles.loginButton}>
        <FAB
          icon="login"
          rippleColor="purple"
          onPress={() => navigation.navigate("loginScreen")}
        />
      </View>) : null
      }
      { isLoggedIn ?
      (<View style={styles.loginButton}>
        <FAB
          icon="logout"
          rippleColor="purple"
          onPress={handleLogout}
        />
      </View>) : null
      }
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
    bottom:10,
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
});
