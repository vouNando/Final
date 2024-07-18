import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const ModeSelectionScreen = ({ navigation }: { navigation: any }) => {

  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sound.mp3/login.mp3')
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

  

  const [selectedMode, setSelectedMode] = useState('normal'); // Default to normal mode

  const handleStartGame = () => {
    navigation.navigate('Game', { selectedMode });
  };

  return (
    <ImageBackground
      source={{ uri: 'https://i.pinimg.com/564x/c0/0c/16/c00c160278e73916660d1da3e2b34f03.jpg' }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.topContainer}>
          <Text style={styles.title}>Selecciona el modo de juego:</Text>
          <TouchableOpacity
            style={[styles.modeButton, selectedMode === 'easy' && styles.selectedModeButton]}
            onPress={() => setSelectedMode('easy')}
          >
            <Text style={styles.buttonText}>Fácil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, selectedMode === 'normal' && styles.selectedModeButton]}
            onPress={() => setSelectedMode('normal')}
          >
            <Text style={styles.buttonText}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, selectedMode === 'hard' && styles.selectedModeButton]}
            onPress={() => setSelectedMode('hard')}
          >
            <Text style={styles.buttonText}>Difícil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
            <Text style={styles.buttonText}>Empezar Juego</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomContainer}>
          <Text style={styles.textodata}>Mas Información de Data</Text>
          <TouchableOpacity style={styles.buttonData} onPress={() => navigation.navigate('Datos')}>
            <Text style={styles.buttonText}>Data</Text>
          </TouchableOpacity>
        </View>
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
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  modeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderColor: 'white',
    borderWidth: 2,
    marginVertical: 5,
  },
  selectedModeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderColor: 'white',
    borderWidth: 2,
  },
  startButton: {
    marginTop: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  textodata: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  buttonData: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 2,
  },
});

export default ModeSelectionScreen;
