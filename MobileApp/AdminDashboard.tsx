import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminDashboard = ({ navigation }) => {
  const [scooters, setScooters] = useState([]);
  const [newScooter, setNewScooter] = useState({ unique_name: '', battery_status: '', latitude: '', longitude: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedScooter, setSelectedScooter] = useState({ id: '', unique_name: '', battery_status: '', latitude: '', longitude: '' });

  const fetchScooters = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get('http://10.0.2.2:3000/scooters', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Scooterlar:', response.data);
      setScooters(response.data);
    } catch (error) {
      console.error('Scooterları yüklerken hata:', error);
    }
  };

  useEffect(() => {
    fetchScooters();
  }, []);

  const addScooter = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post('http://10.0.2.2:3000/scooters', newScooter, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewScooter({ unique_name: '', battery_status: '', latitude: '', longitude: '' });
      fetchScooters();
    } catch (error) {
      console.error('Scooter eklerken hata:', error);
    }
  };

  const deleteScooter = async (id) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.delete(`http://10.0.2.2:3000/scooters/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchScooters();
    } catch (error) {
      console.error('Scooter silerken hata:', error);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Sil',
      'Bu scooterı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', onPress: () => deleteScooter(id) },
      ],
      { cancelable: false }
    );
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(`http://10.0.2.2:3000/scooters/${selectedScooter.id}`, selectedScooter, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalVisible(false);
      fetchScooters();
    } catch (error) {
      console.error('Scooter güncellerken hata:', error);
    }
  };

  const openUpdateModal = (scooter) => {
    setSelectedScooter({
      id: scooter.id,
      unique_name: scooter.unique_name,
      battery_status: scooter.battery_status.toString(),
      latitude: scooter.latitude.toString(),
      longitude: scooter.longitude.toString(),
    });
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Paneli</Text>
      <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.mapButtonText}>Haritaya Dön</Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>Yeni Scooter Ekle</Text>
      <TextInput placeholder="Unique Name" value={newScooter.unique_name} onChangeText={(text) => setNewScooter({ ...newScooter, unique_name: text })} style={styles.input} />
      <TextInput placeholder="Battery Status" value={newScooter.battery_status} onChangeText={(text) => setNewScooter({ ...newScooter, battery_status: text })} style={styles.input} />
      <TextInput placeholder="Latitude" value={newScooter.latitude} onChangeText={(text) => setNewScooter({ ...newScooter, latitude: text })} style={styles.input} />
      <TextInput placeholder="Longitude" value={newScooter.longitude} onChangeText={(text) => setNewScooter({ ...newScooter, longitude: text })} style={styles.input} />
      <TouchableOpacity style={styles.addButton} onPress={addScooter}>
        <Text style={styles.addButtonText}>Ekle</Text>
      </TouchableOpacity>

      <FlatList
        data={scooters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.scooterItem}>
            <Text>{item.unique_name} - Batarya: {item.battery_status}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.updateButton} onPress={() => openUpdateModal(item)}>
                <Text style={styles.buttonText}>Güncelle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.buttonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {selectedScooter && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Scooter Güncelle</Text>
            <TextInput placeholder="Unique Name" value={selectedScooter.unique_name} onChangeText={(text) => setSelectedScooter({ ...selectedScooter, unique_name: text })} style={styles.input} />
            <TextInput placeholder="Battery Status" value={selectedScooter.battery_status} onChangeText={(text) => setSelectedScooter({ ...selectedScooter, battery_status: text })} style={styles.input} />
            <TextInput placeholder="Latitude" value={selectedScooter.latitude} onChangeText={(text) => setSelectedScooter({ ...selectedScooter, latitude: text })} style={styles.input} />
            <TextInput placeholder="Longitude" value={selectedScooter.longitude} onChangeText={(text) => setSelectedScooter({ ...selectedScooter, longitude: text })} style={styles.input} />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Güncelle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 18,
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  mapButton: {
    backgroundColor: '#007bff',
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  scooterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  updateButton: {
    backgroundColor: '#28a745',
    padding: 10,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
  },
  buttonText: {
    color: '#fff',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 10,
  },
});

export default AdminDashboard;
