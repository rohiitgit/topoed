import { auth, firestore } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    console.log('Auth instance:', !!auth);
    console.log('Firestore instance:', !!firestore);
    
    // Test Firestore connection
    const testDoc = await addDoc(collection(firestore, 'test'), {
      message: 'Hello from Architects App!',
      timestamp: new Date()
    });
    
    console.log('Firestore test successful! Doc ID:', testDoc.id);
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};