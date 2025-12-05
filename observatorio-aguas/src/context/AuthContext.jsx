import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenFromStorage = useMemo(() => localStorage.getItem('observatorio_token'), []);
  const [token, setToken] = useState(tokenFromStorage);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        console.error('No se pudo recuperar la sesión', error);
        localStorage.removeItem('observatorio_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const { data } = await api.post('/auth/login', params);
    localStorage.setItem('observatorio_token', data.access_token);
    setToken(data.access_token);
    const me = await api.get('/auth/me');
    setUser(me.data);
    return me.data;
  };

  const register = async ({ email, password, fullName }) => {
    const { data } = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('observatorio_token');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user && token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
