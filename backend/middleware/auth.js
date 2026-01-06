const admin = require('firebase-admin');

let firebaseInitialized = false;

if (process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_PRIVATE_KEY && 
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY !== '"-----BEGIN PRIVATE KEY-----\\nyour_private_key\\n-----END PRIVATE KEY-----\\n"' &&
    !process.env.FIREBASE_PRIVATE_KEY.includes('your_private_key')) {
  
  try {
    if (!admin.apps.length) {
      console.log('Initializing Firebase Admin SDK...');
      console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
      console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
      console.log('Private Key ID:', process.env.FIREBASE_PRIVATE_KEY_ID ? 'Present' : 'Missing');
      console.log('Private Key:', process.env.FIREBASE_PRIVATE_KEY ? 'Present (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'Missing');
      
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      
      firebaseInitialized = true;
      console.log(' Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error(' Firebase initialization failed:', error.message);
    console.error('Full error:', error);
    console.log('Running without Firebase authentication');
  }
} else {
  console.log('🔧 Firebase credentials not configured properly:');
  console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '+' : '-');
  console.log('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '+' : '-');
  console.log('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '+' : '-');
  console.log('Running without Firebase authentication');
}

const verifyToken = async (req, res, next) => {
  if (!firebaseInitialized) {
    req.user = {
      uid: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User'
    };
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authorization token required' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  if (!firebaseInitialized) {
    req.user = {
      uid: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User'
    };
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email
      };
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = { verifyToken, optionalAuth };