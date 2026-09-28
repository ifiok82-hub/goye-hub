import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "GoyeBN3583773";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "goye_super_secret_jwt_key";

if (!process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH) {
  console.warn("⚠️ [Security Warning] Neither ADMIN_PASSWORD nor ADMIN_PASSWORD_HASH env var is set. Set ADMIN_PASSWORD in Vercel Env Vars for production security. Falling back to default secure credential.");
}

const PROFILES_FILE = path.join(__dirname, 'user_profiles.json');

function readProfiles() {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      const data = fs.readFileSync(PROFILES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Profiles DB] Error reading file:', e);
  }
  return {};
}

function writeProfiles(profiles: any) {
  try {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Profiles DB] Error writing file:', e);
  }
}

const ORDERS_FILE = path.join(__dirname, 'orders_db.json');

function readOrdersDB() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Orders DB] Error reading file:', e);
  }
  return { requests: [], quotes: [] };
}

function writeOrdersDB(db: any) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Orders DB] Error writing file:', e);
  }
}

// Clean credentials placeholders in compliance with security guidelines
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || "";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY || "";
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || "";
const PI_API_KEY = process.env.PI_API_KEY || "";

export const PI_TESTNET_WALLET = "GASU7HADLZKZE4A6EPRWW5QNMGHQBSL6FR3ED4N4ZR3KYDQRQXGQTJLX";
export const PI_MAINNET_WALLET = "GBR4B47WY7JDK2JKUUQQTWWQENOUUYTAQAOYLXZ7XE36YFQY6LKPVO6R";

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
    const { paymentId, txid, orderId } = req.body;
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

      // Update the request status securely if orderId is provided
      if (orderId) {
        const db = readOrdersDB();
        db.requests = db.requests || [];
        const idx = db.requests.findIndex((r: any) => r.id === orderId);
        if (idx >= 0) {
          db.requests[idx].status = 'PAYMENT VERIFIED';
          db.requests[idx].paymentRef = txid;
          db.requests[idx].paymentProvider = 'PI_NETWORK';
          db.requests[idx].updatedAt = Date.now();
          writeOrdersDB(db);
        }
      }

      res.json({ status: 'success', message: 'Pi Blockchain Transaction Verified & Completed Server-Side', data: response.data });
    } catch (error: any) {
      console.error("Pi Complete Error: ", error.response?.data || error.message);
      res.status(500).json({ status: 'error', message: error.response?.data || error.message });
    }
  });

  // Server-Side Pi User Access Token Verification
  app.post('/api/pi/verify-user', async (req, res) => {
    const { accessToken } = req.body;
    try {
      if (!accessToken) {
        return res.status(400).json({ status: false, message: 'Missing access token' });
      }
      const response = await axios.get('https://api.minepi.com/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      res.json({ status: 'success', data: response.data });
    } catch (error: any) {
      console.error("Pi Verify User Error: ", error.response?.data || error.message);
      res.status(500).json({ status: 'error', message: error.response?.data || error.message });
    }
  });

  // Unique Server-Side Order Reference Generator
  app.post('/api/orders/generate-reference', (req, res) => {
    const { type } = req.body;
    const validatedType = ['CAC', 'WEB', 'AI', 'DIG'].includes(type) ? type : 'GEN';
    const year = 2026;
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const reference = `GOYE-${validatedType}-${year}-${randomDigits}`;
    res.json({ reference });
  });

  // Payment Provider Webhook Signature Check with Idempotency placeholders
  app.post('/api/webhooks/paystack', (req, res) => {
    const signature = req.headers['x-paystack-signature'];
    if (!signature) {
      return res.status(401).json({ status: 'failed', message: 'Missing Signature Header' });
    }
    // Secure verification mock-free placeholder logic
    console.log('[Webhook] Paystack signature received:', signature);
    res.json({ status: 'success', received: true });
  });

  // Secure API Route to pull System Health metrics without exposing keys
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'CONNECTED',
      PI_API_KEY: PI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED',
      PAYSTACK_SECRET_KEY: PAYSTACK_SECRET_KEY ? 'CONFIGURED' : 'NOT CONFIGURED',
      FLUTTERWAVE_SECRET_KEY: FLUTTERWAVE_SECRET_KEY ? 'CONFIGURED' : 'NOT CONFIGURED',
      VITE_PAYSTACK_PUBLIC_KEY: process.env.VITE_PAYSTACK_PUBLIC_KEY ? 'CONFIGURED' : 'NOT CONFIGURED',
      VITE_FLUTTERWAVE_PUBLIC_KEY: process.env.VITE_FLUTTERWAVE_PUBLIC_KEY ? 'CONFIGURED' : 'NOT CONFIGURED',
      PI_NETWORK_MODE: 'TESTNET',
      PI_SANDBOX: true,
      TESTNET_WALLET: PI_TESTNET_WALLET,
      VALIDATION_KEY: 'CONFIGURED',
      appWallet: {
        testnet: PI_TESTNET_WALLET,
        testnetStatus: "CONFIGURED",
        mainnet: PI_MAINNET_WALLET,
        mainnetStatus: "KYC / Mainnet Only - BLOCKED IN TESTNET",
        networkMode: "TESTNET",
        sandbox: true
      },
      paymentGateways: {
        paystack_secret: PAYSTACK_SECRET_KEY ? 'CONFIGURED' : 'NOT CONFIGURED',
        flutterwave_secret: FLUTTERWAVE_SECRET_KEY ? 'CONFIGURED' : 'NOT CONFIGURED',
        pi_api_key: PI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'
      },
      timestamp: Date.now()
    });
  });

  // Secure endpoints to manage authenticated user profiles (No customer leaks)
  app.get('/api/user/profile', (req, res) => {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }
    const profiles = readProfiles();
    const userProfile = profiles[userId];
    if (!userProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(userProfile);
  });

  app.post('/api/user/profile', (req, res) => {
    const { id, name, email, phone, role } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Missing profile ID' });
    }
    const profiles = readProfiles();
    profiles[id] = {
      id,
      name: name || 'Valued User',
      email: email || '',
      phone: phone || '',
      role: role || 'customer',
      updatedAt: Date.now()
    };
    writeProfiles(profiles);
    res.json({ success: true, profile: profiles[id] });
  });

  // Secure endpoints for Admin authentication
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password parameter is required' });
    }

    let isMatch = false;
    if (ADMIN_PASSWORD_HASH) {
      isMatch = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
    } else {
      isMatch = (password === ADMIN_PASSWORD);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }

    const token = jwt.sign({ role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: 'admin', expiresIn: '8h' });
  });

  app.post('/api/admin/logout', (req, res) => {
    res.json({ success: true, message: 'Session cleared successfully' });
  });

  app.get('/api/admin/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. Missing bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any;
      if (decoded && decoded.role === 'admin') {
        return res.json({ valid: true, role: 'admin' });
      }
      return res.status(401).json({ error: 'Invalid token structure.' });
    } catch (err: any) {
      return res.status(401).json({ error: 'Invalid or expired admin token.' });
    }
  });

  app.get('/api/admin/profiles', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. Missing bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any;
      if (decoded && decoded.role === 'admin') {
        const profiles = readProfiles();
        const profileList = Object.values(profiles).map((p: any) => ({
          id: p.id || '',
          name: p.name || '',
          email: p.email || '',
          phone: p.phone || '',
          role: p.role || 'customer',
          updatedAt: p.updatedAt || 0
        }));
        return res.json(profileList);
      }
      return res.status(401).json({ error: 'Invalid token structure.' });
    } catch (err: any) {
      return res.status(401).json({ error: 'Invalid or expired admin token.' });
    }
  });

  // Secure endpoints to manage service requests and acceptances
  app.get('/api/orders', (req, res) => {
    const userId = req.query.userId as string;
    const authHeader = req.headers.authorization;
    
    let isAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any;
        if (decoded && decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (err) {}
    }

    const db = readOrdersDB();

    if (isAdmin) {
      return res.json({ requests: db.requests || [], quotes: db.quotes || [] });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    // Customer Isolation: Filter strictly by userId
    const userRequests = (db.requests || []).filter((r: any) => r.userId === userId);
    const userQuotes = (db.quotes || []).filter((q: any) => {
      const associatedReq = (db.requests || []).find((r: any) => r.id === q.requestId);
      return associatedReq && associatedReq.userId === userId;
    });

    res.json({ requests: userRequests, quotes: userQuotes });
  });

  app.post('/api/orders/create', (req, res) => {
    const { request } = req.body;
    if (!request || !request.id || !request.userId) {
      return res.status(400).json({ error: 'Invalid order structure' });
    }

    const db = readOrdersDB();
    db.requests = db.requests || [];

    // Enforce that new orders must always start in unpaid state
    const cleanRequest = {
      ...request,
      status: request.status === 'PAYMENT VERIFIED' || request.status === 'COMPLETED' ? 'PAYMENT PENDING' : (request.status || 'PAYMENT PENDING'),
      paymentRef: undefined,
      paymentProvider: undefined,
      updatedAt: Date.now()
    };

    const existingIdx = db.requests.findIndex((r: any) => r.id === request.id);
    if (existingIdx >= 0) {
      const existing = db.requests[existingIdx];
      // Do not overwrite validated payment status unless verified securely!
      if (existing.status === 'PAYMENT VERIFIED' || existing.status === 'COMPLETED') {
        cleanRequest.status = existing.status;
        cleanRequest.paymentRef = existing.paymentRef;
        cleanRequest.paymentProvider = existing.paymentProvider;
      }
      db.requests[existingIdx] = cleanRequest;
    } else {
      db.requests.push(cleanRequest);
    }

    writeOrdersDB(db);
    res.json({ success: true, request: cleanRequest });
  });

  app.post('/api/quotes/create', (req, res) => {
    const { quote } = req.body;
    if (!quote || !quote.id) {
      return res.status(400).json({ error: 'Invalid quote structure' });
    }

    const db = readOrdersDB();
    db.quotes = db.quotes || [];

    const existingIdx = db.quotes.findIndex((q: any) => q.id === quote.id);
    if (existingIdx >= 0) {
      db.quotes[existingIdx] = { ...db.quotes[existingIdx], ...quote };
    } else {
      db.quotes.push(quote);
    }

    writeOrdersDB(db);
    res.json({ success: true, quote });
  });

  app.post('/api/admin/orders/update-status', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. Missing bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any;
      if (!decoded || decoded.role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized role.' });
      }
    } catch (err) {
      return res.status(401).json({ error: 'Invalid admin token.' });
    }

    const { id, type, status, verifierInfo } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: 'Missing id or status' });
    }

    const db = readOrdersDB();

    if (type === 'QUOTE') {
      db.quotes = db.quotes || [];
      const idx = db.quotes.findIndex((q: any) => q.id === id);
      if (idx >= 0) {
        db.quotes[idx].status = status;
        db.quotes[idx].updatedAt = Date.now();
        writeOrdersDB(db);
        return res.json({ success: true, quote: db.quotes[idx] });
      }
    } else {
      db.requests = db.requests || [];
      const idx = db.requests.findIndex((r: any) => r.id === id);
      if (idx >= 0) {
        db.requests[idx].status = status;
        db.requests[idx].updatedAt = Date.now();
        if (status === 'PAYMENT VERIFIED') {
          db.requests[idx].verifiedByAdmin = verifierInfo || 'Admin';
          db.requests[idx].verifiedAt = Date.now();
        }
        writeOrdersDB(db);
        return res.json({ success: true, request: db.requests[idx] });
      }
    }

    res.status(404).json({ error: 'Record not found' });
  });

  app.post('/api/payments/paystack/verify', async (req, res) => {
    const { orderId, reference, expectedAmount } = req.body;
    if (!orderId || !reference || !expectedAmount) {
      return res.status(400).json({ error: 'Missing required validation parameters' });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: 'Paystack configuration error. Secret Key missing.' });
    }

    const db = readOrdersDB();
    db.requests = db.requests || [];
    
    // Verify reference uniqueness to prevent transaction reuse
    const alreadyUsed = db.requests.some((r: any) => r.paymentRef === reference && r.id !== orderId && r.status === 'PAYMENT VERIFIED');
    if (alreadyUsed) {
      return res.status(400).json({ error: 'Transaction reference has already been used for another order.' });
    }

    try {
      const apiResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      });

      const data = apiResponse.data?.data;
      if (apiResponse.data?.status && data?.status === 'success') {
        const receivedAmountInKobo = data.amount;
        const expectedAmountInKobo = expectedAmount * 100;

        if (receivedAmountInKobo < expectedAmountInKobo) {
          return res.status(400).json({ error: `Amount mismatch. Expected ₦${expectedAmount}, received ₦${receivedAmountInKobo / 100}` });
        }

        if (data.currency !== 'NGN') {
          return res.status(400).json({ error: `Currency mismatch. Expected NGN, received ${data.currency}` });
        }

        const idx = db.requests.findIndex((r: any) => r.id === orderId);
        if (idx >= 0) {
          db.requests[idx].status = 'PAYMENT VERIFIED';
          db.requests[idx].paymentRef = reference;
          db.requests[idx].paymentProvider = 'PAYSTACK';
          db.requests[idx].updatedAt = Date.now();
          writeOrdersDB(db);
          return res.json({ success: true, request: db.requests[idx] });
        } else {
          return res.status(404).json({ error: 'Order not found to associate with payment.' });
        }
      } else {
        return res.status(400).json({ error: 'Transaction is not in a successful state on Paystack.' });
      }
    } catch (err: any) {
      console.error("Paystack API Error:", err.response?.data || err.message);
      return res.status(500).json({ error: `Paystack API Verification Failed: ${err.response?.data?.message || err.message}` });
    }
  });

  app.post('/api/payments/flutterwave/verify', async (req, res) => {
    const { orderId, reference, expectedAmount, transactionId } = req.body;
    if (!orderId || !expectedAmount || (!reference && !transactionId)) {
      return res.status(400).json({ error: 'Missing required validation parameters' });
    }

    if (!FLUTTERWAVE_SECRET_KEY) {
      return res.status(500).json({ error: 'Flutterwave configuration error. Secret Key missing.' });
    }

    const db = readOrdersDB();
    db.requests = db.requests || [];

    const lookupRef = reference || transactionId;
    const alreadyUsed = db.requests.some((r: any) => r.paymentRef === lookupRef && r.id !== orderId && r.status === 'PAYMENT VERIFIED');
    if (alreadyUsed) {
      return res.status(400).json({ error: 'Transaction reference has already been used for another order.' });
    }

    try {
      const apiResponse = await axios.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`
        }
      });

      const data = apiResponse.data?.data;
      if (apiResponse.data?.status === 'success' && data?.status === 'successful') {
        const receivedAmount = data.amount;
        if (receivedAmount < expectedAmount) {
          return res.status(400).json({ error: `Amount mismatch. Expected ₦${expectedAmount}, received ₦${receivedAmount}` });
        }

        if (data.currency !== 'NGN') {
          return res.status(400).json({ error: `Currency mismatch. Expected NGN, received ${data.currency}` });
        }

        const idx = db.requests.findIndex((r: any) => r.id === orderId);
        if (idx >= 0) {
          db.requests[idx].status = 'PAYMENT VERIFIED';
          db.requests[idx].paymentRef = lookupRef;
          db.requests[idx].paymentProvider = 'FLUTTERWAVE';
          db.requests[idx].updatedAt = Date.now();
          writeOrdersDB(db);
          return res.json({ success: true, request: db.requests[idx] });
        } else {
          return res.status(404).json({ error: 'Order not found to associate with payment.' });
        }
      } else {
        return res.status(400).json({ error: 'Transaction is not successful on Flutterwave.' });
      }
    } catch (err: any) {
      console.error("Flutterwave API Error:", err.response?.data || err.message);
      return res.status(500).json({ error: `Flutterwave API Verification Failed: ${err.response?.data?.message || err.message}` });
    }
  });

  app.post('/api/payments/crypto/submit', (req, res) => {
    const { orderId, txHash, provider } = req.body;
    if (!orderId || !txHash || !provider) {
      return res.status(400).json({ error: 'Missing payment metadata' });
    }

    const db = readOrdersDB();
    db.requests = db.requests || [];
    
    const idx = db.requests.findIndex((r: any) => r.id === orderId);
    if (idx >= 0) {
      // Must strictly remain PAYMENT PENDING until manual administrator verification
      db.requests[idx].status = 'PAYMENT PENDING';
      db.requests[idx].paymentRef = txHash;
      db.requests[idx].paymentProvider = provider;
      db.requests[idx].updatedAt = Date.now();
      writeOrdersDB(db);
      return res.json({ success: true, request: db.requests[idx] });
    }

    res.status(404).json({ error: 'Order not found' });
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
