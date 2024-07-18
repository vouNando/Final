import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, Image } from 'react-native';
import { db } from '../config/config';
import { ref, push } from 'firebase/database';
import { Audio } from 'expo-av';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const GameScreen = ({ navigation, route } : any) => {

  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sound.mp3/juego.mp3')
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

  
  const { selectedMode } = route.params;

  const [playerPosition, setPlayerPosition] = useState({ x: screenWidth / 2 - 25, y: screenHeight - 100 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bullets, setBullets] = useState([]);
  const [invaders, setInvaders] = useState(generateInvaders());
  const invaderDirection = useRef(1); // 1 para derecha, -1 para izquierda

  const difficulties = {
    easy: { invaderSpeed: 3, bulletFrequency: 2000 },
    normal: { invaderSpeed: 5, bulletFrequency: 1000 },
    hard: { invaderSpeed: 7, bulletFrequency: 500 },
  };

  const [currentDifficulty, setCurrentDifficulty] = useState(selectedMode || 'normal');

  function generateInvaders() {
    let invadersArray = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 7; j++) {
        invadersArray.push({ x: j * 60 + 10, y: i * 60 + 10 });
      }
    }
    return invadersArray;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setInvaders(prevInvaders =>
        prevInvaders.map(invader => ({
          ...invader,
          x: invader.x + difficulties[currentDifficulty].invaderSpeed * invaderDirection.current,
        }))
      );

      if (invaders.some(invader => invader.x <= 0 || invader.x >= screenWidth - 50)) {
        invaderDirection.current *= -1;
        setInvaders(prevInvaders =>
          prevInvaders.map(invader => ({
            ...invader,
            y: invader.y + 50,
          }))
        );
      }
    }, 700);

    return () => clearInterval(interval);
  }, [invaders, currentDifficulty]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBullets(prevBullets =>
        prevBullets.map(bullet => ({ ...bullet, y: bullet.y - 10 })).filter(bullet => bullet.y > 0)
      );
    }, difficulties[currentDifficulty].bulletFrequency);

    return () => clearInterval(interval);
  }, [currentDifficulty]);

  useEffect(() => {
    bullets.forEach(bullet => {
      invaders.forEach(invader => {
        if (
          bullet.x < invader.x + 50 &&
          bullet.x + 10 > invader.x &&
          bullet.y < invader.y + 50 &&
          bullet.y + 20 > invader.y
        ) {
          setScore(prevScore => prevScore + 10);
          setInvaders(prevInvaders => prevInvaders.filter(i => i !== invader));
          setBullets(prevBullets => prevBullets.filter(b => b !== bullet));
        }
      });
    });

    if (invaders.some(invader => invader.y >= screenHeight - 100)) {
      setGameOver(true);
      updateScoreInFirebase(score);
      navigation.navigate('GameOver', { score }); // Asegúrate de que 'GameOver' es el nombre correcto
    }
  }, [bullets, invaders]);

  const handleMoveLeft = () => {
    if (playerPosition.x > 0) {
      setPlayerPosition(prevPosition => ({ ...prevPosition, x: prevPosition.x - 10 }));
    }
  };

  const handleMoveRight = () => {
    if (playerPosition.x < screenWidth - 50) {
      setPlayerPosition(prevPosition => ({ ...prevPosition, x: prevPosition.x + 10 }));
    }
  };

  const handleFire = () => {
    setBullets(prevBullets => [...prevBullets, { x: playerPosition.x + 20, y: playerPosition.y }]);
  };

  const updateScoreInFirebase = async score => {
    try {
      await push(ref(db, 'scores'), { score });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://uvn-brightspot.s3.amazonaws.com/assets/vixes/btg/curiosidades.batanga.com/files/5-cosas-sobre-el-espacio-y-la-materia-que-debemos-tener-claras.jpg' }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.scoreText}>Puntuación: {score}</Text>
        {!gameOver ? (
          <View style={styles.gameContainer}>
            <Image source={require('../assets/nav1.png')} style={[styles.player, { left: playerPosition.x, top: playerPosition.y }]} />
            {invaders.map((invader, index) => (
              <Image key={index} source={require('../assets/bass.png')} style={[styles.invader, { left: invader.x, top: invader.y }]} />
            ))}
            {bullets.map((bullet, index) => (
              <View key={index} style={[styles.bullet, { left: bullet.x, top: bullet.y }]} />
            ))}
            <View style={styles.controlButtons}>
              <TouchableOpacity style={[styles.button, styles.moveLeftButton]} onPress={handleMoveLeft}>
                <Text style={styles.buttonText}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.fireButton]} onPress={handleFire}>
                <Text style={styles.buttonText}>Disparar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.moveRightButton]} onPress={handleMoveRight}>
                <Text style={styles.buttonText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText}>Juego Terminado!</Text>
            <Text style={styles.finalScoreText}>Puntuación Final: {score}</Text>
            <TouchableOpacity
              style={styles.playAgainButton}
              onPress={() => navigation.navigate('ModeSelection')}
            >
              <Text style={styles.playAgainButtonText}>Jugar de Nuevo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gameContainer: {
    position: 'relative',
    width: screenWidth,
    height: screenHeight,
  },
  scoreText: {
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 100,
  },
  player: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  invader: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  bullet: {
    position: 'absolute',
    width: 10,
    height: 20,
    backgroundColor: 'yellow',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100, // Ajusta esta propiedad para mover los botones más arriba
    width: '100%',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  gameOverContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  finalScoreText: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  playAgainButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'rgba(0,0,0,0.5)', 
  },
  playAgainButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default GameScreen;
