import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';
import { TicketItem } from '../types/index.js';
import { BoardingPass } from '../components/BoardingPass.js';

export const TicketViewPage: React.FC = () => {
  const { ticketCode } = useParams<{ ticketCode: string }>();
  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketCode) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getTicketByCode(ticketCode);
        setTicket(data.ticket);
      } catch (err: any) {
        setError(err.message || 'Ticket no encontrado');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [ticketCode]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <RefreshCw className="w-10 h-10 text-allstar-gold animate-spin mb-4" />
        <h2 className="text-xl font-bold font-luxury text-white">Cargando Pase de Abordaje...</h2>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold font-luxury text-white mb-2">Pase No Encontrado</h2>
        <p className="text-slate-400 text-sm mb-6">
          El código <span className="font-mono text-allstar-gold">{ticketCode}</span> no corresponde a un ticket activo.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-allstar-gold text-black font-bold text-sm shadow-gold"
        >
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-allstar-gold/15 border border-allstar-gold/30 text-allstar-gold text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Acceso Confirmado</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white">
          Pase de Abordaje Digital
        </h1>
        <p className="text-xs text-slate-400">
          Presenta este código en la puerta de acceso para validar tu ingreso.
        </p>
      </div>

      <BoardingPass ticket={ticket} showActions={true} />
    </div>
  );
};
