import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://dldyysmfnenpnfftazld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZHl5c21mbmVucG5mZnRhemxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTM1NjgsImV4cCI6MjA2OTc2OTU2OH0.bg_Uggwua0cAGXr_yW01ukohPHDgDxFQco1-Oi3vmjk'
)
