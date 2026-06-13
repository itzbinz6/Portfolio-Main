// ============================================================
// FIREBASE CONFIG
// ------------------------------------------------------------
// Paste the config object from your Firebase project here:
// Firebase Console > Project Settings > General > Your apps > Web app (</>) > SDK setup and configuration
//
// Until you fill this in with real values, the site will just
// run normally without the "View More Work" extra projects,
// extra certifications, or extra tools — nothing breaks.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCjqr_1JiDTgMZyku6-QwR_Sw7pDLVRIS0",
  authDomain: "portfolio-73940.firebaseapp.com",
  databaseURL: "https://portfolio-73940-default-rtdb.firebaseio.com",
  projectId: "portfolio-73940",
  storageBucket: "portfolio-73940.firebasestorage.app",
  messagingSenderId: "767148956455",
  appId: "1:767148956455:web:2248161ef2ad36672ca702"
};

// Don't initialize if the config is still placeholder values —
// prevents console errors before you've set things up.
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  firebase.initializeApp(firebaseConfig);
}
