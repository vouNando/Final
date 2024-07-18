import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, Image, Button } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from "../config/config"; // Importa db desde tu configuración de Firebase
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { push, ref as dbRef, set } from 'firebase/database'; // Importa push y ref desde database
import { Audio } from "expo-av";

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sound.mp3/register.mp3')
    );
    setSound(sound);

    await sound.playAsync();
  }

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  };

  useEffect(() => {
    playSound();

    return () => {
      stopSound();
    };
  }, []);

  

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); 
    }
  };

  async function subir() {
    if (usuario && email && password && image) {
      const extension = image.split('.').pop(); // Obtiene la extensión del archivo
      const fileName = `avatar_${Date.now()}.${extension}`; // Genera un nombre único para la imagen
      const storageRef = ref(storage, `avatars/${fileName}`); // Define la referencia en el storage de Firebase con el nombre único

      try {
        const response = await fetch(image);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob);
        console.log('Imagen subida correctamente a Firebase Storage');

        // Obtén la URL de descarga de la imagen subida
        const downloadURL = await getDownloadURL(storageRef);

        // Guarda los datos del usuario en la base de datos en tiempo real
        const newUserRef = push(dbRef(db, 'usuarios'));
        set(newUserRef, {
          usuario: usuario,
          email: email,
          imageURL: downloadURL,
          timestamp: new Date().getTime(),
        });

        Alert.alert("Éxito", "¡Usuario registrado correctamente!");
        setUsuario('');
        setEmail('');
        setPassword('');
        setImage(null);
        navigation.navigate('Login');

      } catch (error) {
        console.error('Error al subir la imagen:', error);
        Alert.alert("Error", "Hubo un problema al subir la imagen.");
      }
    } else {
      Alert.alert("Advertencia", "Por favor completa todos los campos antes de registrar al usuario.");
    }
  }

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); 
    }
  };

  const guardarUsuario = () => {
    if (usuario && email && password) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          subir(); // Llama a la función subir para guardar la imagen y los datos del usuario
        })
        .catch(error => {
          Alert.alert("Error", "Hubo un problema al registrar el usuario: " + error.message);
        });
    } else {
      Alert.alert("Advertencia", "Por favor ingresa un usuario, email y contraseña válidos.");
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://e1.pxfuel.com/desktop-wallpaper/22/1001/desktop-wallpaper-galaxy-vertical-portrait.jpg" }}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.containerdos}>
          <Text style={styles.text}>¡REGÍSTRATE Y DIVIÉRTETE!</Text>
          <Text style={styles.textDos}>Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu usuario"
            placeholderTextColor='#434242f7'
            onChangeText={text => setUsuario(text)}
          />
          <Text style={styles.textDos}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu email"
            placeholderTextColor='#434242f7'
            onChangeText={text => setEmail(text)}
          />
          <Text style={styles.textDos}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor='#434242f7'
            value={password}
            onChangeText={text => setPassword(text)}
            secureTextEntry
          />
          <View style={styles.imageContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>Seleccionar Imagen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Text style={styles.imageButtonText}>Tomar Foto</Text>
            </TouchableOpacity>
            <Button title='SUBIR IMAGEN' color={'green'} onPress={subir} />
          </View>
          {image && <Image source={{ uri: image }} style={styles.image} />}
          <TouchableOpacity style={styles.imageButton} onPress={guardarUsuario}>
            <Text style={styles.btntext}>REGISTRARSE Y JUGAR</Text>
          </TouchableOpacity>
        
          <Text style={styles.textTres}>¿YA TIENES CUENTA?</Text>
          <TouchableOpacity style={styles.imageButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btntext}>INICIAR SESION</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerdos: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e2e2ef7',
    borderRadius: 30,
    padding: 20,
  },
  text: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginVertical: 35,
    textAlign: 'center',
  },
  textDos: {
    fontSize: 19,
    color: 'white',
    marginVertical: 10,
    textAlign: 'left',
  },
  textTres: {
    padding: 20,
    color: '#7a7a7a',
    textAlign: 'center',
  },
  btntext: {
    color: '#817e7ef7',
    fontSize: 15,
  },
  input: {
    height: 50,
    width: '80%',
    marginVertical: 10,
    borderRadius: 21,
    fontSize: 20,
    backgroundColor: '#1c1c1cf7',
    paddingHorizontal: 20,
    color: '#747272f7',
    textAlign: 'center',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  imageButton: {
    backgroundColor: '#0f0f0ff7',
    padding: 10,
    borderRadius: 10,
  },
  imageButtonText: {
    color: '#817e7ef7',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius:10,
    marginVertical: 10,
  },
});

export default RegisterScreen;
