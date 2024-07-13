import React, { useContext, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  ProgressBarAndroid,
} from "react-native";
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

  function firstAchievedOrNot() {
    if (cUser && cUser.data.points >= 1) {
      return true;
    } else {
      return false;
    }
  }

  function firstAchievedBarProgress() {
    if (cUser) {
      return cUser.data.points / 1; // Calculate progress ratio
    }
    return 0;
  }

  function firstProgressText() {
    const firstRaterProgress = cUser ? cUser.data.points : 0;
    if (firstAchievedOrNot()) {
      return <Text>1/1</Text>;
    } else {
      return <Text>{`${firstRaterProgress}/1`}</Text>;
    }
  }

  function bigRaterAchievedOrNot() {
    if (cUser && cUser.data.points >= 10) {
      return true;
    } else {
      return false;
    }
  }

  function bigRaterProgressBarProgress() {
    if (cUser) {
      return cUser.data.points / 10; // Calculate progress ratio
    }
    return 0;
  }

  function bigRaterProgressText() {
    const bigRaterProgress = cUser ? cUser.data.points : 0;
    if (bigRaterAchievedOrNot()) {
      return <Text>10/10</Text>;
    }
    return <Text>{`${bigRaterProgress}/10`}</Text>;
  }

  function kingRaterAchievedOrNot() {
    if (cUser && cUser.data.points >= 50) {
      return true;
    } else {
      return false;
    }
  }

  function kingRaterAchievedBarProgress() {
    if (cUser) {
      return cUser.data.points / 50; // Calculate progress ratio
    }
    return 0;
  }

  function kingRaterProgressText() {
    const kingRaterProgress = cUser ? cUser.data.points : 0;
    if (kingRaterAchievedOrNot()) {
      return <Text>50/50</Text>;
    } else {
      return <Text>{`${kingRaterProgress}/50`}</Text>;
    }
  }

  const Badges = [
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
      title: "First!",
      description: "Submit a form through the accuracy form",
      imgAchieved: require("../assets/First!Achieved.jpg"),
      imgNotAchieved: require("../assets/First!NotAchieved.jpg"),
      achieved: firstAchievedOrNot(),
      currentProgressBarProgress: firstAchievedBarProgress(),
      progressText: firstProgressText(),
    },
    {
      id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
      title: "BigRater",
      description: "Submit 10 forms through the accuracy form",
      imgAchieved: require("../assets/BigRaterAchieved.jpg"),
      imgNotAchieved: require("../assets/BigRaterNotAchieved.jpg"),
      achieved: bigRaterAchievedOrNot(),
      currentProgressBarProgress: bigRaterProgressBarProgress(),
      progressNumber: 4,
      progressText: bigRaterProgressText(),
    },
    {
      id: "3ac68afc-c605-48d3-a4c8-fbx91aa97f63",
      title: "KingRater",
      description: "Submit 50 forms through the accuracy form",
      imgAchieved: require("../assets/KingRaterAchieved.jpg"),
      imgNotAchieved: require("../assets/KingRaterNotAchieved.jpg"),
      achieved: kingRaterAchievedOrNot(),
      currentProgressBarProgress: kingRaterAchievedBarProgress(),
      progressText: kingRaterProgressText(),
    },
  ];

  function Item({ title, achieved }) {
    const badge = Badges.find((badge) => badge.title === title);

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          margin: 3,
          elevation: 4,
        }}
      ></View>
    );
  }

  const leaderboardOrBadges = () => {
    if (value === "leaderboard") {
      return (
        <>
          <View style={styles.podiumContainer}>
            {top2User && (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>2</Text>
                <View style={styles.podium2} />
                <Text>{top2User.data.username}</Text>
                <Text>{top2User.data.points}</Text>
              </View>
            )}
            {top1User && (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>1</Text>
                <View style={styles.podium1} />
                <Text>{top1User.data.username}</Text>
                <Text>{top1User.data.points}</Text>
              </View>
            )}
            {top3User && (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>3</Text>
                <View style={styles.podium3} />
                <Text>{top3User.data.username}</Text>
                <Text>{top3User.data.points}</Text>
              </View>
            )}
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
      return (
        <View style={styles.badgesContainer}>
          <FlatList
            style={{ flex: 1, width: "100%" }}
            contentContainerStyle={{ flexGrow: 1 }}
            numColumns={4}
            data={Badges}
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
                <View>
                  <Image
                    source={
                      item.achieved ? item.imgAchieved : item.imgNotAchieved
                    }
                    style={{ height: 80, width: 80 }}
                  />
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
          <View style={{ position: "absolute", top: "20%" }}>
            <View>
              <Text style={{ fontSize: 25, fontWeight: "bold" }}>Progress</Text>
            </View>
            <FlatList
              style={{ flex: 1, width: "100%", marginTop: 10 }}
              contentContainerStyle={{ flexGrow: 1 }}
              data={Badges}
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
                  <View>
                    <Image
                      source={
                        item.achieved ? item.imgAchieved : item.imgNotAchieved
                      }
                      style={{ height: 100, width: 100 }}
                    />
                  </View>
                  <View style={{ flexDirection: "column", marginLeft: 10 }}>
                    <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 13 }}>{item.description}</Text>
                    <View style={{ flexDirection: "row" }}>
                      <ProgressBarAndroid
                        style={{ flex: 1 }}
                        styleAttr="Horizontal"
                        indeterminate={false}
                        progress={item.currentProgressBarProgress}
                      />
                      <Text>{item.progressText}</Text>
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        </View>
      );
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
