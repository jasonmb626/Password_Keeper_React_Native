import React, { useState, useEffect, useCallback } from "react";
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
import { useDispatch } from "react-redux";

import Card from "../Components/Card";
import * as authActions from "../store/actions/auth";
import Constants from "expo-constants";
import * as LocalAuthentication from "expo-local-authentication";

const FORM_INPUT_UPDATE = "FORM_INPUT_UPDATE";

const AuthScreen = props => {
  const [authenticated, setAuthenticated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [failedCount, setFailedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
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
        setAuthenticated(true);
        setFailedCount(0);
      } else {
        setFailedCount(failedCount + 1);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      email: "",
      password: ""
    },
    inputValidities: {
      email: false,
      password: false
    },
    formIsValid: false
  });

  useEffect(() => {
    if (error) {
      Alert.alert("An Error Occurred!", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const authHandler = async () => {
    let action;
    action = authActions.login(
      formState.inputValues.email,
      formState.inputValues.password
    );
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(action);
      props.navigation.navigate("Shop");
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier
      });
    },
    [dispatchFormState]
  );

  console.log("Rendering");
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
              onInputChange={inputChangeHandler}
              initialValue=""
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
              onInputChange={inputChangeHandler}
              initialValue=""
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
            <Button
              title={
                authenticated
                  ? "Reset and begin Authentication again"
                  : "Begin Authentication"
              }
              onPress={() => {
                clearState();
                if (Platform.OS === "android") {
                  setModalVisible(!modalVisible);
                } else {
                  scanFingerPrint();
                }
              }}
            />
            {authenticated && (
              <Text style={styles.text}>Authentication Successful! 🎉</Text>
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

AuthScreen.navigationOptions = {
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

export default AuthScreen;
