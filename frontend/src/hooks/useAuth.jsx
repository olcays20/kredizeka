import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * KrediZeka - useAuth Özel Hook'u
 * =====================================
 * Bileşenlerin kimlik doğrulama verilerine ve fonksiyonlarına
 * (user, login, logout, updateUser) kolayca erişmesini sağlar.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
