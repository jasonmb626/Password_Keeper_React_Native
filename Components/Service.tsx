import React, { useContext } from 'React';
import {
  withNavigation,
  NavigationRoute,
  NavigationParams
} from 'react-navigation';
import { NavigationStackProp } from 'react-navigation-stack';
import {
  TouchableNativeFeedback,
  View,
  Text,
  StyleSheet,
  Clipboard
} from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Services, IService } from '../context/services';

interface Props {
  id: string;
  navigation: NavigationStackProp<
    NavigationRoute<NavigationParams>,
    NavigationParams
  >;
}

const Service: React.FC<Props> = props => {
  const services = useContext(Services);
  let service: string = '';
  let username: string;
  let password: string;
  let thisService: IService;

  if (services && services.services) {
    thisService = services.services.find(
      service => service.id === props.id
    ) as IService;
    service = thisService.service;
    username = thisService.username;
    password = thisService.password;
  }

  return (
    <TouchableNativeFeedback
      onPress={() =>
        props.navigation.navigate('AddEditService', {
          id: props.id
        })
      }
    >
      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTextBox}>{service}</Text>
        <View style={styles.copyIcons}>
          <TouchableNativeFeedback
            onPress={() => Clipboard.setString(`${username}`)}
          >
            <AntDesign style={styles.copyIcon} name="user" size={24} />
          </TouchableNativeFeedback>
          <TouchableNativeFeedback
            onPress={() => Clipboard.setString(`${password}`)}
          >
            <MaterialCommunityIcons
              style={styles.copyIcon}
              name="textbox-password"
              size={24}
            />
          </TouchableNativeFeedback>
        </View>
      </View>
    </TouchableNativeFeedback>
  );
};

const styles = StyleSheet.create({
  serviceContainer: {
    flexDirection: 'row',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  serviceTextBox: {
    marginLeft: 50
  },
  copyIcons: {
    flexDirection: 'row',
    marginRight: 50
  },
  copyIcon: {
    margin: 20
  }
});

export default withNavigation(Service);
