import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedDemo = localStorage.getItem('contabeni_demo_user');
    if (savedDemo) {
      try {
        const demoObj = JSON.parse(savedDemo);
        setUser(demoObj);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('contabeni_demo_user');
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem('contabeni_demo_user')) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
        redirectTo: `${window.location.origin}/dashboard`,
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
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
