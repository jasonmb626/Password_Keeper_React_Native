import React, { useState, useEffect, useContext } from 'react';
import { NavigationStackScreenComponent, NavigationStackProp } from 'react-navigation-stack';
import {
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Auth } from '../context/auth';
import Card from '../Components/Card';
import Constants from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import {setLoginCredentialsToDB} from '../db/db';


//This is the first screen a user should see because they either need to be authenticated or reauthenticated (fingerprint).
const LoginScreen: NavigationStackScreenComponent = props => {
  const auth = useContext(Auth);
  const [modalVisible, setModalVisible] = useState(false);
  const [failedCount, setFailedCount] = useState(0); //Number of failed fingerprint scan attempts. It increments or resets, but otherwise is currently unused.
  const [error, setError] = useState(); //With useEffect and Alert, used to alert user of error.
  const [username, setUsername] = useState(''); //Linked to TextInput
  const [password, setPassword] = useState(''); //Linked to TextInput

  //If user chooses fingerprint login, resets everything so it'll work right.  
  const clearState = () => {
    if (auth && auth.setAuth) {
      auth.setAuth({ ...auth.auth, authenticated: false });
    }
    setFailedCount(0);
  };

  //Is run when modal pops up. Attempts to authenticate using fingerprint.
  const scanFingerPrint = async () => {
    try {
      let results = await LocalAuthentication.authenticateAsync();
      if (results.success) {
        setModalVisible(false);
        setFailedCount(0);
        if (auth && auth.setAuth) {
          auth.setAuth({ ...auth.auth, authenticated: true });
        }
        setUsername('');
        setPassword('');
        props.navigation.navigate('ServiceList');
      } else {
        setFailedCount(failedCount + 1);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (error) {
      Alert.alert('An Error Occurred!', error, [{ text: 'Okay' }]);
    }
  }, [error]);

  //Logs user in and redirects to main servicelist page.
  const authHandler = async () => {
    if (username === '') {
      Alert.alert('Please enter a username', error, [{ text: 'Okay' }]);
    } else if (password === '') {
      Alert.alert('Please enter a password', error, [{ text: 'Okay' }]);
    } else {
      if (auth && auth.setAuth) {
        const insertID = await  setLoginCredentialsToDB(username, password).catch(err => console.error(err));
        auth.setAuth({ ...auth.auth, username, password, authenticated: true, missingCredentials: false });
      }
      setUsername('');
      setPassword('');
      props.navigation.navigate('ServiceList');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={50}
      style={styles.screen}
    >
      <LinearGradient colors={['#281f47', '#753369']} style={styles.gradient}>
        <Card style={styles.authContainer}>
          <ScrollView>
            <Text>Email:</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={text => setUsername(text)}
              value={username}
            />
            <Text>Password:</Text>
            <TextInput
              style={styles.input}
              keyboardType="default"
              secureTextEntry
              autoCapitalize="none"
              onChangeText={text => setPassword(text)}
              value={password}
            />
            <View style={styles.buttonContainer}>
                <Button
                  title={'Login'}
                  color={'#000000'}
                  onPress={authHandler}
                />
            </View>
            {!auth.auth.missingCredentials && (
              <Button
                title={'Fingerprint Login'}
                onPress={() => {
                  clearState();
                  setModalVisible(!modalVisible);
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
                    source={require('../assets/fingerprint.png')}
                  />
                  {failedCount > 0 && (
                    <Text style={{ color: 'red', fontSize: 14 }}>
                      Failed to authenticate, press cancel and try again.
                    </Text>
                  )}
                  <TouchableHighlight
                    onPress={async () => {
                      LocalAuthentication.cancelAuthenticate();
                      setModalVisible(!modalVisible);
                    }}
                  >
                    <Text style={{ color: 'red', fontSize: 16 }}>Cancel</Text>
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
  headerTitle: 'Authenticate'
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
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

export default LoginScreen;
