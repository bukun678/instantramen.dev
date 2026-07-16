'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { useInstantRamenAuth } from './auth-provider';

export function AuthModal() {
  const {
    authError,
    authMessage,
    closeAuthModal,
    isModalOpen,
    sendMagicLink,
    signInWithGoogle,
  } = useInstantRamenAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isModalOpen]);

  if (!isModalOpen) {
    return null;
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    await sendMagicLink(email);
    setIsSubmitting(false);
  }

  async function handleGoogleClick() {
    setIsSubmitting(true);
    await signInWithGoogle();
    setIsSubmitting(false);
  }

  return (
    <div
      className="auth-modal-backdrop fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/70 p-4 sm:p-6"
      role="presentation"
    >
      <section
        aria-label="Sign in to Instant Ramen"
        aria-modal="true"
        className="auth-modal instant-ramen-surface bg-card text-card-foreground relative my-auto w-full max-w-[760px] rounded-xl border p-6 text-center shadow-2xl sm:p-10 md:p-12"
        role="dialog"
      >
        <button
          ref={closeButtonRef}
          aria-label="Close sign-in dialog"
          className="auth-modal__close bg-background text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring absolute top-4 right-4 grid h-11 w-11 cursor-pointer place-items-center rounded-md border text-2xl leading-none transition focus-visible:ring-2"
          type="button"
          onClick={closeAuthModal}
        >
          ×
        </button>

        <div className="auth-modal__brand mb-6 inline-flex items-center justify-center gap-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
          <span
            aria-hidden="true"
            className="bg-primary grid h-12 w-12 place-items-center rounded-lg text-2xl"
          >
            🍜
          </span>
          <strong>Instant Ramen</strong>
        </div>

        <h2 className="mb-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
          Sign In
        </h2>

        <p className="auth-modal__promo text-muted-foreground mb-8 text-sm leading-6 sm:text-base">
          Continue with Google or receive a secure magic link by email.
        </p>

        <button
          className="auth-modal__google border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-md border text-base font-black transition focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="button"
          onClick={handleGoogleClick}
        >
          <span
            aria-hidden="true"
            className="grid h-6 w-6 place-items-center rounded-full bg-white font-black text-[#4285f4]"
          >
            G
          </span>
          Sign in with Google
        </button>

        <div className="auth-modal__divider text-muted-foreground before:bg-border after:bg-border my-7 grid grid-cols-[1fr_auto_1fr] items-center gap-5 before:h-px before:content-[''] after:h-px after:content-['']">
          <span>OR</span>
        </div>

        <form
          className="auth-modal__form grid gap-3 text-left"
          onSubmit={handleEmailSubmit}
        >
          <label
            className="text-foreground text-base font-extrabold"
            htmlFor="auth-email"
          >
            Email
          </label>
          <input
            id="auth-email"
            autoComplete="email"
            className="bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/20 min-h-14 w-full rounded-md border px-5 text-base transition outline-none focus:ring-2"
            inputMode="email"
            placeholder="name@example.com"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button
            className="border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring mt-4 inline-flex min-h-14 w-full cursor-pointer items-center justify-center rounded-md border text-base font-black transition focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            Send Magic Link
          </button>
        </form>

        {authError ? (
          <p
            className="auth-modal__message auth-modal__message--error text-destructive mt-5 text-center"
            role="alert"
          >
            {authError}
          </p>
        ) : null}
        {authMessage ? (
          <p
            className="auth-modal__message text-primary mt-5 text-center"
            role="status"
          >
            {authMessage}
          </p>
        ) : null}
      </section>
    </div>
  );
}
