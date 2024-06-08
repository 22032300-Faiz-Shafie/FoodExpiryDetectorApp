import React, { createContext, useState } from 'react';
 
//This entire code creates context for authentication -Faiz

const AuthContext = createContext();
 
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginID, setLoginID] = useState("");

  const login = () => {
    setIsLoggedIn(true);
  };
 
  const logout = () => {
    setIsLoggedIn(false);
  };

  const loggingInID = (id) => {
    setLoginID(id);
  };

  const loggingOutID = () => {
    setLoginID("");
  };

  return (
<AuthContext.Provider value={{ isLoggedIn, login, logout, loginID, loggingInID, loggingOutID }}>
      {children}
</AuthContext.Provider>
  );
};
 
export default AuthContext;