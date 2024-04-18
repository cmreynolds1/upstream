import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkUserSession } from './checkUserSession';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const verifySession = async () => {
      const isAuthenticated = await checkUserSession();
      setIsLoggedIn(isAuthenticated);
      console.log("Session verified and user is logged in:", isAuthenticated); // Log after session check
      setIsLoading(false);
    };

    verifySession();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
