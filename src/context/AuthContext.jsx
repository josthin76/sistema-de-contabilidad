import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timeout de seguridad: asegura que la app nunca se quede en pantalla blanca si la conexión es lenta
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    const savedDemo = localStorage.getItem('contabeni_demo_user');
    if (savedDemo) {
      try {
        const demoObj = JSON.parse(savedDemo);
        setUser(demoObj);
        setLoading(false);
        clearTimeout(timer);
        return;
      } catch (e) {
        localStorage.removeItem('contabeni_demo_user');
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      clearTimeout(timer);
    }).catch(() => {
      setLoading(false);
      clearTimeout(timer);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem('contabeni_demo_user')) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
      clearTimeout(timer);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    return supabase.auth.signUp({ email, password });
  };

  const signIn = async (email, password) => {
    localStorage.removeItem('contabeni_demo_user');
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithGoogle = async () => {
    localStorage.removeItem('contabeni_demo_user');
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signInAsDemo = () => {
    const demoUser = {
      id: 'demo-piloto-trinidad',
      email: 'comercial.beni@contabeni.bo',
      user_metadata: { name: 'Comercial El Beni' }
    };
    localStorage.setItem('contabeni_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const signOut = async () => {
    localStorage.removeItem('contabeni_demo_user');
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore offline error on signout
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signInWithGoogle, signInAsDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
