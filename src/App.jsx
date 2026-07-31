import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import JackpotHero from './components/JackpotHero';
import TicketSelector from './components/TicketSelector';
import DrawResults from './components/DrawResults';
import MyTickets from './components/MyTickets';
import AdminPanel from './components/AdminPanel';
import PaiementModal from './components/PaiementModal';
import ApkDownloadModal from './components/ApkDownloadModal';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [activeDraw, setActiveDraw] = useState(null);
  const [pastDraws, setPastDraws] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Modals state
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [pendingGrids, setPendingGrids] = useState([]);
  const [pendingCost, setPendingCost] = useState(0);

  // Active Tab: 'play' | 'tickets' | 'results'
  const [activeTab, setActiveTab] = useState('play');

  // Charge les données initiales depuis Supabase
  const fetchData = async () => {
    try {
      // 1. Récupérer le tirage actif ('upcoming')
      const { data: upcoming } = await supabase
        .from('draws')
        .select('*')
        .eq('status', 'upcoming')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (upcoming) {
        setActiveDraw(upcoming);
      } else {
        // Mock fallback if DB table not created yet
        setActiveDraw({
          id: 'mock-upcoming',
          draw_number: 1,
          cycle_number: 1,
          jackpot_indicative: 1000000,
          status: 'upcoming',
        });
      }

      // 2. Récupérer les tirages passés
      const { data: past } = await supabase
        .from('draws')
        .select('*')
        .neq('status', 'upcoming')
        .order('draw_date', { ascending: false })
        .limit(10);

      if (past) setPastDraws(past);

      // 3. Récupérer les billets enregistrés
      const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (tickets) setUserTickets(tickets);

      // 4. Récupérer ou créer un profil démo
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
      } else {
        setUserProfile({
          id: 'demo-user',
          phone_number: '+223 70 00 00 00',
          full_name: 'Joueur Mali',
          balance: 5000,
        });
      }
    } catch (err) {
      console.warn('Error loading Supabase data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Déclencher le modal de paiement
  const handleProceedToPayment = (grids, cost) => {
    setPendingGrids(grids);
    setPendingCost(cost);
    setIsPaiementModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-100 flex flex-col justify-between selection:bg-yellow-500 selection:text-black">
      
      {/* NAVBAR */}
      <Navbar
        userProfile={userProfile}
        onOpenAuth={() => setActiveTab('tickets')}
        onOpenDeposit={() => {
          const el = document.getElementById('ticket-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      <main className="flex-1 pb-16">
        
        {/* HERO JACKPOT */}
        <JackpotHero activeDraw={activeDraw} />

        {/* TAB NAVIGATION BAR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 my-4">
          <div className="flex items-center justify-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto shadow-inner">
            <button
              onClick={() => setActiveTab('play')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'play'
                  ? 'gold-button shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Jouer une Grille
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'tickets'
                  ? 'gold-button shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mes Billets ({userTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'results'
                  ? 'gold-button shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Résultats
            </button>
          </div>
        </div>

        {/* DYNAMIC TAB CONTENT */}
        {activeTab === 'play' && (
          <TicketSelector onProceedToPayment={handleProceedToPayment} />
        )}

        {activeTab === 'tickets' && (
          <MyTickets
            userTickets={userTickets}
            onOpenDeposit={() => setActiveTab('play')}
          />
        )}

        {activeTab === 'results' && (
          <DrawResults pastDraws={pastDraws} userTickets={userTickets} />
        )}

        {/* ADMIN CONTROL PANEL */}
        <AdminPanel
          activeDraw={activeDraw}
          pastDraws={pastDraws}
          onRefreshData={fetchData}
        />

      </main>

      {/* FOOTER */}
      <footer className="glass-panel border-t border-slate-800 py-6 px-4 text-center text-xs text-gray-500 space-y-2">
        <p className="font-semibold text-gray-400">
          WinnerOne Mali &copy; 2026 &bull; Loterie Journalière 100% Sécurisée
        </p>
        <p className="text-[11px] text-gray-600 max-w-xl mx-auto">
          Processeurs de paiement : Orange Money Mali (`OMML` / PaiementPro `PP-F92288`). Jouez de manière responsable. Réservé aux personnes de plus de 18 ans au Mali.
        </p>
      </footer>

      {/* MODALS */}
      <PaiementModal
        isOpen={isPaiementModalOpen}
        onClose={() => setIsPaiementModalOpen(false)}
        gridsToPlay={pendingGrids}
        totalCost={pendingCost}
        activeDraw={activeDraw}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

    </div>
  );
}
