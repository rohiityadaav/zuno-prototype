import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting Zuno Server (In-Memory Mode)...");

// In-memory store simulating DynamoDB Single-Table Design
const store = {
  // PK: USER#1, SK: TX#<timestamp>
  transactions: [
    { 
      id: 1, 
      item: 'Chini (Sugar)', 
      qty: 2, 
      price: 40, 
      type: 'Sale', 
      category: 'Inventory',
      status: 'Paid',
      customer: 'Walk-in', 
      timestamp: '2026-02-20T10:00:00.000Z',
      rawAudioRef: 's3://zuno-audio/tx-001.wav',
      intentProof: 'Ek kilo chini bechi cash mein'
    },
    { 
      id: 2, 
      item: 'Aata (Flour)', 
      qty: 5, 
      price: 35, 
      type: 'Credit', 
      category: 'Udhaar',
      status: 'Pending',
      customer: 'Ramesh Bhai', 
      timestamp: '2026-02-21T14:30:00.000Z',
      rawAudioRef: 's3://zuno-audio/tx-002.wav',
      intentProof: 'Ramesh ko 5 kilo aata udhaar diya'
    },
    { 
      id: 3, 
      item: 'Chai Patti (Tea)', 
      qty: 1, 
      price: 150, 
      type: 'Purchase', 
      category: 'Inventory',
      status: 'Paid',
      customer: 'Supplier Alpha', 
      timestamp: '2026-02-22T09:15:00.000Z',
      rawAudioRef: 's3://zuno-audio/tx-003.wav',
      intentProof: 'Supplier se chai patti kharidi'
    },
    { 
      id: 4, 
      item: 'Doodh (Milk)', 
      qty: 10, 
      price: 20, 
      type: 'Sale', 
      category: 'Inventory',
      status: 'Paid',
      customer: 'Walk-in', 
      timestamp: '2026-02-23T08:00:00.000Z',
      rawAudioRef: 's3://zuno-audio/tx-004.wav',
      intentProof: '10 packet doodh becha'
    }
  ],
  inventory: [
    { id: 1, item: 'Chini (Sugar)', stock: 50, min_stock: 10, cost_price: 35 },
    { id: 2, item: 'Doodh (Milk)', stock: 5, min_stock: 10, cost_price: 18 },
    { id: 3, item: 'Aata (Flour)', stock: 100, min_stock: 20, cost_price: 30 },
    { id: 4, item: 'Chai Patti (Tea)', stock: 2, min_stock: 5, cost_price: 120 }
  ]
};

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // API Routes
    app.get("/api/transactions", (req, res) => {
      res.json([...store.transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    });

    app.post("/api/transactions", (req, res) => {
      const { item, qty, price, type, customer, intentProof } = req.body;
      const newTx = {
        id: store.transactions.length + 1,
        item,
        qty,
        price,
        type: type === 'Cash' ? 'Sale' : (type === 'Credit' ? 'Credit' : 'Purchase'),
        category: type === 'Credit' ? 'Udhaar' : 'Inventory',
        status: type === 'Cash' ? 'Paid' : 'Pending',
        customer: customer || 'Walk-in',
        timestamp: new Date().toISOString(),
        rawAudioRef: `s3://zuno-audio/tx-${Date.now()}.wav`,
        intentProof: intentProof || 'Ambient extraction'
      };
      store.transactions.push(newTx);
      
      // Update inventory
      const invItem = store.inventory.find(i => i.item === item);
      if (invItem) {
        invItem.stock -= qty;
      }
      
      res.json({ id: newTx.id });
    });

    app.get("/api/inventory", (req, res) => {
      res.json(store.inventory);
    });

    app.get("/api/financials", (req, res) => {
      const txs = store.transactions;
      
      // Total Revenue: Sum of all Sale entries
      const totalRevenue = txs
        .filter(t => t.type === 'Sale')
        .reduce((acc, t) => acc + (t.qty * t.price), 0);
      
      // COGS: Sum of all Purchase entries (or cost of items sold)
      const cogs = txs
        .filter(t => t.type === 'Purchase')
        .reduce((acc, t) => acc + (t.qty * t.price), 0);
      
      // Trapped Capital (Udhaar)
      const trappedCapital = txs
        .filter(t => t.type === 'Credit')
        .reduce((acc, t) => acc + (t.qty * t.price), 0);
      
      // Net Profit
      const netProfit = totalRevenue - cogs;
      
      const inventoryValue = store.inventory.reduce((acc, i) => acc + (i.stock * i.cost_price), 0);
      const disposableIncome = totalRevenue - trappedCapital;

      // Growth Calculation (Simulated MoM)
      const growth = 12.5; // 12.5% growth

      // Zuno Score logic
      const cashRatio = txs.filter(t => t.type === 'Sale').length / (txs.length || 1);
      let score = 300 + Math.min(600, (totalRevenue / 100) + (cashRatio * 200));

      res.json({ 
        score: Math.round(score),
        totalRevenue,
        cogs,
        netProfit,
        trappedCapital,
        inventoryValue,
        disposableIncome,
        growth
      });
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      console.log("Starting Vite in middleware mode...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware integrated.");
    } else {
      app.use(express.static(path.join(__dirname, "dist")));
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "dist", "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Zuno Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();
