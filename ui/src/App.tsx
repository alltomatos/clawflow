import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LayoutDashboard, MessageSquare, Settings, Activity, Plus, Send, ArrowLeft, Bot, FileText, Target, CheckCircle2 } from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

type ChatItem = { sender: 'agent' | 'user'; message: string };

type Project = {
  id: string;
  name: string;
  manager_status: string;
  manager_session_key: string;
};

type ManagerInfo = {
  manager_status: string;
  manager_enabled: boolean;
  manager_session_key: string;
  api_calls: number;
};

const Dashboard = () => {
  const [view, setView] = useState<'empty' | 'chat'>('empty');
  const [message, setMessage] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [manager, setManager] = useState<ManagerInfo | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [sending, setSending] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatItem[]>([
    {
      sender: 'agent',
      message:
        'Olá! Para iniciarmos a documentação, preciso saber: Este é um Projeto Novo (começando do zero/ideação) ou um Projeto Existente (já possui código, banco de dados rodando ou repositório)?',
    },
  ]);

  const version = '0.1.4-beta';

  const loadManager = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/manager`);
      if (!res.ok) return;
      const data = await res.json();
      setManager(data);
    } catch {
      // silencioso para não poluir UI
    }
  };

  useEffect(() => {
    if (project?.id) {
      loadManager(project.id);
    }
  }, [project?.id]);

  const handleStartProject = async () => {
    setView('chat');
    if (project || creatingProject) return;

    setCreatingProject(true);
    try {
      const payload = {
        name: `projeto-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`,
        description: 'Projeto iniciado via dashboard ClawProject',
      };

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Falha ao criar projeto');
      const created: Project = await res.json();
      setProject(created);
      await loadManager(created.id);

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'agent',
          message: `Projeto criado com gestor dedicado. Sessão: ${created.manager_session_key}`,
        },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'agent',
          message: 'Não consegui criar o projeto agora. Tente novamente em instantes.',
        },
      ]);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    const userText = message;
    setMessage('');
    setChatHistory((prev) => [...prev, { sender: 'user', message: userText }]);

    if (!project?.id) {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'agent', message: 'Crie/abra um projeto para conversar com o gestor dedicado.' },
      ]);
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/manager/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao enviar mensagem');

      setChatHistory((prev) => [...prev, { sender: 'agent', message: data.reply || 'Recebido.' }]);
      await loadManager(project.id);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'agent', message: 'Gestor indisponível no momento. Tente novamente em alguns segundos.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const managerOnline = manager?.manager_status === 'active';

  return (
    <div className="flex h-screen w-full bg-[#F5F5F7] overflow-hidden text-[#1D1D1F]">
      <aside className="w-20 md:w-64 glass border-r border-gray-200 flex flex-col p-4 z-20">
        <div className="flex items-center space-x-3 px-2 mb-10 mt-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
            C
          </div>
          <span className="font-extrabold text-xl tracking-tighter hidden md:block">ClawProject</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={view === 'empty'} onClick={() => setView('empty')} />
          <NavItem icon={<MessageSquare size={20} />} label="Projetos" active={view === 'chat'} onClick={() => setView('chat')} />
          <NavItem icon={<Activity size={20} />} label="Atividade" />
        </nav>

        <div className="pt-4 border-t border-gray-100">
          <NavItem icon={<Settings size={20} />} label="Configurações" />
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 glass border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-4">
            {view === 'chat' && (
              <button onClick={() => setView('empty')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{view === 'empty' ? 'Visão Geral' : 'Modo Planejador'}</h2>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestor do Projeto</p>
              <div className="flex items-center justify-end gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${managerOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className={`text-xs font-bold uppercase ${managerOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {managerOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">API calls: {manager?.api_calls ?? 0}</p>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Gateway Ativo</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">v{version}</span>
            </div>
          </div>
        </header>

        <section className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'empty' ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto p-8"
              >
                <div className="w-24 h-24 bg-white rounded-[32px] apple-shadow-lg flex items-center justify-center mb-8 border border-gray-100">
                  <Target size={40} className="text-indigo-600" />
                </div>
                <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Seu próximo passo começa aqui.</h1>
                <p className="text-gray-500 text-xl mb-10 leading-relaxed font-medium max-w-2xl">
                  O ClawProject utiliza o Modo Planejador para transformar ideias em resultados entregáveis. Seja software, prospecção ou gestão: o agente documenta a bíblia do projeto e executa.
                </p>

                <button
                  onClick={handleStartProject}
                  disabled={creatingProject}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[28px] font-bold text-xl transition-all apple-shadow-lg flex items-center space-x-3 active:scale-95 mb-16 disabled:opacity-70"
                >
                  <Plus size={28} />
                  <span>{creatingProject ? 'Criando projeto...' : 'Criar Novo Projeto'}</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                  <DeliverableCard icon={<Bot size={18} />} title="Software" desc="PRD + DER + POPs" />
                  <DeliverableCard icon={<Target size={18} />} title="Vendas" desc="Funil + Scripts" />
                  <DeliverableCard icon={<FileText size={18} />} title="Conteúdo" desc="Calendário + Estilo" />
                  <DeliverableCard icon={<CheckCircle2 size={18} />} title="Gestão" desc="Checklists + Ops" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="h-full flex flex-col p-8 max-w-4xl mx-auto"
              >
                <div className="mb-3 text-xs text-slate-500 font-semibold">
                  Projeto: {project?.id ?? 'não criado'} • Sessão gestor: {manager?.manager_session_key ?? project?.manager_session_key ?? '-'}
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto mb-6 pr-4 scroll-smooth">
                  {chatHistory.map((item, idx) => (
                    <ChatBubble key={idx} sender={item.sender} message={item.message} />
                  ))}
                </div>

                <div className="relative group">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Converse com o gestor dedicado do projeto..."
                    className="w-full bg-white border border-gray-200 rounded-[28px] py-5 px-8 pr-16 apple-shadow-lg focus:outline-none focus:border-indigo-500 transition-all text-lg font-medium"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-transform hover:bg-indigo-700 disabled:opacity-60"
                  >
                    <Send size={20} />
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-widest mt-4">Bíblia do Projeto será gerada em docs/PLANNING.md</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: NavItemProps) => (
  <div
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 ${
      active ? 'bg-indigo-600 text-white apple-shadow' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {icon}
    <span className="font-bold text-sm hidden md:block">{label}</span>
  </div>
);

const ChatBubble = ({ sender, message }: { sender: 'agent' | 'user'; message: string }) => (
  <motion.div initial={{ opacity: 0, x: sender === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-3`}>
    {sender === 'agent' && (
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-1">
        <Bot size={18} />
      </div>
    )}
    <div className={`max-w-[80%] p-6 rounded-[28px] text-lg font-medium apple-shadow ${sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none border border-gray-50'}`}>{message}</div>
  </motion.div>
);

const DeliverableCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="bg-white p-4 rounded-[20px] border border-gray-100 text-center hover:border-indigo-200 transition-all cursor-default apple-shadow group">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">{icon}</div>
    <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1">{desc}</p>
  </div>
);

export default Dashboard;
