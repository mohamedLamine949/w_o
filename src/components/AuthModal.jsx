import React, { useState } from 'react';
import { X, User, Phone, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AuthModal({ isOpen, onClose, userProfile, onUserSaved }) {
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone_number || '');
  const [omNumber, setOmNumber] = useState(userProfile?.om_number || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

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
    const clientName = fullName.trim() || 'Joueur WinnerOne';

    try {
      // Vérifier si le profil existe déjà
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', formattedPhone)
        .maybeSingle();

      let savedProfile;

      if (existing) {
        const { data: updated } = await supabase
          .from('profiles')
          .update({
            full_name: clientName,
            phone_number: formattedPhone,
          })
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

      // Persister dans le stockage local
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 text-slate-800">
        
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
            Connectez-vous pour consulter vos grilles et recevoir automatiquement vos gains par Orange Money Mali.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Numéro de Téléphone Principal</label>
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

          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 space-y-1.5">
            <label className="block text-xs font-black text-amber-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Numéro Orange Money Mali (Obligatoire pour les Gains)</span>
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
              * En cas de gain, l'argent sera transféré directement vers ce compte Orange Money.
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
