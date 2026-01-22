
import React, { useState, useMemo } from 'react';
import { Proposal } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportsProps {
  proposals: Proposal[];
}

interface ExportColumn {
  id: string;
  label: string;
}

const AVAILABLE_COLUMNS: ExportColumn[] = [
  { id: 'client', label: 'Cliente' },
  { id: 'dvt_number', label: 'DVT' },
  { id: 'project_type', label: 'Tipo de Projeto' },
  { id: 'proposal_type', label: 'Tipo Proposta' },
  { id: 'commercial_consultant', label: 'Consultor' },
  { id: 'technical_responsible', label: 'Resp. Técnico' },
  { id: 'value', label: 'Valor (R$)' },
  { id: 'status', label: 'Status' },
  { id: 'opening_date', label: 'Data Abertura' },
  { id: 'manager_checklist', label: 'Checklist Gerente' },
  { id: 'loss_reason_details', label: 'Motivo Perda' },
  { id: 'competitor', label: 'Concorrente' },
];

const Reports: React.FC<ReportsProps> = ({ proposals }) => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    projectType: '',
    consultant: '',
    client: '',
    techResponsible: '',
    proposalType: ''
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'pdf'>('csv');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(AVAILABLE_COLUMNS.map(c => c.id));

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

  const filteredData = useMemo(() => {
    return proposals.filter(p => {
      const start = appliedFilters.startDate ? new Date(p.opening_date) >= new Date(appliedFilters.startDate) : true;
      const end = appliedFilters.endDate ? new Date(p.opening_date) <= new Date(appliedFilters.endDate) : true;
      const status = appliedFilters.status ? p.status === appliedFilters.status : true;
      const consultant = appliedFilters.consultant ? (p.commercial_consultant || '').toLowerCase().includes(appliedFilters.consultant.toLowerCase()) : true;
      const client = appliedFilters.client ? p.client.toLowerCase().includes(appliedFilters.client.toLowerCase()) : true;
      return start && end && status && consultant && client;
    });
  }, [proposals, appliedFilters]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const totalValue = filteredData.reduce((acc, p) => acc + (p.sent_value || p.estimated_value || 0), 0);
    const closed = filteredData.filter(p => p.status === 'Fechado').length;
    const conversion = total > 0 ? ((closed / total) * 100).toFixed(1) : '0';
    return { total, totalValue, conversion };
  }, [filteredData]);

  const executeExport = () => {
    if (exportType === 'csv') {
      const headers = AVAILABLE_COLUMNS.filter(c => selectedColumns.includes(c.id)).map(c => c.label).join(",");
      const rows = filteredData.map(item => {
        return AVAILABLE_COLUMNS.filter(c => selectedColumns.includes(c.id)).map(c => {
          if (c.id === 'value') return item.sent_value || item.estimated_value;
          if (c.id === 'manager_checklist') return item.manager_checklist || 'Pendente';
          return (item as any)[c.id] || '';
        }).join(",");
      }).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `relatorio_ea_drive.csv`);
      document.body.appendChild(link);
      link.click();
    } else {
      const doc = new jsPDF('l', 'mm', 'a4');
      const headers = AVAILABLE_COLUMNS.filter(c => selectedColumns.includes(c.id)).map(c => c.label);
      const data = filteredData.map(item => AVAILABLE_COLUMNS.filter(c => selectedColumns.includes(c.id)).map(c => {
          if (c.id === 'value') return formatCurrency(item.sent_value || item.estimated_value);
          if (c.id === 'manager_checklist') return item.manager_checklist || 'Pendente';
          return (item as any)[c.id] || '';
      }));
      autoTable(doc, { head: [headers], body: data });
      doc.save('relatorio_ea_drive.pdf');
    }
    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-500">Análise de performance e exportação de dados.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setExportType('csv'); setIsExportModalOpen(true); }} className="bg-white border px-4 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-all">
            <i className="fas fa-file-csv text-green-600"></i> CSV
          </button>
          <button onClick={() => { setExportType('pdf'); setIsExportModalOpen(true); }} className="bg-[#252525] text-white px-4 py-2 rounded-lg font-bold hover:bg-black flex items-center gap-2 transition-all shadow-md">
            <i className="fas fa-file-pdf text-red-400"></i> PDF
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">DVT / Rev.</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tipo de Projeto</th>
                <th className="px-4 py-3">Resp. Técnico</th>
                <th className="px-4 py-3">Data Envio</th>
                <th className="px-4 py-3">Checklist Gerente</th>
                <th className="px-4 py-3 text-right">Valor Enviado (R$)</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-sm">{item.dvt_number}</td>
                  <td className="px-4 py-3 text-sm">{item.client}</td>
                  <td className="px-4 py-3 text-xs">{item.project_type}</td>
                  <td className="px-4 py-3 text-xs">{item.technical_responsible}</td>
                  <td className="px-4 py-3 text-[10px]">{formatDisplayDate(item.actual_comm_date)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.manager_checklist === 'Sim' ? 'bg-green-50 text-[#85a839]' : 'bg-gray-100 text-gray-500'}`}>
                      {item.manager_checklist || 'Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right">{formatCurrency(item.sent_value)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isExportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-slideUp">
            <h3 className="text-xl font-bold mb-4">Escolha as Colunas para {exportType.toUpperCase()}</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {AVAILABLE_COLUMNS.map(c => (
                <label key={c.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={selectedColumns.includes(c.id)} onChange={() => setSelectedColumns(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])} />
                  <span className="text-xs font-bold">{c.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-400">Cancelar</button>
              <button onClick={executeExport} className="bg-[#85a839] text-white px-6 py-2 rounded-xl font-bold text-xs uppercase shadow-md">Exportar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
