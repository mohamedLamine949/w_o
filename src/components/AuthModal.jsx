import React, { useState } from 'react';
import { X, User, ShieldCheck, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../lib/supabaseClient';

export default function AuthModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      await signInWithGoogle();
      // Redirection automatique vers Google (Supabase OAuth)
    } catch (err) {
      console.error('Google sign-in error:', err);
      setMessage('Erreur lors de la connexion Google. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl text-slate-800 space-y-6">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#00205B] text-white flex items-center justify-center mx-auto shadow-md">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-[#00205B]">Espace Joueur WinnerOne</h3>
          <p className="text-xs text-slate-500">
            Connexion et inscription en un clic avec votre compte Google.
          </p>
        </div>

        {/* GOOGLE SIGN-IN BUTTON */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-300 hover:border-[#00205B] rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 transition shadow-xs hover:shadow-md disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[#00205B]" />
              <span>Redirection vers Google...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
                <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4"/>
                <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853"/>
                <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04"/>
                <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335"/>
              </svg>
              <span>Continuer avec Google</span>
            </>
          )}
        </button>

        {message && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
            {message}
          </div>
        )}

        {/* INFO */}
        <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-3">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Après connexion, ajoutez votre numéro <span className="font-bold text-orange-600">Orange Money Mali</span> dans votre profil pour recevoir automatiquement vos gains.
          </p>
        </div>

      </div>
    </div>
  );
}
