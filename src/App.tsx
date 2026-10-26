import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CalendarCheck,
  Activity,
  FileText,
  History,
  Database,
  Printer,
  Sparkles,
  ShieldCheck,
  Building2,
  HeartHandshake,
  UserCheck,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { VictoriaLogo } from './components/VictoriaLogo';
import { CaregiverBadgeBar } from './components/CaregiverBadgeBar';
import { ResidentSelector } from './components/ResidentSelector';
import { DailyCareNoteForm } from './components/DailyCareNoteForm';
import { PrescriptionCheckGrid } from './components/PrescriptionCheckGrid';
import { GlucoseAndVitalsSheet } from './components/GlucoseAndVitalsSheet';
import { NursingEvolutionForm } from './components/NursingEvolutionForm';
import { CareHistoryAndReport } from './components/CareHistoryAndReport';
import { SyncAndDataModal } from './components/SyncAndDataModal';
import {
  ResidenteResumo,
  CuidadorFuncionario,
  AnotacaoDiariaPlantao
} from './types/care';
import {
  getResidentes,
  getCuidadores,
  getCuidadorAtivo,
  getAnotacoesPlantao,
  subscribeToAllData
} from './lib/storage';

export type MainTabType =
  | 'anotacao_diaria'
  | 'prescricao_grade'
  | 'glicemia_vitais'
  | 'evolucao_enfermagem'
  | 'historico_prontuario';

