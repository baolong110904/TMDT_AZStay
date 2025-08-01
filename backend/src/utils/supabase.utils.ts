import { createClient } from '@supabase/supabase-js'
import { ENV } from '../config/environtment.config';

const SUPABASE_KEY = ENV.SUPABASE_KEY
const SUPABASE_URL = ENV.SUPABASE_URL
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);