import React, { useState } from 'react';
import { Sparkles, Trash2, Zap, CheckCircle2, Ticket, Star, RefreshCw } from 'lucide-react';
import { generateFlashPick, TICKET_PRICE } from '../lib/lotteryLogic';

export default function TicketSelector({ onProceedToPayment }) {
  // Mode: 'classique' | 'flash_rapide'
  const [playMode, setPlayMode] = useState('classique');

  // Grilles gérées en onglets
  const [grids, setGrids] = useState([
    { id: 1, main: [], star: [] }
  ]);
  const [activeGridIndex, setActiveGridIndex] = useState(0);

  // Nombre de tickets pour Flash rapide / Multi-tickets
  const [multiQuantity, setMultiQuantity] = useState(5);

  const currentGrid = grids[activeGridIndex] || { main: [], star: [] };

  // Sélection numéros principaux (1..50)
  const toggleMainNumber = (num) => {
    const currentMain = currentGrid.main;
    let newMain;
    if (currentMain.includes(num)) {
      newMain = currentMain.filter((n) => n !== num);
    } else {
      if (currentMain.length < 5) {
        newMain = [...currentMain, num].sort((a, b) => a - b);
      } else {
        return;
      }
    }
    updateGrid(activeGridIndex, newMain, currentGrid.star);
  };

  // Sélection étoiles (1..12)
  const toggleStarNumber = (num) => {
    const currentStar = currentGrid.star;
    let newStar;
    if (currentStar.includes(num)) {
      newStar = currentStar.filter((n) => n !== num);
    } else {
      if (currentStar.length < 2) {
        newStar = [...currentStar, num].sort((a, b) => a - b);
      } else {
        return;
      }
    }
    updateGrid(activeGridIndex, currentGrid.main, newStar);
  };

  const updateGrid = (index, newMain, newStar) => {
    const updated = [...grids];
    updated[index] = { ...updated[index], main: newMain, star: newStar };
    setGrids(updated);
  };

  // Flash pour la grille active
  const handleFlashSingle = () => {
    const { mainNumbers, starNumbers } = generateFlashPick();
    updateGrid(activeGridIndex, mainNumbers, starNumbers);
  };

  // Flash Multiple (génère N grilles complètes d'un coup)
  const handleFlashMultiple = (count = 5) => {
    const newGrids = [];
    for (let i = 0; i < count; i++) {
      const { mainNumbers, starNumbers } = generateFlashPick();
      newGrids.push({ id: i + 1, main: mainNumbers, star: starNumbers });
    }
    setGrids(newGrids);
    setActiveGridIndex(0);
  };

  // Effacer la grille active
  const handleClearCurrentGrid = () => {
    updateGrid(activeGridIndex, [], []);
  };

  // Ajouter une nouvelle grille
  const handleAddGrid = () => {
    const newId = grids.length + 1;
    setGrids([...grids, { id: newId, main: [], star: [] }]);
    setActiveGridIndex(grids.length);
  };

  // Supprimer une grille
  const handleRemoveGrid = (index) => {
    if (grids.length === 1) {
      updateGrid(0, [], []);
      return;
    }
    const updated = grids.filter((_, i) => i !== index);
    setGrids(updated);
    setActiveGridIndex(Math.max(0, index - 1));
  };

  // Filtrer les grilles complètes (5 numéros + 2 étoiles)
  const validGrids = grids.filter((g) => g.main.length === 5 && g.star.length === 2);
  const totalCost = validGrids.length * TICKET_PRICE;

  const handleCheckout = () => {
    if (validGrids.length > 0) {
      onProceedToPayment(validGrids, totalCost);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6" id="ticket-section">
      
      {/* FDJ MODE TABS (Classique | Flash rapide | MultiChances) */}
      <div className="flex items-center justify-center border-b border-gray-300 mb-6 bg-white rounded-2xl shadow-xs p-1 max-w-lg mx-auto">
        <button
          onClick={() => setPlayMode('classique')}
          className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition ${
            playMode === 'classique'
              ? 'bg-[#00205B] text-white shadow-sm'
              : 'text-gray-600 hover:text-[#00205B]'
          }`}
        >
          Classique
        </button>
        <button
          onClick={() => setPlayMode('flash_rapide')}
          className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition relative ${
            playMode === 'flash_rapide'
              ? 'bg-[#00205B] text-white shadow-sm'
              : 'text-gray-600 hover:text-[#00205B]'
          }`}
        >
          <span>Flash rapide</span>
          <span className="absolute -top-2 right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
            Nouveau
          </span>
        </button>
      </div>

      {/* FDJ ACTION PILLS */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-6">
        <button onClick={handleFlashSingle} className="fdj-pill-btn">
          <Zap className="w-4 h-4 text-blue-600" />
          <span>Flash</span>
        </button>
        <button onClick={() => handleFlashMultiple(multiQuantity)} className="fdj-pill-btn">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Flash Multiple ({multiQuantity} grilles)</span>
        </button>
        <button onClick={handleClearCurrentGrid} className="fdj-pill-btn">
          <Trash2 className="w-4 h-4 text-red-500" />
          <span>Effacer grille</span>
        </button>
      </div>

      {/* MAIN SELECTION CONTAINER */}
      <div className="fdj-card p-6 sm:p-8">
        
        {/* MULTI-GRID TABS HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {grids.map((g, idx) => {
              const isComplete = g.main.length === 5 && g.star.length === 2;
              return (
                <button
                  key={`grid-tab-${g.id}`}
                  onClick={() => setActiveGridIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                    activeGridIndex === idx
                      ? 'bg-[#00205B] text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Grille {idx + 1}</span>
                  {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}

            <button
              onClick={handleAddGrid}
              className="px-3 py-2 rounded-xl border border-dashed border-slate-300 text-slate-600 hover:border-[#00205B] hover:text-[#00205B] text-xs font-bold transition"
            >
              + Ajouter une Grille
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Grille {activeGridIndex + 1} sur {grids.length}
          </span>
        </div>

        {/* MODE FLASH RAPIDE FAST MULTI SELECTOR */}
        {playMode === 'flash_rapide' && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-[#00205B]">Acheter plusieurs grilles Flash en 1 clic</h4>
              <p className="text-xs text-slate-600">Choisissez le nombre de grilles à générer automatiquement :</p>
            </div>
            
            <div className="flex items-center gap-2">
              {[1, 3, 5, 10].map((qty) => (
                <button
                  key={`qty-${qty}`}
                  onClick={() => {
                    setMultiQuantity(qty);
                    handleFlashMultiple(qty);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                    grids.length === qty
                      ? 'bg-[#00205B] text-white shadow'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {qty} Grille{qty > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NUMBERS SELECTION SECTION (FDJ EXACT LAYOUT) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: 50 MAIN BALLS */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold text-[#00205B] uppercase tracking-wide">
                Cochez 5 numéros
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                {currentGrid.main.length}/5 sélectionnés
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5 justify-items-center">
              {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => {
                const isSelected = currentGrid.main.includes(num);
                return (
                  <button
                    key={`main-${num}`}
                    onClick={() => toggleMainNumber(num)}
                    className={`fdj-ball-main ${isSelected ? 'selected' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: 12 STAR BALLS */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold text-[#00205B] uppercase tracking-wide">
                et 2 étoiles
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {currentGrid.star.length}/2 étoiles
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 justify-items-center">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                const isSelected = currentGrid.star.includes(num);
                return (
                  <button
                    key={`star-${num}`}
                    onClick={() => toggleStarNumber(num)}
                    className={`fdj-ball-star ${isSelected ? 'selected' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* BOTTOM CHECKOUT SUMMARY BAR */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Total grilles prêtes à jouer :</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-[#00205B]">
                {validGrids.length} Grille{validGrids.length > 1 ? 's' : ''}
              </span>
              <span className="text-lg font-bold text-amber-600">
                ({totalCost.toLocaleString('fr-FR')} FCFA)
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={validGrids.length === 0}
            className={`px-8 py-4 rounded-2xl font-black text-sm sm:text-base flex items-center gap-3 transition shadow-lg ${
              validGrids.length > 0
                ? 'fdj-yellow-btn cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            <Ticket className="w-5 h-5 text-[#00205B]" />
            <span>PAYER {totalCost > 0 ? `${totalCost.toLocaleString('fr-FR')} FCFA` : '200 FCFA'} VIA ORANGE MONEY</span>
          </button>

        </div>

      </div>

    </section>
  );
}
