import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase';
import { User, UserRole } from '../types';

export const createUser = async (
  email: string,
  password: string,
  role: UserRole,
  name: string
): Promise<User> => {
  try {
    console.log('Creating user with email:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log('Firebase user created:', firebaseUser.uid);

    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      role,
      profile: {
        name,
        skills: [],
        software: [],
        location: '',
      },
      portfolio: [],
      premium: false,
      createdAt: new Date(),
    };

    console.log('Saving user data to Firestore...');
    await setDoc(doc(firestore, 'users', firebaseUser.uid), userData);
    console.log('User data saved successfully');
    return userData;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log('Signing in user with email:', email);
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Sign in successful:', result.user.uid);
    return result;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  return await signOut(auth);
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!auth.currentUser) return null;

  const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};