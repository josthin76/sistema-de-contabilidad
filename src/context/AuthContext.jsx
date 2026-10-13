import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});
const DEMO_USER_KEY = 'contabeni_demo_user';
const DEMO_USER_ID = 'demo-piloto-trinidad';
const DEFAULT_APP_URL = 'https://sistema-de-contabilidad-4dce.onrender.com';

function getAuthRedirectUrl() {
  const configuredUrl = import.meta.env.VITE_APP_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/+$/, '');

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return window.location.origin;
  }

  return DEFAULT_APP_URL;
}

function removeStoredItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('No se pudo limpiar el almacenamiento local:', error);
  }
}

function readDemoUser() {
  try {
    const saved = localStorage.getItem(DEMO_USER_KEY);
    if (!saved) return null;
    const user = JSON.parse(saved);
    return user?.id === DEMO_USER_ID ? user : null;
  } catch (error) {
    removeStoredItem(DEMO_USER_KEY);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveActiveUser = (nextUser) => {
    try {
      if (nextUser?.id === DEMO_USER_ID) {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(nextUser));
      } else {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    } catch (error) {
      console.warn('No se pudo guardar la sesión de demostración:', error);
    }
    setUser(nextUser);
  };

  useEffect(() => {
    let disposed = false;
    let authEventReceived = false;

    // Retire credenciales locales antiguas: las contraseñas se guardaban en texto plano.
    removeStoredItem('contabeni_user');
    removeStoredItem('contabeni_registered_users');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      authEventReceived = true;
      if (disposed) return;

      setSession(nextSession);
      setUser(nextSession?.user || (event === 'SIGNED_OUT' ? null : readDemoUser()));
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (disposed || authEventReceived) return;
      setSession(currentSession);
      setUser(currentSession?.user || readDemoUser());
      setLoading(false);
    }).catch((error) => {
      if (disposed) return;
      console.error('No se pudo recuperar la sesión:', error);
      setUser(readDemoUser());
      setLoading(false);
    });

    return () => {
      disposed = true;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, name = '') => {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name.trim() || cleanEmail.split('@')[0];
    saveActiveUser(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { name: displayName } },
      });
      if (error) return { data, error };

      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    saveActiveUser(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) return { data, error };
      if (!data?.user || !data?.session) {
        return { data, error: new Error('No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.') };
      }
      setSession(data.session);
      setUser(data.user);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    saveActiveUser(null);
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl(),
      },
    });
  };

  const signInAsDemo = () => {
    const demoUser = {
      id: DEMO_USER_ID,
      email: 'comercial.beni@contabeni.bo',
      user_metadata: { name: 'Comercial El Beni' },
    };
    setSession(null);
    saveActiveUser(demoUser);
    return demoUser;
  };

  const signOut = async () => {
    saveActiveUser(null);
    setSession(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('No se pudo cerrar la sesión remota:', error);
    } catch (error) {
      console.error('No se pudo cerrar la sesión remota:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signInWithGoogle, signInAsDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
