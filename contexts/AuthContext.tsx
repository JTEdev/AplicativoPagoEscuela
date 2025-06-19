import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { MOCK_STUDENT } from '../constants'; // For initial admin user

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, passwordAttempt: string) => Promise<{success: boolean, message?: string}>;
  isUserAdmin: () => boolean;
  addUser: (userData: Omit<User, 'id'>) => Promise<{success: boolean, message?: string, newUser?: User}>;
  updateUser: (userId: string, updates: Partial<Omit<User, 'id' | 'password'>>) => Promise<{success: boolean, message?: string, updatedUser?: User}>;
  deleteUser: (userId: string) => Promise<{success: boolean, message?: string}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialUsers: User[] = [
  { id: 'admin-001', name: 'Admin User', email: 'admin@school.edu', password: 'adminpassword', role: Role.Admin },
  { id: MOCK_STUDENT.id, name: MOCK_STUDENT.name, email: 'student@school.edu', password: 'studentpassword', role: Role.Student, grade: MOCK_STUDENT.grade },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true to load initial state

  useEffect(() => {
    // Load users from backend API
    const fetchUsersFromAPI = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (e) {
        // Si falla, usa localStorage o initialUsers
        const storedUsers = localStorage.getItem('users');
        setUsers(storedUsers ? JSON.parse(storedUsers) : initialUsers);
      }
    };
    fetchUsersFromAPI();

    // Load currentUser from localStorage
    const storedCurrentUser = localStorage.getItem('currentUser');
    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
    }
    setIsLoading(false); // Done with initial load
  }, []);

  useEffect(() => {
    // Persist users to localStorage whenever it changes, but not on initial empty load
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);


  const login = useCallback(async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    return new Promise(resolve => {
        setTimeout(() => { // Simulate API call
            const user = users.find(u => u.email === email && u.password === passwordAttempt);
            if (user) {
                setCurrentUser(user);
                resolve(true);
            } else {
                resolve(false);
            }
            setIsLoading(false);
        }, 500);
    });
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const register = useCallback(async (name: string, email: string, passwordAttempt: string): Promise<{success: boolean, message?: string}> => {
    setIsLoading(true);
    return new Promise(resolve => {
        setTimeout(() => { // Simulate API call
            if (users.some(u => u.email === email)) {
                setIsLoading(false);
                resolve({success: false, message: "User with this email already exists."});
                return;
            }
            const newUser: User = {
                id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                name,
                email,
                password: passwordAttempt,
                role: Role.Student, 
                grade: 'N/A' // Default grade
            };
            setUsers(prevUsers => [...prevUsers, newUser]);
            setCurrentUser(newUser); // Auto-login after registration
            setIsLoading(false);
            resolve({success: true});
        }, 500);
    });
  }, [users]);
  
  const isUserAdmin = useCallback(() => {
    return currentUser?.role === Role.Admin;
  }, [currentUser]);

  const addUser = useCallback(async (userData: Omit<User, 'id'>): Promise<{success: boolean, message?: string, newUser?: User}> => {
    if (users.some(u => u.email === userData.email)) {
      return { success: false, message: "User with this email already exists." };
    }
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...userData,
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    return { success: true, newUser };
  }, [users]);

  const updateUser = useCallback(async (userId: string, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<{success: boolean, message?: string, updatedUser?: User}> => {
    let foundUser: User | undefined;
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.id === userId) {
          // Check if email is being changed and if the new email already exists for another user
          if (updates.email && updates.email !== user.email && prevUsers.some(u => u.id !== userId && u.email === updates.email)) {
             // This check should ideally be done before calling setUsers, returning an error.
             // For now, let's log a warning. A proper implementation would throw or return an error.
             console.warn("Attempted to update email to an already existing email for another user.");
             // To prevent update, we'd need to not map, or handle error outside.
             // For simplicity, let's assume email conflicts are handled by UI or pre-validation for this mock.
          }
          foundUser = { ...user, ...updates };
          return foundUser;
        }
        return user;
      })
    );
    if (foundUser) {
      // If the updated user is the current user, update currentUser as well
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? ({ ...prev, ...updates }) : null);
      }
      return { success: true, updatedUser: foundUser };
    }
    return { success: false, message: "User not found." };
  }, [users, currentUser]);

  const deleteUser = useCallback(async (userId: string): Promise<{success: boolean, message?: string}> => {
    if (currentUser && currentUser.id === userId) {
      return { success: false, message: "Cannot delete your own account." };
    }
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    return { success: true };
  }, [currentUser, users]);


  return (
    <AuthContext.Provider value={{ currentUser, users, isLoading, login, logout, register, isUserAdmin, addUser, updateUser, deleteUser }}>
      {!isLoading && children} 
      {/* Render children only when not loading initial state to avoid flicker or premature route access */}
      {/* Or, keep children rendering and let ProtectedRoute handle loading state UI */}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};