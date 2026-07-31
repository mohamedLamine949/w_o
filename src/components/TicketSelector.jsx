import React, { useState } from 'react';
import { Sparkles, Trash2, CheckCircle2, Ticket, Zap, Info } from 'lucide-react';
import { generateFlashPick, TICKET_PRICE } from '../lib/lotteryLogic';

export default function TicketSelector({ onProceedToPayment }) {
  const [selectedMain, setSelectedMain] = useState([]);
  const [selectedStar, setSelectedStar] = useState([]);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [storedGrids, setStoredGrids] = useState([]);

  // Gérer la sélection des numéros principaux (max 5)
  const toggleMainNumber = (num) => {
    if (selectedMain.includes(num)) {
      setSelectedMain(selectedMain.filter((n) => n !== num));
    } else {
      if (selectedMain.length < 5) {
        setSelectedMain([...selectedMain, num].sort((a, b) => a - b));
      }
    }
  };

  // Gérer la sélection des étoiles (max 2)
  const toggleStarNumber = (num) => {
    if (selectedStar.includes(num)) {
      setSelectedStar(selectedStar.filter((n) => n !== num));
    } else {
      if (selectedStar.length < 2) {
        setSelectedStar([...selectedStar, num].sort((a, b) => a - b));
      }
    }
  };

  // Générer un choix rapide Flash
  const handleFlashPick = () => {
    const { mainNumbers, starNumbers } = generateFlashPick();
    setSelectedMain(mainNumbers);
    setSelectedStar(starNumbers);
  };

  // Réinitialiser la sélection
  const handleClear = () => {
    setSelectedMain([]);
    setSelectedStar([]);
  };

  // Ajouter la grille courante ou valider
  const isCurrentGridComplete = selectedMain.length === 5 && selectedStar.length === 2;

  const handleAddGrid = () => {
    if (isCurrentGridComplete) {
      setStoredGrids([...storedGrids, { main: selectedMain, star: selectedStar }]);
      handleClear();
    }
  };

  const handleRemoveStoredGrid = (index) => {
    setStoredGrids(storedGrids.filter((_, i) => i !== index));
  };

  // Total des grilles prêtes à jouer
  const activeGridsToPlay = isCurrentGridComplete
    ? [...storedGrids, { main: selectedMain, star: selectedStar }]
    : storedGrids;

  const totalCost = activeGridsToPlay.length * TICKET_PRICE;

  const handleCheckoutClick = () => {
    if (activeGridsToPlay.length > 0) {
      onProceedToPayment(activeGridsToPlay, totalCost);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6" id="ticket-section">
      
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-yellow-500/20 shadow-xl">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Remplissez votre Grille EuroMillions</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              Choisissez <span className="text-yellow-400 font-bold">5 Numéros</span> (entre 1 et 50) et <span className="text-emerald-400 font-bold">2 Étoiles</span> (entre 1 et 12).
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFlashPick}
              className="gold-button px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Flash (Choix Auto)</span>
            </button>

            <button
              onClick={handleClear}
              className="bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700 px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="hidden xs:inline">Effacer</span>
            </button>
          </div>
        </div>

        {/* NUMBERS SELECTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN NUMBERS (1 to 50) */}
          <div className="lg:col-span-2 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <span>1. Choisissez 5 Numéros</span>
                <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                  {selectedMain.length}/5 Sélectionnés
                </span>
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5">
              {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => {
                const isSelected = selectedMain.includes(num);
                return (
                  <button
                    key={`main-${num}`}
                    onClick={() => toggleMainNumber(num)}
                    className={`lotto-ball-main ${isSelected ? 'selected' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STAR NUMBERS (1 to 12) */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <span>2. Choisissez 2 Étoiles</span>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {selectedStar.length}/2 Sélectionnées
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 justify-items-center">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                  const isSelected = selectedStar.includes(num);
                  return (
                    <button
                      key={`star-${num}`}
                      onClick={() => toggleStarNumber(num)}
                      className={`lotto-ball-star ${isSelected ? 'selected' : ''}`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LIVE PREVIEW OF SELECTED NUMBERS */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <span className="text-xs text-gray-400 block mb-2 font-medium">Grille sélectionnée :</span>
              <div className="flex items-center gap-2 flex-wrap min-h-[48px] bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                {selectedMain.map((n) => (
                  <span key={`preview-m-${n}`} className="w-8 h-8 rounded-full bg-yellow-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow">
                    {n}
                  </span>
                ))}
                {selectedStar.map((s) => (
                  <span key={`preview-s-${s}`} className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow">
                    ★{s}
                  </span>
                ))}
                {!isCurrentGridComplete && (
                  <span className="text-xs text-gray-500 italic">Complétez la grille...</span>
                )}
              </div>

              {isCurrentGridComplete && (
                <button
                  onClick={handleAddGrid}
                  className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ajouter une 2ème Grille</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* STORED GRIDS LIST & CHECKOUT BAR */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* RECAP OF ALL GRIDS */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold text-gray-300">Total Grilles à valider :</span>
            <span className="text-lg font-black text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-xl border border-yellow-500/30">
              {activeGridsToPlay.length} Grille{activeGridsToPlay.length > 1 ? 's' : ''}
            </span>
            <span className="text-sm text-gray-400">
              ({(activeGridsToPlay.length * TICKET_PRICE).toLocaleString('fr-FR')} FCFA)
            </span>
          </div>

          {/* CHECKOUT BUTTON */}
          <button
            onClick={handleCheckoutClick}
            disabled={activeGridsToPlay.length === 0}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center gap-3 transition-all shadow-xl ${
              activeGridsToPlay.length > 0
                ? 'gold-button hover:scale-105 cursor-pointer'
                : 'bg-slate-800 text-gray-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            <span>PAYER {totalCost > 0 ? `${totalCost.toLocaleString('fr-FR')} FCFA` : '200 FCFA'} VIA ORANGE MONEY</span>
          </button>

        </div>

      </div>

    </section>
  );
}
