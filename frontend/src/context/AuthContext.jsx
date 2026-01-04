// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { signup, login, signOut, onAuth } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const register = (email, password) => signup(email, password);
  const signin = (email, password) => login(email, password);
  const logout = () => signOut();

  return (
    <AuthContext.Provider value={{ user, loading, register, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
