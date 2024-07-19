import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, Modal, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXJ0Y2FuIiwiYSI6ImNseWx5N3Y3ZjA4ZmIyanFyaW1wbTE1bHYifQ.tyJTX_KmRgTktiL1DL0sVg';
Mapbox.setAccessToken(MAPBOX_TOKEN);

const HomeScreen = ({ navigation }) => {
  const [scooters, setScooters] = useState([]);
  const [location, setLocation] = useState(null);
  const [selectedScooter, setSelectedScooter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [batteryStatus, setBatteryStatus] = useState(0);
  const [isRiding, setIsRiding] = useState(false);
  const [rideDuration, setRideDuration] = useState(0);
  const [rideInterval, setRideInterval] = useState(null); 

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Konum İzni',
          message: 'Bu uygulamanın konumunuza erişmesi gerekiyor.',
          buttonNeutral: 'Daha Sonra Sor',
          buttonNegative: 'İptal',
          buttonPositive: 'Tamam',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; 
  };

  useEffect(() => {
    let watchId;

    const fetchScooters = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('role');
        const response = await axios.get('http://10.0.2.2:3000/scooters', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (role === 'admin') {
          setScooters(response.data);
        } else {
          const availableScooters = response.data.filter(scooter => scooter.battery_status > 20);
          setScooters(availableScooters);
        }
      } catch (error) {
        console.error('Scooter verileri alınırken bir hata oluştu:', error);
      }
    };

    const getLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        watchId = Geolocation.watchPosition(
          (position) => {
            const userLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(userLocation);
          },
          (error) => {
            console.error('Konum alınırken bir hata oluştu:', error);
          },
          { enableHighAccuracy: true, distanceFilter: 10, interval: 10000, fastestInterval: 5000 }
        );
      } else {
        console.error('Konum izni verilmedi.');
      }
    };

    fetchScooters();
    getLocation();

    return () => {
      if (watchId) {
        Geolocation.clearWatch(watchId); 
      }
      if (rideInterval) {
        clearInterval(rideInterval); 
      }
    };
  }, []);

  const handleScooterPress = (scooter) => {
    setSelectedScooter(scooter);
    setBatteryStatus(scooter.battery_status);
    setModalVisible(true);
  };

  const handleStartRide = () => {
    setIsRiding(true);
    setRideDuration(0);
    let elapsedSeconds = 0;
  
    const intervalId = setInterval(() => {
      elapsedSeconds += 1; 
      setRideDuration(elapsedSeconds); 
  
      setBatteryStatus((prevBattery) => {
        if (elapsedSeconds % 10 === 0 && prevBattery > 0) {
          return prevBattery - 1; 
        } else if (prevBattery === 0) {
          clearInterval(intervalId);
          setIsRiding(false);
          return 0;
        } else {
          return prevBattery; 
        }
      });
    }, 1000); 

    setRideInterval(intervalId); 
  };

  const handleEndRide = async () => {
    setIsRiding(false);
    clearInterval(rideInterval); 

    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post('http://10.0.2.2:3000/end-ride', {
        scooterId: selectedScooter.id,
        remainingBattery: batteryStatus,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Sürüş başarıyla bitirildi.');
    } catch (error) {
      console.error('Sürüş bitirme hatası:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hoş Geldiniz!</Text>
      <Mapbox.MapView style={styles.map}>
        {location && (
          <>
            <Mapbox.Camera 
              centerCoordinate={[location.longitude, location.latitude]}
              zoomLevel={12}
            />
            <Mapbox.PointAnnotation
              id="user-location"
              coordinate={[location.longitude, location.latitude]}
            >
              <Mapbox.Callout title="Bu sizin konumunuz!" />
            </Mapbox.PointAnnotation>
          </>
        )}
        {scooters.map((scooter, index) => (
          <Mapbox.PointAnnotation
            key={index}
            id={`scooter-${index}`}
            coordinate={[scooter.longitude, scooter.latitude]}
            onSelected={() => handleScooterPress(scooter)}
          >
            <Mapbox.Callout>
              <Text>{scooter.unique_name}</Text>
            </Mapbox.Callout>
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>

      {selectedScooter && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>✖</Text>
              </TouchableOpacity>
              <Text style={styles.scooterName}>Scooter İsmi: {selectedScooter.unique_name}</Text>
              <Text style={styles.batteryStatus}>Şarj Durumu: {batteryStatus}%</Text>
              {isRiding && (
                <Text style={styles.rideDuration}>Sürüş Süresi: {rideDuration} saniye</Text>
              )}
              {!isRiding ? (
                <TouchableOpacity style={styles.startRideButton} onPress={handleStartRide}>
                  <Text style={styles.startRideButtonText}>Sürüşe Başla</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.endRideButton} onPress={handleEndRide}>
                  <Text style={styles.endRideButtonText}>Sürüşü Bitir</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute', 
    top: 40,
    left: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'black',
  },
  scooterName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  batteryStatus: {
    fontSize: 20,
  },
  rideDuration: {
    fontSize: 18,
    marginTop: 10,
  },
  startRideButton: {
    marginTop: 20,
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
  },
  startRideButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  endRideButton: {
    marginTop: 20,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
  },
  endRideButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