export default function App() {
  const [residentes, setResidentes] = useState<ResidenteResumo[]>([]);
  const [residenteSelecionado, setResidenteSelecionado] = useState<ResidenteResumo | null>(null);
  const [cuidadorAtivo, setCuidadorAtivo] = useState<CuidadorFuncionario | null>(null);
  const [activeTab, setActiveTab] = useState<MainTabType>('anotacao_diaria');
  const [anotacoes, setAnotacoes] = useState<AnotacaoDiariaPlantao[]>([]);
  const [anotacaoEmEdicao, setAnotacaoEmEdicao] = useState<AnotacaoDiariaPlantao | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Inicialização e sincronização em tempo real 100% Firestore
  useEffect(() => {
    carregarDados();

    const unsubscribe = subscribeToAllData(() => {
      const resList = getResidentes();
      setResidentes(resList);
      setResidenteSelecionado((prev) => {
        if (!prev) {
          const maria = resList.find(r => r.nomeCompleto.includes('Maria Elisabete')) || resList[0];
          return maria || null;
        }
        return resList.find(r => r.id === prev.id) || prev;
      });
      const cuid = getCuidadorAtivo();
      if (cuid) {
        setCuidadorAtivo(cuid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (residenteSelecionado) {
      setAnotacoes(getAnotacoesPlantao(residenteSelecionado.id));
    }
  }, [residenteSelecionado]);

  const carregarDados = () => {
    const resList = getResidentes();
    setResidentes(resList);
    if (resList.length > 0) {
      const maria = resList.find(r => r.nomeCompleto.includes('Maria Elisabete')) || resList[0];
      setResidenteSelecionado(maria);
      setAnotacoes(getAnotacoesPlantao(maria.id));
    }
    const cuid = getCuidadorAtivo();
    setCuidadorAtivo(cuid);
  };

  const handleSelectResidente = (res: ResidenteResumo) => {
    setResidenteSelecionado(res);
    setAnotacoes(getAnotacoesPlantao(res.id));
    setAnotacaoEmEdicao(null);
  };

  const handleCuidadorChange = (cuid: CuidadorFuncionario) => {
    setCuidadorAtivo(cuid);
  };

  // Data do Cuidado Capturada Automaticamente pelo Programa
  const agora = new Date();
  const dataHojeStr = agora.toISOString().split('T')[0];
  const dataHojeFormatada = agora.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const handleSaveAnotacaoSuccess = (novaAnotacao: AnotacaoDiariaPlantao) => {
    if (residenteSelecionado) {
      setAnotacoes(getAnotacoesPlantao(residenteSelecionado.id));
    }
    setAnotacaoEmEdicao(null);
  };

  const handleEditarAnotacao = (anotacao: AnotacaoDiariaPlantao) => {
    setAnotacaoEmEdicao(anotacao);
    setActiveTab('anotacao_diaria');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-stone-800 flex flex-col font-sans selection:bg-[#dfb842]/30 selection:text-[#133827]">
      {/* 1. Barra de Identificação do Cuidador por Matrícula ID (Topmost Bar com Data Automática) */}
      <CaregiverBadgeBar
        cuidadorAtivo={cuidadorAtivo}
        onCuidadorChange={handleCuidadorChange}
        dataHojeFormatada={dataHojeFormatada}
      />

      {/* 2. Cabeçalho Institucional Oficial */}
      <header className="bg-gradient-to-r from-[#133827] via-[#174430] to-[#133827] text-white shadow-lg border-b border-[#dfb842]/40 relative overflow-hidden no-print">
        {/* Detalhes de iluminação sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#dfb842]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <VictoriaLogo size="md" showSubtitle={true} />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setIsDataModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#dfb842]/20 hover:bg-[#dfb842]/30 text-amber-200 border border-[#dfb842]/50 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <Database className="w-3.5 h-3.5 text-[#dfb842]" />
                <span>Integração de Cadastros</span>
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-[#dfb842]" />
                <span>Imprimir Prontuário</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Navegação em Abas Principais de Cuidados */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              {
                id: 'anotacao_diaria',
                label: 'Anotação Diária de Cuidados',
                subtitle: 'Plantão Diurno / Noturno',
                icon: ClipboardCheck
              },
              {
                id: 'prescricao_grade',
                label: 'Grade Diária de Cuidados',
                subtitle: 'Checagem do Dia (M - T - N)',
                icon: CalendarCheck
              },
              {
                id: 'glicemia_vitais',
                label: 'Folha de Glicemia & Sinais Vitais',
                subtitle: 'Aferições & Metas',
                icon: Activity
              },
              {
                id: 'evolucao_enfermagem',
                label: 'Evolução de Enfermagem (SAE)',
                subtitle: 'Relato & Diagnósticos',
                icon: FileText
              },
              {
                id: 'historico_prontuario',
                label: 'Prontuário & Linha do Tempo',
                subtitle: 'Auditoria & Impressão',
                icon: History
              }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MainTabType)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border-t-2 ${
                    isActive
                      ? 'bg-[#f7f6f1] text-[#133827] border-[#dfb842] shadow-sm font-bold'
                      : 'border-transparent text-emerald-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#133827]' : 'text-[#dfb842]'}`} />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className={`text-[10px] font-normal leading-tight ${isActive ? 'text-stone-500' : 'text-emerald-300/70'}`}>
                      {tab.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Seletor & Filtro Inteligente de Residente com dados pré-carregados */}
        <div className="no-print">
          <ResidentSelector
            residentes={residentes}
            residenteSelecionado={residenteSelecionado}
            onSelectResidente={handleSelectResidente}
            onOpenDataModal={() => setIsDataModalOpen(true)}
          />
        </div>

        {/* Conteúdo da Aba Ativa */}
        {residenteSelecionado ? (
          <div>
            {activeTab === 'anotacao_diaria' && (
              <DailyCareNoteForm
                residente={residenteSelecionado}
                cuidadorAtivo={cuidadorAtivo}
                dataHojeStr={dataHojeStr}
                dataHojeFormatada={dataHojeFormatada}
                onSaveSuccess={handleSaveAnotacaoSuccess}
                anotacaoParaEdicao={anotacaoEmEdicao}
              />
            )}

            {activeTab === 'prescricao_grade' && (
              <PrescriptionCheckGrid
                residente={residenteSelecionado}
                cuidadorAtivo={cuidadorAtivo}
                dataHojeStr={dataHojeStr}
                dataHojeFormatada={dataHojeFormatada}
              />
            )}

            {activeTab === 'glicemia_vitais' && (
              <GlucoseAndVitalsSheet
                residente={residenteSelecionado}
                cuidadorAtivo={cuidadorAtivo}
                dataHojeStr={dataHojeStr}
                dataHojeFormatada={dataHojeFormatada}
              />
            )}

            {activeTab === 'evolucao_enfermagem' && (
              <NursingEvolutionForm
                residente={residenteSelecionado}
                cuidadorAtivo={cuidadorAtivo}
                dataHojeStr={dataHojeStr}
                dataHojeFormatada={dataHojeFormatada}
              />
            )}

            {activeTab === 'historico_prontuario' && (
              <CareHistoryAndReport
                residente={residenteSelecionado}
                anotacoes={anotacoes}
                onEditarAnotacao={handleEditarAnotacao}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
            <p className="text-base font-semibold">Nenhum residente selecionado.</p>
            <p className="text-xs mt-1">Selecione um paciente acima para abrir o formulário de cuidados.</p>
          </div>
        )}
      </main>

      {/* Modal de Integração com Outros Formulários (Cadastro de Residentes & Funcionários) */}
      <SyncAndDataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onDataUpdated={carregarDados}
      />

      {/* Rodapé Institucional Oficial */}
      <footer className="bg-[#102c1e] text-stone-300 border-t border-[#dfb842]/40 py-8 px-4 sm:px-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <VictoriaLogo size="sm" showSubtitle={false} />
            <p className="text-xs text-stone-400 max-w-md">
              Sistema Institucional de Controle de Cuidados, Checagem de Prescrições e Acompanhamento Assistencial Diário.
            </p>
          </div>

          <div className="text-xs text-stone-400 space-y-1">
            <div className="font-semibold text-amber-200">
              Victoria Lar Residencial
            </div>
            <div>
              Rua Guaiáuna, 61 – Parque Jaçatuba – Santo André – SP • CEP: 09291-030
            </div>
            <div>
              Telefones: (11) 4975-8822 • (11) 9.7248-9030
            </div>
            <div className="text-[11px] text-emerald-300/80 font-mono pt-1">
              CNPJ: 19.434.978/0001-90
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
          <span>
            © {new Date().getFullYear()} Victoria Lar Residencial. Todos os direitos reservados.
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#dfb842]" />
            Em conformidade com as diretrizes de enfermagem e assistência gerontológica.
          </span>
        </div>
      </footer>
    </div>
  );
}
