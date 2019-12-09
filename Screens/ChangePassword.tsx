import React, { useState, useContext } from 'react';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
import {
  ScrollView,
  View,
  KeyboardAvoidingView,
  StyleSheet,
  Button,
  Alert,
  TextInput,
  Text
} from 'react-native';
import { Services, changePassword, IService } from '../context/services';
import { Auth } from '../context/auth';
import Card from '../Components/Card';
import Constants from 'expo-constants';

const ChangePasswordScreen: NavigationStackScreenComponent = props => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const services = useContext(Services);
  const auth = useContext(Auth);

  const updatePassword = () => {
    if (password === confirm) {
      changePassword(services.services as IService[], password);
      if (auth && auth.setAuth) auth.setAuth({ ...auth.auth, password });
      props.navigation.pop();
    } else
      Alert.alert('Passwords do not match.', 'Passwords do not match.', [
        { text: 'Okay' }
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
          <Text>New Password:</Text>
          <TextInput
            style={styles.input}
            keyboardType="default"
            secureTextEntry
            autoCapitalize="none"
            onChangeText={text => setPassword(text)}
            value={password}
          />
          <Text>Confirm Password:</Text>
          <TextInput
            style={styles.input}
            keyboardType="default"
            secureTextEntry
            autoCapitalize="none"
            onChangeText={text => setConfirm(text)}
            value={confirm}
          />
          <View style={styles.buttonContainer}>
            <Button
              title={'Change'}
              color={'#000000'}
              onPress={() => updatePassword()}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title={'Cancel'}
              color={'#000000'}
              onPress={() => props.navigation.pop()}
            />
          </View>
        </ScrollView>
      </Card>
    </KeyboardAvoidingView>
  );
};

ChangePasswordScreen.navigationOptions = {
  headerTitle: 'Change Password'
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  authContainer: {
    width: '80%',
    maxWidth: 400,
    maxHeight: 400,
    padding: 20
  },
  buttonContainer: {
    marginTop: 10
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    paddingTop: Constants.statusBarHeight,
    padding: 8
  },
  modal: {
    flex: 1,
    marginTop: '90%',
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerContainer: {
    marginTop: '30%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    alignSelf: 'center',
    fontSize: 22,
    paddingTop: 20
  },
  input: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10
  }
});

export default ChangePasswordScreen;
