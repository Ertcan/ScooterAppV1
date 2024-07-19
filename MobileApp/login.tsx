import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Animated } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0)); 

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://10.0.2.2:3000/login', {
        username,
        password,
      });
      
      // Token'ı ve rolü sakla
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('role', response.data.user.role); 
      
      // Kullanıcı rolünü kontrol et
      if (response.data.user.role === 'admin') {
        navigation.navigate('AdminDashboard'); 
      } else {
        navigation.navigate('Home'); 
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage('Yanlış kullanıcı adı veya şifre');
        fadeIn(); 
        console.error('Login error:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }
    }
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
      <Text style={styles.header}>Giriş Yap</Text>
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
      <View style={styles.buttonContainer}>
        <Button title="Giriş Yap" onPress={handleLogin} color="#28a745" />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Kayıt Ol"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
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
  buttonContainer: {
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;
