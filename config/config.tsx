import { initializeApp } from "firebase/app";
import { getDatabase} from "firebase/database";
import { getAuth} from "firebase/auth";

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDExPOU41qzJlRuqpUoii_v6YdBH5SdXxI",
  authDomain: "prueba-1c17e.firebaseapp.com",
  databaseURL: "https://prueba-1c17e-default-rtdb.firebaseio.com",
  projectId: "prueba-1c17e",
  storageBucket: "prueba-1c17e.appspot.com",
  messagingSenderId: "266323672085",
  appId: "1:266323672085:web:af2bc709f4f9429654e21c"
};
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
//export const auth = getAuth(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const storage = getStorage(app);