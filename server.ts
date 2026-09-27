import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Clean credentials placeholders in compliance with security guidelines
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || "";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY || "";
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || "";
const PI_API_KEY = process.env.PI_API_KEY || "";

async function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // Paystack Verification (Clean backend call, no hardcoded secrets)
  app.get('/api/payments/paystack/verify/:reference', async (req, res) => {
    const { reference } = req.params;
    try {
      if (!PAYSTACK_SECRET_KEY) {
         return res.status(500).json({ status: false, message: 'Paystack Secret key not configured' });
      }
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  });

  // Server-Side Pi Payment Approval
  app.post('/api/pi/approve', async (req, res) => {
    const { paymentId } = req.body;
    try {
      if (!PI_API_KEY) {
        return res.status(500).json({ status: false, message: 'PI_API_KEY is not configured on the server-side.' });
      }
      // Official Pi Platform API call for payment approval
      const response = await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
        headers: {
          Authorization: `Key ${PI_API_KEY}`
        }
      });
      res.json({ status: 'approved', data: response.data });
    } catch (error: any) {
      console.error("Pi Approve Error: ", error.response?.data || error.message);
      res.status(500).json({ status: 'error', message: error.response?.data || error.message });
    }
  });

  // Server-Side Pi Payment Completion
  app.post('/api/pi/complete', async (req, res) => {
    const { paymentId, txid } = req.body;
    try {
      if (!PI_API_KEY) {
        return res.status(500).json({ status: false, message: 'PI_API_KEY is not configured on the server-side.' });
      }
      // Official Pi Platform API call for payment completion
      const response = await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, { txid }, {
        headers: {
          Authorization: `Key ${PI_API_KEY}`
        }
      });
      res.json({ status: 'success', message: 'Pi Blockchain Transaction Verified & Completed Server-Side', data: response.data });
    } catch (error: any) {
      console.error("Pi Complete Error: ", error.response?.data || error.message);
      res.status(500).json({ status: 'error', message: error.response?.data || error.message });
    }
  });

  // --- Vite Integration / Static Serving ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname)));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`GOYE HUB running at http://localhost:${port}`);
  });
}

createServer();
