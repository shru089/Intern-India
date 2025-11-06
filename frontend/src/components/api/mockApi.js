// This should be the content of src/api/mockApi.js

// Helper function to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user database
const mockUsers = {
  'test@example.com': {
    password: 'password123',
    fullName: 'Anjali Sharma',
    email: 'test@example.com',
    phoneNumber: '9876543210',
    profileImage: 'https://i.pravatar.cc/150?u=test@example.com',
    profileCompletion: 75,
    // --- NEW FIELDS ---
    bio: "Aspiring software developer with a passion for building scalable web applications and exploring new technologies. Eager to apply my skills in a real-world setting.",
    skills: "React, Node.js, MongoDB, Express.js, Python",
    linkedin: "https://linkedin.com/in/example",
    portfolio: "https://example.com"
  }
};

// ... (the rest of the file remains the same)

// Mock internship database
const mockInternships = [
    { id: 1, title: 'AI/ML Intern', company: 'NITI Aayog', location: 'Remote', score: 0.92 },
    { id: 2, title: 'Data Analyst Intern', company: 'Ministry of Statistics', location: 'Delhi', score: 0.88 },
    { id: 3, title: 'Cyber Security Intern', company: 'National Informatics Centre', location: 'Bangalore', score: 0.85 },
    { id: 4, title: 'Frontend Developer Intern', company: 'MyGov India', location: 'Remote', score: 0.95 },
    { id: 5, title: 'Cloud Engineering Intern', company: 'Digital India Corporation', location: 'Hyderabad', score: 0.89 },
];

let mockAppliedInternships = [
    { id: 2, title: 'Data Analyst Intern', company: 'Ministry of Statistics', location: 'Delhi', score: 0.88, status: 'Shortlisted', dateApplied: '2025-09-25' },
];


export const mockApi = {
  login: async (email, password) => {
    await delay(1000);
    const user = mockUsers[email];
    if (user && user.password === password) {
      const { password, ...userData } = user;
      return Promise.resolve(userData);
    }
    return Promise.reject(new Error('Invalid email or password.'));
  },

  register: async (newUserData) => {
    await delay(1000);
    if (mockUsers[newUserData.email]) {
      return Promise.reject(new Error('User with this email already exists.'));
    }
    const user = {
      ...newUserData,
      profileCompletion: 25,
      profileImage: `https://i.pravatar.cc/150?u=${newUserData.email}`
    };
    mockUsers[newUserData.email] = user;
    const { password, ...userData } = user;
    return Promise.resolve(userData);
  },

  getUserProfile: async (email) => {
    await delay(500);
    const user = mockUsers[email];
    if (user) {
      const { password, ...userData } = user;
      return Promise.resolve(userData);
    }
    return Promise.reject(new Error('User profile not found.'));
  },

  updateUserProfile: async (email, updates) => {
      await delay(800);
      if (mockUsers[email]) {
          mockUsers[email] = { ...mockUsers[email], ...updates };
          return Promise.resolve({ success: true }); // This now correctly returns just success
      }
      return Promise.reject(new Error('Failed to update profile.'));
  },
  
  findInternships: async (preferences) => {
      await delay(1500);
      return Promise.resolve(mockInternships);
  },
  
  getAppliedInternships: async (email) => {
      await delay(700);
      return Promise.resolve(mockAppliedInternships);
  },
  
  applyForInternship: async (internshipId) => {
    await delay(600);
    const alreadyApplied = mockAppliedInternships.some(internship => internship.id === internshipId);
    if (alreadyApplied) {
      return Promise.resolve({ success: true, message: 'Already applied.' });
    }
    const internshipToAdd = mockInternships.find(internship => internship.id === internshipId);
    if (internshipToAdd) {
      const newApplication = {
        ...internshipToAdd,
        status: 'Applied',
        dateApplied: new Date().toISOString().split('T')[0],
      };
      mockAppliedInternships.unshift(newApplication);
      return Promise.resolve({ success: true });
    }
    return Promise.reject(new Error('Internship not found.'));
  },
};