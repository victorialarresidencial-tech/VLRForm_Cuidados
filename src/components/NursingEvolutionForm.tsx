import React, { useState, useEffect } from 'react';
import {
  FileText,
  UserCheck,
  CheckCircle2,
  Printer,
  Shield,
  Stethoscope,
  Plus,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  ResidenteResumo,
  CuidadorFuncionario,
  EvolucaoEnfermagem
} from '../types/care';
import { getEvolucoes, saveEvolucao, subscribeToAllData } from '../lib/storage';

interface NursingEvolutionFormProps {
  residente: ResidenteResumo;
  cuidadorAtivo: CuidadorFuncionario | null;
  dataHojeStr: string;
  dataHojeFormatada: string;
}

const DIAGNOSTICOS_SAE_PADRAO = [
  'Risco de glicemia instável',
  'Risco de lesão por pressão',
  'Risco de queda',
  'Mobilidade física prejudicada',
  'Deambulação prejudicada',
  'Déficit do auto cuidado para banho',
  'Déficit do auto cuidado para alimentação',
  'Deglutição prejudicada',
  'Constipação',
  'Eliminação urinária prejudicada',
  'Incontinência intestinal',
  'Integridade da pele prejudicada',
  'Confusão crônica',
  'Confusão aguda',
  'Memória prejudicada',
  'Insônia',
  'Interação social prejudicada',
  'Síndrome do idoso frágil',
  'Risco para aspiração',
  'Dor crônica',
  'Padrão respiratório ineficaz'
];

