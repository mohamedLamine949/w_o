import React, { useState } from 'react';
import { User, Phone, Zap, Wallet, Ticket, History, ArrowUpRight, CheckCircle2, ShieldCheck, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function UserProfile({ userProfile, userTickets, onOpenAuth, onOpenDeposit }) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState(null);

  if (!userProfile) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="fdj-card p-8 sm:p-12 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#00205B] text-white flex items-center justify-center mx-auto shadow-md">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#00205B]">Connexion au Compte Joueur</h2>
          <p className="text-xs text-slate-500">
            Veuillez vous connecter avec votre numéro de téléphone et votre numéro Orange Money Mali pour accéder à votre profil complet.
          </p>
          <button
            onClick={onOpenAuth}
            className="w-full fdj-yellow-btn py-3 rounded-xl text-xs font-bold shadow"
          >
            Se Connecter / Inscription Compte Joueur
          </button>
        </div>
      </section>
    );
  }

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
              <div className="w-12 h-12 rounded-2xl bg-[#00205B] text-white flex items-center justify-center font-bold text-lg">
                {userProfile.full_name?.charAt(0) || 'J'}
              </div>
              <div>
                <h2 className="text-lg font-black text-[#00205B]">{userProfile.full_name}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5" /> {userProfile.phone_number}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-[#00205B] hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Modifier
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-semibold">Téléphone Principal</span>
              <span className="font-mono font-bold text-slate-800">{userProfile.phone_number}</span>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
              <span className="text-amber-800 block text-[10px] font-black flex items-center gap-1">
                <Zap className="w-3 h-3 text-orange-500" /> Numéro Orange Money Mali
              </span>
              <span className="font-mono font-black text-orange-700">{userProfile.om_number || userProfile.phone_number}</span>
            </div>
          </div>
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
