import React, { useContext, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Linking,
  Image,
  ProgressBarAndroid,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from "react-native";

import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import "firebase/database";
import { db } from "../firebaseConfig";
import AuthContext from "./AuthContext";
import {
  SegmentedButtons,
  Divider,
  Button,
  Dialog,
  Portal,
  PaperProvider,
} from "react-native-paper";

function FetchUserData() {
  const usercol = collection(db, "loginInformation");
  const [usersfetch, setUsersfetch] = useState([]);
  const { loginID } = useContext(AuthContext);
  const [visible, setVisible] = React.useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedGemValue, setSelectedGemValue] = useState(null);
  const [selectedGiftCardDollarValue, setGiftCardDollarValue] = useState(null);

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
      return cUser.data.points / 1;
    }
    return 0;
  }

  function firstProgressText() {
    const firstRaterProgress = cUser && cUser ? cUser.data.points / 1 : 0;
    if (firstAchievedOrNot()) {
      return (
        <View style={{ flexDirection: "row" }}>
          <ProgressBarAndroid
            style={{ flex: 1 }}
            styleAttr="Horizontal"
            indeterminate={false}
            color="green"
            progress={firstRaterProgress}
          />
          <Text>1/1</Text>
        </View>
      );
    } else {
      return (
        <View style={{ flexDirection: "row" }}>
          <ProgressBarAndroid
            style={{ flex: 1 }}
            styleAttr="Horizontal"
            indeterminate={false}
            color="yellow"
            progress={firstRaterProgress}
          />
          <Text>{`${cUser && cUser.data ? cUser.data.points : 0}/1`}</Text>
        </View>
      );
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
      return cUser.data.points / 10;
    }
    return 0;
  }

  function bigRaterProgressText() {
    const bigRaterProgress = cUser && cUser ? cUser.data.points / 10 : 0;
    if (bigRaterAchievedOrNot()) {
      return (
        <View style={{ flexDirection: "row" }}>
          <ProgressBarAndroid
            style={{ flex: 1 }}
            styleAttr="Horizontal"
            indeterminate={false}
            color="green"
            progress={bigRaterProgress}
          />
          <Text>10/10</Text>
        </View>
      );
    } else {
      return (
        <View style={{ flexDirection: "row" }}>
          <ProgressBarAndroid
            style={{ flex: 1 }}
            styleAttr="Horizontal"
            color="yellow"
            indeterminate={false}
            progress={bigRaterProgress}
          />
          <Text>{`${cUser && cUser.data ? cUser.data.points : 0}/10`}</Text>
        </View>
      );
    }
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
      return cUser.data.points / 50;
    }
    return 0;
  }

  function kingRaterProgressText() {
    const kingRaterProgress = cUser && cUser ? cUser.data.points / 50 : 0;
    if (kingRaterAchievedOrNot()) {
      return (
        <View style={{ flexDirection: "row" }}>
          <ProgressBarAndroid
            style={{ flex: 1 }}
            styleAttr="Horizontal"
            color="green"
            indeterminate={false}
            progress={kingRaterProgress}
          />
          <Text>50/50</Text>
        </View>
      );
    } else {
      return (
        <View style={{ flexDirection: "row" }}>
          <ProgressBarAndroid
            style={{ flex: 1 }}
            styleAttr="Horizontal"
            indeterminate={false}
            color="yellow"
            progress={kingRaterProgress}
          />
          <Text>{`${cUser && cUser.data ? cUser.data.points : 0}/50`}</Text>
        </View>
      );
    }
  }
  function mangoSquire() {}
  const currentFairpriceCards = [
    {
      id: "bd7adfdf-c1b1-46cx-aed5-3vd53abb28ba",
      quantity: cUser ? cUser.data.fairprice1 : 0,
      fairpriceLogo: require("../assets/1.png"),
      value: 1,
    },
    {
      id: "bd7adfdf-c1b1-46cx-aed5-3ad53abb28ba",
      quantity: cUser ? cUser.data.fairprice5 : 0,
      fairpriceLogo: require("../assets/5.png"),
      value: 5,
    },
    {
      id: "bbd7adfdf-c1b1-46cx-aed5-3ad53abb28ba",
      quantity: cUser ? cUser.data.fairprice10 : 0,
      fairpriceLogo: require("../assets/10.png"),
      value: 10,
    },
  ];
  const currentFairpriceCardsDisplay = currentFairpriceCards.filter(
    (item) => item.quantity > 0
  );
  const fairpriceCards = [
    {
      id: "bd7adfdf-c1b1-46cx-aed5-3vd53abb28ba",
      value: -100,
      dollarValue: 1,
      fairpriceLogo: require("../assets/1.png"),
    },
    {
      id: "bd7adfdf-c1b1-46cx-aed5-3ad53abb28ba",
      value: -450,
      dollarValue: 5,
      fairpriceLogo: require("../assets/5.png"),
    },
    {
      id: "bd7adfdf-c1b1-46ml-aed5-3vd53abb28ba",
      value: -850,
      dollarValue: 10,
      fairpriceLogo: require("../assets/10.png"),
    },
  ];
  const Badges = [
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
      title: "First!",
      description: "Submit a form through the accuracy form",
      imgAchieved: require("../assets/First!Achieved.png"),
      imgNotAchieved: require("../assets/First!NotAchieved.png"),
      achieved: firstAchievedOrNot(),
      currentProgressBarProgress: firstAchievedBarProgress(),
      progressText: firstProgressText(),
      titleDisplayed: "First!",
    },
    {
      id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
      title: "BigRater",
      description: "Submit 10 forms through the accuracy form",
      imgAchieved: require("../assets/BigRaterAchieved.png"),
      imgNotAchieved: require("../assets/BigRaterNotAchieved.png"),
      achieved: bigRaterAchievedOrNot(),
      currentProgressBarProgress: bigRaterProgressBarProgress(),
      progressNumber: 4,
      progressText: bigRaterProgressText(),
      titleDisplayed: "Big Rater",
    },
    {
      id: "3ac68afc-c605-48d3-a4c8-fbx91aa97f63",
      title: "KingRater",
      description: "Submit 50 forms through the accuracy form",
      imgAchieved: require("../assets/KingRaterAchieved.png"),
      imgNotAchieved: require("../assets/KingRaterNotAchieved.png"),
      achieved: kingRaterAchievedOrNot(),
      currentProgressBarProgress: kingRaterAchievedBarProgress(),
      progressText: kingRaterProgressText(),
      titleDisplayed: "King Rater",
    },
  ];
  const achievedBadges = Badges.filter((badge) => badge.achieved);
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
  const buyGiftcard = async (value) => {
    const docRef = doc(db, "loginInformation", loginID);
    await updateDoc(docRef, {
      [`fairprice${value}`]: increment(-1),
    });

    Linking.openURL("https://www.fairprice.com.sg/accounts?tab=vouchers");
  };
  const yesOptionForCard = async () => {
    const gemsLeftAfterBuying = cUser.data.gems + selectedGemValue;
    if (gemsLeftAfterBuying >= 0) {
      setModalVisible(!modalVisible);
      console.log("Selected gem value:", selectedGemValue);
      const docRef = doc(db, "loginInformation", loginID);
      Alert.alert("giftcard successfully added");

      await updateDoc(docRef, {
        gems: increment(selectedGemValue),
        [`fairprice${selectedGiftCardDollarValue}`]: increment(1),
      });
    } else {
      setModalVisible(!modalVisible);
      Alert.alert("Not enough gems");
    }
  };

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
                <View style={{ flexDirection: "row" }}>
                  <Text>{top2User.data.points}</Text>
                  <Image
                    source={require("../assets/EXP.png")}
                    style={{ height: 25, width: 25 }}
                  ></Image>
                </View>
              </View>
            )}
            {top1User && (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>1</Text>
                <View style={styles.podium1} />
                <Text>{top1User.data.username}</Text>
                <View style={{ flexDirection: "row" }}>
                  <Text>{top1User.data.points}</Text>
                  <Image
                    source={require("../assets/EXP.png")}
                    style={{ height: 25, width: 25 }}
                  ></Image>
                </View>
              </View>
            )}
            {top3User && (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>3</Text>
                <View style={styles.podium3} />
                <Text>{top3User.data.username}</Text>
                <View style={{ flexDirection: "row" }}>
                  <Text>{top3User.data.points}</Text>
                  <Image
                    source={require("../assets/EXP.png")}
                    style={{ height: 25, width: 25 }}
                  ></Image>
                </View>
              </View>
            )}
          </View>
          <View style={{ flex: 1, width: "100%" }}>
            <FlatList
              style={{ flex: 1, width: "100%" }}
              contentContainerStyle={{ flexGrow: 1 }}
              data={sortUsersWithoutTop3}
              renderItem={({ item, index }) => (
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
                  <Text style={{ fontSize: 25, marginRight: 10 }}>
                    {index + 4}
                  </Text>
                  <Text style={{ fontSize: 25, flex: 1 }}>
                    {item.data.username}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{ fontSize: 15, minWidth: 80, textAlign: "right" }}
                    >
                      Exp: {item.data.points}
                    </Text>
                    <Image
                      source={require("../assets/EXP.png")}
                      style={{ height: 25, width: 25 }}
                    ></Image>
                  </View>
                  <Divider />
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        </>
      );
    } else if (value === "badges") {
      return (
        <View style={styles.badgesContainer}>
          <Text style={{ fontSize: 25, fontWeight: "bold" }}>Badges</Text>

          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <FlatList
              style={{ width: "100%" }}
              contentContainerStyle={{ alignItems: "center" }}
              numColumns={4}
              data={achievedBadges}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: "white",
                    alignItems: "center",
                    padding: 10,
                    margin: 3,
                    elevation: 4,
                  }}
                >
                  <Image
                    source={
                      item.achieved ? item.imgAchieved : item.imgNotAchieved
                    }
                    style={{ height: 80, width: 80 }}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>

          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>Progress</Text>
            <ScrollView
              contentContainerStyle={{ alignItems: "center" }}
              style={{ maxHeight: 300 }}
            >
              <FlatList
                style={{
                  flex: 1,
                  width: "100%",
                  marginTop: 10,
                }}
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
                        style={{ height: 70, width: 70 }}
                      />
                    </View>
                    <View style={{ flexDirection: "column", marginLeft: 10 }}>
                      <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                        {item.titleDisplayed}
                      </Text>
                      <Text style={{ fontSize: 12 }}>{item.description}</Text>
                      <View>{item.progressText}</View>
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item.id}
              />
            </ScrollView>
          </View>
        </View>
      );
    }

    if (value == "rewards") {
      return (
        <ScrollView style={styles.storeContainerGift}>
          <View style={{ flex: 1, width: "100%", alignItems: "center" }}>
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>
              Buy giftcards
            </Text>
            <FlatList
              style={{ maxHeight: 180, width: "100%" }}
              contentContainerStyle={{ flexGrow: 1 }}
              data={fairpriceCards}
              horizontal={true}
              renderItem={({ item }) => (
                <View
                  style={{
                    paddingTop: 30,
                    margin: -12,
                    elevation: 4,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImage(item.fairpriceLogo);
                      setSelectedGemValue(item.value);
                      setGiftCardDollarValue(item.dollarValue);
                      setModalVisible(true);
                    }}
                  >
                    <Image
                      source={item.fairpriceLogo}
                      style={{ height: 150, width: 200, resizeMode: "contain" }} // Adjust image size here
                    />
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />

            <Text style={{ fontSize: 25, fontWeight: "bold", marginTop: 30 }}>
              Your giftcards
            </Text>
            <FlatList
              style={{ flex: 1, width: "100%", marginTop: 10 }}
              contentContainerStyle={{ flexGrow: 1 }}
              data={currentFairpriceCardsDisplay}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: "white",
                    flexDirection: "row",
                    alignItems: "center",
                    margin: 3,
                    marginVertical: 10,
                    elevation: 4,
                    height: 80,
                  }}
                >
                  <View style={{ marginLeft: -20 }}>
                    <Image
                      source={item.fairpriceLogo}
                      style={{
                        height: 80,
                        width: 120,
                        resizeMode: "contain",
                      }} // Adjust image size here
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "column",

                      paddingBottom: 20,
                    }}
                  >
                    <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                      Fairprice X{item.quantity}
                    </Text>
                    <Text>Value: ${item.value}</Text>
                    <Text style={{ fontSize: 13 }}>{item.description}</Text>
                    <View>{item.progressText}</View>
                  </View>
                  <TouchableOpacity
                    onPress={() => buyGiftcard(item.value)}
                    style={{ paddingLeft: 70 }}
                  >
                    <Text
                      style={{
                        fontSize: 25,
                        color: "purple",
                        marginLeft: -40,
                      }}
                    >
                      use
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            {selectedImage && (
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Image
                    source={selectedImage}
                    style={{ height: 200, width: 300, resizeMode: "contain" }}
                  />
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 20 }}>{selectedGemValue}</Text>
                    <Image
                      source={require("../assets/gems.png")}
                      style={{ height: 35, width: 35 }}
                    ></Image>
                  </View>
                  <TouchableOpacity onPress={yesOptionForCard}>
                    <Text style={{ fontSize: 20, color: "purple" }}>
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Modal>
        </ScrollView>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 40 }}>
            Exp: {cUser ? cUser.data.points : "loading..."}
          </Text>
          <Image
            source={require("../assets/EXP.png")}
            style={{ height: 50, width: 50 }}
          ></Image>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 40 }}>
            Gems: {cUser ? cUser.data.gems : "loading..."}
          </Text>
          <Image
            source={require("../assets/gems.png")}
            style={{ height: 50, width: 50 }}
          ></Image>
        </View>
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
              {
                value: "rewards",
                label: "Rewards",
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
    flex: 1,
    width: "100%",
    alignItems: "center",
  },

  storeContainerGift: {
    flex: 1,
    width: "90%",
    height: 120,
  },
  storeContainerGiftContent: {
    alignItems: "center",
    justifyContent: "center",
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
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
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default FetchUserData;
