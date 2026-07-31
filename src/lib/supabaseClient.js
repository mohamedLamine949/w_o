import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ncuhzlhgkpltucdvdwln.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UcuF96oN4jz3kXh0eMZd3g_DIOM6Lfj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
