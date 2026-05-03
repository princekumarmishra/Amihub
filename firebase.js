// Firebase Configuration for Amity Innovation Hub

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (without service account for demo)
// In production, you'll need to add your service account key
try {
  const serviceAccount = require('./firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://amihub-e8153-default-rtdb.firebaseio.com"
  });
} catch (error) {
  console.log('⚠️  Firebase Admin SDK not initialized - Using mock data');
  console.log('📋 Please follow FIREBASE_SETUP.md to complete Firebase setup');
}

// Export Firebase services (only if initialized)
let db, auth, storage, collections;

if (admin.apps.length > 0) {
  db = admin.firestore();
  auth = admin.auth();
  storage = admin.storage();
  
  // Firestore collections
  collections = {
    users: db.collection('users'),
    projects: db.collection('projects'),
    reviews: db.collection('reviews'),
    teams: db.collection('teams')
  };
} else {
  // Mock collections for when Firebase is not initialized
  collections = {
    users: null,
    projects: null,
    reviews: null,
    teams: null
  };
}

// Helper functions for Firebase operations
const firebaseHelpers = {
  // User operations
  async createUser(userData) {
    // Check if Firebase is initialized
    if (!admin.apps.length) {
      // Return mock user data
      return {
        uid: 'mock-' + Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        studentId: userData.studentId,
        branch: userData.branch,
        year: userData.year,
        role: 'student',
        createdAt: new Date().toISOString()
      };
    }

    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Store additional user data in Firestore
      const userDoc = {
        uid: userRecord.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        studentId: userData.studentId,
        branch: userData.branch,
        year: userData.year,
        role: 'student',
        submissionTracking: {
          currentMonth: new Date().getMonth(),
          currentYear: new Date().getFullYear(),
          submissionsThisMonth: 0,
          lastSubmissionDate: null,
          submissionDates: []
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await collections.users.doc(userRecord.uid).set(userDoc);
      
      return {
        uid: userRecord.uid,
        ...userDoc
      };
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  },

  async getUserByEmail(email) {
    // Check if Firebase is initialized
    if (!admin.apps.length) {
      // Return mock user data for demo
      if (email === 'demo@amity.edu') {
        const currentDate = new Date();
        return {
          uid: 'mock-user-1',
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@amity.edu',
          studentId: 'DEMO001',
          branch: 'CSE',
          year: '3',
          role: 'student',
          submissionTracking: {
            currentMonth: currentDate.getMonth(),
            currentYear: currentDate.getFullYear(),
            submissionsThisMonth: 1,
            lastSubmissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            submissionDates: [
              new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            ]
          }
        };
      }
      return null;
    }

    try {
      const snapshot = await collections.users.where('email', '==', email).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const userDoc = snapshot.docs[0];
      return {
        uid: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      throw new Error(`Error getting user: ${error.message}`);
    }
  },

  async getUserById(uid) {
    // Check if Firebase is initialized
    if (!admin.apps.length) {
      // Return mock user data for demo
      if (uid === 'mock-user-1') {
        const currentDate = new Date();
        return {
          uid: 'mock-user-1',
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@amity.edu',
          studentId: 'DEMO001',
          branch: 'CSE',
          year: '3',
          role: 'student',
          submissionTracking: {
            currentMonth: currentDate.getMonth(),
            currentYear: currentDate.getFullYear(),
            submissionsThisMonth: 1,
            lastSubmissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            submissionDates: [
              new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            ]
          }
        };
      }
      return null;
    }

    try {
      const userDoc = await collections.users.doc(uid).get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      return {
        uid: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      throw new Error(`Error getting user: ${error.message}`);
    }
  },

  // Project operations
  async createProject(projectData) {
    // Check if Firebase is initialized
    if (!admin.apps.length) {
      // Return mock project data
      return {
        _id: 'mock-project-' + Date.now(),
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    try {
      const projectDoc = {
        ...projectData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await collections.projects.add(projectDoc);
      
      return {
        _id: docRef.id,
        ...projectDoc
      };
    } catch (error) {
      throw new Error(`Error creating project: ${error.message}`);
    }
  },

  async getAllProjects() {
    // Check if Firebase is initialized
    if (!admin.apps.length) {
      // Return mock projects
      return getMockProjects();
    }

    try {
      const snapshot = await collections.projects.orderBy('createdAt', 'desc').get();
      
      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error getting projects: ${error.message}`);
    }
  },

  async getProjectById(projectId) {
    try {
      const projectDoc = await collections.projects.doc(projectId).get();
      
      if (!projectDoc.exists) {
        return null;
      }
      
      return {
        _id: projectDoc.id,
        ...projectDoc.data()
      };
    } catch (error) {
      throw new Error(`Error getting project: ${error.message}`);
    }
  },

  async getUserProjects(userId) {
    try {
      const snapshot = await collections.projects
        .where('createdBy', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error getting user projects: ${error.message}`);
    }
  },

  async updateProject(projectId, updateData) {
    try {
      const projectDoc = {
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await collections.projects.doc(projectId).update(projectDoc);
      
      const updatedDoc = await collections.projects.doc(projectId).get();
      
      return {
        _id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      throw new Error(`Error updating project: ${error.message}`);
    }
  },

  async deleteProject(projectId) {
    try {
      await collections.projects.doc(projectId).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting project: ${error.message}`);
    }
  },

  // Review operations
  async createReview(reviewData) {
    try {
      const reviewDoc = {
        ...reviewData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await collections.reviews.add(reviewDoc);
      
      return {
        _id: docRef.id,
        ...reviewDoc
      };
    } catch (error) {
      throw new Error(`Error creating review: ${error.message}`);
    }
  },

  async getProjectReviews(projectId) {
    try {
      const snapshot = await collections.reviews
        .where('projectId', '==', projectId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error getting reviews: ${error.message}`);
    }
  },

  async getAllReviews() {
    // Check if Firebase is initialized
    if (!admin.apps.length) {
      // Return mock reviews
      return getMockReviews();
    }

    try {
      const snapshot = await collections.reviews.orderBy('createdAt', 'desc').get();
      
      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error getting reviews: ${error.message}`);
    }
  },

  // Update user data
  async updateUser(userId, updateData) {
    // Check if Firebase is initialized
    if (!admin.apps.length) {
      // Mock update - just return success
      return true;
    }

    try {
      await collections.users.doc(userId).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }
};

// Mock data functions
function getMockProjects() {
  return [
    {
      _id: '1',
      title: 'AI-Powered Study Assistant',
      description: 'An intelligent chatbot that helps students with their studies using natural language processing and machine learning algorithms.',
      domain: 'AI',
      status: 'ongoing',
      teamSize: 4,
      createdBy: 'mock-user-1',
      createdByName: 'Demo User',
      skills: ['Python', 'TensorFlow', 'NLP', 'React'],
      github: 'https://github.com/example/study-assistant',
      createdAt: '2024-01-15'
    },
    {
      _id: '2',
      title: 'Campus Navigation App',
      description: 'A mobile application that helps new students navigate the campus with AR-based directions and building information.',
      domain: 'Mobile',
      status: 'completed',
      teamSize: 3,
      createdBy: 'mock-user-1',
      createdByName: 'Demo User',
      skills: ['React Native', 'Firebase', 'AR Core'],
      github: 'https://github.com/example/campus-nav',
      createdAt: '2024-02-20'
    },
    {
      _id: '3',
      title: 'Smart Attendance System',
      description: 'A biometric attendance system using facial recognition to automate student attendance tracking.',
      domain: 'AI',
      status: 'planning',
      teamSize: 5,
      createdBy: 'mock-user-1',
      createdByName: 'Demo User',
      skills: ['Python', 'OpenCV', 'Flask', 'MongoDB'],
      github: 'https://github.com/example/attendance',
      createdAt: '2024-03-10'
    },
    {
      _id: '4',
      title: 'Renewable Energy Monitor',
      description: 'IoT-based system for monitoring and optimizing renewable energy consumption in campus buildings.',
      domain: 'Environmental',
      status: 'ongoing',
      teamSize: 6,
      createdBy: 'mock-user-1',
      createdByName: 'Demo User',
      skills: ['Arduino', 'Raspberry Pi', 'Python', 'Solar Panels'],
      github: 'https://github.com/example/energy-monitor',
      createdAt: '2024-01-25'
    },
    {
      _id: '5',
      title: 'Student Loan Calculator',
      description: 'FinTech application for calculating and comparing student loan options with interest projections.',
      domain: 'Fintech',
      status: 'completed',
      teamSize: 4,
      createdBy: 'mock-user-1',
      createdByName: 'Demo User',
      skills: ['React', 'Node.js', 'MongoDB', 'Chart.js'],
      github: 'https://github.com/example/loan-calculator',
      createdAt: '2024-02-15'
    },
    {
      _id: '6',
      title: 'Robotic Arm Assistant',
      description: 'Mechanical engineering project creating a robotic arm for laboratory assistance and automation.',
      domain: 'Mechanical',
      status: 'ongoing',
      teamSize: 5,
      createdBy: 'mock-user-1',
      createdByName: 'Demo User',
      skills: ['Arduino', 'Servo Motors', 'CAD Design', 'Python'],
      github: 'https://github.com/example/robotic-arm',
      createdAt: '2024-03-05'
    },
    {
      _id: '7',
      title: 'E-Learning Platform',
      description: 'Educational technology platform for interactive online courses with video streaming and assessments.',
      domain: 'EdTech',
      status: 'planning',
      teamSize: 7,
      createdBy: 'mock-user-1',
      createdByName: 'Demo User',
      skills: ['MERN Stack', 'WebRTC', 'AWS', 'Video Processing'],
      github: 'https://github.com/example/elearning-platform',
      createdAt: '2024-03-12'
    },
    {
      _id: '8',
      title: 'Healthcare Record System',
      description: 'Medical technology application for managing patient records and appointment scheduling.',
      domain: 'Healthcare',
      status: 'ongoing',
      teamSize: 6,
      createdBy: 'mock-user-1',
      createdByName: 'Demo User',
      skills: ['React', 'Node.js', 'HIPAA Compliance', 'PostgreSQL'],
      github: 'https://github.com/example/healthcare-records',
      createdAt: '2024-02-28'
    },
    {
      _id: '9',
      title: 'Agricultural Yield Predictor',
      description: 'AgriTech solution using machine learning to predict crop yields based on weather and soil data.',
      domain: 'AgriTech',
      status: 'completed',
      teamSize: 4,
      createdBy: 'mock-user-1',
      createdByName: 'Demo User',
      skills: ['Python', 'TensorFlow', 'Data Analysis', 'Weather APIs'],
      github: 'https://github.com/example/yield-predictor',
      createdAt: '2024-01-10'
    }
  ];
}

function getMockReviews() {
  return [
    {
      _id: '1',
      projectId: '1',
      userId: 'mock-user-1',
      userName: 'Demo User',
      rating: 5,
      comment: 'Excellent project! Great use of AI technology.',
      title: 'Amazing Work',
      createdAt: '2024-03-15'
    },
    {
      _id: '2',
      projectId: '2',
      userId: 'mock-user-1',
      userName: 'Demo User',
      rating: 4,
      comment: 'Good navigation app, very useful for new students.',
      title: 'Helpful App',
      createdAt: '2024-03-14'
    }
  ];
}

module.exports = {
  admin,
  db,
  auth,
  storage,
  collections,
  firebaseHelpers
};
