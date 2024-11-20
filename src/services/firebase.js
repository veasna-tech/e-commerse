import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAILIZ2BcQNxy-y0tph3fCeCU5G2zoAscs",
  authDomain: "ecommers-web-76fb1.firebaseapp.com",
  projectId: "ecommers-web-76fb1",
  storageBucket: "ecommers-web-76fb1.firebasestorage.app",
  messagingSenderId: "952696028165",
  appId: "1:952696028165:web:44d7e6ce928e45b403706c",
  databaseURL: "https://ecommers-web-76fb1-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Auth helper functions
export const firebaseAuth = {
  register: async (userData) => {
    const { email, password, firstName, lastName, username } = userData;
    
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Store additional user data in Realtime Database
      await set(ref(db, `users/${user.uid}`), {
        firstName,
        lastName,
        username,
        email,
        createdAt: new Date().toISOString()
      });
      
      return {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        username
      };
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    const { email, password } = credentials;
    
    try {
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get additional user data from Realtime Database
      const userDataSnapshot = await get(ref(db, `users/${user.uid}`));
      const userData = userDataSnapshot.val();
      
      return {
        uid: user.uid,
        email: user.email,
        ...userData
      };
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  }
};

export default app; 