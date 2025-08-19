import { createClient } from '@supabase/supabase-js'

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcG5wdGt4dG1iaGlxaHdxdGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Mzc0OTgsImV4cCI6MjA2ODIxMzQ5OH0.OA0bsU5CKrDJvCDSBBK0jzuPcgNdy069o9fwx_ynees'
const SUPABASE_URL = 'https://jmpnptkxtmbhiqhwqtkh.supabase.co'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);