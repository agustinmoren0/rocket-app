'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notifyDataChange } from '../lib/storage-utils';

interface UserContextType {
  username: string;
  setUsername: (name: string) => void;
}

const UserContext = createContext<UserContextType>({
  username: 'Usuario',
  setUsername: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState('Usuario');

  useEffect(() => {
    const stored = localStorage.getItem('habika_username');
    if (stored) setUsernameState(stored);
  }, []);

  const setUsername = (name: string) => {
    setUsernameState(name);
    localStorage.setItem('habika_username', name);
    notifyDataChange();
  };

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
