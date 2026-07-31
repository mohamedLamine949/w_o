import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import JackpotHero from './components/JackpotHero';
import TicketSelector from './components/TicketSelector';
import DrawResults from './components/DrawResults';
import MyTickets from './components/MyTickets';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import PaiementModal from './components/PaiementModal';
import ApkDownloadModal from './components/ApkDownloadModal';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [activeDraw, setActiveDraw] = useState(null);
  const [pastDraws, setPastDraws] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [latestWinningTicket, setLatestWinningTicket] = useState(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isAdminVisible, setIsAdminVisible] = useState(false);

  const [pendingGrids, setPendingGrids] = useState([]);
  const [pendingCost, setPendingCost] = useState(0);

  // Active Tab: 'play' | 'tickets' | 'results' | 'profile'
  const [activeTab, setActiveTab] = useState('play');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setIsAdminVisible(true);
    }

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsAdminVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('winnerone_user');
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const fetchData = async () => {
    try {
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
        setActiveDraw({
          id: 'mock-upcoming',
          draw_number: 1,
          cycle_number: 1,
          jackpot_indicative: 1000000,
          status: 'upcoming',
        });
      }

      const { data: past } = await supabase
        .from('draws')
        .select('*')
        .neq('status', 'upcoming')
        .order('draw_date', { ascending: false })
        .limit(10);

      if (past) setPastDraws(past);

      const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (tickets) {
        setUserTickets(tickets);
        const winningTicket = tickets.find((t) => t.win_rank > 0);
        if (winningTicket) setLatestWinningTicket(winningTicket);
      }
    } catch (err) {
      console.warn('Error loading Supabase data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProceedToPayment = (grids, cost) => {
    if (!userProfile) {
      setIsAuthModalOpen(true);
      return;
    }
    setPendingGrids(grids);
    setPendingCost(cost);
    setIsPaiementModalOpen(true);
  };

  const handleUserSaved = (profile) => {
    setUserProfile(profile);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col justify-between selection:bg-[#FFD100] selection:text-[#00205B]">
      
      {/* NAVBAR */}
      <Navbar
        userProfile={userProfile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 pb-16">
        
        {/* HERO JACKPOT WINNERONE */}
        <JackpotHero activeDraw={activeDraw} latestWinningTicket={latestWinningTicket} />

        {/* DYNAMIC TAB CONTENT */}
        {activeTab === 'play' && (
          <TicketSelector onProceedToPayment={handleProceedToPayment} />
        )}

        {activeTab === 'tickets' && (
          <MyTickets
            userTickets={userTickets}
            userProfile={userProfile}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenDeposit={() => setActiveTab('play')}
          />
        )}

        {activeTab === 'results' && (
          <DrawResults pastDraws={pastDraws} userTickets={userTickets} />
        )}

        {activeTab === 'profile' && (
          <UserProfile
            userProfile={userProfile}
            userTickets={userTickets}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenDeposit={() => setActiveTab('play')}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-[#00205B]">
          WinnerOne Mali &copy; 2026 &bull; Loterie Journalière Officielle (200 FCFA)
        </p>
        <p className="text-[11px] text-slate-400 max-w-xl mx-auto">
          Paiement sécurisé via Orange Money Mali (`OMML` / PaiementPro `PP-F92288`). Réservé aux personnes majeures de plus de 18 ans au Mali.
        </p>
      </footer>

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userProfile={userProfile}
        onUserSaved={handleUserSaved}
      />

      <PaiementModal
        isOpen={isPaiementModalOpen}
        onClose={() => setIsPaiementModalOpen(false)}
        gridsToPlay={pendingGrids}
        totalCost={pendingCost}
        activeDraw={activeDraw}
        onPaymentSuccess={fetchData}
      />

      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* ISOLATED ADMIN PANEL */}
      <AdminPanel
        activeDraw={activeDraw}
        pastDraws={pastDraws}
        onRefreshData={fetchData}
        isVisible={isAdminVisible}
        onClose={() => setIsAdminVisible(false)}
      />

    </div>
  );
}
