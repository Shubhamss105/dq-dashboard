import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqL14dTemJLyySC5O6jv2z1lXXfo80Zko",
  authDomain: "data-a0e04.firebaseapp.com",
  databaseURL: "https://data-a0e04-default-rtdb.firebaseio.com",
  projectId: "data-a0e04",
  storageBucket: "data-a0e04.firebasestorage.app",
  messagingSenderId: "1035101822405",
  appId: "1:1035101822405:web:dc0579e30e9d57fcc4bfac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

export { messaging };