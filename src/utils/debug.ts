export const debugFirebaseConfig = () => {
  console.log('=== Firebase Configuration Debug ===');
  console.log('API Key:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing');
  console.log('Auth Domain:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing');
  console.log('Project ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
  console.log('Storage Bucket:', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Missing');
  console.log('Messaging Sender ID:', process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing');
  console.log('App ID:', process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Missing');
  console.log('=====================================');
};