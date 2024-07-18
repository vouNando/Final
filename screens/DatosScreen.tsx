import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, TextInput, Alert, Image } from "react-native";
import { auth } from "../config/config";
import { onAuthStateChanged, sendEmailVerification, updateEmail } from "firebase/auth"; // Importa sendEmailVerification y updateEmail desde firebase/auth
import { Audio } from "expo-av";

const DatosScreen = ({ navigation }: any) => {

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [editing, setEditing] = useState(false); // Estado para controlar la edición
  const [newEmail, setNewEmail] = useState(""); // Estado para almacenar el nuevo email
  const [userImage, setUserImage] = useState<string | null>(null); // Estado para almacenar la URL de la imagen

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

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Aquí deberías obtener la URL de la imagen del usuario desde Firebase Database o Firestore
        // Supongamos que la imagen está almacenada como parte de los datos del usuario
        setUserImage(user.imageURL); // Ajusta esto según cómo estés almacenando la URL de la imagen en tu base de datos
      } else {
        setCurrentUser(null);
        setUserImage(null);
      }
    });

    return unsubscribe;
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setNewEmail(currentUser.email); // Puedes inicializar con el valor actual del usuario
  };

  const handleSave = async () => {
    try {
      await sendEmailVerification(currentUser); // Envía un correo de verificación al usuario
      Alert.alert("Verificación de Email", "Se ha enviado un correo de verificación. Por favor, verifica tu nuevo email antes de continuar.");
      setEditing(false); // Desactiva la edición después de enviar el correo de verificación
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el correo de verificación. Inténtalo de nuevo.");
      console.error("Error sending verification email:", error);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://i.pinimg.com/564x/c0/0c/16/c00c160278e73916660d1da3e2b34f03.jpg' }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Datos del Usuario</Text>
        {currentUser ? (
          <View style={styles.usuarioContainer}>
            {editing ? (
              <View>
                <TextInput
                  style={styles.input}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="Nuevo Email"
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.text}>Email: {currentUser.email}</Text>
                {userImage && <Image source={{ uri: userImage }} style={styles.image} />}
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.text}>No hay usuario autenticado</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Game")}>
          <Text style={styles.buttonText}>Iniciar a jugar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate("Menu")}>
          <Text style={styles.buttonText}>Volver al Menú</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate("ModeSelection")}>
          <Text style={styles.buttonText}>Volver Modo Seleccion</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  usuarioContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "white",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#0f0f0f",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  menuButton: {
    backgroundColor: "#0f0f0f",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
  },
  input: {
    backgroundColor: 'white',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "#0f0f0f",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  saveButton: {
    backgroundColor: "#0f0f0f",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
  },
});

export default DatosScreen;
