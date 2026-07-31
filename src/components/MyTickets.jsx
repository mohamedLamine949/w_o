import React from 'react';
import { Ticket, CheckCircle2, Clock, Trophy, ArrowUpRight } from 'lucide-react';

export default function MyTickets({ userTickets, onOpenDeposit }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="my-tickets-section">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-yellow-500/20">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Mes Billets Achetes</h2>
            </div>
            <p className="text-xs text-gray-400">
              Retrouvez ici tous vos tickets valides pour le tirage EuroMillions Mali.
            </p>
          </div>

          <button
            onClick={onOpenDeposit}
            className="gold-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
          >
            <span>Acheter d'autres Grilles (200 FCFA)</span>
          </button>
        </div>

        {userTickets && userTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-yellow-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-slate-800">
                    <span className="font-mono font-bold text-gray-300">{ticket.reference_number}</span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      PAYÉ (OMML)
                    </span>
                  </div>

                  {/* NUMBERS ROW */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {ticket.main_numbers?.map((num, i) => (
                      <span
                        key={`m-${i}`}
                        className="w-7 h-7 rounded-full bg-slate-800 text-yellow-400 font-bold text-xs flex items-center justify-center border border-slate-700"
                      >
                        {num}
                      </span>
                    ))}
                    <span className="text-xs text-emerald-400 font-bold px-0.5">+</span>
                    {ticket.star_numbers?.map((star, i) => (
                      <span
                        key={`s-${i}`}
                        className="w-7 h-7 rounded-full bg-emerald-900/40 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/40"
                      >
                        ★{star}
                      </span>
                    ))}
                  </div>
                </div>

                {/* FOOTER / STATUS */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-yellow-400" />
                    <span>
                      {ticket.win_rank > 0
                        ? `Gagnant Rang ${ticket.win_rank}`
                        : 'En attente du tirage 20h'}
                    </span>
                  </div>

                  {ticket.prize_amount > 0 ? (
                    <span className="font-bold text-emerald-400">
                      +{ticket.prize_amount.toLocaleString('fr-FR')} FCFA
                    </span>
                  ) : (
                    <span className="text-gray-500">200 FCFA</span>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 text-center text-gray-400">
            <Ticket className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">Vous n'avez aucun billet actif pour le moment.</p>
            <p className="text-xs text-gray-500 mt-1">Remplissez une grille ci-dessus pour tenter de gagner la cagnotte !</p>
          </div>
        )}

      </div>
    </section>
  );
}
