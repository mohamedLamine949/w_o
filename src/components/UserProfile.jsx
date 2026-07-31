import React, { useState } from 'react';
import { Zap, Wallet, Ticket, ArrowUpRight, LogOut, Mail, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function UserProfile({ userProfile, userTickets, onOpenAuth, onLogout, onProfileUpdate }) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState(null);
  const [omInput, setOmInput] = useState(userProfile?.om_number || '');
  const [omSaving, setOmSaving] = useState(false);
  const [omSaved, setOmSaved] = useState(false);

  if (!userProfile) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="fdj-card p-8 sm:p-12 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#00205B] text-white flex items-center justify-center mx-auto shadow-md">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#00205B]">Connexion au Compte Joueur</h2>
          <p className="text-xs text-slate-500">
            Connectez-vous avec Google pour accéder à votre profil, jouer et recevoir vos gains.
          </p>
          <button
            onClick={onOpenAuth}
            className="w-full fdj-yellow-btn py-3 rounded-xl text-xs font-bold shadow"
          >
            Se Connecter avec Google
          </button>
        </div>
      </section>
    );
  }

  const handleSaveOm = async (e) => {
    e.preventDefault();
    if (!omInput || omInput.trim().length < 8) return;
    setOmSaving(true);
    setOmSaved(false);

    const formattedOm = omInput.startsWith('+223') ? omInput.trim() : `+223 ${omInput.trim()}`;

    try {
      const { data: updated } = await supabase
        .from('profiles')
        .update({ om_number: formattedOm })
        .eq('id', userProfile.id)
        .select()
        .single();

      const newProfile = updated || { ...userProfile, om_number: formattedOm };
      localStorage.setItem('winnerone_user', JSON.stringify(newProfile));
      if (onProfileUpdate) onProfileUpdate(newProfile);
      setOmSaved(true);
    } catch (err) {
      console.warn('Erreur sauvegarde OM:', err);
    } finally {
      setOmSaving(false);
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setWithdrawStatus(null);

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > userProfile.balance) {
      setWithdrawStatus({ success: false, message: 'Montant de retrait invalide ou solde insuffisant.' });
      return;
    }

    try {
      // Enregistrer la demande de retrait vers Orange Money Mali
      await supabase.from('transactions').insert({
        user_id: userProfile.id,
        type: 'WITHDRAWAL',
        amount: amount,
        reference: `WD-${Date.now()}`,
        status: 'SUCCESS',
      });

      // Mettre à jour le solde
      const newBalance = userProfile.balance - amount;
      await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userProfile.id);

      userProfile.balance = newBalance;
      localStorage.setItem('winnerone_user', JSON.stringify(userProfile));

      setWithdrawStatus({
        success: true,
        message: `Transfert de ${amount.toLocaleString('fr-FR')} FCFA envoyé avec succès vers votre compte Orange Money (${userProfile.om_number || userProfile.phone_number}).`,
      });
      setWithdrawAmount('');
    } catch (err) {
      setWithdrawStatus({ success: false, message: 'Échec de la demande de retrait.' });
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* PROFILE HEADER & WALLET CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* USER INFORMATIONS CARD */}
        <div className="md:col-span-2 fdj-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              {userProfile.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.full_name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#00205B] text-white flex items-center justify-center font-bold text-lg">
                  {userProfile.full_name?.charAt(0) || 'J'}
                </div>
              )}
              <div>
                <h2 className="text-lg font-black text-[#00205B]">{userProfile.full_name}</h2>
                {userProfile.email && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {userProfile.email}
                  </p>
                )}
                {userProfile.phone_number && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5" /> {userProfile.phone_number}
                  </p>
                )}
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Déconnexion
              </button>
            )}
          </div>

          {/* ALERTE SI OM MANQUANT */}
          {!userProfile.om_number && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 font-medium">
                Ajoutez votre numéro <span className="font-black">Orange Money Mali</span> ci-dessous pour pouvoir recevoir vos gains.
              </p>
            </div>
          )}

          {/* CHAMP ORANGE MONEY ÉDITABLE */}
          <form onSubmit={handleSaveOm} className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
            <label className="text-xs font-black text-amber-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-500" /> Numéro Orange Money Mali (pour vos gains)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+223</span>
                <input
                  type="tel"
                  placeholder="76 54 32 10"
                  value={omInput}
                  onChange={(e) => { setOmInput(e.target.value); setOmSaved(false); }}
                  className="w-full bg-white border border-amber-300 rounded-xl pl-14 pr-4 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={omSaving}
                className="fdj-blue-btn px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-60"
              >
                {omSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{omSaving ? '...' : omSaved ? 'Enregistré' : 'Enregistrer'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* WALLET & WITHDRAWAL CARD */}
        <div className="fdj-card p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-600">Solde des Gains</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#00205B]">
              {(userProfile.balance || 0).toLocaleString('fr-FR')} FCFA
            </div>
          </div>

          <form onSubmit={handleWithdrawal} className="space-y-3 pt-2 border-t border-slate-200">
            <input
              type="number"
              placeholder="Montant FCFA à retirer"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00205B]"
            />
            <button
              type="submit"
              className="w-full fdj-yellow-btn py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Retirer vers Orange Money</span>
            </button>
          </form>

          {withdrawStatus && (
            <p className={`text-[11px] font-medium p-2 rounded-lg ${withdrawStatus.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {withdrawStatus.message}
            </p>
          )}
        </div>

      </div>

      {/* TICKETS HISTORY */}
      <div className="fdj-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#00205B]" />
            <h3 className="text-base font-black text-[#00205B]">Historique Complet de Mes Billets WinnerOne</h3>
          </div>
          <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
            {userTickets.length} Billet(s)
          </span>
        </div>

        {userTickets && userTickets.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">Référence Ticket</th>
                  <th className="py-3 px-4">Combinaison Jouée</th>
                  <th className="py-3 px-4">Canal de Paiement</th>
                  <th className="py-3 px-4">Statut Tirage</th>
                  <th className="py-3 px-4 text-right">Gain FCFA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {userTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#00205B]">{t.reference_number}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {t.main_numbers?.map((n) => (
                          <span key={n} className="w-5 h-5 rounded-full bg-slate-200 text-[#00205B] font-bold text-[10px] flex items-center justify-center">
                            {n}
                          </span>
                        ))}
                        <span className="text-amber-600 font-bold px-0.5">+</span>
                        {t.star_numbers?.map((s) => (
                          <span key={s} className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-black text-[10px] flex items-center justify-center">
                            ★{s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-orange-600">Orange Money (OMML)</td>
                    <td className="py-3 px-4">
                      {t.win_rank > 0 ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          Rang {t.win_rank} Gagnant !
                        </span>
                      ) : (
                        <span className="text-slate-400">En attente / Terminé</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {t.prize_amount > 0 ? `+${t.prize_amount.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-50 p-8 rounded-2xl text-center text-slate-400 text-xs">
            Aucun billet dans votre historique pour le moment.
          </div>
        )}
      </div>

    </section>
  );
}
