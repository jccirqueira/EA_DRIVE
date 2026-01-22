
import React, { useState, useEffect } from 'react';
import { Proposal, ProjectType, ProposalStatus, ProposalType, LogEntry, ProposalRevision, RevisionReasonType } from '../types';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Proposal> & { checklistResult?: string }) => void;
  proposal?: Proposal;
  logs?: LogEntry[];
  defaultTab?: 'data' | 'history' | 'revisions';
}

const ProposalModal: React.FC<ProposalModalProps> = ({ isOpen, onClose, onSave, proposal, logs = [], defaultTab = 'data' }) => {
  const [activeTab, setActiveTab] = useState<'data' | 'history' | 'revisions'>('data');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [isChecklistVisible, setIsChecklistVisible] = useState(false);
  
  const [newRevisionData, setNewRevisionData] = useState({
    reason_type: 'Motivo Técnico' as RevisionReasonType,
    description: ''
  });

  const [formData, setFormData] = useState<Partial<Proposal>>({
    dvt_number: '',
    revision_number: 0,
    client: '',
    project_type: 'Eletrocentro',
    opening_date: new Date().toISOString().split('T')[0],
    start_date: new Date().toISOString().split('T')[0],
    expected_tech_date: '',
    expected_comm_date: '',
    actual_tech_date: '',
    actual_comm_date: '',
    technical_responsible: '',
    commercial_consultant: '',
    proposal_type: 'Técnica',
    status: 'Pendente',
    estimated_value: 0,
    sent_value: 0,
    loss_reason_details: '',
    competitor: '',
    revisions: []
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setShowRevisionForm(false);
      setIsChecklistVisible(false);
      setNewRevisionData({ reason_type: 'Motivo Técnico', description: '' });
      
      if (proposal) {
        setFormData(proposal);
      } else {
        setFormData({
          dvt_number: '',
          revision_number: 0,
          client: '',
          project_type: 'Eletrocentro',
          opening_date: new Date().toISOString().split('T')[0],
          start_date: new Date().toISOString().split('T')[0],
          expected_tech_date: '',
          expected_comm_date: '',
          actual_tech_date: '',
          actual_comm_date: '',
          technical_responsible: '',
          commercial_consultant: '',
          proposal_type: 'Técnica',
          status: 'Pendente',
          estimated_value: 0,
          sent_value: 0,
          loss_reason_details: '',
          competitor: '',
          revisions: []
        });
      }
    }
  }, [proposal, isOpen, defaultTab]);

  if (!isOpen) return null;

  const isLostStatus = ['Perdido por Prazo', 'Perdido por Preço', 'Cancelada pelo Cliente'].includes(formData.status || '');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const handleStartRevision = () => {
    setShowRevisionForm(true);
  };

  const handleCancelRevision = () => {
    setShowRevisionForm(false);
  };

  const handleApplyRevision = () => {
    if (!newRevisionData.description.trim()) {
      alert("Por favor, descreva o motivo da revisão.");
      return;
    }

    const nextRevNum = (formData.revision_number || 0) + 1;
    const isTechnical = newRevisionData.reason_type === 'Motivo Técnico';
    
    const newRevision: ProposalRevision = {
      id: Math.random().toString(36).substring(7),
      revision_number: nextRevNum,
      reason_type: newRevisionData.reason_type,
      description: newRevisionData.description,
      created_at: new Date().toISOString(),
      user_name: 'Engenheiro EA',
      value_at_revision: isTechnical ? undefined : formData.sent_value || 0
    };

    setFormData({
      ...formData,
      revision_number: nextRevNum,
      revisions: [newRevision, ...(formData.revisions || [])]
    });
    
    setShowRevisionForm(false);
    setNewRevisionData({ reason_type: 'Motivo Técnico', description: '' });
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Verifica se mudou para 'Enviada' ou já está 'Enviada' mas o usuário clicou em salvar
    if (formData.status === 'Enviada' && proposal?.status !== 'Enviada') {
      setIsChecklistVisible(true);
    } else {
      onSave(formData);
    }
  };

  const handleChecklistResult = (result: 'Sim' | 'Não') => {
    setIsChecklistVisible(false);
    onSave({ ...formData, checklistResult: result });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slideUp">
        
        <header className="px-8 py-5 border-b border-gray-100 bg-[#252525] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#85a839] rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
              {proposal ? <i className="fas fa-file-pen"></i> : <i className="fas fa-plus"></i>}
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight text-white">
                {proposal ? `Proposta ${proposal.dvt_number}` : 'Nova Proposta'}
              </h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-[2px] font-bold">Gerenciamento Técnico e Comercial</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <i className="fas fa-times"></i>
          </button>
        </header>

        <div className="bg-gray-50 px-8 flex border-b border-gray-200 shrink-0 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('data')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'data' 
                ? 'border-[#85a839] text-[#85a839] bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-list-ul"></i>
            Dados
          </button>
          <button 
            onClick={() => setActiveTab('revisions')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'revisions' 
                ? 'border-[#85a839] text-[#85a839] bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-code-branch"></i>
            Revisões
            {(formData.revisions?.length || 0) > 0 && (
              <span className="bg-[#85a839] text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1 font-black">
                {formData.revisions?.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'history' 
                ? 'border-[#85a839] text-[#85a839] bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-history"></i>
            Histórico Geral
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
          {activeTab === 'data' ? (
            <form 
              id="proposal-form"
              onSubmit={handlePreSubmit}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">DVT Número</label>
                  <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#85a839] outline-none font-semibold text-gray-800" value={formData.dvt_number} onChange={e => setFormData({...formData, dvt_number: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Revisão Atual</label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-black text-[#85a839] text-center">
                      R{formData.revision_number}
                    </div>
                    {proposal && !showRevisionForm && (
                      <button 
                        type="button" 
                        onClick={handleStartRevision}
                        className="px-4 py-2 bg-[#252525] text-white rounded-xl text-[10px] font-bold uppercase hover:bg-black transition-all"
                      >
                        Nova Rev.
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Cliente</label>
                  <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#85a839] outline-none font-semibold text-gray-800" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
                </div>

                {showRevisionForm && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#85a839]/5 border-2 border-dashed border-[#85a839]/30 p-6 rounded-2xl animate-slideDown">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-black text-[#85a839] uppercase tracking-widest flex items-center gap-2">
                        <i className="fas fa-plus-circle"></i>
                        Detalhamento da Revisão R{(formData.revision_number || 0) + 1}
                      </h4>
                      <button type="button" onClick={handleCancelRevision} className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase">Cancelar</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo de Justificativa</label>
                        <select 
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold"
                          value={newRevisionData.reason_type}
                          onChange={e => setNewRevisionData({...newRevisionData, reason_type: e.target.value as RevisionReasonType})}
                        >
                          <option value="Motivo Técnico">Motivo Técnico</option>
                          <option value="Solicitação do Cliente">Solicitação do Cliente</option>
                          <option value="Ajuste Comercial">Ajuste Comercial</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Descrição da Alteração</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Ex: Alteração de potência do transformador..."
                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            value={newRevisionData.description}
                            onChange={e => setNewRevisionData({...newRevisionData, description: e.target.value})}
                          />
                          <button 
                            type="button"
                            onClick={handleApplyRevision}
                            className="bg-[#85a839] text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase shadow-md active:scale-95 transition-all"
                          >
                            Registrar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Projeto</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#85a839] outline-none font-semibold text-gray-800" value={formData.project_type} onChange={e => setFormData({...formData, project_type: e.target.value as ProjectType})}>
                    {['Eletrocentro', 'Cubículo MT', 'QGBT', 'CCM', 'QDCA', 'QDCC', 'QDL', 'Painel de Controle', 'Serviços'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Valor Estimado (Interno)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                    <input type="number" step="0.01" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#85a839] outline-none font-bold text-gray-800" value={formData.estimated_value} onChange={e => setFormData({...formData, estimated_value: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Valor Enviado (Comercial)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-sm">R$</span>
                    <input type="number" step="0.01" className="w-full pl-10 pr-4 py-2.5 bg-blue-50/30 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none font-bold text-gray-800" value={formData.sent_value} onChange={e => setFormData({...formData, sent_value: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status do Fluxo</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#85a839] outline-none font-semibold text-gray-800" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ProposalStatus})}>
                    {['Pendente', 'Elaborando', 'Pausada', 'Enviada', 'Revisão', 'Negociação', 'Fechado', 'Perdido por Prazo', 'Perdido por Preço', 'Cancelada pelo Cliente'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Responsável Técnico</label>
                  <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#85a839] outline-none font-semibold text-gray-800" value={formData.technical_responsible || ''} onChange={e => setFormData({...formData, technical_responsible: e.target.value})} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Consultor Comercial</label>
                  <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#85a839] outline-none font-semibold text-gray-800" value={formData.commercial_consultant || ''} onChange={e => setFormData({...formData, commercial_consultant: e.target.value})} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Tipo Proposta</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#85a839] outline-none font-semibold text-gray-800" value={formData.proposal_type} onChange={e => setFormData({...formData, proposal_type: e.target.value as ProposalType})}>
                    <option value="Técnica">Técnica</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Técnica/Comercial">Técnica/Comercial</option>
                  </select>
                </div>
              </div>

              {isLostStatus && (
                <div className="pt-8 border-t border-red-100 animate-slideDown">
                  <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle"></i>
                    Análise de Perda / Cancelamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Concorrente Ganhador</label>
                      <input 
                        type="text" 
                        placeholder="Nome da empresa..."
                        className="w-full px-4 py-2.5 bg-red-50/30 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none font-semibold text-gray-800" 
                        value={formData.competitor || ''} 
                        onChange={e => setFormData({...formData, competitor: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Detalhamento do Motivo</label>
                      <textarea 
                        rows={2}
                        placeholder="Explique o que ocorreu..."
                        className="w-full px-4 py-2.5 bg-red-50/30 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none font-semibold text-gray-800" 
                        value={formData.loss_reason_details || ''} 
                        onChange={e => setFormData({...formData, loss_reason_details: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Prazos e Cronograma</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Prev. Técnica</label>
                    <input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={formData.expected_tech_date} onChange={e => setFormData({...formData, expected_tech_date: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Prev. Comercial</label>
                    <input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={formData.expected_comm_date} onChange={e => setFormData({...formData, expected_comm_date: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#85a839] uppercase">Real Técnica</label>
                    <input type="date" className="w-full px-3 py-2 bg-green-50/30 border border-[#85a839]/30 rounded-lg text-sm" value={formData.actual_tech_date} onChange={e => setFormData({...formData, actual_tech_date: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#85a839] uppercase">Real Comercial</label>
                    <input type="date" className="w-full px-3 py-2 bg-green-50/30 border border-[#85a839]/30 rounded-lg text-sm" value={formData.actual_comm_date} onChange={e => setFormData({...formData, actual_comm_date: e.target.value})} />
                  </div>
                </div>
              </div>
            </form>
          ) : activeTab === 'revisions' ? (
            <div className="animate-fadeIn min-h-[400px]">
               <div className="relative ml-4">
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-100 shadow-inner"></div>
                  <div className="space-y-8">
                    {formData.revisions && formData.revisions.length > 0 ? formData.revisions.map((rev) => (
                      <div key={rev.id} className="relative pl-10">
                        <div className={`absolute left-[-6px] top-2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md ring-4 ring-opacity-10 ${
                          rev.reason_type === 'Solicitação do Cliente' ? 'bg-blue-500 ring-blue-500' : 
                          rev.reason_type === 'Motivo Técnico' ? 'bg-orange-500 ring-orange-500' : 'bg-green-500 ring-green-500'
                        }`}></div>
                        
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all border-l-4" style={{ 
                          borderLeftColor: rev.reason_type === 'Solicitação do Cliente' ? '#3b82f6' : 
                                           rev.reason_type === 'Motivo Técnico' ? '#f97316' : '#85a839' 
                        }}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-xl font-black text-gray-900 mr-2">R{rev.revision_number}</span>
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                                rev.reason_type === 'Solicitação do Cliente' ? 'bg-blue-50 text-blue-600' : 
                                rev.reason_type === 'Motivo Técnico' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                              }`}>
                                <i className={`fas ${rev.reason_type === 'Solicitação do Cliente' ? 'fa-user-tag' : 'fa-tools'} mr-1`}></i>
                                {rev.reason_type}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                              {formatDate(rev.created_at)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-700 font-semibold mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                            "{rev.description}"
                          </p>

                          <div className="flex justify-between items-center text-[11px]">
                            <div className="flex items-center gap-2 text-gray-500 font-bold">
                              <i className="fas fa-user-circle text-gray-300"></i>
                              {rev.user_name}
                            </div>
                            {rev.value_at_revision !== undefined && rev.value_at_revision > 0 ? (
                               <div className="text-[#85a839] font-black">
                                Valor na Versão: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rev.value_at_revision)}
                              </div>
                            ) : (
                              <div className="text-gray-300 font-bold uppercase tracking-widest text-[9px]">
                                Revisão sem dados comerciais
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4 border border-dashed border-gray-200">
                          <i className="fas fa-code-branch text-2xl"></i>
                        </div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nenhuma Revisão Registrada</h4>
                        <p className="text-xs text-gray-300 mt-2">Clique em "Nova Rev." nos dados para iniciar.</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          ) : (
            <div className="animate-fadeIn min-h-[300px]">
              {proposal ? (
                <div className="relative ml-4">
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-100 shadow-inner"></div>
                  <div className="space-y-10">
                    {logs.length > 0 ? logs.map((log) => (
                      <div key={log.id} className="relative pl-10">
                        <div className={`absolute left-[-5px] top-2 w-3 h-3 rounded-full border-2 border-white shadow-sm ring-4 ring-opacity-20 ${
                          log.action === 'Criação' ? 'bg-[#85a839] ring-[#85a839]' : 
                          log.action === 'Exclusão' ? 'bg-red-500 ring-red-500' : 'bg-blue-500 ring-blue-500'
                        }`}></div>
                        
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                              log.action === 'Criação' ? 'bg-green-50 text-[#85a839]' : 
                              log.action === 'Exclusão' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {log.action}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                              <i className="far fa-calendar-alt mr-1"></i>
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-gray-700 mb-2">
                             <i className="fas fa-user-circle mr-1 text-[#85a839]"></i>
                             {log.user_name}
                          </p>
                          <p className="text-xs text-gray-500 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                            {log.details}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                        <i className="fas fa-history text-5xl mb-4 opacity-10"></i>
                        <p className="text-sm font-bold text-gray-400">Nenhum registro encontrado</p>
                        <p className="text-xs text-gray-300">As alterações serão listadas aqui.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-[#85a839]/10 rounded-full flex items-center justify-center text-[#85a839] mb-4">
                    <i className="fas fa-bolt text-3xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Proposta em Modo de Edição</h3>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-2 uppercase tracking-widest font-bold">
                    O Histórico será preenchido após a primeira gravação.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 transition-all uppercase tracking-widest"
          >
            Fechar
          </button>
          {activeTab === 'data' && (
            <button 
              form="proposal-form"
              type="submit" 
              className="px-8 py-2 bg-[#85a839] hover:bg-[#6e8b30] text-white rounded-xl font-bold shadow-lg shadow-[#85a839]/20 transition-all transform active:scale-95 text-xs uppercase tracking-widest"
            >
              {proposal ? 'Salvar Alterações' : 'Criar Proposta'}
            </button>
          )}
        </footer>
      </div>

      {/* Janela de Checklist do Gerente (Sobreposta) */}
      {isChecklistVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative bg-[#252525] text-white w-full max-w-sm rounded-3xl shadow-2xl p-8 border border-white/10 animate-slideUp">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-[#85a839]/20 text-[#85a839] rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                <i className="fas fa-clipboard-check"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Checklist do Gerente</h3>
                <p className="text-gray-400 text-xs mt-3 uppercase tracking-[2px] font-bold">A proposta está 100% pronta?</p>
              </div>
              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => handleChecklistResult('Não')}
                  className="flex-1 py-4 rounded-2xl border border-white/10 font-black hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                >
                  Não
                </button>
                <button 
                  onClick={() => handleChecklistResult('Sim')}
                  className="flex-1 py-4 rounded-2xl bg-[#85a839] text-white font-black hover:bg-[#6e8b30] transition-all text-sm uppercase tracking-widest shadow-xl shadow-[#85a839]/20"
                >
                  Sim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalModal;
