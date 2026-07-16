'use client';

import { useInstantRamenAuth } from './auth-provider';

export function InstantRamenAuthButton() {
  const { isLoadingSession, openAuthModal, session, signOut } =
    useInstantRamenAuth();
  const email = session?.user.email;

  if (isLoadingSession) {
    return (
      <div
        className="bg-muted h-11 w-28 animate-pulse rounded-md"
        aria-hidden
      />
    );
  }

  if (email) {
    return (
      <div className="auth-account inline-flex items-center gap-3">
        <span className="auth-account__email text-muted-foreground max-w-44 overflow-hidden text-sm text-ellipsis whitespace-nowrap">
          {email}
        </span>
        <button
          className="hover:bg-muted min-h-11 rounded-md border px-4 py-2 text-sm font-bold"
          type="button"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      className="auth-sign-in border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border px-5 text-sm font-black transition focus-visible:ring-2 focus-visible:ring-offset-2"
      type="button"
      onClick={openAuthModal}
    >
      <span
        aria-hidden="true"
        className="grid h-6 w-6 place-items-center rounded-full bg-white font-black text-[#4285f4]"
      >
        G
      </span>
      Sign In
    </button>
  );
}
