
import React, { useState, useEffect, useRef } from 'react';

interface UserMember {
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

interface SettingsProps {
  role: 'Admin' | 'User';
  compactMode: boolean;
  setCompactMode: (val: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ role, compactMode, setCompactMode }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'users'>('profile');
  const [notifications, setNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for SLA Target with Persistence
  const [slaTarget, setSlaTarget] = useState<number>(() => {
    const saved = localStorage.getItem('ea_drive_sla_target');
    return saved ? parseInt(saved, 10) : 95;
  });

  // State for Profile Picture with Persistence
  const [avatar, setAvatar] = useState<string | null>(() => {
    return localStorage.getItem('ea_drive_user_avatar');
  });

  // State for Alert Emails with Persistence
  const [alertEmails, setAlertEmails] = useState<string[]>(() => {
    const saved = localStorage.getItem('ea_drive_alert_emails');
    return saved ? JSON.parse(saved) : ['comercial@drivetech.com.br', 'engenharia@drivetech.com.br'];
  });
  const [newEmail, setNewEmail] = useState('');

  // State for Team Members with Persistence
  const [users, setUsers] = useState<UserMember[]>(() => {
    const saved = localStorage.getItem('ea_drive_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar usuários:", e);
      }
    }
    return [
      { name: 'Admin Principal', email: 'ea@drivetech.com.br', role: 'Admin' },
      { name: 'Engenheiro Júnior', email: 'jr@drivetech.com.br', role: 'User' },
      { name: 'Coordenação Comercial', email: 'vendas@drivetech.com.br', role: 'User' },
    ];
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('ea_drive_alert_emails', JSON.stringify(alertEmails));
  }, [alertEmails]);

  useEffect(() => {
    localStorage.setItem('ea_drive_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ea_drive_sla_target', slaTarget.toString());
  }, [slaTarget]);

