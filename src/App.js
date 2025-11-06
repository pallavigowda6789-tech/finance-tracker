import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [expenses, setExpenses] = useState([])
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [editingId, setEditingId] = useState(null)

  // Fetch data from Supabase
  useEffect(() => {
    fetchExpenses()
  }, [])

  async function fetchExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('id', { ascending: false })
    if (error) console.error('❌ Error fetching:', error)
    else setExpenses(data)
  }

  // Add new expense
  async function addExpense(e) {
    e.preventDefault()
    if (!title || !amount) return alert('Please fill both fields')

    const { error } = await supabase
      .from('expenses')
      .insert([{ title, amount: parseFloat(amount) }])

    if (error) alert('❌ Failed to add expense')
    else {
      alert('✅ Expense added successfully!')
      setTitle('')
      setAmount('')
      fetchExpenses()
    }
  }

  // Delete expense
  async function deleteExpense(id) {
    const confirmDelete = window.confirm('🗑️ Are you sure you want to delete this expense?')
    if (!confirmDelete) return

    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) alert('❌ Failed to delete')
    else fetchExpenses()
  }

  // Start editing mode
  function startEdit(expense) {
    setEditingId(expense.id)
    setTitle(expense.title)
    setAmount(expense.amount)
  }

  // Save updated expense
  async function updateExpense(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('expenses')
      .update({ title, amount: parseFloat(amount) })
      .eq('id', editingId)

    if (error) alert('❌ Update failed')
    else {
      alert('✅ Expense updated successfully!')
      setEditingId(null)
      setTitle('')
      setAmount('')
      fetchExpenses()
    }
  }

  return (
    <div style={{ textAlign: 'center', padding: '30px', fontFamily: 'Arial' }}>
      <h1>💰 My Finance Tracker</h1>

      {/* Add / Edit Expense Form */}
      <form onSubmit={editingId ? updateExpense : addExpense} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter expense title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: '8px',
            marginRight: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc'
          }}
        />
        <input
          type="number"
          placeholder="Amount ₹"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            padding: '8px',
            marginRight: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 15px',
            backgroundColor: editingId ? '#ff9800' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {editingId ? 'Update Expense' : 'Add Expense'}
        </button>
      </form>

      {/* Expense List */}
      <h3>Expenses:</h3>
      {expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {expenses.map((item) => (
            <li
              key={item.id}
              style={{
                margin: '8px 0',
                fontSize: '18px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              🧾 {item.title} — ₹{item.amount}
              <button
                onClick={() => startEdit(item)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteExpense(item.id)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
