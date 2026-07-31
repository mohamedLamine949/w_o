import React, { useState } from 'react';
import { Search, Trophy, Calendar, CheckCircle2, XCircle, Award } from 'lucide-react';
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="results-section">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LATEST DRAW BALLS DISPLAY */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-yellow-500/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Dernier Tirage Officiel EuroMillions Mali</h2>
            </div>
            {latestDrawn && (
              <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(latestDrawn.draw_date).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>

          {latestDrawn && latestDrawn.winning_main_numbers ? (
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
              <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">
                Tirage #{latestDrawn.draw_number} &bull; Cycle {latestDrawn.cycle_number}/3
              </p>

              {/* BALLS ROW */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                {latestDrawn.winning_main_numbers.map((num, i) => (
                  <div key={`win-main-${i}`} className="lotto-ball-main selected w-12 h-12 text-base">
                    {num}
                  </div>
                ))}

                <span className="text-yellow-400 font-bold text-xl px-1">+</span>

                {latestDrawn.winning_star_numbers.map((star, i) => (
                  <div key={`win-star-${i}`} className="lotto-ball-star selected w-12 h-12 text-base">
                    ★{star}
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-gray-400">
                Ventes du tirage : <span className="text-white font-bold">{latestDrawn.total_sales_pot?.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 text-center text-gray-400">
              <p className="text-sm font-semibold">Le tirage d'aujourd'hui est en cours de préparation.</p>
              <p className="text-xs text-gray-500 mt-1">Résultats publiés tous les soirs à 20h00 GMT.</p>
            </div>
          )}

          {/* RANGS DE GAIN TABLE */}
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Grille des Rangs de Gain (Ventilation de la Cagnotte)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-gray-400">
                    <th className="py-2.5 px-3">Rang</th>
                    <th className="py-2.5 px-3">Combinaison</th>
                    <th className="py-2.5 px-3 text-right">% Cagnotte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-gray-300">
                  <tr className="bg-yellow-500/10 font-bold">
                    <td className="py-2 px-3 text-yellow-400">Rang 1</td>
                    <td className="py-2 px-3">5 Numéros + 2 Étoiles</td>
                    <td className="py-2 px-3 text-right text-yellow-400">50% (+ Jackpot)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Rang 2</td>
                    <td className="py-2 px-3">5 Numéros + 1 Étoile</td>
                    <td className="py-2 px-3 text-right">15%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Rang 3</td>
                    <td className="py-2 px-3">5 Numéros + 0 Étoile</td>
                    <td className="py-2 px-3 text-right">10%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Rang 4</td>
                    <td className="py-2 px-3">4 Numéros + 2/1 Étoiles</td>
                    <td className="py-2 px-3 text-right">10%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Rang 5</td>
                    <td className="py-2 px-3">3 Numéros / 2 Num + 2 Étoiles</td>
                    <td className="py-2 px-3 text-right">15%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* TICKET CHECKER */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-yellow-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Vérificateur de Billet</h3>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Saisissez la référence unique de votre ticket pour vérifier vos gains en un clic.
            </p>

            <form onSubmit={handleCheckTicket} className="space-y-3">
              <input
                type="text"
                placeholder="Ex: W1-ML-1722..."
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Search className="w-4 h-4" />
                <span>Vérifier mon Ticket</span>
              </button>
            </form>

            {/* CHECK RESULT PANEL */}
            {checkResult && (
              <div className="mt-6 p-4 rounded-2xl border bg-slate-900/90 text-xs space-y-2 animate-fade-in">
                {!checkResult.found ? (
                  <p className="text-red-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>{checkResult.message}</span>
                  </p>
                ) : checkResult.status === 'en_attente' ? (
                  <p className="text-yellow-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Billet valide ! En attente du tirage de 20h00.</span>
                  </p>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {checkResult.evalRes.rank > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-500" />
                      )}
                      <span className="font-bold text-white">
                        {checkResult.evalRes.rankLabel}
                      </span>
                    </div>
                    <p className="text-gray-400">
                      Correspondance : {checkResult.evalRes.matchedMain} numéros + {checkResult.evalRes.matchedStar} étoiles
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-gray-500 text-center">
            WinnerOne Mali &bull; Tirages quotidiens transparents et vérifiables.
          </div>
        </div>

      </div>

    </section>
  );
}
