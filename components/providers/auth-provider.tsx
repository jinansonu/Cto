"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { ProfileRow } from '@/types/database';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type SignInArgs = {
  email: string;
  password: string;
};

type SignUpArgs = {
  email: string;
  password: string;
  displayName?: string;
};

type UpdateProfileArgs = {
  display_name?: string | null;
};

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  authError: string | null;
  isAuthenticating: boolean;
  isProfileLoading: boolean;
  isProfileUpdating: boolean;
  isAvatarUploading: boolean;
  profileError: string | null;
  signIn: (credentials: SignInArgs) => Promise<void>;
  signUp: (data: SignUpArgs) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileArgs) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const previousProfileRef = useRef<ProfileRow | null>(null);

  const handleProfileLoad = useCallback(
    async (currentUser: User) => {
      setIsProfileLoading(true);
      setProfileError(null);
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store',
          credentials: 'include'
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? 'Failed to load profile');
        }

        const payload = (await response.json()) as { profile: ProfileRow };
        setProfile(payload.profile ?? null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load profile';
        setProfileError(message);
        // ensure we have at least a stub profile for optimistic UI
        setProfile((current) =>
          current ?? {
            id: currentUser.id,
            avatar_url: null,
            created_at: null,
            display_name: null,
            email: currentUser.email ?? null,
            updated_at: null
          }
        );
      } finally {
        setIsProfileLoading(false);
      }
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    await handleProfileLoad(user);
  }, [handleProfileLoad, user]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const {
        data: { session: initialSession },
        error: sessionError
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (sessionError) {
        console.error('Failed to fetch session', sessionError);
      }

      setSession(initialSession);
      const currentUser = initialSession?.user ?? null;
      setUser(currentUser);
      setStatus(initialSession ? 'authenticated' : 'unauthenticated');

      if (currentUser) {
        await handleProfileLoad(currentUser);
      }
    };

    init();

    const { data: authSubscription } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);
      setStatus(nextSession ? 'authenticated' : 'unauthenticated');

      if (nextUser) {
        await handleProfileLoad(nextUser);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, [handleProfileLoad, supabase]);

  const signIn = useCallback(async ({ email, password }: SignInArgs) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, [supabase]);

  const signUp = useCallback(async ({ email, password, displayName }: SignUpArgs) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName ?? null
          }
        }
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign up';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setProfile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send password reset email';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, [supabase]);

  const updateProfile = useCallback(async (data: UpdateProfileArgs) => {
    if (!user) {
      throw new Error('You must be signed in to update your profile');
    }

    setIsProfileUpdating(true);
    setProfileError(null);

    previousProfileRef.current = profile ? { ...profile } : null;
    setProfile((current) => {
      if (!current) {
        return {
          id: user.id,
          email: user.email ?? null,
          avatar_url: null,
          created_at: null,
          display_name: data.display_name ?? null,
          updated_at: new Date().toISOString()
        };
      }

      return {
        ...current,
        ...data,
        updated_at: new Date().toISOString()
      };
    });

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Failed to update profile');
      }

      const payload = (await response.json()) as { profile: ProfileRow };
      setProfile(payload.profile ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      setProfileError(message);
      setProfile(previousProfileRef.current);
      throw new Error(message);
    } finally {
      setIsProfileUpdating(false);
      previousProfileRef.current = null;
    }
  }, [profile, user]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) {
      throw new Error('You must be signed in to upload an avatar');
    }

    setIsAvatarUploading(true);
    setProfileError(null);
    previousProfileRef.current = profile ? { ...profile } : null;

    let optimisticUrl: string | null = null;

    try {
      optimisticUrl = URL.createObjectURL(file);
      setProfile((current) => {
        if (!current) {
          return {
            id: user.id,
            email: user.email ?? null,
            avatar_url: optimisticUrl,
            created_at: null,
            display_name: null,
            updated_at: new Date().toISOString()
          };
        }

        return {
          ...current,
          avatar_url: optimisticUrl,
          updated_at: new Date().toISOString()
        };
      });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Failed to upload avatar');
      }

      const payload = (await response.json()) as { profile: ProfileRow };
      setProfile(payload.profile ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload avatar';
      setProfileError(message);
      setProfile(previousProfileRef.current);
      throw new Error(message);
    } finally {
      if (optimisticUrl) {
        URL.revokeObjectURL(optimisticUrl);
      }
      setIsAvatarUploading(false);
      previousProfileRef.current = null;
    }
  }, [profile, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user,
      profile,
      authError,
      isAuthenticating,
      isProfileLoading,
      isProfileUpdating,
      isAvatarUploading,
      profileError,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshProfile,
      updateProfile,
      uploadAvatar
    }),
    [
      authError,
      isAuthenticating,
      isAvatarUploading,
      isProfileLoading,
      isProfileUpdating,
      profile,
      profileError,
      refreshProfile,
      resetPassword,
      session,
      signIn,
      signOut,
      signUp,
      status,
      updateProfile,
      uploadAvatar,
      user
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
