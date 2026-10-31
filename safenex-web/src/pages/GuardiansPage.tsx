import React, { useState } from 'react';
import { Users, Phone, MessageSquare, Star, Trash2, UserPlus, HeartHandshake } from 'lucide-react';
import { Guardian } from '../types';

interface GuardiansPageProps {
  guardians: Guardian[];
  onSetPrimary: (id: string) => void;
  onDeleteGuardian: (id: string) => void;
  onAddGuardian: (guardian: Guardian) => void;
  onNotify: (title: string, message?: string, type?: any) => void;
}

export const GuardiansPage: React.FC<GuardiansPageProps> = ({
  guardians,
  onSetPrimary,
  onDeleteGuardian,
  onAddGuardian,
  onNotify,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newG: Guardian = {
      id: crypto.randomUUID(),
      name: name.trim(),
      relation: relation.trim() || 'Emergency Contact',
      phone: phone.trim(),
      email: email.trim() || undefined,
      isPrimary: guardians.length === 0,
    };

    onAddGuardian(newG);
    setName('');
    setRelation('');
    setPhone('');
    setEmail('');
    setShowAddForm(false);
    onNotify('Guardian Added', `${newG.name} registered to your emergency network.`, 'success');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-[#24434A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#00E6A0]/15 text-[#00E6A0]">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#00E6A0] uppercase tracking-wider">
              TRUSTED SAFETY NETWORK
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#F4FAFA]">Emergency Guardians</h2>
          <p className="text-xs text-[#A2B5BF] mt-1">
            Real emergency contacts notified via direct calls, WhatsApp dispatch, and live satellite tracking.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="py-2.5 px-4 rounded-2xl btn-emerald-gradient text-xs font-bold flex items-center gap-2 shadow-emerald-glow cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Guardian</span>
        </button>
      </div>

      {/* Add Guardian Form Card */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel rounded-3xl p-6 border border-[#00E6A0]/40 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#F4FAFA]">Register Emergency Contact</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#A2B5BF] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A2B5BF] mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B151D] border border-[#24434A] text-xs text-[#F4FAFA] focus:outline-none focus:border-[#00E6A0]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A2B5BF] mb-1">Relationship</label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g. Spouse / Sister / Friend"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B151D] border border-[#24434A] text-xs text-[#F4FAFA] focus:outline-none focus:border-[#00E6A0]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A2B5BF] mb-1">Phone Number (with Country Code) *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B151D] border border-[#24434A] text-xs text-[#F4FAFA] focus:outline-none focus:border-[#00E6A0]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A2B5BF] mb-1">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guardian@email.com"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B151D] border border-[#24434A] text-xs text-[#F4FAFA] focus:outline-none focus:border-[#00E6A0]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl btn-emerald-gradient text-xs font-bold cursor-pointer"
            >
              Save to Guardian Network
            </button>
          </div>
        </form>
      )}

      {/* Guardians List or Honest Empty State */}
      {guardians.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 border border-[#24434A] flex flex-col items-center text-center">
          <div className="p-4 rounded-3xl bg-[#142B35] border border-[#24434A] text-[#00E6A0] mb-4">
            <HeartHandshake className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-[#F4FAFA]">No Emergency Guardians Configured</h3>
          <p className="text-xs text-[#A2B5BF] max-w-md mt-1 mb-6 leading-relaxed">
            Your emergency network is currently empty. Add trusted family members or friends who should be immediately contacted when SOS is triggered.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="py-3 px-6 rounded-2xl btn-emerald-gradient text-xs font-bold flex items-center gap-2 shadow-emerald-glow cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Your First Emergency Contact</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {guardians.map((g) => {
            const cleanPhone = g.phone.replace(/[^0-9]/g, '');
            const waLink = `https://wa.me/${cleanPhone}`;

            return (
              <div
                key={g.id}
                className={`glass-panel rounded-3xl p-6 border transition flex flex-col justify-between ${
                  g.isPrimary
                    ? 'border-[#00E6A0]/50 shadow-emerald-glow'
                    : 'border-[#24434A]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#35DDF2]">{g.relation}</span>
                    {g.isPrimary ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00E6A0]/15 text-[#00E6A0] border border-[#00E6A0]/30 text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#00E6A0]" />
                        PRIMARY GUARDIAN
                      </span>
                    ) : (
                      <button
                        onClick={() => onSetPrimary(g.id)}
                        className="text-[11px] text-[#A2B5BF] hover:text-[#00E6A0] transition flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3 h-3" />
                        Set as Primary
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#F4FAFA]">{g.name}</h3>
                  <p className="text-xs font-mono text-[#A2B5BF] mt-0.5">{g.phone}</p>
                  {g.email && <p className="text-[11px] text-[#708792] mt-0.5">{g.email}</p>}
                </div>

                <div className="mt-5 pt-4 border-t border-[#24434A] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${g.phone.replace(/[^0-9+]/g, '')}`}
                      className="p-2.5 rounded-xl bg-[#142B35] hover:bg-[#1A3644] text-[#00E6A0] border border-[#24434A] transition"
                      title="Call Guardian"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-[#142B35] hover:bg-[#1A3644] text-[#25D366] border border-[#24434A] transition"
                      title="Message on WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>

                  <button
                    onClick={() => onDeleteGuardian(g.id)}
                    className="p-2.5 rounded-xl bg-[#142B35] hover:bg-[#FF304F]/20 text-[#708792] hover:text-[#FF304F] border border-[#24434A] transition cursor-pointer"
                    title="Remove Guardian"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
