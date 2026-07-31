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
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8" id="results-section">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LATEST DRAW BALLS DISPLAY */}
        <div className="md:col-span-2 fdj-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#00205B]" />
              <h2 className="text-lg font-black text-[#00205B]">Dernier Tirage Officiel EuroMillions Mali</h2>
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
                Ventes totales du tirage : <span className="text-[#00205B] font-bold">{latestDrawn.total_sales_pot?.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
              <p className="text-sm font-bold text-[#00205B]">Le tirage d'aujourd'hui est en cours de préparation.</p>
              <p className="text-xs text-slate-400 mt-1">Résultats publiés tous les soirs à 20h00 GMT.</p>
            </div>
          )}

          {/* RANGS DE GAIN TABLE */}
          <div>
            <h3 className="text-xs font-bold text-[#00205B] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Ventilation Officielle des Rangs de Gain</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Rang</th>
                    <th className="py-2.5 px-3">Combinaison Gagnante</th>
                    <th className="py-2.5 px-3 text-right">% Cagnotte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="bg-yellow-50 font-bold text-[#00205B]">
                    <td className="py-2.5 px-3">Rang 1</td>
                    <td className="py-2.5 px-3">5 Numéros + 2 Étoiles</td>
                    <td className="py-2.5 px-3 text-right text-amber-700">50% (+ Jackpot)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Rang 2</td>
                    <td className="py-2.5 px-3">5 Numéros + 1 Étoile</td>
                    <td className="py-2.5 px-3 text-right">15%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Rang 3</td>
                    <td className="py-2.5 px-3">5 Numéros + 0 Étoile</td>
                    <td className="py-2.5 px-3 text-right">10%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Rang 4</td>
                    <td className="py-2.5 px-3">4 Numéros + 2/1 Étoiles</td>
                    <td className="py-2.5 px-3 text-right">10%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Rang 5</td>
                    <td className="py-2.5 px-3">3 Numéros / 2 Num + 2 Étoiles</td>
                    <td className="py-2.5 px-3 text-right">15%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* TICKET CHECKER */}
        <div className="fdj-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-black text-[#00205B]">Vérificateur de Billet</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Entrez la référence de votre ticket pour vérifier vos gains.
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
                        {checkResult.evalRes.rankLabel}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Correspondance : {checkResult.evalRes.matchedMain} numéros + {checkResult.evalRes.matchedStar} étoiles
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 text-center">
            WinnerOne Mali &bull; EuroMillions officiel journalier.
          </div>
        </div>

      </div>

    </section>
  );
}
