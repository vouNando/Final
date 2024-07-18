import React, { useEffect, useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../config/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { TextInput } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const loginIni = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        stopSound(); // Detener la música al iniciar sesión
        navigation.navigate('ModeSelection'); // Navegar a GameScreen después de iniciar sesión
        Alert.alert('Acceso', '¡Inicio de sesión exitoso!');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorCode);
        console.log(errorMessage);

        let titulo = '';
        let mensaje = '';

        if (errorCode === 'auth/wrong-password') {
          titulo = 'Error de contraseña';
          mensaje = 'Contraseña incorrecta, revisa tus credenciales';
        } else if (errorCode === 'auth/user-not-found') {
          titulo = 'Error de usuario';
          mensaje = 'Usuario no encontrado, revisa tu correo electrónico';
        } else {
          titulo = 'Error';
          mensaje = 'Revisa tus credenciales de correo y contraseña';
        }

        Alert.alert(titulo, mensaje);
      });
  };

  return (
    <ImageBackground
      source={{ uri: 'https://e1.pxfuel.com/desktop-wallpaper/22/1001/desktop-wallpaper-galaxy-vertical-portrait.jpg' }}
      style={styles.background}>
      <View style={styles.container}>
        <View style={styles.containerdos}>
          <Text style={styles.text}>¡INICIAR SESIÓN!</Text>
          <Text style={styles.textDos}>Correo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu correo"
            placeholderTextColor="white"
            onChangeText={(texto) => setEmail(texto)}
          />
          <Text style={styles.textDos}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="white"
            onChangeText={(texto) => setPassword(texto)}
            secureTextEntry
          />
          <TouchableOpacity style={styles.btn} onPress={loginIni}>
            <Text style={styles.btntext}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
          <View style={styles.textTres}>
            <Text style={{ color: 'white' }}>¿NO TIENES CUENTA?</Text>
            <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.btntext}>REGÍSTRATE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  textTres: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    color: 'white',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerdos: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    padding: 20,
  },
  text: {
    fontSize: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 35,
    color: 'white',
    fontWeight: 'bold',
  },
  textDos: {
    textAlign: 'left',
    color: 'white',
    fontSize: 19,
    marginVertical: 10,
  },
  btn: {
    backgroundColor: '#37B7C3',
    height: 40,
    width: '80%',
    borderRadius: 40,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2, // Añade un borde blanco
    borderColor: '#fff', // Color del borde blanco
  },
  registerBtn: {
    backgroundColor: '#0f0f0ff7',
    height: 40,
    width: '60%', // Ancho ajustado para centrar el botón
    borderRadius: 40,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2, // Añade un borde blanco
    borderColor: '#fff', // Color del borde blanco
  },
  btntext: {
    color: 'white',
    fontSize: 15,
  },
  input: {
    height: 50,
    width: '80%',
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 21,
    fontSize: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    color: 'white',
    textAlign: 'center',
    borderWidth: 2, // Añade un borde blanco
    borderColor: '#fff', // Color del borde blanco
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});