export const NursingEvolutionForm: React.FC<NursingEvolutionFormProps> = ({
  residente,
  cuidadorAtivo,
  dataHojeStr,
  dataHojeFormatada
}) => {
  const agoraHora = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

  const [evolucoes, setEvolucoes] = useState<EvolucaoEnfermagem[]>([]);
  const [data] = useState<string>(dataHojeStr);
  const [hora, setHora] = useState<string>(agoraHora);

  // Estado Geral
  const [estadoGeral, setEstadoGeral] = useState<'bom' | 'regular' | 'ruim'>('bom');
  const [pa, setPa] = useState<string>('120x80');
  const [fc, setFc] = useState<string>('74');
  const [temp, setTemp] = useState<string>('36.5');
  const [spo2, setSpo2] = useState<string>('97');

  // Condições Gerais
  const [lucida, setLucida] = useState<boolean>(true);
  const [orientada, setOrientada] = useState<boolean>(true);
  const [confusa, setConfusa] = useState<boolean>(false);
  const [desorientada, setDesorientada] = useState<boolean>(false);
  const [mobilidadePreservada, setMobilidadePreservada] = useState<boolean>(false);
  const [mobilidadeReduzida, setMobilidadeReduzida] = useState<boolean>(true);
  const [acamada, setAcamada] = useState<boolean>(false);
  const [alimentacaoBoa, setAlimentacaoBoa] = useState<boolean>(true);
  const [alimentacaoRegular, setAlimentacaoRegular] = useState<boolean>(false);
  const [alimentacaoRuim, setAlimentacaoRuim] = useState<boolean>(false);
  const [hidratacaoAdequada, setHidratacaoAdequada] = useState<boolean>(true);
  const [peleIntegra, setPeleIntegra] = useState<boolean>(true);
  const [peleComLesao, setPeleComLesao] = useState<boolean>(false);
  const [usoFralda, setUsoFralda] = useState<boolean>(true);
  const [familiarInformado, setFamiliarInformado] = useState<boolean>(true);

  // Diagnósticos Selecionados
  const [diagnosticosSelecionados, setDiagnosticosSelecionados] = useState<string[]>([
    'Risco de glicemia instável',
    'Risco de queda',
    'Mobilidade física prejudicada'
  ]);

  // Relato Livre
  const [relato, setRelato] = useState<string>(
    `Paciente idosa, residente na instituição, estado geral bom, lúcida e orientada no tempo e espaço. Deambulando com auxílio. Alimentação com boa aceitação, sem queixas de náuseas. Hidratação supervisionada satisfatória. Eliminações fisiológicas presentes em uso de fralda descartável. Pele íntegra sem hiperemias. Segue em acompanhamento diário com sinais vitais e glicemia capilar controlados.`
  );
  const [conduta, setConduta] = useState<string>(
    'Manter cuidados de enfermagem vigentes, rotina de hidratação ofertada frequentemente, auxílio durante transferências para prevenção de quedas.'
  );

  const [sucesso, setSucesso] = useState<string>('');
  const [erro, setErro] = useState<string>('');

  useEffect(() => {
    setEvolucoes(getEvolucoes(residente.id));
    const unsub = subscribeToAllData(() => {
      setEvolucoes(getEvolucoes(residente.id));
    });
    return () => unsub();
  }, [residente.id]);

  const toggleDiagnostico = (diag: string) => {
    if (diagnosticosSelecionados.includes(diag)) {
      setDiagnosticosSelecionados(diagnosticosSelecionados.filter(d => d !== diag));
    } else {
      setDiagnosticosSelecionados([...diagnosticosSelecionados, diag]);
    }
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuidadorAtivo) {
      setErro('Identifique o profissional por matrícula na barra superior antes de assinar a evolução.');
      setTimeout(() => setErro(''), 4000);
      return;
    }
    setErro('');

    const nova: EvolucaoEnfermagem = {
      id: `evo-${Date.now()}`,
      residenteId: residente.id,
      data,
      hora,
      cuidadorMatricula: cuidadorAtivo.matricula,
      cuidadorNome: cuidadorAtivo.nomeCompleto,
      cuidadorCargo: cuidadorAtivo.cargo,
      cuidadorRegistro: cuidadorAtivo.registroProfissional,
      estadoGeral,
      sinaisVitais: {
        pa,
        fc,
        temp,
        spo2
      },
      condicoesGerais: {
        lucida,
        orientada,
        confusa,
        desorientada,
        mobilidadePreservada,
        mobilidadeReduzida,
        acamada,
        alimentacaoBoa,
        alimentacaoRegular,
        alimentacaoRuim,
        hidratacaoAdequada,
        peleIntegra,
        peleComLesao,
        usoFralda
      },
      diagnosticosEnfermagem: diagnosticosSelecionados,
      relatoEvolucao: relato,
      condutaEEncaminhamentos: conduta,
      familiarInformado,
      criadoEm: new Date().toISOString()
    };

    saveEvolucao(nova);
    setEvolucoes(getEvolucoes(residente.id));
    setSucesso('Evolução de enfermagem registrada e assinada digitalmente!');
    setTimeout(() => setSucesso(''), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Registro de Evolução */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <span className="text-[11px] font-bold text-[#dfb842] uppercase tracking-wider">
              Sistematização da Assistência de Enfermagem (SAE) • Conforme Página 4 do Documento
            </span>
            <h3 className="font-serif-brand font-bold text-lg text-stone-900">
              Evolução Multidisciplinar & Cuidados Clínicos
            </h3>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-300 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Evolução</span>
          </button>
        </div>

        {sucesso && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{sucesso}</span>
          </div>
        )}

        {erro && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSalvar} className="space-y-5 text-xs">
          {/* Linha de Data, Hora e Estado Geral */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">
                Data do Cuidado:
              </label>
              <div className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 font-bold text-stone-800 flex items-center justify-between">
                <span>{dataHojeFormatada}</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono">
                  Hoje
                </span>
              </div>
            </div>

            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">
                Hora:
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">
                Estado Geral do Residente:
              </label>
              <div className="flex gap-2">
                {[
                  { v: 'bom', l: 'Bom', c: 'bg-emerald-700' },
                  { v: 'regular', l: 'Regular', c: 'bg-amber-600' },
                  { v: 'ruim', l: 'Ruim', c: 'bg-rose-700' }
                ].map((st) => (
                  <button
                    key={st.v}
                    type="button"
                    onClick={() => setEstadoGeral(st.v as any)}
                    className={`flex-1 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                      estadoGeral === st.v
                        ? `${st.c} text-white border-transparent shadow-2xs`
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    ( {estadoGeral === st.v ? '✓' : ' '} ) {st.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sinais Vitais no Momento da Evolução */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">PA:</label>
              <input
                type="text"
                placeholder="120x80"
                value={pa}
                onChange={(e) => setPa(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 text-center font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">FC (bpm):</label>
              <input
                type="text"
                placeholder="74"
                value={fc}
                onChange={(e) => setFc(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 text-center font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">Temp (°C):</label>
              <input
                type="text"
                placeholder="36.5"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 text-center font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">SpO₂ (%):</label>
              <input
                type="text"
                placeholder="97"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 text-center font-mono font-bold"
              />
            </div>
          </div>

          {/* Checkboxes de Parâmetros Clínicos Oficiais (Página 4 do PDF) */}
          <div className="space-y-2">
            <span className="font-bold text-stone-700 block uppercase tracking-wider text-[11px]">
              Avaliação Física & Condições Gerais Observadas:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lucida}
                  onChange={(e) => setLucida(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Lúcida</span>
              </label>
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={orientada}
                  onChange={(e) => setOrientada(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Orientada</span>
              </label>
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confusa}
                  onChange={(e) => setConfusa(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Confusa</span>
              </label>
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={desorientada}
                  onChange={(e) => setDesorientada(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Desorientada</span>
              </label>
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mobilidadePreservada}
                  onChange={(e) => setMobilidadePreservada(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Mob. Preservada</span>
              </label>
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mobilidadeReduzida}
                  onChange={(e) => setMobilidadeReduzida(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Mob. Reduzida</span>
              </label>
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acamada}
                  onChange={(e) => setAcamada(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Acamada</span>
              </label>
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alimentacaoBoa}
                  onChange={(e) => setAlimentacaoBoa(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Boa Aceitação Dieta</span>
              </label>
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={peleIntegra}
                  onChange={(e) => setPeleIntegra(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Pele Íntegra</span>
              </label>
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={peleComLesao}
                  onChange={(e) => setPeleComLesao(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Lesão em Tratamento</span>
              </label>
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usoFralda}
                  onChange={(e) => setUsoFralda(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Uso de Fralda</span>
              </label>
              <label className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={familiarInformado}
                  onChange={(e) => setFamiliarInformado(e.target.checked)}
                  className="rounded text-[#133827]"
                />
                <span className="font-medium text-stone-800">Familiar Informado</span>
              </label>
            </div>
          </div>

          {/* Diagnósticos de Enfermagem (Tag selector) */}
          <div className="space-y-2">
            <span className="font-bold text-stone-700 block uppercase tracking-wider text-[11px]">
              Diagnósticos de Enfermagem Aplicáveis ao Residente:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
              {DIAGNOSTICOS_SAE_PADRAO.map((diag) => {
                const ativo = diagnosticosSelecionados.includes(diag);
                return (
                  <button
                    key={diag}
                    type="button"
                    onClick={() => toggleDiagnostico(diag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                      ativo
                        ? 'bg-[#133827] text-white border-[#133827] shadow-2xs font-semibold'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {ativo ? '✓ ' : '+ '} {diag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Relato e Conduta */}
          <div className="space-y-3">
            <div>
              <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                Relato Descritivo da Evolução de Enfermagem:
              </label>
              <textarea
                rows={4}
                value={relato}
                onChange={(e) => setRelato(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 leading-relaxed focus:ring-2 focus:ring-[#133827]"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                Conduta e Encaminhamentos:
              </label>
              <textarea
                rows={2}
                value={conduta}
                onChange={(e) => setConduta(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 leading-relaxed focus:ring-2 focus:ring-[#133827]"
              />
            </div>
          </div>

          {/* Rodapé e Carimbo */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-stone-500 text-xs flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Assinatura: <strong className="text-stone-800">{cuidadorAtivo?.nomeCompleto}</strong> (ID: {cuidadorAtivo?.matricula} • {cuidadorAtivo?.cargo})
              </span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#133827] hover:bg-[#1b4d36] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#dfb842]" />
              <span>Salvar Evolução com Carimbo</span>
            </button>
          </div>
        </form>
      </div>

      {/* Histórico das Evoluções Anteriores */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4 print-card">
        <h4 className="font-serif-brand font-bold text-stone-900 text-sm">
          Evoluções Anteriores Registradas para {residente.nomeCompleto}
        </h4>

        <div className="space-y-4">
          {evolucoes.map((evo) => (
            <div
              key={evo.id}
              className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">
                    {evo.data} às {evo.hora}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    evo.estadoGeral === 'bom'
                      ? 'bg-emerald-100 text-emerald-800'
                      : evo.estadoGeral === 'regular'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    Estado Geral {evo.estadoGeral}
                  </span>
                </div>

                <div className="font-mono text-stone-600 text-[11px]">
                  Assinado por: <strong className="text-stone-800">{evo.cuidadorNome}</strong> (Matrícula: {evo.cuidadorMatricula})
                </div>
              </div>

              {evo.sinaisVitais && (
                <div className="flex flex-wrap gap-4 text-xs font-mono bg-white p-2 rounded-lg border border-stone-200">
                  <span>PA: <strong>{evo.sinaisVitais.pa}</strong></span>
                  <span>FC: <strong>{evo.sinaisVitais.fc}</strong></span>
                  <span>Temp: <strong>{evo.sinaisVitais.temp}</strong></span>
                  <span>SpO₂: <strong>{evo.sinaisVitais.spo2}</strong></span>
                </div>
              )}

              <p className="text-xs text-stone-800 leading-relaxed">
                {evo.relatoEvolucao}
              </p>

              {evo.condutaEEncaminhamentos && (
                <div className="text-xs bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-amber-900">
                  <strong>Conduta:</strong> {evo.condutaEEncaminhamentos}
                </div>
              )}

              {evo.diagnosticosEnfermagem.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {evo.diagnosticosEnfermagem.map((d, i) => (
                    <span
                      key={i}
                      className="bg-stone-200/80 text-stone-700 text-[10px] px-2 py-0.5 rounded"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {evolucoes.length === 0 && (
            <p className="text-center text-stone-400 py-6 text-xs">
              Nenhuma evolução cadastrada para este residente ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
