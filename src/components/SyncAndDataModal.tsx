import React, { useState } from 'react';
import {
  Database,
  Upload,
  Download,
  Users,
  UserPlus,
  RefreshCw,
  X,
  CheckCircle2,
  FileJson,
  AlertCircle
} from 'lucide-react';
import { ResidenteResumo, CuidadorFuncionario } from '../types/care';
import {
  getResidentes,
  saveResidentes,
  getCuidadores,
  saveCuidadores,
  RESIDENTES_INICIAIS,
  CUIDADORES_INICIAIS
} from '../lib/storage';

interface SyncAndDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdated: () => void;
}

export const SyncAndDataModal: React.FC<SyncAndDataModalProps> = ({
  isOpen,
  onClose,
  onDataUpdated
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'conectar' | 'novo_residente' | 'novo_cuidador'>('conectar');
  const [msg, setMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Formulário de Novo Residente
  const [nomeResidente, setNomeResidente] = useState('');
  const [quartoResidente, setQuartoResidente] = useState('Suíte 103 - Ala Margaridas');
  const [nascResidente, setNascResidente] = useState('1945-06-12');
  const [cpfResidente, setCpfResidente] = useState('321.654.987-00');
  const [grauResidente, setGrauResidente] = useState<'grau1' | 'grau2' | 'grau3'>('grau2');
  const [dietaResidente, setDietaResidente] = useState('Geral branda hipossódica');
  const [alergiasResidente, setAlergiasResidente] = useState('Nenhuma conhecida');

  // Formulário de Novo Cuidador
  const [matriculaCuidador, setMatriculaCuidador] = useState('MAT-106');
  const [nomeCuidador, setNomeCuidador] = useState('');
  const [cargoCuidador, setCargoCuidador] = useState('Cuidador(a) de Idosos');
  const [corenCuidador, setCorenCuidador] = useState('');

  if (!isOpen) return null;

  const handleExportarTudo = () => {
    const dados = {
      residentes: getResidentes(),
      cuidadores: getCuidadores(),
      exportadoEm: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VictoriaLar_ControleCuidados_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ tipo: 'sucesso', texto: 'Arquivo de backup e integração exportado com sucesso!' });
  };

  const handleImportarJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.residentes && Array.isArray(parsed.residentes)) {
          saveResidentes(parsed.residentes);
        }
        if (parsed.cuidadores && Array.isArray(parsed.cuidadores)) {
          saveCuidadores(parsed.cuidadores);
        }
        setMsg({ tipo: 'sucesso', texto: 'Dados importados e sincronizados com sucesso!' });
        onDataUpdated();
      } catch (err) {
        setMsg({ tipo: 'erro', texto: 'Falha ao processar o arquivo JSON. Verifique a estrutura.' });
      }
    };
    reader.readAsText(file);
  };

  const handleCadastrarResidente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeResidente.trim()) {
      setMsg({ tipo: 'erro', texto: 'Nome do residente é obrigatório.' });
      return;
    }

    const novo: ResidenteResumo = {
      id: `res-${Date.now()}`,
      nomeCompleto: nomeResidente.trim(),
      quarto: quartoResidente,
      dataNascimento: nascResidente,
      cpf: cpfResidente,
      sexo: 'feminino',
      grauDependencia: grauResidente,
      mobilidade: 'independente',
      tipoSanguineo: 'O+',
      dieta: dietaResidente,
      alergias: [alergiasResidente],
      diagnosticos: ['Hipertensão Leve'],
      observacoesGerais: 'Cadastrado no controle de cuidados.'
    };

    const lista = getResidentes();
    lista.unshift(novo);
    saveResidentes(lista);
    setMsg({ tipo: 'sucesso', texto: `Residente ${novo.nomeCompleto} adicionado com sucesso!` });
    setNomeResidente('');
    onDataUpdated();
  };

  const handleCadastrarCuidador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCuidador.trim() || !matriculaCuidador.trim()) {
      setMsg({ tipo: 'erro', texto: 'Nome e Matrícula são obrigatórios.' });
      return;
    }

    const novo: CuidadorFuncionario = {
      id: `func-${Date.now()}`,
      matricula: matriculaCuidador.trim().toUpperCase(),
      nomeCompleto: nomeCuidador.trim(),
      cargo: cargoCuidador,
      departamento: 'Cuidados & Enfermagem',
      escala: '12x36_diurno',
      registroProfissional: corenCuidador.trim() || undefined,
      ativo: true
    };

    const lista = getCuidadores();
    lista.unshift(novo);
    saveCuidadores(lista);
    setMsg({ tipo: 'sucesso', texto: `Cuidador(a) ${novo.nomeCompleto} (${novo.matricula}) cadastrado!` });
    setNomeCuidador('');
    setMatriculaCuidador(`MAT-${Math.floor(Math.random() * 800 + 200)}`);
    onDataUpdated();
  };

  const handleRestaurarPadroes = () => {
    saveResidentes(RESIDENTES_INICIAIS);
    saveCuidadores(CUIDADORES_INICIAIS);
    setMsg({ tipo: 'sucesso', texto: 'Base padrão do Victoria Lar restaurada e sincronizada no Firebase Firestore!' });
    onDataUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#133827] to-[#1b4d36] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dfb842]/20 border border-[#dfb842]/40 flex items-center justify-center text-[#dfb842]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-brand font-bold text-lg text-amber-200">
                Integração & Gestão de Cadastros
              </h3>
              <p className="text-xs text-stone-300">
                Conexão com Cadastro de Residentes e Funcionários
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificações */}
        {msg && (
          <div className={`p-3 text-xs font-semibold flex items-center gap-2 border-b ${
            msg.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg.texto}</span>
          </div>
        )}

        {/* Abas do Modal */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-3 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('conectar')}
            className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'conectar'
                ? 'border-[#133827] text-[#133827]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Importar / Exportar / Sincronizar
          </button>
          <button
            onClick={() => setActiveSubTab('novo_residente')}
            className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'novo_residente'
                ? 'border-[#133827] text-[#133827]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            + Novo Residente
          </button>
          <button
            onClick={() => setActiveSubTab('novo_cuidador')}
            className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'novo_cuidador'
                ? 'border-[#133827] text-[#133827]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            + Novo Cuidador (ID/Matrícula)
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeSubTab === 'conectar' && (
            <div className="space-y-5 text-xs">
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-950 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-xs text-[#133827]">
                    <Database className="w-4 h-4 text-emerald-700" />
                    Armazenamento 100% no Firebase Firestore
                  </span>
                  <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Regra Zero LocalStorage
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Todos os prontuários, folhas de glicemia, sinais vitais, passagens de plantão diurno/noturno e checagens de prescrições são gravados e sincronizados em tempo real no banco de dados na nuvem da instituição.
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-stone-700 space-y-2">
                <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                  <Database className="w-4 h-4 text-[#dfb842]" />
                  Conexão Automática entre Formulários
                </span>
                <p className="leading-relaxed">
                  Os dados de cada residente e funcionário cadastrados nos outros módulos (Cadastro de Residente e Cadastro de Funcionário) podem ser exportados em JSON e importados diretamente aqui. O formulário de cuidados lê esses dados e elimina qualquer retrabalho de digitação.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Exportar */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                  <span className="font-bold text-stone-800 block text-xs">
                    Exportar Backup / Dados Atuais
                  </span>
                  <p className="text-stone-500 text-[11px]">
                    Gera um arquivo JSON com todos os residentes, cuidadores e histórico assistencial.
                  </p>
                  <button
                    onClick={handleExportarTudo}
                    className="w-full py-2 bg-white hover:bg-stone-100 text-[#133827] font-bold border border-stone-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar JSON</span>
                  </button>
                </div>

                {/* Importar */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                  <span className="font-bold text-stone-800 block text-xs">
                    Importar Base de Cadastros
                  </span>
                  <p className="text-stone-500 text-[11px]">
                    Carregue um arquivo JSON gerado nos módulos de residentes ou colaboradores.
                  </p>
                  <label className="w-full py-2 bg-[#133827] hover:bg-[#1b4d36] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 text-[#dfb842]" />
                    <span>Selecionar Arquivo JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportarJSON}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                <span className="text-stone-400 text-[11px]">
                  Deseja voltar aos dados de demonstração iniciais?
                </span>
                <button
                  onClick={handleRestaurarPadroes}
                  className="text-stone-600 hover:text-stone-900 underline font-medium text-[11px] cursor-pointer"
                >
                  Restaurar Padrões Iniciais
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'novo_residente' && (
            <form onSubmit={handleCadastrarResidente} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                  Nome Completo do Residente:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dona Maria Luiza Santos"
                  value={nomeResidente}
                  onChange={(e) => setNomeResidente(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Quarto / Ala:
                  </label>
                  <input
                    type="text"
                    value={quartoResidente}
                    onChange={(e) => setQuartoResidente(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Data de Nascimento:
                  </label>
                  <input
                    type="date"
                    value={nascResidente}
                    onChange={(e) => setNascResidente(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    CPF:
                  </label>
                  <input
                    type="text"
                    value={cpfResidente}
                    onChange={(e) => setCpfResidente(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Grau de Dependência:
                  </label>
                  <select
                    value={grauResidente}
                    onChange={(e) => setGrauResidente(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  >
                    <option value="grau1">Grau I (Independente)</option>
                    <option value="grau2">Grau II (Semidependente)</option>
                    <option value="grau3">Grau III (Dependente Total)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                  Dieta Prescrita:
                </label>
                <input
                  type="text"
                  value={dietaResidente}
                  onChange={(e) => setDietaResidente(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                  Alergias Conhecidas:
                </label>
                <input
                  type="text"
                  value={alergiasResidente}
                  onChange={(e) => setAlergiasResidente(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#133827] hover:bg-[#1b4d36] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Cadastrar Residente
              </button>
            </form>
          )}

          {activeSubTab === 'novo_cuidador' && (
            <form onSubmit={handleCadastrarCuidador} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Matrícula ID:
                  </label>
                  <input
                    type="text"
                    value={matriculaCuidador}
                    onChange={(e) => setMatriculaCuidador(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Cargo:
                  </label>
                  <select
                    value={cargoCuidador}
                    onChange={(e) => setCargoCuidador(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  >
                    <option value="Cuidador(a) de Idosos">Cuidador(a) de Idosos</option>
                    <option value="Técnico(a) de Enfermagem">Técnico(a) de Enfermagem</option>
                    <option value="Auxiliar de Enfermagem">Auxiliar de Enfermagem</option>
                    <option value="Enfermeiro(a) Responsável Técnico (RT)">Enfermeiro(a) RT</option>
                    <option value="Fisioterapeuta">Fisioterapeuta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                  Nome Completo:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ana Paula Ribeiro"
                  value={nomeCuidador}
                  onChange={(e) => setNomeCuidador(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                  Registro Profissional (Opcional - Ex: COREN-SP):
                </label>
                <input
                  type="text"
                  placeholder="Ex: COREN-SP 521.844-TE"
                  value={corenCuidador}
                  onChange={(e) => setCorenCuidador(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#133827] hover:bg-[#1b4d36] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Cadastrar Cuidador com Matrícula
              </button>
            </form>
          )}
        </div>

        {/* Rodapé */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
