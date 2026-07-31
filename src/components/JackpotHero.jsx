import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Zap, Sparkles, AlertCircle, Award } from 'lucide-react';

export default function JackpotHero({ activeDraw }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Compte à rebours jusqu'à 20:00 GMT
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(20, 0, 0, 0);

      if (now > target) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target - now;
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const cycleNumber = activeDraw?.cycle_number || 1;
  const jackpotDisplay = activeDraw?.jackpot_indicative || 1000000;

  return (
    <section className="relative overflow-hidden py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* HERO CARD */}
      <div className="relative glass-gold-card rounded-3xl p-6 sm:p-10 border border-yellow-500/40 text-center shadow-2xl">
        
        {/* CYCLE BADGE */}
        <div className="inline-flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/40 px-3.5 py-1.5 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-spin-slow" />
          <span className="text-xs sm:text-sm font-bold text-yellow-300">
            TIRAGE DU JOUR #{activeDraw?.draw_number || 1} &bull; CYCLE {cycleNumber}/3
          </span>
          {cycleNumber === 3 && (
            <span className="bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] px-2 py-0.5 rounded font-black tracking-wider uppercase animate-pulse">
              Dernier tirage du cycle !
            </span>
          )}
        </div>

        {/* JACKPOT HEADING */}
        <p className="text-gray-300 font-semibold uppercase tracking-wider text-xs sm:text-sm mb-1">
          Cagnotte Journalière EuroMillions Mali
        </p>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-2">
          <span className="gold-gradient-text drop-shadow-lg">
            {jackpotDisplay.toLocaleString('fr-FR')} FCFA
          </span>
        </h1>

        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-200/80 mb-6 max-w-lg mx-auto bg-slate-900/60 py-1.5 px-4 rounded-xl border border-yellow-500/20">
          <AlertCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span>Gain potentiel indicatif. Le jackpot dépend des ventes de tickets et des tirages accumulés.</span>
        </div>

        {/* TIMER & TRUST BADGES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          
          {/* TIMER BOX */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-medium">Prochain Tirage</span>
                <span className="text-xs font-bold text-emerald-400">Ce soir à 20:00 GMT</span>
              </div>
            </div>

            <div className="flex items-center gap-1 font-mono font-bold text-lg sm:text-xl text-yellow-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
              <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
              <span className="text-amber-300">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>

          {/* ORANGE MONEY BADGE */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-medium">Paiement Sécurisé</span>
                <span className="text-xs font-bold text-white">Orange Money Mali (OMML)</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 block">
                200 FCFA
              </span>
              <span className="text-[10px] text-gray-400">par ticket</span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
