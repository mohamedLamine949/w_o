import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

export default function JackpotHero({ activeDraw }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

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

  const jackpotDisplay = activeDraw?.jackpot_indicative || 1000000;
  const cycleNumber = activeDraw?.cycle_number || 1;

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = new Date().toLocaleDateString('fr-FR', options);

  return (
    <section className="fdj-hero-bg py-8 px-4 sm:px-6 shadow-inner text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* DATE HEADER */}
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-blue-200">
          Tirage du {formattedDate}
        </p>

        {/* LOGO & JACKPOT DISPLAY */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 my-2">
          <span className="bg-white/10 text-yellow-300 font-bold px-3 py-1 rounded-full border border-yellow-400/30 text-xs sm:text-sm">
            200 FCFA la grille
          </span>
          <span className="bg-blue-950/80 text-white font-bold px-3 py-1 rounded-full border border-blue-400/30 text-xs sm:text-sm">
            Tirage #{activeDraw?.draw_number || 1} &bull; Cycle {cycleNumber}/3
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-yellow-400 tracking-tight drop-shadow-md">
          {jackpotDisplay.toLocaleString('fr-FR')} FCFA
        </h1>

        <p className="text-xs text-blue-200/90 max-w-xl mx-auto font-medium">
          * Gain potentiel indicatif. Le jackpot disponible dépend de la participation des joueurs et des cagnottes cumulées.
        </p>

        {/* TIMER & ORANGE MONEY BADGE */}
        <div className="pt-2 flex items-center justify-center gap-4 flex-wrap text-xs text-white">
          <div className="flex items-center gap-2 bg-blue-950/80 px-4 py-2 rounded-full border border-blue-400/30">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span>Fermeture des grilles dans : </span>
            <span className="font-mono font-bold text-yellow-300 text-sm">
              {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>

          <div className="flex items-center gap-2 bg-blue-950/80 px-4 py-2 rounded-full border border-blue-400/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Paiement Direct Orange Money Mali</span>
          </div>
        </div>

      </div>
    </section>
  );
}
