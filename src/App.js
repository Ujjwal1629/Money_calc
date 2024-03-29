import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL);
function App() {
  const [name, setName] = useState("");
  const [datetime, setDatetime] = useState("");
  const [description, setDescription] = useState("");
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    getTransactions().then(setTransactions);
    // Listen for new transaction events
    socket.on("newTransaction", (newTransaction) => {
      setTransactions([...transactions, newTransaction]);
    });

    // Clean up function
    return () => {
      socket.off("newTransaction");
    };
  }, [transactions]);

  async function getTransactions() {
    const url = process.env.REACT_APP_API_URL + "/transactions";
    const response = await fetch(url);
    return await response.json();
  }

  function addNewTransaction(ev) {
    ev.preventDefault();
    const url = process.env.REACT_APP_API_URL + "/transaction";
    const match = name.match(/^([+-]?\d+(\.\d+)?)\s+(.*)/); // Match price and name
    const price = match ? match[1] : "0"; // Extracted price as string
    const productName = match ? match[3] : name;
    fetch(url, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        price: price, // Add plus sign before the price
        name: productName.trim(), // Trim product name
        description,
        datetime,
      }),
    }).then((response) =>
      response.json().then((json) => {
        setName("");
        setDatetime("");
        setDescription("");
        console.log("result", json);
        socket.emit("newTransaction", json);
      })
    );
  }
  let balance = 0;
  for (let transaction of transactions) {
    balance = balance + transaction.price;
  }
  return (
    <main className="App">
      <h1>
        Rs.{balance}
        <span>.00</span>
      </h1>
      <form onSubmit={addNewTransaction}>
        <div className="basic">
          <input
            type="text"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder=""
          />
          <input
            type="datetime-local"
            value={datetime}
            onChange={(ev) => setDatetime(ev.target.value)}
          />
        </div>
        <div className="description">
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
          />
        </div>
        <button type="submit">Add new transaction</button>
      </form>
      <div className="transactions">
        {transactions.length > 0 &&
          transactions.map((transaction) => (
            <div className="transaction">
              <div className="left">
                <div className="name">{transaction.name}</div>
                <div className="description">{transaction.description}</div>
              </div>
              <div className="right">
                <div
                  className={
                    "price " + (transaction.price < 0 ? "red" : "green")
                  }
                >
                  {transaction.price}
                </div>
                <div className="datetime">{transaction.date}</div>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}

export default App;
