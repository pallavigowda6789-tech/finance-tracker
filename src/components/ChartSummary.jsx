// src/components/ChartSummary.jsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { getMonthlyTotals, getCategoryTotals } from '../services/supabaseClient';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B8A'];

function formatMonthLabel(yyyyMM) {
  const [y, m] = yyyyMM.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString(undefined, { month: 'short', year: 'numeric' });
}

export default function ChartSummary({ userId }) {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const months = await getMonthlyTotals(userId, 6);
        // prepare for line chart
        const lineData = months.map(m => ({ month: formatMonthLabel(m.month), total: m.total }));
        setMonthlyData(lineData);

        const cats = await getCategoryTotals(userId);
        const pieData = cats.map(c => ({ name: c.category, value: c.total }));
        setCategoryData(pieData);
      } catch (err) {
        console.error('chart load error', err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) load();
  }, [userId]);

  if (loading) return <div>Loading charts...</div>;
  if (!monthlyData.length && !categoryData.length) return <div>No data to show yet.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ minHeight: 300 }}>
        <h3>Spending (Last 6 months)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ minHeight: 300 }}>
        <h3>Spending by Category</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
