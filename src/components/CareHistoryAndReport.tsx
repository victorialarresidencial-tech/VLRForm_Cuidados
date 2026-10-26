import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Sun,
  Moon,
  Clock,
  HeartPulse,
  Utensils,
  Droplet,
  ShieldAlert,
  UserCheck,
  AlertTriangle,
  ChevronDown,
  Search,
  Filter,
  CheckCircle2,
  Share2
} from 'lucide-react';
import {
  ResidenteResumo,
  AnotacaoDiariaPlantao,
  CuidadorFuncionario
} from '../types/care';

interface CareHistoryAndReportProps {
  residente: ResidenteResumo;
  anotacoes: AnotacaoDiariaPlantao[];
  onEditarAnotacao?: (anotacao: AnotacaoDiariaPlantao) => void;
}

export const CareHistoryAndReport: React.FC<CareHistoryAndReportProps> = ({
  residente,
  anotacoes,
  onEditarAnotacao
}) => {
  const [filtroTurno, setFiltroTurno] = useState<string>('todos');
  const [buscaTermo, setBuscaTermo] = useState<string>('');
  const [itemExpandido, setItemExpandido] = useState<string | null>(null);

  const anotacoesFiltradas = anotacoes.filter((a) => {
    const matchesTurno = filtroTurno === 'todos' || a.turno === filtroTurno;
    const matchesBusca =
      a.data.includes(buscaTermo) ||
      a.cuidadorNome.toLowerCase().includes(buscaTermo.toLowerCase()) ||
      a.cuidadorMatricula.toLowerCase().includes(buscaTermo.toLowerCase()) ||
      (a.passagemPlantao.anotacoesGerais || '').toLowerCase().includes(buscaTermo.toLowerCase());
    return matchesTurno && matchesBusca;
  });

  const toggleExpandir = (id: string) => {
    setItemExpandido(itemExpandido === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros do Prontuário */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <span className="text-[11px] font-bold text-[#dfb842] uppercase tracking-wider">
              Auditoria de Cuidados & Histórico por Residente
            </span>
            <h3 className="font-serif-brand font-bold text-lg text-stone-900">
              Prontuário Assistencial de {residente.nomeCompleto}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Busca por cuidador, data ou anotação */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cuidador, ID, data..."
                value={buscaTermo}
                onChange={(e) => setBuscaTermo(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            {/* Filtro de Turno */}
            <select
              value={filtroTurno}
              onChange={(e) => setFiltroTurno(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5"
            >
              <option value="todos">Todos os Turnos</option>
              <option value="diurno">Plantão Diurno (06h-18h)</option>
              <option value="noturno">Plantão Noturno (18h-06h)</option>
            </select>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 bg-[#133827] hover:bg-[#1b4d36] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#dfb842]" />
              <span>Imprimir Ficha Completa</span>
            </button>
          </div>
        </div>

        <div className="pt-3 text-xs text-stone-500 flex items-center justify-between">
          <span>
            Mostrando {anotacoesFiltradas.length} registro(s) de plantão
          </span>
          <span className="text-[11px] text-emerald-800 font-medium">
            Rastreabilidade total: Cuidador identificado por Matrícula e Carimbo
          </span>
        </div>
      </div>

      {/* CABEÇALHO PARA IMPRESSÃO (Visível apenas ao imprimir) */}
      <div className="hidden print:block border-b-2 border-stone-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-serif-brand font-bold text-2xl uppercase tracking-wide">
              Victoria Lar Residencial
            </h1>
            <p className="text-xs text-stone-600">
              PRONTUÁRIO & RELATÓRIO OFICIAL DE CONTROLE DE CUIDADOS ASSISTENCIAIS
            </p>
          </div>
          <div className="text-right text-xs">
            <div>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
            <div className="font-mono text-stone-500">Controle Institucional</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-stone-100 rounded-lg text-xs grid grid-cols-3 gap-2 border border-stone-300">
          <div><strong>Paciente:</strong> {residente.nomeCompleto}</div>
          <div><strong>Quarto / Ala:</strong> {residente.quarto}</div>
          <div><strong>Data Nasc.:</strong> {residente.dataNascimento} ({residente.idade} anos)</div>
          <div><strong>CPF:</strong> {residente.cpf}</div>
          <div><strong>Grau Dependência:</strong> {residente.grauDependencia.toUpperCase()}</div>
          <div><strong>Dieta:</strong> {residente.dieta}</div>
          <div className="col-span-3 text-rose-800">
            <strong>Alergias Documentadas:</strong> {residente.alergias.join(', ')}
          </div>
        </div>
      </div>

      {/* Lista de Registros de Plantão */}
      <div className="space-y-4">
        {anotacoesFiltradas.map((item) => {
          const isExpandido = itemExpandido === item.id;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden transition-all print-card"
            >
              {/* Topo do Card de Plantão */}
              <div
                onClick={() => toggleExpandir(item.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-stone-50 to-white border-b border-stone-100 cursor-pointer hover:bg-stone-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    item.turno === 'diurno'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-[#133827] text-[#dfb842] border border-[#dfb842]/30'
                  }`}>
                    {item.turno === 'diurno' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif-brand font-bold text-stone-900 text-sm sm:text-base">
                        Plantão {item.turno === 'diurno' ? 'Diurno (06h - 18h)' : 'Noturno (18h - 06h)'}
                      </span>
                      <span className="bg-stone-200/80 text-stone-700 font-mono text-xs px-2 py-0.5 rounded font-semibold">
                        {item.data}
                      </span>
                      {item.passagemPlantao.status === 'com_intercorrencia' && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Intercorrência
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Cuidador(a): <strong className="text-stone-800">{item.cuidadorNome}</strong></span>
                      <span className="bg-stone-100 text-stone-700 font-mono px-1.5 py-0.2 rounded border text-[10px]">
                        ID: {item.cuidadorMatricula}
                      </span>
                      {item.cuidadorCargo && <span className="hidden md:inline text-stone-400">• {item.cuidadorCargo}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {onEditarAnotacao && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditarAnotacao(item);
                      }}
                      className="text-xs text-[#133827] font-semibold hover:underline bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg border border-stone-300 no-print"
                    >
                      Editar Anotação
                    </button>
                  )}
                  <button
                    type="button"
                    className="text-stone-400 hover:text-stone-600 p-1 no-print"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform ${isExpandido ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Resumo de Destaques Rápidos (Sinais vitais & Hidratação) */}
              <div className="px-5 py-3 bg-stone-50/50 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>PA: <strong>{item.sinaisVitais.paSistolica || '-'}/{item.sinaisVitais.paDiastolica || '-'} mmHg</strong></span>
                  <span>FC: <strong>{item.sinaisVitais.freqCardiaca || '-'} bpm</strong></span>
                  <span>Temp: <strong>{item.sinaisVitais.temperatura || '-'} °C</strong></span>
                  <span>SatO₂: <strong>{item.sinaisVitais.saturacaoO2 || '-'} %</strong></span>
                  {item.sinaisVitais.glicemia && (
                    <span className="text-amber-800 font-bold bg-amber-100/80 px-2 py-0.5 rounded">
                      Glicemia: {item.sinaisVitais.glicemia} mg/dL ({item.sinaisVitais.horarioGlicemia || '07h'})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-stone-600">
                  <Droplet className="w-3.5 h-3.5 text-blue-500" />
                  <span>Água: <strong>{item.alimentacao.volumeHidricoMl || 0} mL</strong></span>
                  <span>• Pele: <strong className="capitalize">{item.peleCurativos.integridadeCutanea.replace('_', ' ')}</strong></span>
                </div>
              </div>

              {/* Corpo Detalhado do Relatório */}
              <div className={`p-5 space-y-4 text-xs ${isExpandido ? 'block' : 'hidden print:block'}`}>
                {/* Grade de 4 Colunas com os Blocos do Formulário */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Recebimento */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                    <span className="font-bold text-stone-800 uppercase text-[10px] block">
                      Recebimento do Plantão:
                    </span>
                    <div><strong>Estado:</strong> <span className="capitalize">{item.recebimentoPlantao.estado}</span></div>
                    <div><strong>Consciência:</strong> <span className="capitalize">{item.recebimentoPlantao.nivelConsciencia}</span></div>
                    <div><strong>Locomoção:</strong> <span className="capitalize">{item.recebimentoPlantao.locomocao.replace('_', ' ')}</span></div>
                  </div>

                  {/* Alimentação */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                    <span className="font-bold text-stone-800 uppercase text-[10px] block">
                      Aceitação Alimentar (Via {item.alimentacao.via.toUpperCase()}):
                    </span>
                    <div>Desjejum: <strong className="capitalize">{item.alimentacao.desjejum || '-'}</strong></div>
                    <div>Almoço: <strong className="capitalize">{item.alimentacao.almoco || '-'}</strong></div>
                    <div>Jantar: <strong className="capitalize">{item.alimentacao.jantar || '-'}</strong></div>
                    {item.turno === 'noturno' && <div>Ceia: <strong className="capitalize">{item.alimentacao.ceia || '-'}</strong></div>}
                  </div>

                  {/* Pele e Curativos */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                    <span className="font-bold text-stone-800 uppercase text-[10px] block">
                      Pele & Edema:
                    </span>
                    <div>Integridade: <strong className="capitalize">{item.peleCurativos.integridadeCutanea}</strong></div>
                    <div>Curativo: <strong>{item.peleCurativos.realizadoCurativo ? 'Sim' : 'Não'}</strong> {item.peleCurativos.regiaoCurativo && `(${item.peleCurativos.regiaoCurativo})`}</div>
                    <div>Edema: <strong className="uppercase">{item.peleCurativos.edema}</strong> {item.peleCurativos.grauEdema && `[${item.peleCurativos.grauEdema}]`}</div>
                  </div>

                  {/* Eliminações */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                    <span className="font-bold text-stone-800 uppercase text-[10px] block">
                      Eliminações:
                    </span>
                    <div>Diurese: <strong>{item.eliminacoes.diuresePresenca ? 'Presente' : 'Ausente'}</strong></div>
                    <div className="text-[11px] text-stone-500 truncate">{item.eliminacoes.diureseAspecto}</div>
                    <div>Evacuação: <strong>{item.eliminacoes.evacuacaoPresenca ? 'Presente' : 'Ausente'}</strong></div>
                    <div className="text-[11px] text-stone-500 truncate">{item.eliminacoes.evacuacaoAspecto}</div>
                  </div>
                </div>

                {/* Passagem de Plantão e Anotações Gerais */}
                {item.passagemPlantao.relatoIntercorrencia && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                    <strong className="block text-[11px] uppercase">Intercorrência Registrada:</strong>
                    <p className="mt-0.5">{item.passagemPlantao.relatoIntercorrencia}</p>
                  </div>
                )}

                {item.passagemPlantao.anotacoesGerais && (
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-stone-800">
                    <strong className="block text-[11px] text-stone-600 uppercase mb-1">
                      Anotações Circunstanciadas do Cuidador:
                    </strong>
                    <p className="leading-relaxed">{item.passagemPlantao.anotacoesGerais}</p>
                  </div>
                )}

                {/* Carimbo Digital */}
                <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between text-stone-500 text-[11px]">
                  <span>
                    Responsável pelo Cuidado: <strong>{item.cuidadorNome}</strong> (Matrícula: {item.cuidadorMatricula})
                  </span>
                  <span>
                    Registrado em: {new Date(item.criadoEm).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {anotacoesFiltradas.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-stone-700">Nenhuma anotação localizada.</p>
            <p className="text-xs">Utilize o formulário de Anotação Diária para registrar os cuidados do plantão.</p>
          </div>
        )}
      </div>
    </div>
  );
};
