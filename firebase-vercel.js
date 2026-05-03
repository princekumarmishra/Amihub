// Firebase configuration for Vercel serverless
const admin = require('firebase-admin');

// Check if Firebase app is already initialized
if (!admin.apps.length) {
  try {
    // For Vercel, we need to initialize with environment variables
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'amihub-e8153',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.projectId}-default-rtdb.firebaseio.com`
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // For development, fall back to service account file
    try {
      const serviceAccount = require('./firebase-service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
      });
    } catch (fallbackError) {
      console.error('Firebase fallback initialization failed:', fallbackError);
    }
  }
}

const db = admin.firestore();
const auth = admin.auth();

// Firebase helpers for serverless
const firebaseHelpers = {
  // User operations
  async createUser(userData) {
    try {
      const userRef = db.collection('users').doc(userData.uid);
      await userRef.set(userData);
      return userData;
    } catch (error) {
      throw new Error('Failed to create user: ' + error.message);
    }
  },

  async getUserById(uid) {
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return null;
      }
      return { uid: userDoc.id, ...userDoc.data() };
    } catch (error) {
      throw new Error('Failed to get user: ' + error.message);
    }
  },

  async getUserByEmail(email) {
    try {
      const userSnapshot = await db.collection('users').where('email', '==', email).get();
      if (userSnapshot.empty) {
        return null;
      }
      const userDoc = userSnapshot.docs[0];
      return { uid: userDoc.id, ...userDoc.data() };
    } catch (error) {
      throw new Error('Failed to get user by email: ' + error.message);
    }
  },

  async updateUser(uid, updateData) {
    try {
      const userRef = db.collection('users').doc(uid);
      await userRef.update(updateData);
      const updatedDoc = await userRef.get();
      return { uid: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      throw new Error('Failed to update user: ' + error.message);
    }
  },

  // Project operations
  async createProject(projectData) {
    try {
      const projectRef = db.collection('projects').doc();
      const project = {
        ...projectData,
        _id: projectRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await projectRef.set(project);
      return project;
    } catch (error) {
      throw new Error('Failed to create project: ' + error.message);
    }
  },

  async getProjects() {
    try {
      const projectsSnapshot = await db.collection('projects').get();
      return projectsSnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Failed to get projects: ' + error.message);
    }
  },

  async getProjectsByStudent(studentId) {
    try {
      const projectsSnapshot = await db.collection('projects')
        .where('studentId', '==', studentId)
        .get();
      return projectsSnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Failed to get student projects: ' + error.message);
    }
  },

  async deleteProject(projectId) {
    try {
      await db.collection('projects').doc(projectId).delete();
      return true;
    } catch (error) {
      throw new Error('Failed to delete project: ' + error.message);
    }
  },

  // Review operations
  async createReview(reviewData) {
    try {
      const reviewRef = db.collection('reviews').doc();
      const review = {
        ...reviewData,
        _id: reviewRef.id,
        createdAt: new Date().toISOString()
      };
      await reviewRef.set(review);
      return review;
    } catch (error) {
      throw new Error('Failed to create review: ' + error.message);
    }
  },

  async getReviewsByMentor(mentorId) {
    try {
      const reviewsSnapshot = await db.collection('reviews')
        .where('mentorId', '==', mentorId)
        .get();
      return reviewsSnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Failed to get mentor reviews: ' + error.message);
    }
  }
};

module.exports = { firebaseHelpers, admin, db, auth };
