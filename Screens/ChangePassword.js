import React, { useState } from "react";
import {
  ScrollView,
  View,
  KeyboardAvoidingView,
  StyleSheet,
  Button,
  Alert,
  TextInput,
  Text
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../store/actions/services";

import Card from "../Components/Card";
import Constants from "expo-constants";

const ChangePasswordScreen = props => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const auth = useSelector(state => state.auth);
  const services = useSelector(state => state.services);
  const dispatch = useDispatch();

  updatePassword = async () => {
    if (password === confirm)
      await dispatch(changePassword(services, password));
    else
      Alert.alert("Passwords do not match.", "Passwords do not match.", [
        { text: "Okay" }
      ]);
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={50}
      style={styles.screen}
    >
      <Card style={styles.authContainer}>
        <ScrollView>
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
          <Text>Confirm Password:</Text>
          <TextInput
            style={styles.input}
            id="confirm"
            label="Confirm"
            keyboardType="default"
            secureTextEntry
            required
            minLength={5}
            autoCapitalize="none"
            errorText="Please enter a valid password."
            onChangeText={text => setConfirm(text)}
            value={confirm}
          />
          <View style={styles.buttonContainer}>
            <Button
              title={"Login"}
              color={"#000000"}
              onPress={() => updatePassword()}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title={"Cancel"}
              color={"#000000"}
              onPress={() => props.navigation.pop()}
            />
          </View>
        </ScrollView>
      </Card>
    </KeyboardAvoidingView>
  );
};

ChangePasswordScreen.navigationOptions = {
  headerTitle: "Change Password"
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
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

export default ChangePasswordScreen;
