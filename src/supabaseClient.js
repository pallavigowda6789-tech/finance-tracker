// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// 🔑 Replace the placeholders below with your real Supabase credentials
const supabaseUrl = 'https://qqhduaiakdpqlhbefndh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxaGR1YWlha2RwcWxoYmVmbmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTI2MDQsImV4cCI6MjA3NzgyODYwNH0.MJlYaE0cxcgahWFOH0wb8CJKyNs07ivIh8oeo86KNxg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


/** fetch raw transactions for a user */
export async function getTransactions(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
}

/** fetch grouped totals by month (last N months) */
export async function getMonthlyTotals(userId, months = 6) {
  // We will fetch transactions and aggregate in JS (client-side)
  // (You could write SQL aggregation on Supabase if preferred)
  const tx = await getTransactions(userId);
  if (!tx) return [];

  // Build map of yyyy-MM => totalExpense (only expenses)
  const map = {};
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = format(d, 'yyyy-MM');
    map[key] = 0;
  }

  tx.forEach((t) => {
    const key = format(new Date(t.date), 'yyyy-MM');
    // Assume t.type === 'expense' or t.amount negative/positive depending on design
    const amt = Number(t.amount) || 0;
    // If your schema stores expense as negative, use Math.abs or adjust as needed.
    map[key] = (map[key] || 0) + (t.type === 'expense' ? Math.abs(amt) : 0);
  });

  return Object.keys(map).map((k) => ({ month: k, total: map[k] }));
}

/** fetch totals grouped by category */
export async function getCategoryTotals(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount, type')
    .eq('user_id', userId);

  if (error) throw error;
  const map = {};
  (data || []).forEach((t) => {
    const cat = t.category || 'Uncategorized';
    const amt = Number(t.amount) || 0;
    const add = t.type === 'expense' ? Math.abs(amt) : 0; // only expense for pie
    map[cat] = (map[cat] || 0) + add;
  });

  return Object.entries(map).map(([category, total]) => ({ category, total }));
}
