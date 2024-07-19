import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Animated } from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0)); 

  const handleRegister = () => {
    axios.post('http://10.0.2.2:3000/register', {
      username,
      password,
      role: 'user',
    })
    .then(response => {
      console.log('Kayıt başarılı:', response.data);
      navigation.navigate('Login'); 
    })
    .catch(error => {
      if (error.response) {
        setErrorMessage('Bu kullanıcı adı veya şifre zaten mevcut.');
        fadeIn(); 
      } else {
        console.error('Kayıt hatası:', error);
      }
    });
  };

  const fadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        fadeOut(); 
      }, 2000); 
    });
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setErrorMessage(''); 
    });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/logo.png')} 
        style={styles.logo}
      />
      <Text style={styles.header}>Kayıt Ol</Text>
      {errorMessage ? (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.error}>{errorMessage}</Text>
        </Animated.View>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Kayıt Ol" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default RegisterScreen;
