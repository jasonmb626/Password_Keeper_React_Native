import React, { useEffect, useContext } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import {
  NavigationStackScreenComponent,
} from 'react-navigation-stack';
import {
  HeaderButton,
  HeaderButtons,
  Item
} from 'react-navigation-header-buttons';
import { Auth } from '../context/auth';
import { Services, getServices, IService } from '../context/services';
import { Ionicons } from '@expo/vector-icons';
import Service from '../Components/Service';
import { clearLoginCredentialsFromDB } from '../db';

//This is the main screen the user sees after login. It contains all their services (passwords, usernames, notes, etc.)
const PasswordListScreen: NavigationStackScreenComponent = props => {
  const services = useContext(Services);
  const auth = useContext(Auth);

  //
  const logoutHandler = async () => {
    await clearLoginCredentialsFromDB();
    if (auth && auth.setAuth) {
      auth.setAuth({
        username: '',
        password: '',
        missingCredentials: true,
        loading: false,
        authenticated: false
      });
    }
    if (services && services.setServices) {
      services.setServices([]);
    }
    props.navigation.navigate('login');
  };

  useEffect(() => {
    getServices(auth.auth.username, auth.auth.password).then(
      fetchedServices => {
        if (services && services.setServices)
          services.setServices(fetchedServices as IService[]);
      }
    );
    props.navigation.setParams({ logoutHandler });
  }, []);

  return (
    <FlatList
      style={styles.container}
      keyExtractor={item => item.id.toString()}
      data={services.services}
      renderItem={item => <Service id={item.item.id} />}
    />
  );
};

PasswordListScreen.navigationOptions = navData => {
  const logoutHandler = navData.navigation.getParam('logoutHandler');
  return {
    title: 'All Passwords',
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
          onPress={() => navData.navigation.navigate('AddEditService')}
        />
        <Item
          title="Change Password"
          IconComponent={Ionicons}
          iconSize={23}
          show="never"
          onPress={() => navData.navigation.navigate('ChangePassword')}
        />
        <Item
          title="Logout"
          IconComponent={Ionicons}
          iconSize={23}
          show={'never'}
          onPress={logoutHandler}
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
