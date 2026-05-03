// Firebase Configuration for Frontend
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBh3jLdQwDXYhfjLeTWFTgFsUiFAUCHPsA",
  authDomain: "amihub-e8153.firebaseapp.com",
  projectId: "amihub-e8153",
  storageBucket: "amihub-e8153.firebasestorage.app",
  messagingSenderId: "441933855937",
  appId: "1:441933855937:web:738c69f45df4c5a5c36840",
  measurementId: "G-W3ZHNYLK5H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    console.log('Firebase persistence error:', err);
  });

// Export for use in other files
window.firebaseServices = {
  auth,
  db,
  storage,
  firebase
};
