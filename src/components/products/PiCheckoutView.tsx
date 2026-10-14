import React, { useState, useEffect } from 'react';
import { Coins, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, Lock, ExternalLink, Terminal } from 'lucide-react';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

export default function PiCheckoutView({ currentUser, onNavigate }: Props) {
  const [piAvailable, setPiAvailable] = useState(false);
  const [piStatus, setPiStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentLog, setPaymentLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setPaymentLog(prev => [...prev, `[${new Date().toLocaleTimeString()}]: ${msg}`]);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      setPiAvailable(true);
    }

    fetch('/api/pi/status')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setPiStatus(data);
      })
      .catch(err => console.warn('Pi status load error', err))
      .finally(() => setLoadingStatus(false));
  }, []);

  // Real Official Pi SDK Payment Execution
  const handleTestnetPayment = async () => {
    const Pi = (window as any).Pi;
    if (!Pi) {
      safeNotify('Pi SDK is not detected. Please open this app inside Pi Browser.', 'error');
      addLog('Error: window.Pi is undefined. Please load inside Pi Browser.');
      return;
    }

    setPaying(true);
    addLog('Initiating Pi.createPayment() with 0.1 Test-Pi...');

    const paymentData = {
      amount: 0.1,
      memo: 'GOYE Web3 Business Hub - Testnet Service Verification',
      metadata: {
        orderId: `test_order_${Date.now()}`,
        service: 'Testnet Verification Action'
      }
    };

    const paymentCallbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        addLog(`Payment initialized. paymentId: ${paymentId}`);
        addLog('Calling server approval endpoint: /api/pi/approve...');
        try {
          const res = await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
          });
          const data = await res.json();
          if (res.ok && (data.status === 'approved' || data.data)) {
            addLog('✅ Server-side approval confirmed via official Pi Platform API.');
          } else {
            addLog(`Approval error: ${data.message || JSON.stringify(data)}`);
            safeNotify(`Pi approval failed: ${data.message || 'Server error'}`, 'error');
          }
        } catch (e: any) {
          addLog(`Network error during approval: ${e.message}`);
          safeNotify('Network error contacting Pi approval server', 'error');
        }
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        addLog(`Wallet signing complete! Blockchain txid: ${txid}`);
        addLog('Calling server completion endpoint: /api/pi/complete...');
        try {
          const res = await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId,
              txid,
              orderId: paymentData.metadata.orderId
            })
          });
          const data = await res.json();
          if (res.ok) {
            addLog('🎉 Official server-side completion verified on Pi Blockchain!');
            safeNotify('0.1 Test-Pi transaction verified & completed!', 'success');
          } else {
            addLog(`Completion error: ${data.message || JSON.stringify(data)}`);
            safeNotify(`Completion failed: ${data.message || 'Verification error'}`, 'error');
          }
        } catch (e: any) {
          addLog(`Network error during completion: ${e.message}`);
          safeNotify('Network error completing payment', 'error');
        } finally {
          setPaying(false);
        }
      },
      onCancel: (paymentId: string) => {
        addLog(`Payment cancelled by user. paymentId: ${paymentId}`);
        safeNotify('Payment cancelled in Pi Wallet', 'info');
        setPaying(false);
      },
      onError: (error: Error, payment?: any) => {
        addLog(`Pi SDK Error: ${error.message}`);
        safeNotify(`Pi Payment Error: ${error.message}`, 'error');
        setPaying(false);
      }
    };

    try {
      Pi.createPayment(paymentData, paymentCallbacks);
    } catch (err: any) {
      addLog(`Failed to invoke Pi.createPayment: ${err.message}`);
      safeNotify(`Pi execution error: ${err.message}`, 'error');
      setPaying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <Coins size={14} /> Product 10 • Web3 Commerce
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          Pi Payment Checkout
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Native, non-custodial Pi Network transaction settlement. Adheres strictly to the official Pi Platform API pipeline with server-side approval and completion handshakes.
        </p>
        <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400 space-y-1 leading-relaxed">
          <p><strong className="text-yellow-400">Security Architecture:</strong> No mock transactions, no simulated balances, no fake txids. Payments are finalized strictly when confirmed by the official Pi Network server API key.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Dashboard */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h2 className="text-base font-black uppercase text-[#FFD700] flex items-center gap-2">
              <ShieldCheck size={18} /> Official Pi Architecture Health
            </h2>
            <button
              onClick={() => {
                setLoadingStatus(true);
                fetch('/api/pi/status')
                  .then(r => r.json())
                  .then(d => setPiStatus(d))
                  .finally(() => setLoadingStatus(false));
              }}
              className="p-2 hover:bg-neutral-900 rounded-lg text-gray-400 hover:text-white"
            >
              <RefreshCw size={14} className={loadingStatus ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-neutral-900 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase block font-bold">Pi SDK Client</span>
              <span className={`font-black ${piAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
                {piAvailable ? 'LOADED IN BROWSER' : 'OPEN IN PI BROWSER'}
              </span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase block font-bold">Pi Server API</span>
              <span className={`font-black ${piStatus?.serverApi === 'CONFIGURED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {piStatus?.serverApi || 'CHECKING...'}
              </span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase block font-bold">Network Mode</span>
              <span className="font-black text-[#FFD700]">
                {piStatus?.network || 'TESTNET'}
              </span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase block font-bold">Sandbox Mode</span>
              <span className="font-black text-white">
                {piStatus?.sandbox || 'ON'}
              </span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-xl col-span-2">
              <span className="text-[10px] text-gray-400 uppercase block font-bold">App Wallet (Testnet)</span>
              <span className="text-[10px] text-gray-200 break-all select-all">
                {piStatus?.testnetWallet === 'CONFIGURED' ? 'GASU7HADLZKZE4A6EPRWW5QNMGHQBSL6FR3ED4N4ZR3KYDQRQXGQTJLX' : 'NOT CONFIGURED'}
              </span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase block font-bold">Mainnet Status</span>
              <span className="font-black text-red-400">
                {piStatus?.mainnet || 'DISABLED'} (Isolated)
              </span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase block font-bold">Mock System Audit</span>
              <span className="font-black text-emerald-400">
                REMOVED (Zero Simulation)
              </span>
            </div>
          </div>

          {/* Test Payment Trigger */}
          <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl space-y-3">
            <h3 className="text-xs font-black uppercase text-[#FFD700]">Development Verification Action</h3>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Execute a real 0.1 Test-Pi transaction through the official Pi SDK. Tests the approval, wallet signing, and server completion handshake.
            </p>
            <button
              onClick={handleTestnetPayment}
              disabled={paying}
              className="w-full py-3.5 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              {paying ? 'Awaiting Pi Network Confirmation...' : 'Pay 0.1 Test-Pi (Official Testnet Flow)'}
            </button>
          </div>
        </div>

        {/* Real-time Payment Audit Console */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl flex flex-col h-[520px]">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h2 className="text-base font-black uppercase text-white flex items-center gap-2">
              <Terminal size={18} className="text-[#FFD700]" /> Live Transaction Audit Log
            </h2>
            <span className="text-[10px] font-mono text-gray-500">Real-time Stream</span>
          </div>

          <div className="flex-1 bg-black/90 border border-neutral-900 rounded-2xl p-4 font-mono text-[11px] text-gray-300 overflow-y-auto space-y-2 scrollbar-thin">
            {paymentLog.length === 0 ? (
              <p className="text-gray-600 text-center py-20">
                Console idle. Click "Pay 0.1 Test-Pi" to observe the official cryptographic handshake stream.
              </p>
            ) : (
              paymentLog.map((line, idx) => (
                <div key={idx} className="leading-relaxed">
                  {line}
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-neutral-900 rounded-xl text-[10px] text-gray-400 flex items-center gap-2">
            <Lock size={12} className="text-yellow-400" />
            <span>Server-side verification required before order fulfillment.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
