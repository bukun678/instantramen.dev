'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';

import { AuthModal } from './auth-modal';
import { createInstantRamenSupabaseBrowserClient } from './client';
import { getInstantRamenAuthRedirectUrl } from './config';

type AuthResult<T> = Promise<{
  data: T;
  error: { message: string } | null;
}>;

export type InstantRamenAuthClient = {
  auth: {
    getSession: () => AuthResult<{ session: Session | null }>;
    onAuthStateChange: (
      callback: (event: string, session: Session | null) => void
    ) => {
      data: {
        subscription: {
          unsubscribe: () => void;
        };
      };
    };
    signInWithOAuth: (options: {
      provider: 'google';
      options: { redirectTo: string };
    }) => AuthResult<unknown>;
    signInWithOtp: (options: {
      email: string;
      options: { emailRedirectTo: string };
    }) => AuthResult<unknown>;
    signOut: () => Promise<{ error: { message: string } | null }>;
  };
};

type InstantRamenAuthContextValue = {
  session: Session | null;
  isLoadingSession: boolean;
  isModalOpen: boolean;
  authMessage: string | null;
  authError: string | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const InstantRamenAuthContext =
  createContext<InstantRamenAuthContextValue | null>(null);

export function InstantRamenAuthProvider({
  children,
  client,
}: {
  children: ReactNode;
  client?: InstantRamenAuthClient;
}) {
  const [supabase] = useState<InstantRamenAuthClient>(
    () => client ?? createInstantRamenSupabaseBrowserClient()
  );
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          setAuthError(error.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingSession(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoadingSession(false);

      if (nextSession) {
        setIsModalOpen(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const openAuthModal = useCallback(() => {
    setAuthError(null);
    setAuthMessage(null);
    setIsModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setAuthMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getInstantRamenAuthRedirectUrl(),
      },
    });

    if (error) {
      setAuthError(error.message);
    }
  }, [supabase]);

  const sendMagicLink = useCallback(
    async (email: string) => {
      setAuthError(null);
      setAuthMessage(null);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getInstantRamenAuthRedirectUrl(),
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      setAuthMessage('Check your email for the magic link.');
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError(error.message);
      return;
    }

    setSession(null);
  }, [supabase]);

  const value = useMemo<InstantRamenAuthContextValue>(
    () => ({
      authError,
      authMessage,
      closeAuthModal,
      isLoadingSession,
      isModalOpen,
      openAuthModal,
      sendMagicLink,
      session,
      signInWithGoogle,
      signOut,
    }),
    [
      authError,
      authMessage,
      closeAuthModal,
      isLoadingSession,
      isModalOpen,
      openAuthModal,
      sendMagicLink,
      session,
      signInWithGoogle,
      signOut,
    ]
  );

  return (
    <InstantRamenAuthContext.Provider value={value}>
      {children}
      <AuthModal />
    </InstantRamenAuthContext.Provider>
  );
}

export function useInstantRamenAuth() {
  const context = useContext(InstantRamenAuthContext);

  if (!context) {
    throw new Error(
      'useInstantRamenAuth must be used within InstantRamenAuthProvider.'
    );
  }

  return context;
}
