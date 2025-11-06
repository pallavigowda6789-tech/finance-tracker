import { createClient } from '@supabase/supabase-js'

// 🔑 Replace the placeholders below with your real Supabase credentials
const supabaseUrl = 'https://qqhduaiakdpqlhbefndh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxaGR1YWlha2RwcWxoYmVmbmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTI2MDQsImV4cCI6MjA3NzgyODYwNH0.MJlYaE0cxcgahWFOH0wb8CJKyNs07ivIh8oeo86KNxg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


