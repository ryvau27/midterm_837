import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('upm_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('upm_user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      // For demo purposes, we'll validate against hardcoded users
      // In a real app, this would be an API call
      const validUsers = {
        'dr.smith': { password: 'physician123', role: 'physician', personID: 1, name: 'Dr. Smith' },
        'john.doe': { password: 'patient123', role: 'patient', personID: 2, name: 'John Doe' },
        'nurse.jane': { password: 'nurse123', role: 'nurse', personID: 3, name: 'Nurse Jane' },
        'admin': { password: 'admin123', role: 'admin', personID: 4, name: 'Admin User' }
      };

      const userData = validUsers[username];
      if (userData && userData.password === password) {
        const userInfo = {
          personID: userData.personID,
          username,
          role: userData.role,
          name: userData.name
        };

        // Store in localStorage
        localStorage.setItem('upm_user', JSON.stringify(userInfo));
        setUser(userInfo);

        return { success: true, user: userInfo };
      } else {
        return { success: false, message: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('upm_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
