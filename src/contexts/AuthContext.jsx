import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid errors if profile doesn't exist yet

      if (error) {
        console.warn("Profile fetch warning:", error.message);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
      SIGN UP (CORRECTED)
   ============================ */
  
   /* AuthContext.jsx - Key Section Changes */

const signUp = async (email, password, username, fullName) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          full_name: fullName,
        },
      },
    });

    if (error) return { error };

    // Use a small delay or a check to ensure the trigger or manual insert works
    // If you have the SQL Trigger from earlier, REMOVE the manual insert below.
    // If you do NOT have a trigger, keep this:
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: data.user.id, 
          username: username, 
          full_name: fullName 
        }]);
      if (profileError) console.error("Profile row error:", profileError.message);
    }

    return { data, error: null };
  } catch (err) {
    return { error: err };
  }
};

  /* ===========================
      SIGN IN (CORRECTED)
   ============================ */
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle "Email not confirmed" specifically
        if (error.message.includes("Email not confirmed")) {
          return { error: new Error("Please check your email to confirm your account before logging in.") };
        }
        return { error }; // Return exact Supabase error (Invalid login credentials)
      }

      return { data, error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};