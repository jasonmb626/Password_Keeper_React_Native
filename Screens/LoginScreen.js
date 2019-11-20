import React, { useState, useEffect } from "react";
import {
  Platform,
  TouchableHighlight,
  ScrollView,
  View,
  KeyboardAvoidingView,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Text,
  Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";

import Card from "../Components/Card";
import { login, setAuthenticated } from "../store/actions/auth";
import { clearServices } from "../store/actions/services";
import Constants from "expo-constants";
import * as LocalAuthentication from "expo-local-authentication";

const LoginScreen = props => {
  const auth = useSelector(state => state.auth);
  const [modalVisible, setModalVisible] = useState(false);
  const [failedCount, setFailedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  clearState = () => {
    setAuthenticated(false);
    setFailedCount(0);
  };

  scanFingerPrint = async () => {
    try {
      let results = await LocalAuthentication.authenticateAsync();
      if (results.success) {
        setModalVisible(false);
        setFailedCount(0);
        await dispatch(setAuthenticated());
        setUsername("");
        setPassword("");
        props.navigation.navigate("ServiceList", { dispatch });
      } else {
        setFailedCount(failedCount + 1);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (error) {
      Alert.alert("An Error Occurred!", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const authHandler = async () => {
    await dispatch(login(username, password));
    await dispatch(setAuthenticated());
    setUsername("");
    setPassword("");
    props.navigation.navigate("ServiceList", { dispatch });
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={50}
      style={styles.screen}
    >
      <LinearGradient colors={["#ffedff", "#ffe3ff"]} style={styles.gradient}>
        <Card style={styles.authContainer}>
          <ScrollView>
            <Text>Email:</Text>
            <TextInput
              style={styles.input}
              id="email"
              label="E-Mail"
              keyboardType="email-address"
              required
              email
              autoCapitalize="none"
              errorText="Please enter a valid email address."
              onChangeText={text => setUsername(text)}
              value={username}
            />
            <Text>Password:</Text>
            <TextInput
              style={styles.input}
              id="password"
              label="Password"
              keyboardType="default"
              secureTextEntry
              required
              minLength={5}
              autoCapitalize="none"
              errorText="Please enter a valid password."
              onChangeText={text => setPassword(text)}
              value={password}
            />
            <View style={styles.buttonContainer}>
              {isLoading ? (
                <ActivityIndicator size="small" color={"#000000"} />
              ) : (
                <Button
                  title={"Login"}
                  color={"#000000"}
                  onPress={authHandler}
                />
              )}
            </View>
            {!auth.missingCredentials && (
              <Button
                title={"Begin Authentication"}
                onPress={() => {
                  clearState();
                  if (Platform.OS === "android") {
                    setModalVisible(!modalVisible);
                  } else {
                    scanFingerPrint();
                  }
                }}
              />
            )}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onShow={scanFingerPrint}
            >
              <View style={styles.modal}>
                <View style={styles.innerContainer}>
                  <Text>Sign in with fingerprint</Text>
                  <Image
                    style={{ width: 128, height: 128 }}
                    source={require("../assets/fingerprint.png")}
                  />
                  {failedCount > 0 && (
                    <Text style={{ color: "red", fontSize: 14 }}>
                      Failed to authenticate, press cancel and try again.
                    </Text>
                  )}
                  <TouchableHighlight
                    onPress={async () => {
                      LocalAuthentication.cancelAuthenticate();
                      setModalVisible(!modalVisible);
                    }}
                  >
                    <Text style={{ color: "red", fontSize: 16 }}>Cancel</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </Card>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

LoginScreen.navigationOptions = {
  headerTitle: "Authenticate"
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  authContainer: {
    width: "80%",
    maxWidth: 400,
    maxHeight: 400,
    padding: 20
  },
  buttonContainer: {
    marginTop: 10
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    paddingTop: Constants.statusBarHeight,
    padding: 8
  },
  modal: {
    flex: 1,
    marginTop: "90%",
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center"
  },
  innerContainer: {
    marginTop: "30%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    alignSelf: "center",
    fontSize: 22,
    paddingTop: 20
  },
  input: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10
  }
});

export default LoginScreen;
