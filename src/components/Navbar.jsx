import React, { useState } from 'react';
import { Trophy, Wallet, Smartphone, Download, User, ArrowDownToLine } from 'lucide-react';

export default function Navbar({ userProfile, onOpenAuth, onOpenDeposit, onOpenApkModal }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-yellow-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Trophy className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">WINNER<span className="gold-gradient-text">ONE</span></span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-semibold">MALI</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">Loterie Journalière (200 FCFA)</p>
          </div>
        </div>

        {/* ACTIONS & USER WALLET */}
        <div className="flex items-center gap-3">

          {/* TELECHARGER APK BUTTON */}
          <button
            onClick={onOpenApkModal}
            className="hidden sm:flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>App Android / PWA</span>
          </button>

          {/* WALLET BALANCE & RECHARGER */}
          <div className="flex items-center bg-slate-900/90 border border-yellow-500/30 rounded-xl p-1 shadow-inner">
            <div className="flex items-center gap-2 px-3 py-1">
              <Wallet className="w-4 h-4 text-yellow-400" />
              <div>
                <span className="text-[10px] text-gray-400 block leading-none">Solde FCFA</span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {userProfile ? `${userProfile.balance.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenDeposit}
              className="gold-button px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <span>+</span>
              <span className="hidden xs:inline">Recharger</span>
            </button>
          </div>

          {/* USER ACCOUNT */}
          <button
            onClick={onOpenAuth}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 hover:border-yellow-500/50 flex items-center justify-center text-gray-300 hover:text-yellow-400 transition"
            title="Mon Compte / Téléphone"
          >
            <User className="w-5 h-5" />
          </button>

        </div>

      </div>
    </header>
  );
}
