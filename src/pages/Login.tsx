
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (isDemo?: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Fix: Using type assertion for signInWithPassword due to environment type mismatch
    const { data, error: authError } = await (supabase.auth as any).signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (authError) {
      setError('E-mail ou senha inválidos ou erro de conexão.');
      setLoading(false);
    } else if (data.user) {
      onLogin();
    }
  };

  const handleDemoLogin = () => {
    onLogin(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
        <div className="bg-[#252525] p-8 text-center">
          <div className="inline-block w-16 h-16 bg-[#85a839] rounded-xl flex items-center justify-center text-3xl font-bold text-white mb-4">EA</div>
          <h1 className="text-2xl font-bold text-[#85a839] tracking-widest uppercase">Drive</h1>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest font-bold">Controle de Propostas</p>
        </div>
        
        <form className="p-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold flex items-center gap-2 animate-bounce">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">E-mail</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                required
                type="email" 
                placeholder="seu-email@drivetech.com.br"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#85a839] transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Senha</label>
            </div>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                required
                type="password" 
                placeholder="********"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#85a839] transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#85a839] hover:bg-[#6e8b30] text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <i className="fas fa-circle-notch fa-spin"></i>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Entrar no Sistema
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={handleDemoLogin}
              className="w-full bg-white border border-gray-200 text-gray-500 py-2 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <i className="fas fa-eye"></i>
              Explorar (Modo Demo)
            </button>
          </div>

          <div className="text-center text-[10px] text-gray-400 pt-4 leading-relaxed">
            <p>© 2026 • Todos os direitos reservados</p>
            <p className="font-semibold">Powered by Cacir Soluções Tecnológicas</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
