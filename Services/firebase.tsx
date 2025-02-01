import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAO3etWS-qat1uFFLSjrslHAo0UJwtVa0",
  authDomain: "gas-c3c22.firebaseapp.com",
  databaseURL: "https://gas-c3c22-default-rtdb.firebaseio.com",
  projectId: "gas-c3c22",
  storageBucket: "gas-c3c22.firebasestorage.app",
  messagingSenderId: "334602451880",
  appId: "1:334602451880:web:24d017ddce0d1f84a83b9d",
  measurementId: "G-EZTE4CTZS2"
};

let app: FirebaseApp;
let auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem("user");
    }
  });
}
else {
  app = getApps()[0];
  auth = getAuth();
}


//const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);


export { app, /*db,*/ rtdb, auth, storage,};
