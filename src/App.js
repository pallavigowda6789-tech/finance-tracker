import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import "./App.css";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [currency, setCurrency] = useState("INR");
  const [editingId, setEditingId] = useState(null);

  const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching:", error.message);
      const offlineData = localStorage.getItem("transactions");
      if (offlineData) setTransactions(JSON.parse(offlineData));
    } else {
      setTransactions(data || []);
      localStorage.setItem("transactions", JSON.stringify(data));
    }
  };

  const addTransaction = async () => {
    if (!title || !amount || !category) {
      alert("Please fill all fields!");
      return;
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert([{ title, amount: parseFloat(amount), category, type, currency }])
      .select();

    if (error) console.error("Error adding:", error.message);
    else if (data && data.length > 0) {
      const updated = [...transactions, data[0]];
      setTransactions(updated);
      localStorage.setItem("transactions", JSON.stringify(updated));
      setTitle("");
      setAmount("");
      setCategory("");
    }
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) console.error("Error deleting:", error.message);
    else {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      localStorage.setItem("transactions", JSON.stringify(updated));
    }
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setTitle(t.title);
    setAmount(t.amount);
    setCategory(t.category);
    setType(t.type);
    setCurrency(t.currency);
  };

  const updateTransaction = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .update({ title, amount: parseFloat(amount), category, type, currency })
      .eq("id", editingId)
      .select();

    if (error) console.error("Error updating:", error.message);
    else if (data && data.length > 0) {
      const updated = transactions.map((t) => (t.id === editingId ? data[0] : t));
      setTransactions(updated);
      localStorage.setItem("transactions", JSON.stringify(updated));
      setEditingId(null);
      setTitle("");
      setAmount("");
      setCategory("");
      setType("expense");
    }
  };

  // ✅ Totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // ✅ Monthly Trend (group by month)
  const monthlyData = Object.values(
    transactions.reduce((acc, t) => {
      const month = new Date(t.created_at || Date.now()).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
      if (t.type === "income") acc[month].income += t.amount;
      else acc[month].expense += t.amount;
      return acc;
    }, {})
  );

  // ✅ Suggestions
  let suggestion = "";
  if (totalExpense > totalIncome) {
    suggestion = "⚠️ You're spending more than you earn. Try cutting down non-essential costs.";
  } else if (totalExpense < totalIncome * 0.5) {
    suggestion = "✅ Great job! You’re saving well — consider investing your surplus.";
  } else if (totalExpense < totalIncome) {
    suggestion = "💡 Good balance! Keep tracking regularly to maintain control.";
  }

  // ✅ Category Chart
  const categoryData = Object.values(
    transactions.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { name: t.category, income: 0, expense: 0 };
      if (t.type === "income") acc[t.category].income += t.amount;
      else acc[t.category].expense += t.amount;
      return acc;
    }, {})
  );

  const COLORS = ["#28a745", "#dc3545", "#007BFF", "#FFC107", "#6f42c1"];

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">🌍 Global Finance Tracker</h1>

        {/* Form */}
        <div className="form">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {Object.keys(currencySymbols).map((c) => (
              <option key={c} value={c}>
                {currencySymbols[c]} {c}
              </option>
            ))}
          </select>
          {editingId ? (
            <button className="btn update" onClick={updateTransaction}>
              ✅ Update
            </button>
          ) : (
            <button className="btn add" onClick={addTransaction}>
              ➕ Add
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="summary">
          <h3>
            💵 Income: {currencySymbols[currency]}
            {totalIncome.toFixed(2)}
          </h3>
          <h3>
            💸 Expense: {currencySymbols[currency]}
            {totalExpense.toFixed(2)}
          </h3>
          <h3>
            📊 Balance: {currencySymbols[currency]}
            {balance.toFixed(2)}
          </h3>
        </div>

        <p className="suggestion">{suggestion}</p>

        {/* Transaction List */}
        <ul className="expense-list">
          {transactions.map((t) => (
            <li key={t.id} className={`expense-item ${t.type}`}>
              <div>
                <strong>{t.title}</strong>
                <p>
                  {currencySymbols[t.currency || "INR"]}
                  {t.amount} ({t.category}) — {t.type === "income" ? "🟢 Income" : "🔴 Expense"}
                </p>
              </div>
              <div>
                <button className="icon-btn" onClick={() => startEdit(t)}>
                  ✏️
                </button>
                <button className="icon-btn delete" onClick={() => deleteTransaction(t.id)}>
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>

          
        {/* Charts */}
        <div className="chart-container">
          <div className="chart-box">
            <h4>Income vs Expense (Pie)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Income", value: totalIncome },
                    { name: "Expense", value: totalExpense },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  <Cell fill="#28a745" />
                  <Cell fill="#dc3545" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h4>Category Breakdown</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#28a745" />
                <Bar dataKey="expense" fill="#dc3545" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h4>📅 Monthly Income & Expense Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#28a745" />
                <Line type="monotone" dataKey="expense" stroke="#dc3545" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
