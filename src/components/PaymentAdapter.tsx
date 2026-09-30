import React, { useState, useEffect } from 'react';
import { isPiBrowser } from '../utils/piDetection';
import { Shield, CreditCard, Wallet, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

interface PaymentAdapterProps {
  item: {
    id: string;
    serviceName: string;
    amount?: number;
    total?: number;
    [key: string]: any;
  };
  currentUser: any;
  onClose: () => void;
  onComplete: (ref: string, provider: string) => void;
  piConfig: any;
}

export function PaymentAdapter({ item, currentUser, onClose, onComplete, piConfig }: PaymentAdapterProps) {
  const [inPiBrowser, setInPiBrowser] = useState(false);
  const [method, setMethod] = useState<'paystack' | 'flutterwave' | 'usdt' | 'usdc' | 'pi'>('paystack');
  const [txHash, setTxHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const price = item.amount || item.total || 0;
  const piAmount = Number((price / 1000).toFixed(2));
  const isSandbox = piConfig?.networkMode === 'TESTNET';

  const cryptoAmounts = {
    usdt: Number((price / 1600).toFixed(2)),
    usdc: Number((price / 1600).toFixed(2))
  };

  // Addresses from environment with standard fallback
  const USDT_BEP20_ADDRESS = import.meta.env.VITE_USDT_BEP20_ADDRESS || "0x7a83d71249b6ef0289f68e9d6b58b3edd0957125";
  const USDC_BASE_ADDRESS = import.meta.env.VITE_USDC_BASE_ADDRESS || "0x7a83d71249b6ef0289f68e9d6b58b3edd0957125";

  useEffect(() => {
    const detected = isPiBrowser();
    setInPiBrowser(detected);
    if (detected) {
      setMethod('pi');
    }
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePiPayment = async () => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      setPaymentError(null);
      setIsVerifying(true);
      try {
        (window as any).Pi.init({ version: "2.0", sandbox: isSandbox });
        (window as any).Pi.createPayment({
          amount: piAmount,
          memo: `GOYE Escrow ${item.id} RC BN3583778`,
          metadata: { dealId: item.id },
          paymentCallbacks: {
            onReadyForServerApproval: async (paymentId: string) => {
              try {
                const res = await fetch('/api/pi/approve', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentId })
                });
                const data = await res.json();
                if (data.status !== 'approved') {
                  throw new Error(data.message || 'Server-side approval failed.');
                }
              } catch (e: any) {
                setPaymentError(e.message || 'Pi Server approval failed.');
                setIsVerifying(false);
              }
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              try {
                const res = await fetch('/api/pi/complete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentId, txid, orderId: item.id })
                });
                const data = await res.json();
                if (data.status === 'success') {
                  setIsVerifying(false);
                  onComplete(txid, isSandbox ? 'PI_TESTNET' : 'PI_MAINNET');
                } else {
                  throw new Error(data.message || 'Server completion verification failed.');
                }
              } catch (e: any) {
                setPaymentError(e.message || 'Server completed verification callback error.');
                setIsVerifying(false);
              }
            },
            onCancel: () => {
              setPaymentError('Payment cancelled by the Pioneer.');
              setIsVerifying(false);
            },
            onError: (error: any) => {
              setPaymentError(error?.message || 'A Pi Blockchain checkout error occurred.');
              setIsVerifying(false);
            }
          }
        });
      } catch (err: any) {
        setPaymentError(err.message || 'Failed to trigger Pi Payment client SDK.');
        setIsVerifying(false);
      }
    } else {
      setPaymentError("Pi SDK is not loaded. Ensure you are running inside the official Pi Browser.");
    }
  };

  const verifyUSDTBEP20 = async () => {
    if (!txHash.trim()) {
      setPaymentError("Please provide your BEP20 transaction hash.");
      return;
    }
    setPaymentError(null);
    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-bep20-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: txHash.trim(), orderId: item.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsVerifying(false);
        onComplete(txHash.trim(), 'USDT_BEP20');
        alert("Transaction Receipt verified successfully on BNB Chain!");
      } else {
        setPaymentError(data.error || "Verification failed. Check the transaction hash on BscScan.");
        setIsVerifying(false);
      }
    } catch (e: any) {
      setPaymentError("Network error verifying transaction.");
      setIsVerifying(false);
    }
  };

  const verifyUSDCBase = async () => {
    if (!txHash.trim()) {
      setPaymentError("Please provide your Base transaction hash.");
      return;
    }
    setPaymentError(null);
    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-base-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: txHash.trim(), orderId: item.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsVerifying(false);
        onComplete(txHash.trim(), 'USDC_BASE');
        alert("Transaction Receipt verified successfully on Base network!");
      } else {
        setPaymentError(data.error || "Verification failed. Check the transaction hash on Basescan.");
        setIsVerifying(false);
      }
    } catch (e: any) {
      setPaymentError("Network error verifying transaction.");
      setIsVerifying(false);
    }
  };

  const handlePaystackPayment = async () => {
    const pubKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!pubKey) {
      setPaymentError("Paystack is not configured. Please use crypto options.");
      return;
    }
    setIsVerifying(true);
    const loaded = await loadScript('https://js.paystack.co/v1/inline.js');
    if (!loaded) {
      setPaymentError("Could not initialize Paystack inline SDK.");
      setIsVerifying(false);
      return;
    }
    try {
      const handler = (window as any).PaystackPop.setup({
        key: pubKey,
        email: currentUser?.email || 'customer@goyeservices.com',
        amount: price * 100,
        currency: 'NGN',
        callback: async (response: any) => {
          setIsVerifying(false);
          onComplete(response.reference, 'PAYSTACK');
        },
        onClose: () => {
          setPaymentError("Paystack checkout was closed.");
          setIsVerifying(false);
        }
      });
      handler.openIframe();
    } catch (err: any) {
      setPaymentError(err.message || "Paystack setup error.");
      setIsVerifying(false);
    }
  };

  const handleFlutterwavePayment = async () => {
    const pubKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
    if (!pubKey) {
      setPaymentError("Flutterwave is not configured. Please use crypto options.");
      return;
    }
    setIsVerifying(true);
    const loaded = await loadScript('https://checkout.flutterwave.com/v3.js');
    if (!loaded) {
      setPaymentError("Could not initialize Flutterwave checkout SDK.");
      setIsVerifying(false);
      return;
    }
    try {
      const flutterwaveHandler = (window as any).FlutterwaveCheckout({
        public_key: pubKey,
        tx_ref: `GOYE-FLW-${Date.now()}`,
        amount: price,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        customer: {
          email: currentUser?.email || 'customer@goyeservices.com',
          phone_number: currentUser?.phone || '08000000000',
          name: currentUser?.name || 'Customer',
        },
        callback: async (response: any) => {
          setIsVerifying(false);
          onComplete(response.tx_ref || response.id, 'FLUTTERWAVE');
        },
        onClose: () => {
          setPaymentError("Flutterwave checkout was closed.");
          setIsVerifying(false);
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || "Flutterwave setup error.");
      setIsVerifying(false);
    }
  };

  // -------------------------------------------------------------
  // PI BROWSER ONLY VIEW
  // -------------------------------------------------------------
  if (inPiBrowser) {
    return (
      <div className="bg-black text-white p-6 rounded-3xl border border-yellow-500/20 max-w-md w-full space-y-6 text-center select-none">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/30 text-[#FFD700]">
            <Shield size={36} />
          </div>
          <h3 className="text-sm font-black tracking-widest text-[#FFD700] uppercase">Pi Portal Payment Secure</h3>
          <p className="text-[10px] uppercase text-gray-500 tracking-wider font-bold">Pi-exclusive transaction — Secured on Pi Network</p>
        </div>

        <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-bold uppercase">Escrow Item</span>
            <span className="text-white font-black uppercase truncate max-w-[200px]">{item.serviceName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-bold uppercase">Value</span>
            <span className="text-[#FFD700] font-mono font-black">{piAmount.toLocaleString()} Pi</span>
          </div>
        </div>

        {paymentError && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-wider">
            {paymentError}
          </div>
        )}

        <button
          onClick={handlePiPayment}
          disabled={isVerifying}
          className="w-full bg-[#FFD700] hover:bg-yellow-400 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> VERIFYING BLOCKCHAIN...
            </>
          ) : (
            `PAY ${piAmount} PI SECURE`
          )}
        </button>

        <p className="text-[9px] text-gray-600 font-bold uppercase">
          🛡️ Funds are securely locked in escrow and released only upon delivery verification.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STANDARD BROWSER (CHROME/SAFARI/EDGE) VIEW
  // -------------------------------------------------------------
  return (
    <div className="bg-black text-white p-6 rounded-3xl border border-yellow-500/10 max-w-md w-full space-y-6 text-center">
      <div className="flex flex-col items-center space-y-2">
        <div className="p-3 bg-yellow-500/5 rounded-full border border-yellow-500/20 text-[#FFD700]">
          <CreditCard size={28} />
        </div>
        <h3 className="text-sm font-black tracking-widest text-[#FFD700] uppercase">Select Payment Channel</h3>
        <p className="text-[9px] uppercase text-gray-500 tracking-wider font-bold">Multiple payment gateways & cryptocurrency options</p>
      </div>

      {/* Payment methods selector */}
      <div className="grid grid-cols-5 gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
        {(['paystack', 'flutterwave', 'usdt', 'usdc', 'pi'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMethod(m);
              setPaymentError(null);
            }}
            className={`py-2 rounded-lg font-black text-[8px] uppercase tracking-wider transition-all cursor-pointer ${
              method === m ? 'bg-[#FFD700] text-black shadow font-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            {m === 'pi' ? 'Pi Network' : m}
          </button>
        ))}
      </div>

      <div className="p-5 bg-neutral-900/60 rounded-2xl border border-neutral-800 text-left space-y-4">
        {method === 'pi' && (
          <div className="space-y-4 text-center">
            <p className="text-[10px] text-yellow-500 font-black uppercase">💡 Pi Browser recommended</p>
            <p className="text-xs text-gray-400 leading-relaxed font-bold">
              Please open this app inside the official **Pi Browser** to pay directly using the native Pi blockchain checkout module.
            </p>
            <button
              onClick={handlePiPayment}
              disabled={isVerifying}
              className="w-full bg-yellow-600/20 hover:bg-yellow-600/30 text-[#FFD700] border border-yellow-500/30 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer"
            >
              TRY PI CHECKOUT ANYWAY
            </button>
          </div>
        )}

        {method === 'paystack' && (
          <div className="space-y-3">
            <p className="text-[10px] text-gray-400 font-black uppercase">⚡ Secure card and bank transfer</p>
            <button
              onClick={handlePaystackPayment}
              disabled={isVerifying}
              className="w-full bg-[#FFD700] hover:bg-yellow-400 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? 'VERIFYING...' : `PAY ₦${price.toLocaleString()} WITH PAYSTACK`}
            </button>
          </div>
        )}

        {method === 'flutterwave' && (
          <div className="space-y-3">
            <p className="text-[10px] text-gray-400 font-black uppercase">💳 Web3 & Local Bank Rails</p>
            <button
              onClick={handleFlutterwavePayment}
              disabled={isVerifying}
              className="w-full bg-[#FFD700] hover:bg-yellow-400 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? 'VERIFYING...' : `PAY ₦${price.toLocaleString()} WITH FLUTTERWAVE`}
            </button>
          </div>
        )}

        {method === 'usdt' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-gray-400">USDT RECEIVER (BSC BEP20)</span>
              <span className="text-[10px] font-mono text-[#FFD700] font-black">{cryptoAmounts.usdt} USDT</span>
            </div>
            
            <div className="flex flex-col items-center space-y-3 p-3 bg-black rounded-xl border border-neutral-800">
              {/* Fallback mock QR code representation */}
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${USDT_BEP20_ADDRESS}`} alt="USDT BEP20 Address QR" className="w-28 h-28" />
              </div>
              <div className="flex items-center justify-between w-full p-2 bg-neutral-900 rounded border border-neutral-800 text-[10px] font-mono text-gray-300">
                <span className="truncate max-w-[240px]">{USDT_BEP20_ADDRESS}</span>
                <button onClick={() => handleCopy(USDT_BEP20_ADDRESS)} className="p-1 hover:text-white transition-all">
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-400">
              <span>BSC CHAIN ID: 56</span>
              <a href={`https://bscscan.com/address/${USDT_BEP20_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline flex items-center gap-1">
                VIEW ON BSCSCAN <ExternalLink size={10} />
              </a>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Enter transaction hash (Tx Hash)</label>
              <input
                type="text"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-[#FFD700] text-xs uppercase"
              />
            </div>

            <button
              onClick={verifyUSDTBEP20}
              disabled={isVerifying}
              className="w-full bg-[#FFD700] hover:bg-yellow-400 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? 'VERIFYING TRANSACTION...' : 'VERIFY BLOCKCHAIN RECEIPT'}
            </button>
          </div>
        )}

        {method === 'usdc' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-gray-400">USDC RECEIVER (BASE MAINNET)</span>
              <span className="text-[10px] font-mono text-[#FFD700] font-black">{cryptoAmounts.usdc} USDC</span>
            </div>

            <div className="flex flex-col items-center space-y-3 p-3 bg-black rounded-xl border border-neutral-800">
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${USDC_BASE_ADDRESS}`} alt="USDC BASE Address QR" className="w-28 h-28" />
              </div>
              <div className="flex items-center justify-between w-full p-2 bg-neutral-900 rounded border border-neutral-800 text-[10px] font-mono text-gray-300">
                <span className="truncate max-w-[240px]">{USDC_BASE_ADDRESS}</span>
                <button onClick={() => handleCopy(USDC_BASE_ADDRESS)} className="p-1 hover:text-white transition-all">
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-400">
              <span>BASE CHAIN ID: 8453</span>
              <a href={`https://basescan.org/address/${USDC_BASE_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline flex items-center gap-1">
                VIEW ON BASESCAN <ExternalLink size={10} />
              </a>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Enter transaction hash (Tx Hash)</label>
              <input
                type="text"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-[#FFD700] text-xs uppercase"
              />
            </div>

            <button
              onClick={verifyUSDCBase}
              disabled={isVerifying}
              className="w-full bg-[#FFD700] hover:bg-yellow-400 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? 'VERIFYING TRANSACTION...' : 'VERIFY BLOCKCHAIN RECEIPT'}
            </button>
          </div>
        )}
      </div>

      {paymentError && (
        <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-wider text-center">
          {paymentError}
        </div>
      )}

      <p className="text-[8px] text-gray-600 font-bold uppercase leading-relaxed">
        🔐 All payments run on top-tier secure rails. Escrow remains held until project delivery is authoritatively verified.
      </p>
    </div>
  );
}
