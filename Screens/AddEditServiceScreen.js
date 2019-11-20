import React, { useState, useEffect } from "react";
import {
  HeaderButton,
  HeaderButtons,
  Item
} from "react-navigation-header-buttons";
import { View, TextInput, Text, StyleSheet, Button, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addUpdateService, deleteService } from "../store/actions/services";
import { Ionicons } from "@expo/vector-icons";
import { logout } from "../store/actions/auth";

const AddEditServiceScreen = props => {
  const [loaded, setLoaded] = useState(false);
  const [serviceData, setServiceData] = useState({});
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const serviceId = props.navigation.getParam("id");
  console.log(`AddEditService: serviceId ${serviceId}`);
  const services = useSelector(state => state.services);
  let service = {};
  useEffect(() => {
    if (serviceId) {
      console.log(`fetching service: ${serviceId}`);
      service = services.find(service => service.id === serviceId);
      console.log(`fetched service: ${serviceId}`);
      console.log(service);
      setServiceData(service);
      setLoaded(true);
    } else {
      service.id = null;
      service.service = "";
      service.username = "";
      service.password = "";
      service.notes = "";
      setLoaded(true);
    }
  }, []);

  if (!loaded) return <Text>Loading</Text>;
  console.log("service");
  console.log(service);
  if (auth && auth.username) {
    service.user = auth.username;
  }

  const onChange = (inputField, text) => {
    setServiceData({ ...serviceData, [inputField]: text });
  };

  return (
    <View style={styles.container}>
      <Text>Service:</Text>
      <TextInput
        style={styles.input}
        id="service"
        label="Service"
        value={serviceData.service}
        onChangeText={onChange.bind(this, "service")}
      />
      <Text>Username:</Text>
      <TextInput
        style={styles.input}
        id="username"
        label="Username"
        value={serviceData.username}
        onChangeText={onChange.bind(this, "username")}
      />
      <Text>Password:</Text>
      <TextInput
        style={styles.input}
        id="password"
        label="Password"
        value={serviceData.password}
        onChangeText={onChange.bind(this, "password")}
      />
      <Text>Notes:</Text>
      <TextInput
        style={styles.input}
        id="notes"
        label="Notes"
        value={serviceData.notes}
        onChangeText={onChange.bind(this, "notes")}
      />
      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          title="Save"
          onPress={() => {
            console.log("Dispatching serviceData");
            dispatch(addUpdateService(serviceData, auth.password));
            props.navigation.pop();
          }}
        />
        <Button
          style={styles.button}
          title="Cancel"
          onPress={() => props.navigation.pop()}
        />
      </View>
    </View>
  );
};

AddEditServiceScreen.navigationOptions = navData => {
  const dispatch = navData.navigation.getParam("dispatch");
  const serviceId = navData.navigation.getParam("id");
  return {
    title: "All Passwords",
    headerRight: () => (
      <HeaderButtons
        HeaderButtonComponent={HeaderButton}
        OverflowIcon={<Ionicons name="md-more" size={23} />}
      >
        <Item
          title="delete"
          IconComponent={Ionicons}
          iconSize={23}
          iconName="md-trash"
          onPress={async () => {
            Alert.alert(
              "Delete this entry?",
              "",
              [
                {
                  text: "OK",
                  onPress: async () => {
                    await dispatch(deleteService(serviceId));
                    navData.navigation.navigate("ServiceList");
                  }
                },
                {
                  text: "Cancel",
                  onPress: () => console.log("Cancel Pressed"),
                  style: "cancel"
                }
              ],
              { cancelable: false }
            );
          }}
        />
        <Item
          title="Change Password"
          show={Item.SHOW_NEVER}
          onPress={() => navData.navigation.navigate("ChangePassword")}
        />
        <Item
          title="Logout"
          show={Item.SHOW_NEVER}
          onPress={async () => {
            await dispatch(logout());
            navData.navigation.navigate("Login");
          }}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  container: {
    margin: 20
  },
  buttonContainer: {
    flexDirection: "row",
    width: "60%",
    justifyContent: "space-between",
    alignSelf: "center"
  },
  input: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10
  },
  button: {
    margin: 10
  }
});

export default AddEditServiceScreen;
