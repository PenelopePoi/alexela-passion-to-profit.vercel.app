import * as admin from 'firebase-admin';

// Initialize Firebase Admin once across all serverless function invocations
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
    credential: process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
      : admin.credential.applicationDefault(),
  });
}

export const db = admin.firestore();

export async function verifyAuth(authHeader: string | undefined): Promise<admin.auth.DecodedIdToken> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  const token = authHeader.split('Bearer ')[1];
  return admin.auth().verifyIdToken(token);
}
