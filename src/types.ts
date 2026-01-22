
export type ProjectType = 
  | 'Eletrocentro' 
  | 'Cubículo MT' 
  | 'QGBT' 
  | 'CCM' 
  | 'QDCA' 
  | 'QDCC' 
  | 'QDL' 
  | 'Painel de Controle' 
  | 'Serviços';

export type ProposalStatus = 
  | 'Pendente' 
  | 'Elaborando' 
  | 'Pausada' 
  | 'Enviada' 
  | 'Revisão'
  | 'Negociação'
  | 'Fechado'
  | 'Perdido por Prazo'
  | 'Perdido por Preço'
  | 'Cancelada pelo Cliente';

export type ProposalType = 'Técnica' | 'Comercial' | 'Técnica/Comercial';

export type RevisionReasonType = 'Solicitação do Cliente' | 'Motivo Técnico' | 'Ajuste Comercial';

export type UserRole = 'Admin' | 'User';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}

export interface ProposalRevision {
  id: string;
  revision_number: number;
  reason_type: RevisionReasonType;
  description: string;
  created_at: string;
  user_name: string;
  value_at_revision?: number; // Opcional para revisões técnicas
}

export interface Proposal {
  id: string;
  dvt_number: string;
  revision_number: number;
  client: string;
  project_type: ProjectType;
  opening_date: string;
  start_date: string;
  expected_tech_date: string;
  expected_comm_date: string;
  actual_tech_date?: string;
  actual_comm_date?: string;
  technical_responsible: string;
  commercial_consultant: string;
  proposal_type: ProposalType;
  status: ProposalStatus;
  estimated_value: number; // Valor de Engenharia/Interno
  sent_value: number;      // Valor Comercial Enviado
  user_id: string;
  created_at: string;
  updated_at: string;
  loss_reason_details?: string;
  competitor?: string;
  revisions?: ProposalRevision[];
  manager_checklist?: 'Sim' | 'Não';
}

export interface LogEntry {
  id: string;
  proposal_id: string;
  user_name: string;
  action: string;
  details: string;
  created_at: string;
}

export interface SystemSettings {
  primary_color: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
}
