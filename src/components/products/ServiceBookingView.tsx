import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, User, AlertCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { ServiceBooking, BookingStatus } from '../../types/products';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:30 AM - 11:30 AM',
  '01:00 PM - 02:00 PM',
  '02:30 PM - 03:30 PM',
  '04:00 PM - 05:00 PM'
];

export default function ServiceBookingView({ currentUser, onNavigate }: Props) {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [serviceTitle, setServiceTitle] = useState('CAC Business Setup Consultation');
  const [providerName, setProviderName] = useState('GOYE Operations Desk');
  const [clientName, setClientName] = useState(currentUser?.name || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Error fetching bookings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !bookingDate || !timeSlot) {
      safeNotify('Please fill in client details, date, and time slot', 'error');
      return;
    }

    // Double Booking Prevention Check
    const doubleBooked = bookings.some(
      b => b.bookingDate === bookingDate && b.timeSlot === timeSlot && b.status !== 'CANCELLED'
    );
    if (doubleBooked) {
      safeNotify('This time slot is already reserved for the selected date. Please choose another slot.', 'error');
      return;
    }

    setSubmitting(true);
    const bookingNumber = `GOYE-BKG-${Date.now().toString().slice(-6)}`;
    const id = `bkg_${Date.now()}`;

    const newBooking: ServiceBooking = {
      id,
      bookingNumber,
      userId: currentUser?.id || 'guest',
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      providerId: 'prov_goye_ops',
      providerName,
      serviceTitle,
      bookingDate,
      timeSlot,
      notes: notes.trim(),
      status: 'CONFIRMED',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
      if (res.ok) {
        setBookings(prev => [newBooking, ...prev]);
        safeNotify(`Appointment reserved! Booking Ref: ${bookingNumber}`, 'success');
        setShowForm(false);
        setNotes('');
      } else {
        safeNotify('Failed to book appointment', 'error');
      }
    } catch (err: any) {
      safeNotify(err.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    const existing = bookings.find(b => b.id === id);
    if (!existing) return;
    const updated = { ...existing, status, updatedAt: Date.now() };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? updated : b));
        safeNotify(`Booking status updated to ${status}`, 'success');
      }
    } catch (e) {
      safeNotify('Error updating status', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <Calendar size={14} /> Product 12 • Commerce & Service Scheduling
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          Service Booking & Scheduling
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Real appointment reservation system equipped with double-booking collision prevention, slot management, and client lifecycle confirmation.
        </p>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-black uppercase text-white">
            Reserved Appointments ({bookings.length})
          </h2>
          <p className="text-[11px] text-gray-400 font-mono">Statuses: REQUESTED • CONFIRMED • IN_PROGRESS • COMPLETED • CANCELLED</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus size={16} /> Schedule Appointment
        </button>
      </div>

      {/* Booking Form */}
      {showForm && (
        <form onSubmit={handleCreateBooking} className="bg-neutral-950 border border-yellow-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="text-lg font-black uppercase text-[#FFD700] flex items-center gap-2">
              <Calendar size={20} /> Reserve Appointment Session
            </h3>
            <span className="text-xs font-mono text-gray-400">Conflict Guard Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold uppercase tracking-wider">
            <div>
              <label className="block text-gray-400 mb-1">Service / Session Scope *</label>
              <select
                value={serviceTitle}
                onChange={e => setServiceTitle(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              >
                <option value="CAC Business Setup Consultation">CAC Business Setup Consultation</option>
                <option value="Website & App Architecture Review">Website & App Architecture Review</option>
                <option value="AI WhatsApp Bot Strategy Discovery">AI WhatsApp Bot Strategy Discovery</option>
                <option value="Trade Assurance Onboarding">Trade Assurance Onboarding</option>
                <option value="General Corporate Advisory">General Corporate Advisory</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Assigned Specialist / Department</label>
              <input
                type="text"
                value={providerName}
                onChange={e => setProviderName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Client Full Name *</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Client Contact Email *</label>
              <input
                type="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Reservation Date *</label>
              <input
                type="date"
                value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Available Time Slot *</label>
              <select
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              >
                {TIME_SLOTS.map(s => {
                  const isTaken = bookings.some(b => b.bookingDate === bookingDate && b.timeSlot === s && b.status !== 'CANCELLED');
                  return (
                    <option key={s} value={s} disabled={isTaken}>
                      {s} {isTaken ? '(RESERVED - UNAVAILABLE)' : '(AVAILABLE)'}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 mb-1">Client Objectives & Background Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Key goals or questions for the session..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 bg-neutral-900 text-gray-400 rounded-xl uppercase font-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black rounded-xl uppercase font-black shadow-lg cursor-pointer"
            >
              {submitting ? 'Locking Reservation...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      )}

      {/* Bookings Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-8">Loading schedule records...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-xs">
            No active appointments scheduled. Click "Schedule Appointment" to book your session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Date & Slot</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-gray-300 font-medium">
                {bookings.map(bkg => (
                  <tr key={bkg.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-4 font-mono font-black text-[#FFD700]">{bkg.bookingNumber}</td>
                    <td className="p-4 font-bold text-white">{bkg.serviceTitle}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-200">{bkg.bookingDate}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{bkg.timeSlot}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white">{bkg.clientName}</p>
                      <p className="text-[10px] text-gray-500">{bkg.clientEmail}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        bkg.status === 'CONFIRMED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        bkg.status === 'COMPLETED' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                        bkg.status === 'CANCELLED' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      }`}>
                        {bkg.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={bkg.status}
                        onChange={e => handleUpdateStatus(bkg.id, e.target.value as BookingStatus)}
                        className="bg-neutral-900 border border-neutral-700 text-white text-[10px] font-bold rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="REQUESTED">REQUESTED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="NO_SHOW">NO_SHOW</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
