import React, { useState } from 'react';
import { Search, Trophy, Calendar, CheckCircle2, XCircle, Award, HelpCircle } from 'lucide-react';
import { evaluateTicketRank } from '../lib/lotteryLogic';

export default function DrawResults({ pastDraws, userTickets }) {
  const [searchRef, setSearchRef] = useState('');
  const [checkResult, setCheckResult] = useState(null);

  const handleCheckTicket = (e) => {
    e.preventDefault();
    setCheckResult(null);

    if (!searchRef.trim()) return;

    const ticket = userTickets.find(
      (t) => t.reference_number.toLowerCase() === searchRef.trim().toLowerCase()
    );

    if (!ticket) {
      setCheckResult({ found: false, message: 'Aucun billet trouvé avec cette référence.' });
      return;
    }

    const draw = pastDraws.find((d) => d.id === ticket.draw_id);
    if (!draw || !draw.winning_main_numbers) {
      setCheckResult({ found: true, status: 'en_attente', ticket });
      return;
    }

    const evalRes = evaluateTicketRank(
      ticket.main_numbers,
      ticket.star_numbers,
      draw.winning_main_numbers,
      draw.winning_star_numbers
    );

    setCheckResult({ found: true, status: 'evalue', ticket, evalRes, draw });
  };

  const latestDrawn = pastDraws.find((d) => d.status === 'drawn' || d.status === 'completed');

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8" id="results-section">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LATEST DRAW BALLS DISPLAY */}
        <div className="md:col-span-2 fdj-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#00205B]" />
              <h2 className="text-lg font-black text-[#00205B]">Dernier Tirage WinnerOne Mali</h2>
            </div>
            {latestDrawn && (
              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(latestDrawn.draw_date).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>

          {latestDrawn && latestDrawn.winning_main_numbers ? (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
              <p className="text-xs text-[#00205B] font-extrabold uppercase tracking-wider">
                Tirage #{latestDrawn.draw_number} &bull; Cycle {latestDrawn.cycle_number}/3
              </p>

              {/* BALLS ROW */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                {latestDrawn.winning_main_numbers.map((num, i) => (
                  <div key={`win-main-${i}`} className="fdj-ball-main selected w-11 h-11 text-base shadow">
                    {num}
                  </div>
                ))}

                <span className="text-[#00205B] font-bold text-xl px-1">+</span>

                {latestDrawn.winning_star_numbers.map((star, i) => (
                  <div key={`win-star-${i}`} className="fdj-ball-star selected w-11 h-11 text-base shadow">
                    ★{star}
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-slate-500">
                Tickets vendus pour ce tirage : <span className="text-[#00205B] font-bold">{latestDrawn.total_tickets_sold || 0}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
              <p className="text-sm font-bold text-[#00205B]">Le tirage d'aujourd'hui est en cours de préparation.</p>
              <p className="text-xs text-slate-400 mt-1">Résultats publiés tous les soirs à 20h00 GMT.</p>
            </div>
          )}

          {/* EXPLICATION SIMPLE DES GAINS (LANGAGE CLAIR) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-[#00205B]">Comment sont partagés les gains du tirage ?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-blue-50 p-3 rounded-xl border border-blue-100">
              Chaque jour, <span className="font-bold text-[#00205B]">60% de l'argent de tous les tickets vendus</span> est redistribué immédiatement aux gagnants.
              Par exemple, si 100 000 FCFA de tickets sont vendus, <span className="font-bold text-emerald-700">60 000 FCFA sont redistribués</span> aux joueurs gagnants.
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Pour gagner</th>
                    <th className="py-2.5 px-3">Il faut trouver</th>
                    <th className="py-2.5 px-3 text-right">Part des gains</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="bg-yellow-50 font-bold text-[#00205B]">
                    <td className="py-2.5 px-3 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Le Jackpot !</span>
                    </td>
                    <td className="py-2.5 px-3">Les 5 numéros + les 2 étoiles</td>
                    <td className="py-2.5 px-3 text-right text-amber-700">La moitié de la cagnotte</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">2ème prix</td>
                    <td className="py-2.5 px-3">5 numéros + 1 étoile</td>
                    <td className="py-2.5 px-3 text-right">15% partagés entre les gagnants</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">3ème prix</td>
                    <td className="py-2.5 px-3">5 numéros (sans étoile)</td>
                    <td className="py-2.5 px-3 text-right">10% partagés entre les gagnants</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">4ème prix</td>
                    <td className="py-2.5 px-3">4 numéros + 1 ou 2 étoiles</td>
                    <td className="py-2.5 px-3 text-right">10% partagés entre les gagnants</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">5ème prix</td>
                    <td className="py-2.5 px-3">3 numéros ou 2 numéros + 2 étoiles</td>
                    <td className="py-2.5 px-3 text-right">15% partagés entre les gagnants</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Si personne ne gagne le Jackpot, la cagnotte s'accumule pendant 3 tirages maximum avant d'être remise à zéro.
            </p>
          </div>

        </div>

        {/* TICKET CHECKER */}
        <div className="fdj-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-black text-[#00205B]">Vérifier mon Billet</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Entrez la référence de votre ticket pour savoir si vous avez gagné.
            </p>

            <form onSubmit={handleCheckTicket} className="space-y-3">
              <input
                type="text"
                placeholder="Ex: W1-ML-1722..."
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00205B]"
              />
              <button
                type="submit"
                className="w-full fdj-blue-btn py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow"
              >
                <Search className="w-4 h-4" />
                <span>Vérifier mon Billet</span>
              </button>
            </form>

            {checkResult && (
              <div className="mt-4 p-4 rounded-2xl border bg-slate-50 text-xs space-y-2">
                {!checkResult.found ? (
                  <p className="text-red-600 flex items-center gap-2 font-medium">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>{checkResult.message}</span>
                  </p>
                ) : checkResult.status === 'en_attente' ? (
                  <p className="text-amber-700 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Billet enregistré ! En attente du tirage de 20h00.</span>
                  </p>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {checkResult.evalRes.rank > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="font-extrabold text-[#00205B]">
                        {checkResult.evalRes.rank > 0
                          ? `Félicitations ! Vous avez le ${checkResult.evalRes.rank === 1 ? 'Jackpot' : checkResult.evalRes.rank + 'ème prix'} !`
                          : 'Pas de gain cette fois-ci. Retentez votre chance !'}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      {checkResult.evalRes.matchedMain} numéros trouvés + {checkResult.evalRes.matchedStar} étoile(s) trouvée(s)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 text-center">
            WinnerOne Mali &bull; Tirages quotidiens transparents et vérifiables.
          </div>
        </div>

      </div>

    </section>
  );
}