  useEffect(() => {
    if (avatar) {
      localStorage.setItem('ea_drive_user_avatar', avatar);
    } else {
      localStorage.removeItem('ea_drive_user_avatar');
    }
  }, [avatar]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Perfil atualizado com sucesso!');
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor, escolha uma imagem de até 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    if (confirm('Deseja realmente remover sua foto de perfil?')) {
      setAvatar(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRegisterUser = () => {
    setTimeout(() => {
      const name = prompt('Digite o nome do novo usuário:');
      if (!name || name.trim() === '') return;
      
      const email = prompt('Digite o e-mail do novo usuário:');
      if (!email || email.trim() === '') return;

      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(trimmedEmail)) {
        alert('Por favor, insira um e-mail válido.');
        return;
      }

      const isAdmin = confirm('O usuário será Administrador?\n(OK para Sim, Cancelar para Usuário comum)');
      const userRole: 'Admin' | 'User' = isAdmin ? 'Admin' : 'User';

      const newUser: UserMember = { 
        name: name.trim(), 
        email: trimmedEmail, 
        role: userRole 
      };

      setUsers(prev => {
        if (prev.some(u => u.email.toLowerCase() === trimmedEmail)) {
          alert('Este e-mail já está cadastrado na equipe.');
          return prev;
        }
        const updated = [...prev, newUser];
        setTimeout(() => alert(`Usuário ${name} cadastrado com sucesso!`), 100);
        return updated;
      });
    }, 50);
  };

  const handleRemoveUser = (emailToRemove: string) => {
    if (emailToRemove === 'ea@drivetech.com.br') {
      alert('O administrador principal não pode ser removido.');
      return;
    }
    if (confirm(`Deseja realmente remover o acesso de ${emailToRemove}?`)) {
      setUsers(prev => prev.filter(user => user.email !== emailToRemove));
    }
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = newEmail.trim().toLowerCase();
    if (trimmedEmail && !alertEmails.includes(trimmedEmail)) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setAlertEmails(prev => [...prev, trimmedEmail]);
        setNewEmail('');
      } else {
        alert('Por favor, insira um e-mail válido.');
      }
    } else if (alertEmails.includes(trimmedEmail)) {
      alert('Este e-mail já está na lista de alertas.');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setAlertEmails(prev => prev.filter(email => email !== emailToRemove));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie sua conta e as preferências do sistema.</p>
      </header>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Tab Navigation */}
        <aside className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4">
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-[#85a839] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <i className="fas fa-user"></i> Perfil
            </button>
            <button 
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'system' ? 'bg-[#85a839] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <i className="fas fa-sliders-h"></i> Sistema
            </button>
            {role === 'Admin' && (
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-[#85a839] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                <i className="fas fa-users-cog"></i> Gestão de Usuários
              </button>
            )}
          </nav>
        </aside>

        {/* Tab Content */}
        <main className="flex-1 p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-gray-100 pb-4">Seu Perfil</h2>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400 border-4 border-white shadow-sm overflow-hidden relative group">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-bold text-[#85a839] hover:underline uppercase tracking-wide flex items-center gap-2"
                  >
                    <i className="fas fa-camera"></i> Alterar Foto
                  </button>
                  {avatar && (
                    <button 
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs font-bold text-red-500 hover:underline uppercase tracking-wide flex items-center gap-2"
                    >
                      <i className="fas fa-trash"></i> Remover Foto
                    </button>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>
              </div>
              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Nome Completo</label>
                  <input type="text" defaultValue="Engenheiro Drivetech" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#85a839]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email Corporativo</label>
                  <input type="email" defaultValue="ea@drivetech.com.br" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#85a839]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Senha Atual</label>
                  <input type="password" placeholder="********" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Nova Senha</label>
                  <input type="password" placeholder="Deixe em branco para não alterar" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" />
                </div>
                <div className="col-span-1 md:col-span-2 pt-6 flex justify-end">
                  <button 
                    disabled={isSaving}
                    type="submit" 
                    className="bg-[#85a839] text-white px-8 py-2 rounded-lg font-bold hover:bg-[#6e8b30] transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Perfil'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-gray-100 pb-4">Preferências do Sistema</h2>
              <div className="space-y-6">
                
                {/* SLA Target Setting */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800">Meta de Indicadores de SLA</h4>
                      <p className="text-xs text-gray-500">Defina a meta percentual global para os indicadores de entrega.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="1"
                        className="w-32 md:w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#85a839]"
                        value={slaTarget}
                        onChange={(e) => setSlaTarget(parseInt(e.target.value))}
                      />
                      <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm font-bold text-[#85a839] min-w-[50px] text-center">
                        {slaTarget}%
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setNotifications(!notifications)}
                >
                  <div>
                    <h4 className="font-bold text-gray-800">Notificações por Email</h4>
                    <p className="text-xs text-gray-500">Receba alertas de prazos expirando por email.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-[#85a839]" 
                    checked={notifications} 
                    readOnly
                  />
                </div>

                <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <i className="fas fa-envelope-open-text text-[#85a839]"></i>
                    E-mails para Alertas de Prazo
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 mb-4">
                    Cadastre os e-mails que devem receber alertas automáticos quando as propostas estiverem próximas do prazo de entrega.
                  </p>
                  
                  <form onSubmit={handleAddEmail} className="flex gap-2 mb-4">
                    <input 
                      type="email" 
                      placeholder="alerta@exemplo.com.br"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#85a839] text-sm"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className="bg-[#85a839] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#6e8b30] transition-all uppercase"
                    >
                      Adicionar
                    </button>
                  </form>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {alertEmails.length > 0 ? (
                      alertEmails.map((email) => (
                        <div 
                          key={email} 
                          className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100 group hover:border-[#85a839]/30 transition-all shadow-sm"
                        >
                          <span className="text-sm text-gray-700 font-medium">{email}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveEmail(email)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            title="Remover e-mail"
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-white/50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 italic">Nenhum e-mail de alerta cadastrado.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setCompactMode(!compactMode)}
                >
                  <div>
                    <h4 className="font-bold text-gray-800">Modo Compacto de Tabela</h4>
                    <p className="text-xs text-gray-500">Exibe mais itens por página na visualização de propostas.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-[#85a839]" 
                    checked={compactMode} 
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold">Gerenciamento de Equipe</h2>
                <button 
                  type="button"
                  onClick={handleRegisterUser}
                  className="text-xs font-bold bg-[#85a839] text-white px-3 py-1.5 rounded-lg hover:bg-[#6e8b30] transition-all uppercase tracking-wide flex items-center gap-2"
                >
                  <i className="fas fa-user-plus"></i>
                  Cadastrar Usuário
                </button>
              </div>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 group-hover:bg-[#85a839] group-hover:text-white transition-colors">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{user.name}</h4>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                      <div className="relative group/menu">
                        <button type="button" className="text-gray-400 hover:text-[#85a839] transition-colors p-2">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <div className="absolute right-0 top-full hidden group-hover/menu:block bg-white border border-gray-100 rounded-lg shadow-xl z-20 w-48 py-1">
                           <button 
                             type="button"
                             onClick={() => alert(`Gerenciando permissões de ${user.name}`)}
                             className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                           >
                             <i className="fas fa-key text-[#85a839]"></i> Permissões
                           </button>
                           <button 
                             type="button"
                             onClick={() => handleRemoveUser(user.email)}
                             className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                           >
                             <i className="fas fa-user-minus"></i> Remover Acesso
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
