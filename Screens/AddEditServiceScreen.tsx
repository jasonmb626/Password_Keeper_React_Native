import React, { useState, useEffect, useContext } from 'react';
import {
  NavigationStackScreenComponent,
  NavigationStackProp,
  NavigationStackOptions
} from 'react-navigation-stack';
import {
  NavigationScreenConfigProps,
  NavigationRoute,
  NavigationParams
} from 'react-navigation';
import {
  HeaderButtons,
  HeaderButton,
  Item
} from 'react-navigation-header-buttons';
import { View, TextInput, Text, StyleSheet, Button, Alert } from 'react-native';
import { Services, IService, addUpdateService, deleteService } from '../context/services';
import { Auth } from '../context/auth';
import { Ionicons } from '@expo/vector-icons';
import { clearLoginCredentialsFromDB } from '../db/db';

type NAVDATA = NavigationScreenConfigProps<
  NavigationStackProp<NavigationRoute<NavigationParams>, NavigationParams>,
  unknown
> & {
  navigationOptions: NavigationStackOptions;
};

const AddEditServiceScreen: NavigationStackScreenComponent = props => {
  const [loaded, setLoaded] = useState(false);
  const [serviceData, setServiceData] = useState<IService>({
    id: '',
    service: '',
    username: '',
    password: '',
    notes: ''
  });
  const auth = useContext(Auth);
  const serviceId = props.navigation.getParam('id');
  const services = useContext(Services);
  let service: IService = {
    id: '',
    service: '',
    username: '',
    password: '',
    notes: ''
  };

  const logoutHandler = async (navData: NAVDATA) => {
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
    navData.navigation.navigate('login');
  };

  useEffect(() => {
    if (serviceId && services && services.services) {
      service = services.services.find(
        service => service.id === serviceId
      ) as IService;
      setServiceData(service);
      setLoaded(true);
    } else {
      service = {
        id: '',
        service: '',
        username: '',
        password: '',
        notes: ''
      };
      setLoaded(true);
    }
    props.navigation.setParams({ logoutHandler });
    props.navigation.setParams({ services });
  }, []);

  if (!loaded) return <Text>Loading</Text>;
  if (auth && auth.auth.username) {
    service.user = auth.auth.username;
  }

  const onChange = (inputField: string, text: string) => {
    setServiceData({ ...serviceData, [inputField]: text });
  };

  return (
    <View style={styles.container}>
      <Text>Service:</Text>
      <TextInput
        style={styles.input}
        value={serviceData.service}
        onChangeText={onChange.bind(null, 'service')}
      />
      <Text>Username:</Text>
      <TextInput
        style={styles.input}
        value={serviceData.username}
        onChangeText={onChange.bind(null, 'username')}
      />
      <Text>Password:</Text>
      <TextInput
        style={styles.input}
        value={serviceData.password}
        onChangeText={onChange.bind(null, 'password')}
      />
      <Text>Notes:</Text>
      <TextInput
        style={styles.input}
        value={serviceData.notes}
        onChangeText={onChange.bind(null, 'notes')}
      />
      <View style={styles.buttonContainer}>
        <Button
          title="Save"
          onPress={() => {
            const serviceWithUser = { ...serviceData };
            if (auth && auth.auth && auth.auth.username && auth.auth.password) {
              serviceWithUser.user = auth.auth.username;
              addUpdateService(serviceWithUser, auth.auth.password, services);
            }
            props.navigation.pop();
          }}
        />
        <Button title="Cancel" onPress={() => props.navigation.pop()} />
      </View>
    </View>
  );
};

AddEditServiceScreen.navigationOptions = navData => {
  const logoutHandler = navData.navigation.getParam('logoutHanlder');
  const services = navData.navigation.getParam('services');
  const serviceId = navData.navigation.getParam('id');
  return {
    title: 'All Passwords',
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
              'Delete this entry?',
              '',
              [
                {
                  text: 'OK',
                  onPress: async () => {
                    deleteService(serviceId, services);
                    navData.navigation.navigate('ServiceList');
                  }
                },
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel'
                }
              ],
              { cancelable: false }
            );
          }}
        />
        <Item
          title="Change Password"
          show={'never'}
          onPress={() => navData.navigation.navigate('ChangePassword')}
        />
        <Item
          title="Logout"
          show={'never'}
          onPress={async () => {
            logoutHandler.bind(null, navData);
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
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
    alignSelf: 'center'
  },
  input: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10
  },
  button: {
    margin: 10
  }
});

export default AddEditServiceScreen;
