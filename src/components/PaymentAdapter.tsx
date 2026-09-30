import React, { useState, useEffect } from 'react';
import { isPiBrowser } from '../utils/piDetection';
import { Shield, CreditCard, Wallet, Copy, Check, ExternalLink, RefreshCw, CheckCircle, Smartphone } from 'lucide-react';

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
  const [method, setMethod] = useState<'paystack' | 'flutterwave' | 'busha_usdt' | 'busha_usdc' | 'pi'>('paystack');
  const [txHash, setTxHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bushaStatus, setBushaStatus] = useState<'IDLE' | 'PENDING' | 'VERIFIED'>('IDLE');

  const price = item.amount || item.total || 0;
  const piAmount = Number((price / 1000).toFixed(2));
  const isSandbox = piConfig?.networkMode === 'TESTNET';

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
          memo: `GOYE-HUB Escrow ${item.id} RC BN3583778`,
          metadata: { dealId: item.id, platform: 'goye-hub' },
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

  const handleBushaVerification = async (asset: 'USDT_BEP20' | 'USDC_BASE') => {
    if (!txHash.trim()) {
      setPaymentError("Please paste the transaction hash or transaction ID for verification.");
      return;
    }
    setPaymentError(null);
    setIsVerifying(true);
    setBushaStatus('PENDING');

    try {
      const res = await fetch('/api/verify-busha-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: txHash.trim(),
          asset,
          dealId: item.id
        })
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setBushaStatus('VERIFIED');
        setIsVerifying(false);
        onComplete(txHash.trim(), `BUSHA_${asset}`);
        alert(`Busha payment verified successfully on-chain! Status updated.`);
      } else {
        setBushaStatus('IDLE');
        setPaymentError(data.error || 'Transaction verification failed on blockchain. Please double check Tx Hash.');
        setIsVerifying(false);
      }
    } catch (e: any) {
      setBushaStatus('IDLE');
      setPaymentError('Network failure checking Busha transaction.');
      setIsVerifying(false);
    }
  };

  const handlePaystackPayment = async () => {
    const pubKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!pubKey) {
      setPaymentError("Paystack is not configured. Please use Busha crypto options.");
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
      setPaymentError("Flutterwave is not configured. Please use Busha crypto options.");
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
      <div className="bg-[#0A1931] text-white p-7 rounded-3xl border border-[#D4AF37]/30 max-w-md w-full space-y-6 text-center select-none shadow-2xl">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/30 text-[#D4AF37]">
            <Shield size={38} className="animate-pulse" />
          </div>
          <h3 className="text-base font-black tracking-widest text-[#D4AF37] uppercase">Pi Portal Active</h3>
          <p className="text-[10px] uppercase text-[#D4AF37]/80 tracking-widest font-extrabold">
            RC BN3583778 TRUSTED ESCROW
          </p>
        </div>

        <div className="p-5 bg-[#15305B] rounded-2xl border border-white/10 text-left space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 font-bold uppercase">Contract Reference</span>
            <span className="text-white font-black truncate max-w-[180px]">{item.serviceName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 font-bold uppercase">Escrow Release Value</span>
            <span className="text-[#D4AF37] font-mono font-black text-sm">{piAmount.toLocaleString()} Pi</span>
          </div>
        </div>

        {paymentError && (
          <div className="p-3 bg-red-950/50 border border-red-500/20 rounded-xl text-red-300 text-[10px] font-black uppercase tracking-wider">
            {paymentError}
          </div>
        )}

        <button
          onClick={handlePiPayment}
          disabled={isVerifying}
          className="w-full bg-[#D4AF37] hover:bg-yellow-500 text-[#0A1931] py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> PROVISIONING CORES...
            </>
          ) : (
            `PAY ${piAmount} PI SECURE`
          )}
        </button>

        <div className="pt-2">
          <span className="text-[9px] text-[#D4AF37] bg-[#15305B] px-3 py-1.5 rounded-full border border-[#D4AF37]/20 font-black tracking-widest uppercase">
            Pi-exclusive transaction — Secured on Pi Network — RC BN3583778
          </span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STANDARD BROWSER VIEW (Navy, Gold, White Cards, Pi purple accents)
  // -------------------------------------------------------------
  return (
    <div className="bg-[#0A1931] text-white p-6 rounded-3xl border border-[#D4AF37]/20 max-w-md w-full space-y-6 text-center shadow-2xl select-none">
      <div className="flex flex-col items-center space-y-2">
        <div className="p-3.5 bg-white/5 rounded-full border border-[#D4AF37]/20 text-[#D4AF37]">
          <Smartphone size={28} />
        </div>
        <h3 className="text-sm font-black tracking-widest text-[#D4AF37] uppercase">Corporate Check-out</h3>
        <span className="text-[9px] uppercase tracking-wider text-white bg-purple-600/20 px-2.5 py-1 rounded-full border border-purple-500/30 font-bold">
          Pi purple Escrow Verified ➔ RC BN3583778
        </span>
      </div>

      {/* Gateway selector tabs */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-[#15305B] rounded-xl border border-white/5">
        {(['paystack', 'flutterwave', 'busha_usdt', 'busha_usdc', 'pi'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMethod(m);
              setPaymentError(null);
              setBushaStatus('IDLE');
            }}
            className={`py-2 rounded-lg font-black text-[7.5px] uppercase tracking-tight transition-all cursor-pointer ${
              method === m 
                ? 'bg-[#D4AF37] text-[#0A1931] shadow-md font-black' 
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {m === 'busha_usdt' ? 'Busha USDT' : m === 'busha_usdc' ? 'Busha USDC' : m === 'pi' ? 'Pi Network' : m}
          </button>
        ))}
      </div>

      {/* White Content Card (Design instructions: white cards) */}
      <div className="p-5 bg-white text-slate-900 rounded-2xl text-left space-y-4 shadow-xl border border-gray-100">
        <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
          <span className="text-[9px] font-black uppercase text-gray-400">Total Price</span>
          <span className="text-base font-black text-[#0A1931]">₦{price.toLocaleString()}</span>
        </div>

        {method === 'pi' && (
          <div className="space-y-4 text-center">
            <p className="text-[10px] text-purple-700 font-extrabold uppercase tracking-wider">💜 PI PORTAL ROUTING ACTIVE</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-wider text-center">
              Please open this hub inside the official **Pi Browser** to pay directly using the native Pi blockchain checkout module.
            </p>
            <button
              onClick={handlePiPayment}
              disabled={isVerifying}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer shadow-md"
            >
              RUN PI OVERLAY ANYWAY
            </button>
          </div>
        )}

        {method === 'paystack' && (
          <div className="space-y-3">
            <p className="text-[9px] text-gray-400 font-black uppercase">💳 Card or Transfer via Paystack</p>
            <button
              onClick={handlePaystackPayment}
              disabled={isVerifying}
              className="w-full bg-[#0A1931] hover:bg-[#15305B] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? 'LOADING PAYSTACK...' : 'INITIATE PAYSTACK PAYMENT'}
            </button>
          </div>
        )}

        {method === 'flutterwave' && (
          <div className="space-y-3">
            <p className="text-[9px] text-gray-400 font-black uppercase">🛡️ Escrow Channel via Flutterwave</p>
            <button
              onClick={handleFlutterwavePayment}
              disabled={isVerifying}
              className="w-full bg-[#0A1931] hover:bg-[#15305B] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? 'LOADING FLUTTERWAVE...' : 'INITIATE FLUTTERWAVE PAYMENT'}
            </button>
          </div>
        )}

        {method === 'busha_usdt' && (
          <div className="space-y-4 text-slate-700 text-xs leading-relaxed font-semibold">
            <div className="bg-[#0A1931]/5 p-3 rounded-xl border border-[#0A1931]/10 text-[#0A1931] text-[10px] font-black uppercase tracking-wider text-center">
              💸 Pay with USDT BEP20 via Busha
            </div>
            
            <div className="space-y-2 text-[10px] uppercase text-slate-500 font-extrabold tracking-wider">
              <p>1. Open your corporate Busha app on your smartphone</p>
              <p>2. Tap the **Receive** button inside the asset card</p>
              <p>3. Select **USDT** and choose the **BEP20 (BSC)** network option</p>
              <p>4. Send exact corresponding amount to your wallet address</p>
              <p>5. Paste the Busha Transaction Hash or ID here for audit</p>
            </div>

            <div className="pt-2 space-y-1.5 text-left">
              <label className="text-[9px] uppercase tracking-wider text-[#0A1931] font-black">Transaction Hash / TxID</label>
              <input
                type="text"
                placeholder="Paste Busha blockchain TxID here"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-[#D4AF37] uppercase font-bold"
              />
            </div>

            <div className="flex justify-between items-center text-[9px] font-black uppercase pt-1">
              <span>Busha Status:</span>
              <span className={`px-2 py-0.5 rounded ${bushaStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                {bushaStatus} VIA BUSHA
              </span>
            </div>

            <button
              onClick={() => handleBushaVerification('USDT_BEP20')}
              disabled={isVerifying}
              className="w-full bg-[#0A1931] hover:bg-[#15305B] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? 'VERIFYING TRANSACT...' : 'VERIFY BUSHA TRANSACTION'}
            </button>
          </div>
        )}

        {method === 'busha_usdc' && (
          <div className="space-y-4 text-slate-700 text-xs leading-relaxed font-semibold">
            <div className="bg-[#0A1931]/5 p-3 rounded-xl border border-[#0A1931]/10 text-[#0A1931] text-[10px] font-black uppercase tracking-wider text-center">
              💸 Pay with USDC Base via Busha
            </div>

            <div className="space-y-2 text-[10px] uppercase text-slate-500 font-extrabold tracking-wider">
              <p>1. Open your Busha app on your phone</p>
              <p>2. Choose **Receive** ➔ select **USDC**</p>
              <p>3. Choose **Base Network** for lowest fees</p>
              <p>4. Complete the transfer inside your Busha profile</p>
              <p>5. Copy and paste the Transaction Receipt Hash below</p>
            </div>

            <div className="pt-2 space-y-1.5 text-left">
              <label className="text-[9px] uppercase tracking-wider text-[#0A1931] font-black">Transaction Hash / TxID</label>
              <input
                type="text"
                placeholder="Paste Busha blockchain TxID here"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-[#D4AF37] uppercase font-bold"
              />
            </div>

            <div className="flex justify-between items-center text-[9px] font-black uppercase pt-1">
              <span>Busha Status:</span>
              <span className={`px-2 py-0.5 rounded ${bushaStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                {bushaStatus} VIA BUSHA
              </span>
            </div>

            <button
              onClick={() => handleBushaVerification('USDC_BASE')}
              disabled={isVerifying}
              className="w-full bg-[#0A1931] hover:bg-[#15305B] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? 'VERIFYING TRANSACT...' : 'VERIFY BUSHA TRANSACTION'}
            </button>
          </div>
        )}
      </div>

      {paymentError && (
        <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-red-300 text-[9px] font-black uppercase tracking-wider">
          {paymentError}
        </div>
      )}

      <p className="text-[8px] text-gray-400 font-bold uppercase leading-relaxed">
        🛡️ Escrow funds held securely inside GOYE HUB and released strictly upon delivery confirmation. RC BN3583778.
      </p>
    </div>
  );
}
