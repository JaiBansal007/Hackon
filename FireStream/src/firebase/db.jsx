// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfU99fHdfCGsmO0uXTnQKLVX-2f5IrRd0",
  authDomain: "firestream-e8465.firebaseapp.com",
  databaseURL: "https://firestream-e8465-default-rtdb.firebaseio.com",
  projectId: "firestream-e8465",
  storageBucket: "firestream-e8465.firebasestorage.app",
  messagingSenderId: "869857658241",
  appId: "1:869857658241:web:6bbffa799a37f54e9e9480",
  measurementId: "G-6RXNYL8D6H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, db }