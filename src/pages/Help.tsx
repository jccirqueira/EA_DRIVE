
import React from 'react';

const Help: React.FC = () => {
  const sections = [
    {
      title: "1. DASHBOARD (PAINEL DE CONTROLE)",
      icon: "fa-chart-line",
      color: "text-[#85a839]",
      items: [
        { label: "Pipeline Total", desc: "Soma de tudo o que está em negociação no momento." },
        { label: "Volume Fechado", desc: "Tudo o que já virou venda de fato no período selecionado." },
        { label: "Taxa de Conversão", desc: "Mostra a eficiência: de cada 10 propostas, quantas estamos fechando." },
        { label: "Live Activity Feed", desc: "Monitoramento em tempo real de quem fez alterações no sistema (via Supabase)." }
      ]
    },
    {
      title: "2. PROPOSTAS (A LISTA GERAL)",
      icon: "fa-file-invoice",
      color: "text-blue-500",
      items: [
        { label: "Buscar e Filtrar", desc: "Localize por DVT ou Cliente. Use filtros de Status para focar em fluxos específicos." },
        { label: "Checklist do Gerente", desc: "Indicador visual (Sim/Não). Se estiver 'Pendente', a proposta ainda não foi oficialmente liberada." },
        { label: "Histórico de Revisões", desc: "Ícone de folha com código. Permite ver a evolução técnica e comercial de cada item." }
      ]
    },
    {
      title: "3. FLUXO (O QUADRO KANBAN)",
      icon: "fa-table-columns",
      color: "text-orange-500",
      items: [
        { label: "Arrastar e Soltar", desc: "Mova os cartões entre as colunas para atualizar o status visualmente." },
        { label: "Gatilho de Envio", desc: "Ao mover para 'Enviada', o sistema exige a validação do Checklist do Gerente." },
        { label: "Valores por Etapa", desc: "Veja quanto dinheiro está parado em cada fase do funil no topo de cada coluna." }
      ]
    },
    {
      title: "4. O FORMULÁRIO (O MODAL)",
      icon: "fa-edit",
      color: "text-purple-500",
      items: [
        { label: "Aba Dados", desc: "Campos principais como Cliente, Valores (Estimado vs Enviado) e Responsáveis." },
        { label: "Aba Revisões", desc: "Toda mudança técnica ou comercial deve ser registrada aqui para manter a rastreabilidade." },
        { label: "Aba Histórico", desc: "Log detalhado de todas as alterações feitas nesta proposta específica." }
      ]
    },
    {
      title: "5. RELATÓRIOS E EXPORTAÇÃO",
      icon: "fa-file-export",
      color: "text-red-500",
      items: [
        { label: "Exportação Multiformato", desc: "Gere arquivos em CSV (para Excel) ou PDF prontos para impressão." },
        { label: "Filtros Avançados", desc: "Gere relatórios por período, consultor, responsável técnico ou tipo de projeto." }
      ]
    },
    {
      title: "6. CONFIGURAÇÕES",
      icon: "fa-cog",
      color: "text-gray-600",
      items: [
        { label: "Meta de SLA", desc: "Configure a porcentagem de meta de entrega no prazo para todo o time." },
        { label: "E-mails de Alerta", desc: "Cadastre quem deve receber avisos automáticos de prazos vencendo." },
        { label: "Gestão de Equipe", desc: "Admins podem cadastrar e remover acessos de colaboradores." }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      <header className="bg-[#252525] p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <i className="fas fa-question-circle text-[#85a839]"></i>
            Central de Ajuda EA_DRIVE
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Manual completo de utilização do sistema de controle de propostas da Drivetech. 
            Aprenda a gerenciar fluxos, acompanhar indicadores e manter a rastreabilidade dos projetos.
          </p>
        </div>
        <i className="fas fa-life-ring absolute -right-8 -bottom-8 text-9xl text-white/5 rotate-12"></i>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${section.color}`}>
                <i className={`fas ${section.icon} text-lg`}></i>
              </div>
              <h3 className="font-bold text-gray-800 text-sm tracking-widest">{section.title}</h3>
            </div>
            <div className="p-6 flex-1 space-y-4">
              {section.items.map((item, i) => (
                <div key={i} className="group">
                  <h4 className="text-xs font-black text-[#85a839] uppercase tracking-wider mb-1 group-hover:translate-x-1 transition-transform inline-block">
                    {item.label}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#85a839]/10 border-2 border-dashed border-[#85a839]/30 p-8 rounded-3xl text-center">
        <div className="w-16 h-16 bg-[#85a839] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg">
          <i className="fas fa-cloud-upload-alt"></i>
        </div>
        <h3 className="text-lg font-bold text-gray-800">Dica Importante: Sincronização em Nuvem</h3>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto mt-2 leading-relaxed">
          O <strong>EA_DRIVE</strong> sincroniza todos os dados em tempo real com o banco de dados seguro da Drivetech no <strong>Supabase</strong>. 
          Suas informações estão salvas na nuvem e podem ser acessadas de qualquer dispositivo autorizado. 
          Sempre lembre de clicar em <strong>"Salvar Alterações"</strong> no formulário para confirmar seus registros!
        </p>
        <div className="mt-6 pt-6 border-t border-[#85a839]/20">
          <p className="text-[10px] font-black uppercase text-[#85a839] tracking-[3px]">
            Powered by Cacir Soluções Tecnológicas
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;
