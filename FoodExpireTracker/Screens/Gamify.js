import React, { useContext, useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Assuming this imports your Firestore instance correctly
import AuthContext from "../Screens/AuthContext";

function FetchUserData() {
  const usercol = collection(db, "loginInformation");
  const [usersfetch, setUsersfetch] = useState([]);
  const { loginID } = useContext(AuthContext);

  useEffect(() => {
    const q = query(usercol); // Construct the query

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setUsersfetch(users);
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );

    return () => unsubscribe();
  }, [loginID]);

  const cUser = usersfetch.find((user) => user.id === loginID);

  return (
    <View style={styles.topContainer}>
      <View style={{ padding: 30 }}>
        <Text style={{ fontSize: 40 }}>
          Points: {cUser ? cUser.data.points : "loading..."}
        </Text>
      </View>
      <View style={styles.bottomContainer}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "lightgreen",
    alignItems: "center",
  },
  bottomContainer: {
    height: 620,
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});

export default FetchUserData;
