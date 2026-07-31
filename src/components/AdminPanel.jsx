import React, { useState } from 'react';
import { ShieldAlert, Play, RefreshCw, CheckCircle, Trophy, DollarSign } from 'lucide-react';
import { generateWinningNumbers, evaluateTicketRank, calculatePrizePoolDistribution } from '../lib/lotteryLogic';
import { supabase } from '../lib/supabaseClient';

export default function AdminPanel({ activeDraw, pastDraws, onRefreshData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [lastDrawSummary, setLastDrawSummary] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passkey === 'mali2026' || passkey === 'admin' || passkey === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Clé d\'accès admin incorrecte. (Essayer "admin")');
    }
  };

  // Déclencher le tirage automatique journalier
  const handleRunDraw = async () => {
    setSimulating(true);
    setLastDrawSummary(null);

    try {
      // 1. Générer les numéros gagnants
      const { mainNumbers, starNumbers } = generateWinningNumbers();

      // 2. Récupérer les tickets pour le tirage actif
      const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('payment_status', 'PAID');

      const totalTickets = tickets ? tickets.length : 0;
      const totalSales = totalTickets * 200; // 200 FCFA par ticket
      const distribution = calculatePrizePoolDistribution(totalSales);

      let hasRank1Winner = false;
      const winnersCount = { rank1: 0, rank2: 0, rank3: 0, rank4: 0, rank5: 0 };

      // 3. Évaluer chaque ticket
      if (tickets) {
        for (const ticket of tickets) {
          const evalRes = evaluateTicketRank(
            ticket.main_numbers,
            ticket.star_numbers,
            mainNumbers,
            starNumbers
          );

          if (evalRes.rank > 0) {
            if (evalRes.rank === 1) hasRank1Winner = true;
            winnersCount[`rank${evalRes.rank}`]++;

            const prizeForRank = distribution.ranks[`rank${evalRes.rank}`] || 500;

            await supabase
              .from('tickets')
              .update({
                win_rank: evalRes.rank,
                prize_amount: prizeForRank,
              })
              .eq('id', ticket.id);

            // Créditer le solde de l'utilisateur
            if (ticket.user_id) {
              const { data: user } = await supabase
                .from('profiles')
                .select('balance')
                .eq('id', ticket.user_id)
                .single();

              if (user) {
                await supabase
                  .from('profiles')
                  .update({ balance: user.balance + prizeForRank })
                  .eq('id', ticket.user_id);
              }
            }
          }
        }
      }

      // 4. Mettre à jour le tirage en statut 'completed'
      const currentCycle = activeDraw?.cycle_number || 1;
      let nextCycle = currentCycle + 1;
      let shouldResetJackpot = false;

      if (hasRank1Winner || nextCycle > 3) {
        shouldResetJackpot = true;
        nextCycle = 1;
      }

      if (activeDraw?.id) {
        await supabase
          .from('draws')
          .update({
            status: 'completed',
            winning_main_numbers: mainNumbers,
            winning_star_numbers: starNumbers,
            total_sales_pot: totalSales,
            net_prize_pot: distribution.netPrizePool,
            total_tickets_sold: totalTickets,
            is_jackpot_won: hasRank1Winner,
          })
          .eq('id', activeDraw.id);
      }

      // 5. Créer le prochain tirage ('upcoming')
      await supabase.from('draws').insert({
        draw_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        cycle_number: nextCycle,
        jackpot_indicative: 1000000,
        total_sales_pot: 0,
        net_prize_pot: 0,
        total_tickets_sold: 0,
      });

      setLastDrawSummary({
        mainNumbers,
        starNumbers,
        totalTickets,
        totalSales,
        netPrizePool: distribution.netPrizePool,
        platformFee: distribution.platformFee,
        hasRank1Winner,
        nextCycle,
      });

      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Admin draw error:', err);
      alert('Erreur lors de l\'exécution du tirage : ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      
      {/* TOGGLE BAR */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-gray-400 hover:text-yellow-400 flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 transition"
        >
          <ShieldAlert className="w-4 h-4 text-yellow-400" />
          <span>{isOpen ? 'Masquer Panneau Admin' : 'Panneau d\'Administration / Simulateur'}</span>
        </button>
      </div>

      {/* PANEL CONTENT */}
      {isOpen && (
        <div className="mt-4 glass-panel p-6 rounded-3xl border border-yellow-500/40 shadow-2xl animate-fade-in">
          
          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="max-w-sm mx-auto text-center space-y-4 py-4">
              <ShieldAlert className="w-10 h-10 text-yellow-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Accès Administrateur WinnerOne</h3>
              <input
                type="password"
                placeholder="Entrez la clé d'accès (ex: admin)"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-center text-white focus:outline-none focus:border-yellow-500"
              />
              <button
                type="submit"
                className="w-full gold-button py-2 rounded-xl text-xs font-bold"
              >
                Se Connecter au Panneau Admin
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span>Contrôle & Simulation des Tirages</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Déclenchez le tirage du jour pour évaluer automatiquement les billets et créditer les gagnants.
                  </p>
                </div>

                <button
                  onClick={handleRunDraw}
                  disabled={simulating}
                  className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition"
                >
                  {simulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Tirage en cours...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                      <span>Exécuter le Tirage du Jour</span>
                    </>
                  )}
                </button>
              </div>

              {/* SUMMARY OF LAST SIMULATION */}
              {lastDrawSummary && (
                <div className="bg-slate-900/90 p-5 rounded-2xl border border-emerald-500/30 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>Tirage Effectué avec Succès !</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    <span className="text-gray-400 font-medium">Numéros Gagnants :</span>
                    {lastDrawSummary.mainNumbers.map((n, i) => (
                      <span key={i} className="w-7 h-7 rounded-full bg-yellow-500 text-slate-950 font-bold flex items-center justify-center">
                        {n}
                      </span>
                    ))}
                    <span className="text-yellow-400 font-bold">+</span>
                    {lastDrawSummary.starNumbers.map((s, i) => (
                      <span key={i} className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center">
                        ★{s}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-gray-300">
                    <div>
                      <span className="block text-[10px] text-gray-500">Tickets Vendus :</span>
                      <span className="font-bold">{lastDrawSummary.totalTickets}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500">Ventes Totales :</span>
                      <span className="font-bold text-yellow-400">{lastDrawSummary.totalSales.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500">Part Cagnotte (60%) :</span>
                      <span className="font-bold text-emerald-400">{lastDrawSummary.netPrizePool.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500">Prochain Cycle :</span>
                      <span className="font-bold text-white">Cycle {lastDrawSummary.nextCycle}/3</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
