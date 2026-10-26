import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Droplet,
  Plus,
  Printer,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResidenteResumo,
  CuidadorFuncionario,
  RegistroGlicemiaSinais
} from '../types/care';
import { getGlicemiaSinais, saveRegistroGlicemiaSinais, subscribeToAllData } from '../lib/storage';

interface GlucoseAndVitalsSheetProps {
  residente: ResidenteResumo;
  cuidadorAtivo: CuidadorFuncionario | null;
  dataHojeStr: string;
  dataHojeFormatada: string;
}

export const GlucoseAndVitalsSheet: React.FC<GlucoseAndVitalsSheetProps> = ({
  residente,
  cuidadorAtivo,
  dataHojeStr,
  dataHojeFormatada
}) => {
  const agoraHora = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

  const [registros, setRegistros] = useState<RegistroGlicemiaSinais[]>([]);
  const [data] = useState<string>(dataHojeStr); // Data automática do dia!
  const [horario, setHorario] = useState<string>(agoraHora);
  const [momento, setMomento] = useState<'05:00' | '11:30' | '17:00' | '21:00' | 'jejum' | 'pos_prandial' | 'outro'>('17:00');
  const [glicemia, setGlicemia] = useState<string>('');
  const [pa, setPa] = useState<string>('120x80');
  const [fc, setFc] = useState<string>('76');
  const [satO2, setSatO2] = useState<string>('97');
  const [temp, setTemp] = useState<string>('36.5');
  const [observacoes, setObservacoes] = useState<string>('');
  const [sucesso, setSucesso] = useState<string>('');
  const [erro, setErro] = useState<string>('');

  useEffect(() => {
    setRegistros(getGlicemiaSinais(residente.id));
    const unsub = subscribeToAllData(() => {
      setRegistros(getGlicemiaSinais(residente.id));
    });
    return () => unsub();
  }, [residente.id]);

  const classificarGlicemia = (valor?: number) => {
    if (!valor) return null;
    if (valor < 70) {
      return { rotulo: 'Hipoglicemia (< 70)', classe: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
    if (valor <= 125) {
      return { rotulo: 'Glicemia Adequada', classe: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
    if (valor <= 180) {
      return { rotulo: 'Moderada / Pós-refeição', classe: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
    return { rotulo: 'Hiperglicemia (> 180)', classe: 'bg-red-100 text-red-900 border-red-400 font-bold' };
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuidadorAtivo) {
      setErro('Identifique o cuidador por matrícula antes de registrar a aferição.');
      setTimeout(() => setErro(''), 4000);
      return;
    }
    if (!glicemia && !pa && !fc) {
      setErro('Preencha ao menos a glicemia ou os sinais vitais.');
      setTimeout(() => setErro(''), 4000);
      return;
    }
    setErro('');

    const novo: RegistroGlicemiaSinais = {
      id: `gs-${Date.now()}`,
      residenteId: residente.id,
      data,
      horario,
      tipo: glicemia && pa ? 'ambos' : glicemia ? 'glicemia' : 'sinais_vitais',
      glicemia: glicemia ? Number(glicemia) : undefined,
      momento,
      pressaoArterial: pa || undefined,
      freqCardiaca: fc ? Number(fc) : undefined,
      saturacaoO2: satO2 ? Number(satO2) : undefined,
      temperatura: temp ? Number(temp) : undefined,
      cuidadorMatricula: cuidadorAtivo.matricula,
      cuidadorNome: cuidadorAtivo.nomeCompleto,
      observacoes: observacoes || undefined,
      criadoEm: new Date().toISOString()
    };

    saveRegistroGlicemiaSinais(novo);
    setRegistros(getGlicemiaSinais(residente.id));
    setSucesso('Aferição registrada e assinada digitalmente com sucesso!');
    setGlicemia('');
    setObservacoes('');

    setTimeout(() => setSucesso(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Nova Aferição */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <span className="text-[11px] font-bold text-[#dfb842] uppercase tracking-wider">
              Folha de Glicemia & Sinais Vitais • Conforme Documento Institucional
            </span>
            <h3 className="font-serif-brand font-bold text-lg text-stone-900">
              Nova Aferição para {residente.nomeCompleto}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-300 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Folha Oficial</span>
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
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSalvar} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">
                Data do Cuidado:
              </label>
              <div className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-medium flex items-center justify-between">
                <span>{dataHojeFormatada}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  Hoje
                </span>
              </div>
            </div>

            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">
                Horário da Aferição:
              </label>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">
                Momento / Turno:
              </label>
              <select
                value={momento}
                onChange={(e) => setMomento(e.target.value as any)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 font-medium"
              >
                <option value="05:00">05:00H (Madrugada / Jejum)</option>
                <option value="11:30">11:30H (Pré-Almoço)</option>
                <option value="17:00">17:00H (Pré-Jantar)</option>
                <option value="21:00">21:00H (Ceia / Noturno)</option>
                <option value="jejum">Jejum matinal</option>
                <option value="pos_prandial">Pós-prandial</option>
                <option value="outro">Outro horário / S/N</option>
              </select>
            </div>

            <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-300">
              <label className="block text-amber-900 font-bold uppercase text-[10px] mb-1 flex items-center gap-1">
                <Droplet className="w-3 h-3 text-amber-600" />
                Glicemia (mg/dL):
              </label>
              <input
                type="number"
                placeholder="Ex: 110"
                value={glicemia}
                onChange={(e) => setGlicemia(e.target.value)}
                className="w-full bg-white border border-amber-400 rounded-lg px-2.5 py-1 text-base font-bold font-mono text-center text-amber-950"
              />
            </div>
          </div>

          {/* Sinais Vitais Complementares */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">
                PA (mmHg):
              </label>
              <input
                type="text"
                placeholder="Ex: 120x80"
                value={pa}
                onChange={(e) => setPa(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 text-center font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">
                Freq. Cardíaca (bpm):
              </label>
              <input
                type="number"
                placeholder="75"
                value={fc}
                onChange={(e) => setFc(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 text-center font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">
                Sat O₂ (%):
              </label>
              <input
                type="number"
                placeholder="97"
                value={satO2}
                onChange={(e) => setSatO2(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 text-center font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">
                Temperatura (°C):
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="36.5"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 text-center font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-600 font-bold uppercase text-[10px] mb-1">
              Observações Clínicas / Conduta (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ex: Administrada insulina conforme prescrição médica, paciente assintomática."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-stone-500 text-xs flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Assinatura automática: <strong className="text-stone-800">{cuidadorAtivo?.nomeCompleto}</strong> (ID: {cuidadorAtivo?.matricula})
              </span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#133827] hover:bg-[#1b4d36] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#dfb842]" />
              <span>Registrar & Assinar Aferição</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabela Oficial de Glicemia e Sinais Vitais (Conforme o PDF de papel da Casa de Repouso) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4 print-card">
        {/* Cabeçalho de Impressão Oficial */}
        <div className="hidden print:block text-center border-b-2 border-stone-800 pb-3 mb-4">
          <h2 className="font-serif-brand font-bold text-xl uppercase">
            Victoria Lar Residencial
          </h2>
          <p className="text-xs text-stone-600">
            FOLHA INSTITUCIONAL DE CONTROLE DE GLICEMIA E SINAIS VITAIS
          </p>
          <div className="mt-2 text-xs font-bold">
            PACIENTE: {residente.nomeCompleto.toUpperCase()} • QUARTO: {residente.quarto} • DATA NASC: {residente.dataNascimento}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#133827]" />
            <h4 className="font-serif-brand font-bold text-stone-900 text-sm">
              Histórico Cronológico de Glicemia & Sinais Vitais
            </h4>
          </div>
          <span className="text-xs text-stone-500">
            Total de {registros.length} aferições registradas
          </span>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 text-[11px] uppercase">
                <th className="p-3">Data & Hora</th>
                <th className="p-3">Momento</th>
                <th className="p-3 text-center">Glicemia (mg/dL)</th>
                <th className="p-3 text-center">PA (mmHg)</th>
                <th className="p-3 text-center">FC (bpm)</th>
                <th className="p-3 text-center">Sat O₂ / Temp</th>
                <th className="p-3">Profissional / Matrícula</th>
                <th className="p-3">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {registros.map((r) => {
                const classeGlic = classificarGlicemia(r.glicemia);
                return (
                  <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3 font-semibold text-stone-900 whitespace-nowrap">
                      {r.data} <span className="text-stone-400 font-mono text-[11px]">{r.horario}</span>
                    </td>
                    <td className="p-3 uppercase text-[11px] text-stone-600 whitespace-nowrap font-medium">
                      {r.momento}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {r.glicemia ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="font-mono font-bold text-sm text-stone-900">
                            {r.glicemia}
                          </span>
                          {classeGlic && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${classeGlic.classe}`}>
                              {classeGlic.rotulo}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-stone-800 whitespace-nowrap">
                      {r.pressaoArterial || '-'}
                    </td>
                    <td className="p-3 text-center font-mono text-stone-800 whitespace-nowrap">
                      {r.freqCardiaca ? `${r.freqCardiaca} bpm` : '-'}
                    </td>
                    <td className="p-3 text-center text-stone-700 whitespace-nowrap">
                      {r.saturacaoO2 && <span className="font-mono">{r.saturacaoO2}%</span>}
                      {r.temperatura && <span className="text-stone-400 ml-1">({r.temperatura}°C)</span>}
                      {!r.saturacaoO2 && !r.temperatura && '-'}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-bold text-stone-900 leading-tight">
                        {r.cuidadorNome}
                      </div>
                      <div className="text-[10px] font-mono text-stone-500">
                        ID: {r.cuidadorMatricula}
                      </div>
                    </td>
                    <td className="p-3 text-stone-600 text-[11px] max-w-xs truncate">
                      {r.observacoes || 'Sem anotações complementares'}
                    </td>
                  </tr>
                );
              })}

              {registros.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-stone-400">
                    Nenhum registro de glicemia ou sinais vitais para este residente ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
