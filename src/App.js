import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const supabaseUrl = "https://YOUR-PROJECT-URL.supabase.co";
const supabaseKey = "YOUR-ANON-KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Fetch error:", error.message);
    else setTransactions(data);
    setLoading(false);
  }

  async function addTransaction() {
    if (!title || !amount) return alert("Enter title and amount");
    const { error } = await supabase
      .from("expenses")
      .insert([{ title, amount: +amount, type }]);
    if (error) alert("Failed to add: " + error.message);
    else {
      setTitle("");
      setAmount("");
      fetchTransactions();
    }
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const COLORS = ["#00C49F", "#FF8042"];

  const chartData = [
    { name: "Income", value: totalIncome },
    { name: "Expense", value: totalExpense },
  ];

  return (
    <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial" }}>
      <h1>💰 Finance Tracker Dashboard</h1>

      {/* Add transaction form */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button onClick={addTransaction} style={{ marginLeft: "10px" }}>
          Add
        </button>
      </div>

      {/* Summary */}
      <div>
        <h3>Total Income: ₹{totalIncome}</h3>
        <h3>Total Expense: ₹{totalExpense}</h3>
        <h2>Balance: ₹{totalIncome - totalExpense}</h2>
      </div>

      {/* Pie Chart */}
      <h2>Income vs Expense</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Bar Chart */}
      <h2>Transaction History</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={transactions}>
          <XAxis dataKey="title" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#8884d8" name="Amount" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

