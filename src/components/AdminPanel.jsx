import React, { useState } from 'react';
import { ShieldAlert, Play, RefreshCw, CheckCircle, Trophy, Lock } from 'lucide-react';
import { generateWinningNumbers, evaluateTicketRank, calculatePrizePoolDistribution } from '../lib/lotteryLogic';
import { supabase } from '../lib/supabaseClient';

export default function AdminPanel({ activeDraw, pastDraws, onRefreshData, isVisible, onClose }) {
  const [passkey, setPasskey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [lastDrawSummary, setLastDrawSummary] = useState(null);

  if (!isVisible) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (passkey === 'mali2026' || passkey === 'admin' || passkey === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Mot de passe administrateur incorrect.');
    }
  };

  const handleRunDraw = async () => {
    setSimulating(true);
    setLastDrawSummary(null);

    try {
      const { mainNumbers, starNumbers } = generateWinningNumbers();

      const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('payment_status', 'PAID');

      const totalTickets = tickets ? tickets.length : 0;
      const totalSales = totalTickets * 200;
      const distribution = calculatePrizePoolDistribution(totalSales);

      let hasRank1Winner = false;

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
            const prizeForRank = distribution.ranks[`rank${evalRes.rank}`] || 500;

            await supabase
              .from('tickets')
              .update({
                win_rank: evalRes.rank,
                prize_amount: prizeForRank,
              })
              .eq('id', ticket.id);

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

      const currentCycle = activeDraw?.cycle_number || 1;
      let nextCycle = currentCycle + 1;

      if (hasRank1Winner || nextCycle > 3) {
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
      alert('Erreur lors du tirage : ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl text-slate-800 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#00205B]" />
            <h3 className="text-lg font-black text-[#00205B]">Panneau d'Administration Isolée</h3>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition"
          >
            Fermer l'Admin
          </button>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="max-w-sm mx-auto text-center space-y-4 py-6">
            <ShieldAlert className="w-12 h-12 text-[#00205B] mx-auto" />
            <h4 className="text-sm font-extrabold text-slate-900">Accès Sécurisé Administrateur</h4>
            <input
              type="password"
              placeholder="Entrez le mot de passe admin (ex: admin)"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-center text-slate-900 focus:outline-none focus:border-[#00205B]"
            />
            <button type="submit" className="w-full fdj-blue-btn py-2.5 rounded-xl text-xs font-bold">
              Déverrouiller la Console Admin
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-bold block">Tirage Actif</span>
                <span className="text-sm font-extrabold text-[#00205B]">
                  Tirage #{activeDraw?.draw_number || 1} &bull; Cycle {activeDraw?.cycle_number || 1}/3
                </span>
              </div>

              <button
                onClick={handleRunDraw}
                disabled={simulating}
                className="fdj-yellow-btn px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#00205B]" />
                    <span>Tirage en cours...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-[#00205B] text-[#00205B]" />
                    <span>Exécuter le Tirage du Jour</span>
                  </>
                )}
              </button>
            </div>

            {lastDrawSummary && (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Tirage au Sort Effectué avec Succès !</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-semibold text-slate-700">Numéros Gagnants :</span>
                  {lastDrawSummary.mainNumbers.map((n, i) => (
                    <span key={i} className="w-6 h-6 rounded-full bg-[#00205B] text-white font-bold flex items-center justify-center text-[11px]">
                      {n}
                    </span>
                  ))}
                  <span className="text-amber-700 font-bold">+</span>
                  {lastDrawSummary.starNumbers.map((s, i) => (
                    <span key={i} className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-[11px]">
                      ★{s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
