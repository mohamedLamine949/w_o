import React from 'react';
import { Trophy, User, Download, Wallet, LogOut, CheckCircle2 } from 'lucide-react';

export default function Navbar({ userProfile, onOpenAuth, onOpenApkModal, activeTab, setActiveTab }) {
  return (
    <header className="fdj-header-bg border-b border-blue-900/60 sticky top-0 z-50 shadow-md">
      
      {/* TOP NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        
        {/* BRANDING LOGO */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('play')}>
          <div className="w-10 h-10 rounded-xl bg-blue-600 border border-yellow-400 flex items-center justify-center shadow-md">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">EUROMILLIONS</span>
              <span className="bg-yellow-400 text-blue-950 font-black text-[10px] px-1.5 py-0.5 rounded uppercase">MALI</span>
            </div>
            <p className="text-[10px] text-blue-200 font-medium">WinnerOne &bull; Tirage Journalier (200 FCFA)</p>
          </div>
        </div>

        {/* CENTER TABS */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-blue-100">
          <button
            onClick={() => setActiveTab('play')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'play' ? 'bg-blue-800 text-yellow-300 font-extrabold' : 'hover:bg-blue-900/60'}`}
          >
            Jeux de Tirage
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'tickets' ? 'bg-blue-800 text-yellow-300 font-extrabold' : 'hover:bg-blue-900/60'}`}
          >
            Mes Billets
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'results' ? 'bg-blue-800 text-yellow-300 font-extrabold' : 'hover:bg-blue-900/60'}`}
          >
            Résultats
          </button>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">
          
          {/* APK DOWNLOAD */}
          <button
            onClick={onOpenApkModal}
            className="hidden sm:flex items-center gap-1.5 bg-blue-900/80 hover:bg-blue-800 text-yellow-300 border border-yellow-400/40 px-3 py-1.5 rounded-full text-xs font-bold transition"
          >
            <Download className="w-3.5 h-3.5 text-yellow-400" />
            <span>App Android / PWA</span>
          </button>

          {/* USER ACCOUNT BADGE */}
          {userProfile ? (
            <div
              onClick={onOpenAuth}
              className="flex items-center gap-2 bg-blue-950/90 border border-blue-700/60 hover:border-yellow-400 rounded-full px-3 py-1.5 cursor-pointer transition shadow-inner"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-white block leading-none">{userProfile.full_name || 'Joueur Mali'}</span>
                <span className="text-[10px] text-yellow-300 font-mono">{userProfile.om_number || userProfile.phone_number}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="fdj-yellow-btn px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <User className="w-4 h-4" />
              <span>Se Connecter / Compte</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
