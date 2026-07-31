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
import confetti from 'canvas-confetti';
import { supabase, ensureProfileForAuthUser, signOut } from './lib/supabaseClient';

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

  // Gestion de la session Google (OAuth) : charge/crée le profil après connexion
  useEffect(() => {
    const applyAuthUser = async (authUser) => {
      if (!authUser) return;
      const profile = await ensureProfileForAuthUser(authUser);
      if (profile) {
        setUserProfile(profile);
        localStorage.setItem('winnerone_user', JSON.stringify(profile));
      }
    };

    // Session déjà active (retour de redirection Google)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) applyAuthUser(session.user);
    });

    // Écoute les changements (connexion / déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        applyAuthUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        localStorage.removeItem('winnerone_user');
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Retour depuis la passerelle de paiement Orange Money
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'return') {
      setActiveTab('tickets');
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
      // Le webhook confirme le paiement en arrière-plan : on rafraîchit plusieurs fois
      fetchData();
      const t1 = setTimeout(fetchData, 3000);
      const t2 = setTimeout(fetchData, 8000);
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {}
    setUserProfile(null);
    localStorage.removeItem('winnerone_user');
    setActiveTab('play');
  };

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

      // Billets de l'utilisateur connecté uniquement (évite la confusion entre comptes)
      let ticketsQuery = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (userProfile?.id) {
        ticketsQuery = ticketsQuery.eq('user_id', userProfile.id);
      }

      const { data: tickets } = await ticketsQuery;

      if (tickets) {
        setUserTickets(userProfile?.id ? tickets : []);
        const winningTicket = tickets.find((t) => t.win_rank > 0);
        if (winningTicket) setLatestWinningTicket(winningTicket);
      }
    } catch (err) {
      console.warn('Error loading Supabase data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.id]);

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
        onLogout={handleLogout}
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
            onLogout={handleLogout}
            onProfileUpdate={handleUserSaved}
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
      />

      <PaiementModal
        isOpen={isPaiementModalOpen}
        onClose={() => setIsPaiementModalOpen(false)}
        gridsToPlay={pendingGrids}
        totalCost={pendingCost}
        activeDraw={activeDraw}
        userProfile={userProfile}
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
