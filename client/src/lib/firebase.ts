import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { apiRequest } from "./queryClient";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  
  // Create user in backend
  await createUserInBackend(userCredential.user);
  
  return userCredential;
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  await createUserInBackend(userCredential.user);
  return userCredential;
};

// Sign in with GitHub
export const signInWithGithub = async () => {
  const userCredential = await signInWithPopup(auth, githubProvider);
  await createUserInBackend(userCredential.user);
  return userCredential;
};

// Sign out
export const signOut = async () => {
  return firebaseSignOut(auth);
};

// Create user in backend
export const createUserInBackend = async (user: FirebaseUser) => {
  try {
    const idToken = await user.getIdToken();
    
    await apiRequest('POST', '/api/users', {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
    });
  } catch (error) {
    console.error('Error creating user in backend:', error);
    throw error;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Update user display name
export const updateUserProfile = async (displayName: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in');
  
  try {
    await updateProfile(user, { displayName });
    
    // Update user in backend
    await apiRequest('PATCH', '/api/users/profile', {
      displayName
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Re-authenticate user before changing password
export const reauthenticateUser = async (password: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No authenticated user found or user has no email');
  
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  return true;
};

// Update user password
export const changePassword = async (newPassword: string, currentPassword?: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in');
  
  try {
    // If current password provided, reauthenticate first
    if (currentPassword) {
      await reauthenticateUser(currentPassword);
    }
    
    await updatePassword(user, newPassword);
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export { auth, db, storage };
