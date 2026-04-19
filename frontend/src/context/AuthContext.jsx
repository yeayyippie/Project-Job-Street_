import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_data');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/login', { email, password });
    const { token, user } = res.data;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    
    setToken(token);
    setUser(user);
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/api/logout');
      }
    } catch (error) {
      console.error("Gagal logout di sisi server", error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setToken(null);
      setUser(null);
    }
  };

  // 🔥 FUNGSI SAKTI TAMBAHAN 🔥
  // Digunakan untuk mengupdate sebagian data user (seperti saat ganti foto)
  const updateUser = (newUserData) => {
    // Gabungkan data user lama dengan data user yang baru
    const updatedUser = { ...user, ...newUserData };
    
    setUser(updatedUser); // Update state Navbar dkk langsung secara real-time
    localStorage.setItem('user_data', JSON.stringify(updatedUser)); // Update database lokal browser
  };

  return (
    // Jangan lupa masukkan updateUser ke dalam value ini:
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);