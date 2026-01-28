// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRYZJbrD5seHheEWv1bqqoDLESm0aTvPo",
  authDomain: "yt-clone-cf50e.firebaseapp.com",
  projectId: "yt-clone-cf50e",
  storageBucket: "yt-clone-cf50e.firebasestorage.app",
  messagingSenderId: "786468564766",
  appId: "1:786468564766:web:0fb4040bb885967740230f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

/**
 * Signs the user in with a Google popup.
 * @returns a promise that resolves with the user's credentials.
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs the user out.
 * @returns a promise that resolves when the user is signed out.
 */
export function signOut() {
    return auth.signOut();
}

/**
 * Trigger a callback when user auth state changes.
 * @returns A function to unsubscribe callback.
 * 
 * This function will allow the application to react immediately to an event without
 * having to check a user's log in status manually.
 */
export function onAuthStateChangedHelper(callback:  (user: User | null) => void) {
    return onAuthStateChanged(auth,callback);
}