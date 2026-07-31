import React, { useState, useEffect } from 'react';
import { X, User, Phone, Zap, ShieldCheck, LogIn } from 'lucide-react';
import { supabase, signInWithGoogle } from '../lib/supabaseClient';

export default function AuthModal({ isOpen, onClose, userProfile, onUserSaved }) {
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone_number || '');
  const [omNumber, setOmNumber] = useState(userProfile?.om_number || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showOmForm, setShowOmForm] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setPhoneNumber(userProfile.phone_number || '');
      setOmNumber(userProfile.om_number || '');
    }
  }, [userProfile]);

  if (!isOpen) return null;

  // Connexion Google
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      await signInWithGoogle();
      // La redirection se fait automatiquement via Supabase OAuth
    } catch (err) {
      console.error('Google sign-in error:', err);
      setMessage('Erreur lors de la connexion Google. Veuillez réessayer ou utiliser le formulaire ci-dessous.');
      setShowOmForm(true);
      setIsLoading(false);
    }
  };

  // Inscription classique (téléphone + OM)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!fullName || fullName.trim().length < 2) {
      setMessage('Veuillez entrer votre nom et prénom.');
      setIsLoading(false);
      return;
    }

    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setMessage('Veuillez entrer un numéro de téléphone valide.');
      setIsLoading(false);
      return;
    }

    if (!omNumber || omNumber.trim().length < 8) {
      setMessage('Le numéro Orange Money Mali est obligatoire pour recevoir vos gains.');
      setIsLoading(false);
      return;
    }

    const formattedPhone = phoneNumber.startsWith('+223') ? phoneNumber : `+223 ${phoneNumber.trim()}`;
    const formattedOm = omNumber.startsWith('+223') ? omNumber : `+223 ${omNumber.trim()}`;
    const clientName = fullName.trim();

    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', formattedPhone)
        .maybeSingle();

      let savedProfile;

      if (existing) {
        const { data: updated } = await supabase
          .from('profiles')
          .update({ full_name: clientName })
          .eq('id', existing.id)
          .select()
          .single();

        savedProfile = { ...(updated || existing), om_number: formattedOm };
      } else {
        const { data: created } = await supabase
          .from('profiles')
          .insert({
            full_name: clientName,
            phone_number: formattedPhone,
            balance: 0,
          })
          .select()
          .single();

        savedProfile = { ...(created || { id: Date.now() }), om_number: formattedOm };
      }

      localStorage.setItem('winnerone_user', JSON.stringify(savedProfile));
      if (onUserSaved) onUserSaved(savedProfile);
      onClose();
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors de la sauvegarde du profil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl text-slate-800 space-y-5">
        
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
            Connectez-vous pour jouer et recevoir automatiquement vos gains.
          </p>
        </div>

        {/* GOOGLE SIGN-IN BUTTON */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-300 hover:border-[#00205B] rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 transition shadow-xs hover:shadow-md"
        >
          <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
            <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4"/>
            <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853"/>
            <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04"/>
            <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335"/>
          </svg>
          <span>Connexion avec Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-400 font-semibold">ou</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* CLASSIC PHONE + OM FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nom & Prénom</label>
            <input
              type="text"
              required
              placeholder="Ex: Mohamed Koné"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00205B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Numéro de Téléphone</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+223</span>
              <input
                type="tel"
                required
                placeholder="70 00 00 00"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-14 pr-4 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#00205B]"
              />
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 space-y-1.5">
            <label className="block text-xs font-black text-amber-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>Numéro Orange Money Mali (Obligatoire)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+223</span>
              <input
                type="tel"
                required
                placeholder="76 54 32 10"
                value={omNumber}
                onChange={(e) => setOmNumber(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-xl pl-14 pr-4 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-orange-500"
              />
            </div>
            <p className="text-[10px] text-amber-700">
              * Vos gains seront envoyés directement sur ce compte Orange Money.
            </p>
          </div>

          {message && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-extrabold text-xs fdj-blue-btn flex items-center justify-center gap-2 shadow"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Enregistrer mon Compte Joueur</span>
          </button>
        </form>

      </div>
    </div>
  );
}
