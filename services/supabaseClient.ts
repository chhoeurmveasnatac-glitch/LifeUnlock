
import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const supabaseUrl = 'https://rxsttlcfiwbddhmwdbxw.supabase.co';
const supabaseKey = 'sb_publishable_5fF2UUc-NxdrkeNLSV2umA_kbUcFKMI';

export const supabase = createClient(supabaseUrl, supabaseKey);
