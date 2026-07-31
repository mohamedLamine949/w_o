-- WinnerOne (Loterie Journalière du Mali) - Schema SQL Supabase
-- Exécuter ce script dans l'Éditeur SQL de votre tableau de bord Supabase (https://ncuhzlhgkpltucdvdwln.supabase.co)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    balance NUMERIC DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table DRAWS (Tirages)
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_number SERIAL UNIQUE,
    draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'drawn', 'completed')),
    cycle_number INT NOT NULL DEFAULT 1 CHECK (cycle_number BETWEEN 1 AND 3),
    winning_main_numbers INT[],
    winning_star_numbers INT[],
    jackpot_indicative NUMERIC DEFAULT 1000000, -- Display Jackpot (FCFA)
    total_sales_pot NUMERIC DEFAULT 0,          -- Ventes totales du tirage en FCFA
    net_prize_pot NUMERIC DEFAULT 0,            -- 60% des ventes attribué aux gains
    total_tickets_sold INT DEFAULT 0,
    is_jackpot_won BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table TICKETS (Billets)
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
    main_numbers INT[] NOT NULL,  -- Array of 5 numbers (1..50)
    star_numbers INT[] NOT NULL,  -- Array of 2 numbers (1..12)
    ticket_price NUMERIC NOT NULL DEFAULT 200,
    reference_number TEXT UNIQUE NOT NULL,
    payment_channel TEXT DEFAULT 'OMML', -- Orange Money Mali
    payment_status TEXT NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
    win_rank INT DEFAULT 0, -- 0: Pas de gain, 1: Rang 1 (Jackpot), 2: Rang 2, etc.
    prize_amount NUMERIC DEFAULT 0,
    is_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('TICKET_PURCHASE', 'WINNING_PAYOUT', 'DEPOSIT', 'WITHDRAWAL')),
    amount NUMERIC NOT NULL,
    reference TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public profiles write" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public draws read" ON public.draws FOR SELECT USING (true);
CREATE POLICY "Public draws write" ON public.draws FOR ALL USING (true);

CREATE POLICY "Public tickets read" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Public tickets write" ON public.tickets FOR ALL USING (true);

CREATE POLICY "Public transactions read" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Public transactions write" ON public.transactions FOR ALL USING (true);

-- Seed initial Upcoming Draw if none exists
INSERT INTO public.draws (draw_date, status, cycle_number, jackpot_indicative, total_sales_pot, net_prize_pot, total_tickets_sold)
SELECT NOW() + INTERVAL '1 day', 'upcoming', 1, 1000000, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.draws WHERE status = 'upcoming');
