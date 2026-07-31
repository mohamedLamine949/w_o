import React from 'react';
import { Ticket, Clock, CheckCircle2, UserCheck } from 'lucide-react';

export default function MyTickets({ userTickets, userProfile, onOpenAuth, onOpenDeposit }) {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8" id="my-tickets-section">
      <div className="fdj-card p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#00205B]" />
              <h2 className="text-lg font-black text-[#00205B]">Mes Billets EuroMillions Achetes</h2>
            </div>
            <p className="text-xs text-slate-500">
              {userProfile
                ? `Compte : ${userProfile.full_name} (${userProfile.om_number || userProfile.phone_number})`
                : 'Connectez-vous pour associer vos billets à votre compte Orange Money Mali.'}
            </p>
          </div>

          {!userProfile ? (
            <button
              onClick={onOpenAuth}
              className="fdj-yellow-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <UserCheck className="w-4 h-4" />
              <span>Se Connecter / Associer Mon Compte</span>
            </button>
          ) : (
            <button
              onClick={onOpenDeposit}
              className="fdj-yellow-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>+ Jouer d'autres grilles (200 FCFA)</span>
            </button>
          )}
        </div>

        {userTickets && userTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-slate-50 border border-slate-200 hover:border-[#00205B] rounded-2xl p-4 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-slate-200">
                    <span className="font-mono font-bold text-slate-700">{ticket.reference_number}</span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      PAYÉ (OMML)
                    </span>
                  </div>

                  {/* NUMBERS ROW */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {ticket.main_numbers?.map((num, i) => (
                      <span
                        key={`m-${i}`}
                        className="w-7 h-7 rounded-full bg-white text-[#00205B] font-extrabold text-xs flex items-center justify-center border border-slate-300 shadow-xs"
                      >
                        {num}
                      </span>
                    ))}
                    <span className="text-xs text-amber-600 font-bold px-0.5">+</span>
                    {ticket.star_numbers?.map((star, i) => (
                      <span
                        key={`s-${i}`}
                        className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center border border-amber-300 shadow-xs"
                      >
                        ★{star}
                      </span>
                    ))}
                  </div>
                </div>

                {/* FOOTER / STATUS */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {ticket.win_rank > 0
                        ? `Gagnant Rang ${ticket.win_rank}`
                        : 'En attente du tirage 20h'}
                    </span>
                  </div>

                  {ticket.prize_amount > 0 ? (
                    <span className="font-extrabold text-emerald-600">
                      +{ticket.prize_amount.toLocaleString('fr-FR')} FCFA
                    </span>
                  ) : (
                    <span className="text-slate-400 font-semibold">200 FCFA</span>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
            <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-[#00205B]">Vous n'avez aucun billet enregistré.</p>
            <p className="text-xs text-slate-400">Jouez une grille pour tenter de décrocher le jackpot !</p>
          </div>
        )}

      </div>
    </section>
  );
}
