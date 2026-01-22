
import React, { useState } from 'react';
import { Proposal, ProposalStatus } from '../types';

interface KanbanProps {
  role: 'Admin' | 'User';
  proposals: Proposal[];
  setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
  addLog: (proposalId: string, action: string, details: string) => void;
}

const Kanban: React.FC<KanbanProps> = ({ role, proposals, setProposals, addLog }) => {
  const [pendingStatusChange, setPendingStatusChange] = useState<{ id: string; status: ProposalStatus } | null>(null);

  const columns: ProposalStatus[] = [
    'Pendente', 
    'Elaborando', 
    'Pausada', 
    'Enviada', 
    'Revisão',
    'Negociação',
    'Fechado',
    'Perdido por Prazo',
    'Perdido por Preço',
    'Cancelada pelo Cliente'
  ];

  const formatDisplayDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('proposalId', id);
  };

  const executeStatusChange = (id: string, newStatus: ProposalStatus, checklistResult?: string) => {
    const proposal = proposals.find(p => p.id === id);
    if (proposal) {
      setProposals(prev => prev.map(p => p.id === id ? { 
        ...p, 
        status: newStatus, 
        updated_at: new Date().toISOString(),
        manager_checklist: checklistResult ? (checklistResult as 'Sim' | 'Não') : p.manager_checklist
      } : p));
      const logDetails = `Status alterado via Kanban: ${proposal.status} → ${newStatus}${checklistResult ? ` | Checklist do Gerente: ${checklistResult}` : ''}`;
      addLog(id, 'Atualização', logDetails);
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: ProposalStatus) => {
    const id = e.dataTransfer.getData('proposalId');
    const proposal = proposals.find(p => p.id === id);
    
    if (proposal && proposal.status !== newStatus) {
      if (newStatus === 'Enviada') {
        setPendingStatusChange({ id, status: newStatus });
      } else {
        executeStatusChange(id, newStatus);
      }
    }
  };

  const handleConfirmChecklist = (result: 'Sim' | 'Não') => {
    if (pendingStatusChange) {
      executeStatusChange(pendingStatusChange.id, pendingStatusChange.status, result);
      setPendingStatusChange(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Técnica': return { border: '#3b82f6', badge: 'bg-blue-50 text-blue-600' };
      case 'Comercial': return { border: '#f59e0b', badge: 'bg-orange-50 text-orange-600' };
      case 'Técnica/Comercial': return { border: '#85a839', badge: 'bg-green-50 text-green-600' };
      default: return { border: '#e5e7eb', badge: 'bg-gray-50 text-gray-600' };
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Fluxo de Propostas</h1>
        <p className="text-gray-500">Gestão visual do funil de vendas e engenharia.</p>
      </header>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map((status) => {
            const columnProposals = proposals.filter(p => p.status === status);
            const columnTotal = columnProposals.reduce((acc, p) => acc + (p.sent_value || p.estimated_value || 0), 0);
            return (
              <div key={status} className="flex flex-col w-80 bg-gray-50 rounded-xl border border-gray-200 h-full shadow-sm" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, status)}>
                <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl flex justify-between items-center">
                  <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-widest">{status}</h3>
                  <p className="text-[10px] font-bold text-[#85a839]">{formatCurrency(columnTotal)}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnProposals.map((p) => {
                    const styles = getTypeStyles(p.proposal_type);
                    return (
                      <div key={p.id} draggable onDragStart={(e) => handleDragStart(e, p.id)} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md cursor-grab border-l-4 transition-all" style={{ borderLeftColor: styles.border }}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-bold text-gray-900">{p.dvt_number}</span>
                          <span className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded">R{p.revision_number}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-600 mb-3 truncate">{p.client}</p>
                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                          <span>{p.technical_responsible}</span>
                          <span className="font-bold text-gray-900">{formatCurrency(p.sent_value || p.estimated_value)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pendingStatusChange && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#252525] text-white w-full max-w-sm rounded-2xl p-8 border border-white/10 animate-slideUp text-center">
            <div className="w-16 h-16 bg-[#85a839]/20 text-[#85a839] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"><i className="fas fa-tasks"></i></div>
            <h3 className="text-xl font-bold mb-2">Checklist do Gerente</h3>
            <p className="text-gray-400 text-xs mb-6">A proposta está pronta para envio?</p>
            <div className="flex gap-4">
              <button onClick={() => handleConfirmChecklist('Não')} className="flex-1 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5">Não</button>
              <button onClick={() => handleConfirmChecklist('Sim')} className="flex-1 py-3 rounded-xl bg-[#85a839] text-white font-bold hover:bg-[#6e8b30]">Sim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kanban;
