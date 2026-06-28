'use client';

import { useInstantRamenAuth } from './auth-provider';

export function InstantRamenAuthButton() {
  const { isLoadingSession, openAuthModal, session, signOut } =
    useInstantRamenAuth();
  const email = session?.user.email;

  if (isLoadingSession) {
    return (
      <div className="h-12 w-32 animate-pulse rounded-xl bg-white/10" aria-hidden />
    );
  }

  if (email) {
    return (
      <div className="auth-account inline-flex items-center gap-3">
        <span className="auth-account__email max-w-44 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted-foreground">
          {email}
        </span>
        <button
          className="rounded-full border px-4 py-2 text-sm hover:bg-muted"
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
      className="auth-sign-in inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-xl border-0 bg-linear-to-br from-[#f4b400] to-[#ff8a2a] px-7 text-base font-extrabold text-white shadow-[0_16px_42px_rgb(245_181_27_/_18%)]"
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
