import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.log("Error fetching transactions:", error.message);
    } else {
      setTransactions(data);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Transactions</h2>
      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <ul>
          {transactions.map((tx) => (
            <li key={tx.id}>
              {tx.date?.slice(0, 10)} — {tx.description}: ${tx.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Transactions;
