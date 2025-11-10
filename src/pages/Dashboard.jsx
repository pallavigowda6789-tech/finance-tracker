// src/pages/Dashboard.jsx
import React from 'react';
import ChartSummary from '../components/ChartSummary';
import { supabase } from '../services/supabaseClient';

export default function Dashboard() {
  const user = supabase.auth.user(); // or your auth hook
  const userId = user?.id;

  return (
    <div className="dashboard-page" style={{ padding: 20 }}>
      <h2>Dashboard</h2>

      {/* other dashboard widgets (totals, recent tx) */}

      <section style={{ marginTop: 20 }}>
        <ChartSummary userId={userId} />
      </section>
    </div>
  );
}
