'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';

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
      className="auth-modal-backdrop fixed inset-0 z-[100] grid place-items-center bg-black/70 p-6 backdrop-blur"
      role="presentation"
    >
      <section
        aria-label="Sign in to Instant Ramen"
        aria-modal="true"
        className="auth-modal relative w-full max-w-[850px] rounded-[18px] border border-[#f5b51b47] bg-[#12140f] bg-[radial-gradient(circle_at_50%_0,rgb(245_181_27_/_13%),transparent_18rem)] p-7 text-center text-white shadow-[0_34px_120px_rgb(0_0_0_/_62%)] md:p-14"
        role="dialog"
      >
        <button
          ref={closeButtonRef}
          aria-label="Close sign-in dialog"
          className="auth-modal__close absolute top-4 right-4 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/5 text-2xl leading-none text-white/60"
          type="button"
          onClick={closeAuthModal}
        >
          ×
        </button>

        <div className="auth-modal__brand mb-7 inline-flex items-center justify-center gap-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">
          <span
            aria-hidden="true"
            className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-[#ffe36b] to-[#ff971f] text-3xl"
          >
            🍜
          </span>
          <strong>Instant Ramen</strong>
        </div>

        <h2 className="mb-7 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
          Sign In
        </h2>

        <p className="auth-modal__promo mb-8 inline-flex rounded-full bg-linear-to-r from-[#b22dea] via-[#ff3b85] to-[#f4b400] px-6 py-3 text-base text-white md:text-lg">
          🎉 Sign in now and get free Credits! 🎁
        </p>

        <button
          className="auth-modal__google inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-0 bg-[#ffc515] text-lg font-extrabold text-[#070705] disabled:cursor-not-allowed disabled:opacity-70"
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

        <div className="auth-modal__divider my-8 grid grid-cols-[1fr_auto_1fr] items-center gap-5 text-white/50 before:h-px before:bg-white/15 before:content-[''] after:h-px after:bg-white/15 after:content-['']">
          <span>OR</span>
        </div>

        <form
          className="auth-modal__form grid gap-3 text-left"
          onSubmit={handleEmailSubmit}
        >
          <label className="text-lg font-extrabold text-white" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            autoComplete="email"
            className="min-h-14 w-full rounded-xl border border-[#f5b51b3d] bg-[#0e100c] px-5 text-lg text-white outline-none transition focus:border-[#ffc515]"
            inputMode="email"
            placeholder="name@example.com"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button
            className="mt-4 inline-flex min-h-14 w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-[#ffc515] text-lg font-extrabold text-[#070705] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            Send Magic Link
          </button>
        </form>

        {authError ? (
          <p
            className="auth-modal__message auth-modal__message--error mt-5 text-center text-[#ff7a7a]"
            role="alert"
          >
            {authError}
          </p>
        ) : null}
        {authMessage ? (
          <p
            className="auth-modal__message mt-5 text-center text-[#ffc515]"
            role="status"
          >
            {authMessage}
          </p>
        ) : null}
      </section>
    </div>
  );
}
