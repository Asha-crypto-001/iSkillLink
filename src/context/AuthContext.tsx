import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Notification } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  learnerProfile: any;
  educatorProfile: any;
  isLoading: boolean;
  notifications: Notification[];
  unreadNotificationCount: number;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  updateAvatar: (avatarUrl: string) => Promise<User>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  activeRole: 'learner' | 'educator' | 'admin' | 'secondary_admin' | 'guest';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [learnerProfile, setLearnerProfile] = useState<any>(null);
  const [educatorProfile, setEducatorProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      const storedUserId = localStorage.getItem('iskilllink_user_id');
      const data = await api.getMe(storedUserId || undefined);
      if (data && data.user) {
        setUser(data.user);
        setLearnerProfile(data.learnerProfile);
        setEducatorProfile(data.educatorProfile);
        const notifs = await api.getNotifications(data.user.id);
        setNotifications(notifs);
      } else {
        localStorage.removeItem('iskilllink_user_id');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
      localStorage.removeItem('iskilllink_user_id');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      setLearnerProfile(data.learnerProfile);
      setEducatorProfile(data.educatorProfile);
      localStorage.setItem('iskilllink_user_id', data.user.id);
      
      const notifs = await api.getNotifications(data.user.id);
      setNotifications(notifs);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.loginWithGoogle(credential);
      setUser(data.user);
      setLearnerProfile(data.learnerProfile);
      setEducatorProfile(data.educatorProfile);
      localStorage.setItem('iskilllink_user_id', data.user.id);

      const notifs = await api.getNotifications(data.user.id);
      setNotifications(notifs);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.register(formData);
      setUser(data.user);
      setLearnerProfile(data.learnerProfile);
      setEducatorProfile(data.educatorProfile);
      localStorage.setItem('iskilllink_user_id', data.user.id);

      const notifs = await api.getNotifications(data.user.id);
      setNotifications(notifs);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatar = async (avatarUrl: string): Promise<User> => {
    if (!user) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      const res = await api.updateUserAvatar(user.id, avatarUrl);
      const updatedUser = res.user || { ...user, avatar_url: avatarUrl };
      setUser(updatedUser);
      if (educatorProfile && educatorProfile.user) {
        setEducatorProfile({
          ...educatorProfile,
          user: { ...educatorProfile.user, avatar_url: avatarUrl }
        });
      }
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!user) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      const res = await api.updateUserProfile(user.id, updates);
      const updatedUser = res.user || { ...user, ...updates };
      setUser(updatedUser);
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Failed to revoke server session:', error);
    }
    localStorage.removeItem('iskilllink_user_id');
    setUser(null);
    setLearnerProfile(null);
    setEducatorProfile(null);
    setNotifications([]);
  };

  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const notifs = await api.getNotifications(user.id);
      setNotifications(notifs);
    } catch (e) {
      console.error('Error refreshing notifications:', e);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error('Error marking notification read:', e);
    }
  };

  const unreadNotificationCount = notifications.filter(n => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        learnerProfile,
        educatorProfile,
        isLoading,
        notifications,
        unreadNotificationCount,
        login,
        loginWithGoogle,
        register,
        updateAvatar,
        updateProfile,
        logout,
        refreshNotifications,
        markNotificationAsRead,
        activeRole: user ? user.role : 'guest'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
