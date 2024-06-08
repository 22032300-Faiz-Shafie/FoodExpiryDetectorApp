import React, { createContext, useState } from 'react';
 
//This entire code creates context for authentication -Faiz

const AuthContext = createContext();
 
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
 
  const login = () => {
    setIsLoggedIn(true);
  };
 
  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
<AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
</AuthContext.Provider>
  );
};
 
export default AuthContext;