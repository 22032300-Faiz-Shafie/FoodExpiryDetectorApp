import React, { useContext, useState, useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, FlatList } from "react-native";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Assuming this imports your Firestore instance correctly
import AuthContext from "../Screens/AuthContext";
import { SegmentedButtons, Divider } from "react-native-paper";

function FetchUserData() {
  const usercol = collection(db, "loginInformation");
  const [usersfetch, setUsersfetch] = useState([]);
  const { loginID } = useContext(AuthContext);

  useEffect(() => {
    const q = query(usercol);

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
  const sortTheUsersPoints = [...usersfetch].sort(
    (a, b) => b.data.points - a.data.points
  );
  const sortUsersWithoutTop3 = sortTheUsersPoints.slice(3);
  const top1User = sortTheUsersPoints[0];
  const top2User = sortTheUsersPoints[1];
  const top3User = sortTheUsersPoints[2];
  const [value, setValue] = useState("leaderboard");

  const leaderboardOrBadges = () => {
    if (value === "leaderboard") {
      return (
        <>
          <View style={styles.podiumContainer}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>2</Text>
              <View style={styles.podium2} />
              <Text>{top2User.data.username}</Text>
              <Text>{top2User.data.points}</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>1</Text>
              <View style={styles.podium1} />
              <Text>{top1User.data.username}</Text>
              <Text>{top1User.data.points}</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>3</Text>
              <View style={styles.podium3} />
              <Text>{top3User.data.username}</Text>
              <Text>{top3User.data.points}</Text>
            </View>
          </View>
          <FlatList
            style={{ flex: 1, width: "100%" }}
            contentContainerStyle={{ flexGrow: 1 }}
            data={sortUsersWithoutTop3}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: "white",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 10,
                  margin: 3,
                  elevation: 4,
                }}
              >
                <Text style={{ fontSize: 25, flex: 1 }}>
                  {item.data.username}
                </Text>
                <Text
                  style={{ fontSize: 15, minWidth: 80, textAlign: "right" }}
                >
                  Points: {item.data.points}
                </Text>
                <Divider />
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </>
      );
    } else if (value === "badges") {
      return <View style={styles.badgesContainer}></View>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={{ fontSize: 40 }}>
          Points: {cUser ? cUser.data.points : "loading..."}
        </Text>
      </View>
      <View style={styles.bottomContainer}>
        <SafeAreaView style={styles.segmentButtonContainer}>
          <SegmentedButtons
            value={value}
            onValueChange={setValue}
            buttons={[
              {
                value: "leaderboard",
                label: "Leaderboard",
              },
              {
                value: "badges",
                label: "Badges",
              },
            ]}
          />
        </SafeAreaView>
        {leaderboardOrBadges()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgreen",
    alignItems: "center",
  },
  topContainer: {
    padding: 30,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: "center",
    paddingTop: 20,
    width: "100%",
  },
  segmentButtonContainer: {
    paddingTop: 5,
    alignItems: "center",
    width: "90%",
  },
  badgesContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  podium1: {
    backgroundColor: "#FFD700",
    width: 55,
    height: 100,
    margin: 4,
  },
  podium2: {
    backgroundColor: "#C0C0C0",
    width: 55,
    height: 70,
    margin: 4,
  },
  podium3: {
    backgroundColor: "#CD7F32",
    width: 55,
    height: 50,
    margin: 4,
  },
  podiumContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 25,
  },
});

export default FetchUserData;
