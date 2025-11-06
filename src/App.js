import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    fetchExpenses()
  }, [])

  async function fetchExpenses() {
    const { data, error } = await supabase.from('expenses').select('*')
    if (error) console.error('Error fetching:', error)
    else setExpenses(data)
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>💰 My Finance Tracker</h1>
      <h3>Expenses from Supabase:</h3>

      {expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <ul>
          {expenses.map((item) => (
            <li key={item.id}>
              {item.title} - ₹{item.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
