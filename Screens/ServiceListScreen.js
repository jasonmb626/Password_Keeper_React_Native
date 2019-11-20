import React, { useEffect } from "react";
import { FlatList, StyleSheet } from "react-native";
import {
  HeaderButton,
  HeaderButtons,
  Item
} from "react-navigation-header-buttons";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import Service from "../Components/Service";
import { getServices } from "../store/actions/services";
import { logout } from "../store/actions/auth";

const PasswordListScreen = props => {
  const data = useSelector(state => state.services);
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  logoutHandler = () => {
    dispatch(logout());
  };
  useEffect(() => {
    dispatch(getServices(auth.username, auth.password));
  }, []);
  console.log("ServiceListScreen: data");
  console.log(data);
  return (
    <FlatList
      style={styles.container}
      keyExtractor={item => item.id.toString()}
      data={data}
      renderItem={item => (
        <Service id={item.item.id} navigation={props.navigation} />
      )}
    />
  );
};

PasswordListScreen.navigationOptions = navData => {
  const dispatch = navData.navigation.getParam("dispatch");
  return {
    title: "All Passwords",
    headerRight: () => (
      <HeaderButtons
        HeaderButtonComponent={HeaderButton}
        OverflowIcon={<Ionicons name="md-more" size={23} />}
      >
        <Item
          title="add"
          IconComponent={Ionicons}
          iconSize={23}
          iconName="md-add-circle-outline"
          onPress={() =>
            navData.navigation.navigate("AddEditService", { dispatch })
          }
        />
        <Item
          title="Change Password"
          IconComponent={Ionicons}
          iconSize={23}
          show={Item.SHOW_NEVER}
          onPress={() => navData.navigation.navigate("ChangePassword")}
        />
        <Item
          title="Logout"
          IconComponent={Ionicons}
          iconSize={23}
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
    flex: 1
  }
});

export default PasswordListScreen;
