
import React, { useState, useMemo } from 'react';
import { Proposal, LogEntry } from '../types';
import ProposalModal from '../components/ProposalModal';
import { supabase } from '../lib/supabase';

interface ProposalsProps {
  role: 'Admin' | 'User';
  proposals: Proposal[];
  setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
  logs: LogEntry[];
  addLog: (proposalId: string, action: string, details: string) => void;
  compactMode?: boolean;
}

const Proposals: React.FC<ProposalsProps> = ({ role, proposals, setProposals, logs, addLog, compactMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterConsultant, setFilterConsultant] = useState<string>('');
  const [filterTechResponsible, setFilterTechResponsible] = useState<string>('');
  const [filterProposalType, setFilterProposalType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | undefined>(undefined);
  const [modalInitialTab, setModalInitialTab] = useState<'data' | 'history' | 'revisions'>('data');

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDisplayDate = (dateStr: string | undefined) => {
    if (!dateStr) return '---';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      const matchesSearch = p.dvt_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || p.status === filterStatus;
      const matchesConsultant = !filterConsultant || (p.commercial_consultant || '').toLowerCase().includes(filterConsultant.toLowerCase());
      const matchesTech = !filterTechResponsible || (p.technical_responsible || '').toLowerCase().includes(filterTechResponsible.toLowerCase());
      const matchesType = !filterProposalType || p.proposal_type === filterProposalType;
      
      return matchesSearch && matchesStatus && matchesConsultant && matchesTech && matchesType;
    });
  }, [proposals, searchTerm, filterStatus, filterConsultant, filterTechResponsible, filterProposalType]);

  const handleOpenCreate = () => {
    setSelectedProposal(undefined);
    setModalInitialTab('data');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Proposal) => {
    setSelectedProposal(p);
    setModalInitialTab('data');
    setIsModalOpen(true);
  };

  const handleOpenHistory = (p: Proposal) => {
    setSelectedProposal(p);
    setModalInitialTab('revisions');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const prop = proposals.find(p => p.id === id);
    if (confirm('Deseja realmente excluir esta proposta?')) {
      const { error } = await supabase.from('proposals').delete().eq('id', id);
      if (!error) {
        setProposals(prev => prev.filter(p => p.id !== id));
        addLog(id, 'Exclusão', `Proposta ${prop?.dvt_number} removida do sistema.`);
      } else {
        alert('Erro ao excluir proposta no banco de dados.');
      }
    }
  };

  const handleSave = async (data: Partial<Proposal> & { checklistResult?: string }) => {
    const { checklistResult, revisions, ...proposalData } = data;
    // Fix: Using type assertion to bypass type errors on Supabase Auth methods
    const { data: { user } } = await (supabase.auth as any).getUser();

    if (selectedProposal) {
      const changes: string[] = [];
      if (proposalData.status && proposalData.status !== selectedProposal.status) changes.push(`Status: ${selectedProposal.status} → ${proposalData.status}`);
      
      const finalProposalData = { 
        ...proposalData, 
        updated_at: new Date().toISOString(),
        manager_checklist: checklistResult || proposalData.manager_checklist || selectedProposal.manager_checklist
      };

      const { data: updated, error } = await supabase
        .from('proposals')
        .update(finalProposalData)
        .eq('id', selectedProposal.id)
        .select(`*, revisions:proposal_revisions(*)`)
        .single();

      if (updated) {
        setProposals(prev => prev.map(p => p.id === selectedProposal.id ? updated : p));
        if (changes.length > 0) addLog(selectedProposal.id, 'Atualização', changes.join(' | '));
      }
    } else {
      const newP = {
        ...proposalData,
        user_id: user?.id,
        manager_checklist: checklistResult || 'Não',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error } = await supabase
        .from('proposals')
        .insert([newP])
        .select(`*, revisions:proposal_revisions(*)`)
        .single();

      if (inserted) {
        setProposals(prev => [inserted, ...prev]);
        addLog(inserted.id, 'Criação', `Proposta inicializada para o cliente ${inserted.client}.`);
      }
    }
    setIsModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enviada': return 'bg-green-100 text-green-700';
      case 'Elaborando': return 'bg-yellow-100 text-yellow-700';
      case 'Pausada': return 'bg-red-100 text-red-700';
      case 'Revisão': return 'bg-blue-100 text-blue-700';
      case 'Negociação': return 'bg-indigo-100 text-indigo-700';
      case 'Fechado': return 'bg-[#85a839]/20 text-[#85a839]';
      case 'Pendente': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const cellPaddingClass = compactMode ? 'py-1.5' : 'py-4';

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Propostas</h1>
          <p className="text-gray-500">Gestão centralizada de orçamentos e cronogramas técnicos.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-[#85a839] hover:bg-[#6e8b30] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
        >
          <i className="fas fa-plus"></i>
          Nova Proposta
        </button>
      </header>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Buscar por DVT ou Cliente..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#85a839] outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="w-full md:w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#85a839]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Elaborando">Elaborando</option>
            <option value="Pausada">Pausada</option>
            <option value="Enviada">Enviada</option>
            <option value="Revisão">Revisão</option>
            <option value="Negociação">Negociação</option>
            <option value="Fechado">Fechado</option>
            <option value="Perdido por Prazo">Perdido por Prazo</option>
            <option value="Perdido por Preço">Perdido por Preço</option>
            <option value="Cancelada pelo Cliente">Cancelada pelo Cliente</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className={`px-4 ${cellPaddingClass}`}>DVT / Rev.</th>
                <th className={`px-4 ${cellPaddingClass}`}>Cliente</th>
                <th className={`px-4 ${cellPaddingClass}`}>Tipo de Projeto</th>
                <th className={`px-4 ${cellPaddingClass}`}>Tipo Proposta</th>
                <th className={`px-4 ${cellPaddingClass}`}>Resp. Técnico</th>
                <th className={`px-4 ${cellPaddingClass}`}>Data Envio</th>
                <th className={`px-4 ${cellPaddingClass}`}>Checklist Gerente</th>
                <th className={`px-4 ${cellPaddingClass} text-right`}>Valor Enviado (R$)</th>
                <th className={`px-4 ${cellPaddingClass}`}>Status</th>
                <th className={`px-4 ${cellPaddingClass} text-center`}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProposals.length > 0 ? (
                filteredProposals.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className={`px-4 ${cellPaddingClass}`}>
                      <div className="font-bold text-gray-900 text-sm">{p.dvt_number}</div>
                      {!compactMode && <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Revisão {p.revision_number}</div>}
                    </td>
                    <td className={`px-4 ${cellPaddingClass} font-bold text-gray-800 text-sm truncate max-w-[150px]`}>{p.client}</td>
                    <td className={`px-4 ${cellPaddingClass} text-xs font-semibold text-gray-700`}>{p.project_type}</td>
                    <td className={`px-4 ${cellPaddingClass}`}>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                         p.proposal_type === 'Técnica' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                       }`}>
                        {p.proposal_type}
                       </span>
                    </td>
                    <td className={`px-4 ${cellPaddingClass} text-xs font-semibold text-gray-700`}>{p.technical_responsible}</td>
                    <td className={`px-4 ${cellPaddingClass}`}>
                      <div className="text-[10px] text-gray-400 uppercase">Real: <span className="text-gray-600 font-bold">{formatDisplayDate(p.actual_comm_date)}</span></div>
                    </td>
                    <td className={`px-4 ${cellPaddingClass}`}>
                      {p.manager_checklist ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.manager_checklist === 'Sim' ? 'bg-green-50 text-[#85a839]' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <i className={`fas ${p.manager_checklist === 'Sim' ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
                          {p.manager_checklist}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-300 italic">Pendente</span>
                      )}
                    </td>
                    <td className={`px-4 ${cellPaddingClass} text-sm font-bold text-gray-900 text-right`}>
                      {formatCurrency(p.sent_value)}
                    </td>
                    <td className={`px-4 ${cellPaddingClass}`}>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className={`px-4 ${cellPaddingClass}`}>
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenHistory(p)} className="p-1 text-[#85a839] hover:bg-green-50 rounded"><i className="fas fa-code-branch"></i></button>
                        <button onClick={() => handleOpenEdit(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><i className="fas fa-edit"></i></button>
                        {role === 'Admin' && <button onClick={() => handleDelete(p.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><i className="fas fa-trash-alt"></i></button>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={11} className="px-6 py-12 text-center text-gray-500 italic">Nenhuma proposta encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProposalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        proposal={selectedProposal}
        logs={logs.filter(l => l.proposal_id === selectedProposal?.id)}
        defaultTab={modalInitialTab}
      />
    </div>
  );
};

export default Proposals;
