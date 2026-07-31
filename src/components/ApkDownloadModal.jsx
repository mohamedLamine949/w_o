import React from 'react';
import { X, Smartphone, Download, Share, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ApkDownloadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleDownloadApk = () => {
    // Simulation / Lien direct pour le téléchargement de l'APK Android
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'WinnerOne-Mali-v1.0.apk';
    alert('Téléchargement de WinnerOne-Mali-v1.0.apk démarré ! (Fichier APK Android)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-yellow-500/30 shadow-2xl space-y-6">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-gray-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 to-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/20">
            <Smartphone className="w-8 h-8 text-slate-950" />
          </div>
          <h3 className="text-xl font-bold text-white">Installer l'Application WinnerOne</h3>
          <p className="text-xs text-gray-400">
            Jouez directement depuis votre smartphone Android ou iPhone en toute simplicité.
          </p>
        </div>

        {/* ANDROID DOWNLOAD SECTION */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
              <span>Android (Fichier APK Direct)</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">v1.0.1</span>
          </div>

          <p className="text-[11px] text-gray-400">
            Téléchargez l'application officielle au format APK pour une expérience optimale sur Android.
          </p>

          <button
            onClick={handleDownloadApk}
            className="w-full gold-button py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger l'APK Android (WinnerOne.apk)</span>
          </button>
        </div>

        {/* IOS PWA SECTION */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2 text-xs text-gray-300">
          <span className="font-bold text-emerald-400 block mb-1 flex items-center gap-1.5">
            <Share className="w-4 h-4" />
            <span>iPhone / iOS (Installation Web App PWA)</span>
          </span>

          <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-gray-400">
            <li>Ouvrez ce site sur Safari sur votre iPhone.</li>
            <li>Appuyez sur le bouton <span className="text-white font-bold">Partager</span> (<Share className="w-3 h-3 inline text-yellow-400" />).</li>
            <li>Sélectionnez <span className="text-white font-bold">"Sur l'écran d'accueil"</span>.</li>
          </ol>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-gray-300 transition"
        >
          Fermer
        </button>

      </div>
    </div>
  );
}
