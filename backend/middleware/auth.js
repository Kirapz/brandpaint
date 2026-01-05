const admin = require('firebase-admin');

// Ініціалізація Firebase Admin SDK тільки якщо всі ключі є
let firebaseInitialized = false;

if (process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_PRIVATE_KEY && 
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY !== '"-----BEGIN PRIVATE KEY-----\\nyour_private_key\\n-----END PRIVATE KEY-----\\n"') {
  
  try {
    if (!admin.apps.length) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      
      firebaseInitialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    console.log('Running without Firebase authentication');
  }
} else {
  console.log('Firebase credentials not configured, running without authentication');
}

// Middleware для перевірки токену
const verifyToken = async (req, res, next) => {
  if (!firebaseInitialized) {
    // Для локального тестування без Firebase
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

// Опціональна авторизація (не блокує запит якщо токену немає)
const optionalAuth = async (req, res, next) => {
  if (!firebaseInitialized) {
    // Для локального тестування
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
    // Просто продовжуємо без користувача
    next();
  }
};

module.exports = { verifyToken, optionalAuth };