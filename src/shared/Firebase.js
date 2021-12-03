import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBJt3j3tOxiEPsbf5amaCHqKdqVopjx--k",
  authDomain: "imagecommunity-aabf8.firebaseapp.com",
  projectId: "imagecommunity-aabf8",
  storageBucket: "imagecommunity-aabf8.appspot.com",
  messagingSenderId: "395005360391",
  appId: "1:395005360391:web:b60a4f853dccb92b44ada2",
  measurementId: "G-W4ZVXNB98E"
};

firebase.initializeApp(firebaseConfig);

const apiKey = firebaseConfig.apiKey;
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();
const realTime = firebase.database();

export{auth, apiKey, firestore, storage, realTime};