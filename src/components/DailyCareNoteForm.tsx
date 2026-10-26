import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Sun,
  Moon,
  HeartPulse,
  Utensils,
  Droplet,
  ShieldAlert,
  FileText,
  Save,
  Printer,
  CheckCircle2,
  Clock,
  UserCheck,
  Plus
} from 'lucide-react';
import {
  ResidenteResumo,
  CuidadorFuncionario,
  AnotacaoDiariaPlantao,
  TurnoPlantao
} from '../types/care';
import { saveAnotacaoPlantao } from '../lib/storage';

interface DailyCareNoteFormProps {
  residente: ResidenteResumo;
  cuidadorAtivo: CuidadorFuncionario | null;
  dataHojeStr: string; // YYYY-MM-DD
  dataHojeFormatada: string;
  onSaveSuccess: (anotacao: AnotacaoDiariaPlantao) => void;
  anotacaoParaEdicao?: AnotacaoDiariaPlantao | null;
}

export const DailyCareNoteForm: React.FC<DailyCareNoteFormProps> = ({
  residente,
  cuidadorAtivo,
  dataHojeStr,
  dataHojeFormatada,
  onSaveSuccess,
  anotacaoParaEdicao
}) => {
  // Detecta turno sugerido com base no horário atual
  const horaAtual = new Date().getHours();
  const turnoInicial: TurnoPlantao = horaAtual >= 6 && horaAtual < 18 ? 'diurno' : 'noturno';

  const [turno, setTurno] = useState<TurnoPlantao>(turnoInicial);

  // 1. Recebimento de plantão
  const [estadoRecebimento, setEstadoRecebimento] = useState<'acordado' | 'dormindo' | 'leito' | 'sala_tv' | 'deambulando' | 'ausente'>('acordado');
  const [nivelConsciencia, setNivelConsciencia] = useState<'calma' | 'comunicativa' | 'orientada' | 'agitada' | 'agressiva' | 'confusa' | 'sonolenta'>('orientada');
  const [locomocao, setLocomocao] = useState<'acamada' | 'cadeirante' | 'deambulando_auxilio' | 'deambulando_sem_auxilio'>('deambulando_auxilio');

  // 2. Sinais Vitais
  const [paSistolica, setPaSistolica] = useState<string>('120');
  const [paDiastolica, setPaDiastolica] = useState<string>('80');
  const [freqCardiaca, setFreqCardiaca] = useState<string>('74');
  const [freqRespiratoria, setFreqRespiratoria] = useState<string>('18');
  const [temperatura, setTemperatura] = useState<string>('36.5');
  const [saturacaoO2, setSaturacaoO2] = useState<string>('97');
  const [glicemia, setGlicemia] = useState<string>('');
  const [horarioGlicemia, setHorarioGlicemia] = useState<string>('07:00');

  // 3. Alimentação
  const [viaAlimentacao, setViaAlimentacao] = useState<'oral' | 'enteral'>('oral');
  const [desjejum, setDesjejum] = useState<'total' | 'parcial' | 'negacao' | 'ausente'>('total');
  const [suplementoManha, setSuplementoManha] = useState<'total' | 'parcial' | 'negacao' | 'ausente'>('total');
  const [almoco, setAlmoco] = useState<'total' | 'parcial' | 'negacao' | 'ausente'>('total');
  const [suplementoTarde, setSuplementoTarde] = useState<'total' | 'parcial' | 'negacao' | 'ausente'>('total');
  const [jantar, setJantar] = useState<'total' | 'parcial' | 'negacao' | 'ausente'>('total');
  const [ceia, setCeia] = useState<'total' | 'parcial' | 'negacao' | 'ausente'>('total');
  const [volumeHidricoMl, setVolumeHidricoMl] = useState<number>(1200);

  // 4. Pele & Curativos
  const [integridadeCutanea, setIntegridadeCutanea] = useState<'preservada' | 'nao_preservada'>('preservada');
  const [realizadoCurativo, setRealizadoCurativo] = useState<boolean>(false);
  const [regiaoCurativo, setRegiaoCurativo] = useState<string>('');
  const [materialUtilizado, setMaterialUtilizado] = useState<string>('');
  const [edema, setEdema] = useState<'nao_apresenta' | 'mse' | 'msd' | 'mie' | 'mid'>('nao_apresenta');

  // 5. Eliminações
  const [diuresePresenca, setDiuresePresenca] = useState<boolean>(true);
  const [diureseAspecto, setDiureseAspecto] = useState<string>('Amarelo claro');
  const [evacuacaoPresenca, setEvacuacaoPresenca] = useState<boolean>(true);
  const [evacuacaoAspecto, setEvacuacaoAspecto] = useState<string>('Pastosa');

  // 6. Passagem de plantão
  const [statusPassagem, setStatusPassagem] = useState<'sem_intercorrencia' | 'ausente' | 'com_intercorrencia'>('sem_intercorrencia');
  const [relatoIntercorrencia, setRelatoIntercorrencia] = useState<string>('');
  const [anotacoesGerais, setAnotacoesGerais] = useState<string>('');

  const [salvando, setSalvando] = useState<boolean>(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  // Se vier editando alguma anotação existente
  useEffect(() => {
    if (anotacaoParaEdicao) {
      setTurno(anotacaoParaEdicao.turno);
      setEstadoRecebimento(anotacaoParaEdicao.recebimentoPlantao.estado);
      setNivelConsciencia(anotacaoParaEdicao.recebimentoPlantao.nivelConsciencia);
      setLocomocao(anotacaoParaEdicao.recebimentoPlantao.locomocao);

      setPaSistolica(String(anotacaoParaEdicao.sinaisVitais.paSistolica || '120'));
      setPaDiastolica(String(anotacaoParaEdicao.sinaisVitais.paDiastolica || '80'));
      setFreqCardiaca(String(anotacaoParaEdicao.sinaisVitais.freqCardiaca || '74'));
      setFreqRespiratoria(String(anotacaoParaEdicao.sinaisVitais.freqRespiratoria || '18'));
      setTemperatura(String(anotacaoParaEdicao.sinaisVitais.temperatura || '36.5'));
      setSaturacaoO2(String(anotacaoParaEdicao.sinaisVitais.saturacaoO2 || '97'));
      setGlicemia(String(anotacaoParaEdicao.sinaisVitais.glicemia || ''));
      setHorarioGlicemia(anotacaoParaEdicao.sinaisVitais.horarioGlicemia || '07:00');

      setViaAlimentacao(anotacaoParaEdicao.alimentacao.via);
      setDesjejum(anotacaoParaEdicao.alimentacao.desjejum || 'total');
      setSuplementoManha(anotacaoParaEdicao.alimentacao.suplementoManha || 'total');
      setAlmoco(anotacaoParaEdicao.alimentacao.almoco || 'total');
      setSuplementoTarde(anotacaoParaEdicao.alimentacao.suplementoTarde || 'total');
      setJantar(anotacaoParaEdicao.alimentacao.jantar || 'total');
      setCeia(anotacaoParaEdicao.alimentacao.ceia || 'total');
      setVolumeHidricoMl(Number(anotacaoParaEdicao.alimentacao.volumeHidricoMl || 1200));

      setIntegridadeCutanea(anotacaoParaEdicao.peleCurativos.integridadeCutanea);
      setRealizadoCurativo(anotacaoParaEdicao.peleCurativos.realizadoCurativo);
      setRegiaoCurativo(anotacaoParaEdicao.peleCurativos.regiaoCurativo || '');
      setMaterialUtilizado(anotacaoParaEdicao.peleCurativos.materialUtilizado || '');
      setEdema(anotacaoParaEdicao.peleCurativos.edema);

      setDiuresePresenca(anotacaoParaEdicao.eliminacoes.diuresePresenca);
      setDiureseAspecto(anotacaoParaEdicao.eliminacoes.diureseAspecto || '');
      setEvacuacaoPresenca(anotacaoParaEdicao.eliminacoes.evacuacaoPresenca);
      setEvacuacaoAspecto(anotacaoParaEdicao.eliminacoes.evacuacaoAspecto || '');

      setStatusPassagem(anotacaoParaEdicao.passagemPlantao.status);
      setRelatoIntercorrencia(anotacaoParaEdicao.passagemPlantao.relatoIntercorrencia || '');
      setAnotacoesGerais(anotacaoParaEdicao.passagemPlantao.anotacoesGerais || '');
    }
  }, [anotacaoParaEdicao]);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuidadorAtivo) {
      alert('Identifique sua matrícula de cuidador antes de salvar o controle.');
      return;
    }

    setSalvando(true);

    const novaAnotacao: AnotacaoDiariaPlantao = {
      id: anotacaoParaEdicao?.id || `anot-${Date.now()}`,
      residenteId: residente.id,
      data: dataHojeStr, // Data capturada automaticamente!
      turno,
      cuidadorMatricula: cuidadorAtivo.matricula,
      cuidadorNome: cuidadorAtivo.nomeCompleto,
      cuidadorCargo: cuidadorAtivo.cargo,
      cuidadorRegistro: cuidadorAtivo.registroProfissional,
      recebimentoPlantao: {
        estado: estadoRecebimento,
        nivelConsciencia,
        locomocao
      },
      sinaisVitais: {
        paSistolica: paSistolica ? Number(paSistolica) : undefined,
        paDiastolica: paDiastolica ? Number(paDiastolica) : undefined,
        freqCardiaca: freqCardiaca ? Number(freqCardiaca) : undefined,
        freqRespiratoria: freqRespiratoria ? Number(freqRespiratoria) : undefined,
        temperatura: temperatura ? Number(temperatura) : undefined,
        saturacaoO2: saturacaoO2 ? Number(saturacaoO2) : undefined,
        glicemia: glicemia ? Number(glicemia) : undefined,
        horarioGlicemia
      },
      alimentacao: {
        via: viaAlimentacao,
        desjejum,
        suplementoManha,
        almoco,
        suplementoTarde,
        jantar,
        ceia: turno === 'noturno' ? ceia : undefined,
        volumeHidricoMl
      },
      peleCurativos: {
        integridadeCutanea,
        realizadoCurativo,
        regiaoCurativo: realizadoCurativo ? regiaoCurativo : undefined,
        materialUtilizado: realizadoCurativo ? materialUtilizado : undefined,
        edema
      },
      eliminacoes: {
        diuresePresenca,
        diureseAspecto,
        evacuacaoPresenca,
        evacuacaoAspecto
      },
      passagemPlantao: {
        status: statusPassagem,
        relatoIntercorrencia: statusPassagem === 'com_intercorrencia' ? relatoIntercorrencia : '',
        anotacoesGerais
      },
      criadoEm: anotacaoParaEdicao?.criadoEm || new Date().toISOString()
    };

    saveAnotacaoPlantao(novaAnotacao);
    setSalvando(false);
    setMensagemSucesso(`Anotação de Cuidados salva para ${residente.nomeCompleto}!`);
    onSaveSuccess(novaAnotacao);

    setTimeout(() => {
      setMensagemSucesso('');
    }, 4000);
  };

  return (
    <form onSubmit={handleSalvar} className="space-y-4">
      {mensagemSucesso && (
        <div className="bg-emerald-50 border border-emerald-400 text-emerald-900 p-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button
            type="button"
            onClick={() => setMensagemSucesso('')}
            className="text-emerald-700 hover:underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Barra de Status Minimalista do Plantão de Hoje */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#133827] text-[#dfb842] flex items-center justify-center font-bold text-xs">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 text-sm">
                Anotação Diária de Cuidados
              </span>
              <span className="bg-[#dfb842]/20 text-[#133827] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {dataHojeFormatada}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Assinada pelo cuidador: <strong className="text-stone-700">{cuidadorAtivo?.nomeCompleto}</strong> (Matrícula: {cuidadorAtivo?.matricula})
            </p>
          </div>
        </div>

        {/* Alternador Compacto de Turno */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-bold self-start sm:self-center">
          <button
            type="button"
            onClick={() => setTurno('diurno')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              turno === 'diurno'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Diurno (06h - 18h)</span>
          </button>
          <button
            type="button"
            onClick={() => setTurno('noturno')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              turno === 'noturno'
                ? 'bg-[#133827] text-[#dfb842] shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Noturno (18h - 06h)</span>
          </button>
        </div>
      </div>

      {/* Grid de 2 Colunas: Formulário Minimalista e Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Painel Esquerdo: Recebimento & Sinais Vitais */}
        <div className="space-y-4">
          {/* Recebimento do Plantão */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
              1. Recebimento do Plantão ({turno === 'diurno' ? '06:00H' : '18:00H'})
            </span>

            {/* Estado */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { v: 'acordado', l: 'Acordado(a)' },
                { v: 'dormindo', l: 'Dormindo' },
                { v: 'leito', l: 'No Leito' },
                { v: 'sala_tv', l: 'Na Sala TV' },
                { v: 'deambulando', l: 'Deambulando' }
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setEstadoRecebimento(opt.v as any)}
                  className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                    estadoRecebimento === opt.v
                      ? 'bg-[#133827] text-white border-[#133827] font-bold'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>

            {/* Consciência & Locomoção */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                  Nível de Consciência:
                </label>
                <select
                  value={nivelConsciencia}
                  onChange={(e) => setNivelConsciencia(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                >
                  <option value="orientada">Orientada(o)</option>
                  <option value="calma">Calma(o)</option>
                  <option value="comunicativa">Comunicativa(o)</option>
                  <option value="confusa">Confusa(o)</option>
                  <option value="agitada">Agitada(o)</option>
                  <option value="sonolenta">Sonolenta(o)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                  Locomoção:
                </label>
                <select
                  value={locomocao}
                  onChange={(e) => setLocomocao(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                >
                  <option value="deambulando_auxilio">Deambula c/ auxílio</option>
                  <option value="deambulando_sem_auxilio">Deambula sem auxílio</option>
                  <option value="cadeirante">Cadeirante</option>
                  <option value="acamada">Acamada(o)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sinais Vitais Minimalistas */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
              2. Sinais Vitais do Dia
            </span>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 text-center">
                <span className="text-[9px] font-bold text-stone-500 uppercase block">PA</span>
                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                  <input
                    type="number"
                    value={paSistolica}
                    onChange={(e) => setPaSistolica(e.target.value)}
                    className="w-8 bg-white border border-stone-300 rounded text-center font-bold text-xs p-0.5"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={paDiastolica}
                    onChange={(e) => setPaDiastolica(e.target.value)}
                    className="w-8 bg-white border border-stone-300 rounded text-center font-bold text-xs p-0.5"
                  />
                </div>
              </div>

              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 text-center">
                <span className="text-[9px] font-bold text-stone-500 uppercase block">FC (bpm)</span>
                <input
                  type="number"
                  value={freqCardiaca}
                  onChange={(e) => setFreqCardiaca(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded text-center font-bold text-xs p-0.5 mt-0.5"
                />
              </div>

              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 text-center">
                <span className="text-[9px] font-bold text-stone-500 uppercase block">Temp (°C)</span>
                <input
                  type="number"
                  step="0.1"
                  value={temperatura}
                  onChange={(e) => setTemperatura(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded text-center font-bold text-xs p-0.5 mt-0.5"
                />
              </div>

              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 text-center">
                <span className="text-[9px] font-bold text-stone-500 uppercase block">SpO₂ (%)</span>
                <input
                  type="number"
                  value={saturacaoO2}
                  onChange={(e) => setSaturacaoO2(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded text-center font-bold text-xs p-0.5 mt-0.5"
                />
              </div>

              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 text-center">
                <span className="text-[9px] font-bold text-stone-500 uppercase block">FR (mpm)</span>
                <input
                  type="number"
                  value={freqRespiratoria}
                  onChange={(e) => setFreqRespiratoria(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded text-center font-bold text-xs p-0.5 mt-0.5"
                />
              </div>

              <div className="bg-amber-50 p-2 rounded-xl border border-amber-300 text-center">
                <span className="text-[9px] font-bold text-amber-900 uppercase block">Glicemia</span>
                <input
                  type="number"
                  placeholder="mg/dL"
                  value={glicemia}
                  onChange={(e) => setGlicemia(e.target.value)}
                  className="w-full bg-white border border-amber-400 rounded text-center font-bold font-mono text-xs p-0.5 mt-0.5 text-amber-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Alimentação, Cuidados & Eliminações */}
        <div className="space-y-4">
          {/* Alimentação & Hidratação */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                3. Refeições & Hidratação
              </span>
              <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded font-semibold">
                Via Oral
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {/* Desjejum */}
              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-600 block mb-1">Desjejum:</span>
                <div className="flex gap-1">
                  {(['total', 'parcial', 'negacao'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDesjejum(opt)}
                      className={`flex-1 py-0.5 text-[10px] rounded font-semibold cursor-pointer ${
                        desjejum === opt ? 'bg-[#133827] text-white' : 'bg-white text-stone-600 border border-stone-200'
                      }`}
                    >
                      {opt === 'total' ? 'Tot' : opt === 'parcial' ? 'Parc' : 'Neg'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Almoço */}
              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-600 block mb-1">Almoço:</span>
                <div className="flex gap-1">
                  {(['total', 'parcial', 'negacao'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAlmoco(opt)}
                      className={`flex-1 py-0.5 text-[10px] rounded font-semibold cursor-pointer ${
                        almoco === opt ? 'bg-[#133827] text-white' : 'bg-white text-stone-600 border border-stone-200'
                      }`}
                    >
                      {opt === 'total' ? 'Tot' : opt === 'parcial' ? 'Parc' : 'Neg'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jantar / Ceia */}
              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-600 block mb-1">
                  {turno === 'diurno' ? 'Jantar:' : 'Ceia:'}
                </span>
                <div className="flex gap-1">
                  {(['total', 'parcial', 'negacao'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => (turno === 'diurno' ? setJantar(opt) : setCeia(opt))}
                      className={`flex-1 py-0.5 text-[10px] rounded font-semibold cursor-pointer ${
                        (turno === 'diurno' ? jantar : ceia) === opt
                          ? 'bg-[#133827] text-white'
                          : 'bg-white text-stone-600 border border-stone-200'
                      }`}
                    >
                      {opt === 'total' ? 'Tot' : opt === 'parcial' ? 'Parc' : 'Neg'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Volume Hídrico Rápido */}
            <div className="flex items-center justify-between bg-blue-50/60 p-2.5 rounded-xl border border-blue-200 text-xs">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-blue-600" />
                Água Ofertada: <strong>{volumeHidricoMl} mL</strong>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setVolumeHidricoMl((prev) => prev + 150)}
                  className="px-2 py-0.5 bg-white text-blue-700 font-bold border border-blue-300 rounded text-[11px] cursor-pointer"
                >
                  +150ml
                </button>
                <button
                  type="button"
                  onClick={() => setVolumeHidricoMl((prev) => prev + 250)}
                  className="px-2 py-0.5 bg-white text-blue-700 font-bold border border-blue-300 rounded text-[11px] cursor-pointer"
                >
                  +250ml
                </button>
              </div>
            </div>
          </div>

          {/* Cuidados Físicos, Eliminações & Curativo */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
              4. Pele, Curativo & Eliminações
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* Pele */}
              <button
                type="button"
                onClick={() => setIntegridadeCutanea(integridadeCutanea === 'preservada' ? 'nao_preservada' : 'preservada')}
                className={`p-2 rounded-xl border text-center font-semibold cursor-pointer ${
                  integridadeCutanea === 'preservada'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                Pele: {integridadeCutanea === 'preservada' ? 'Íntegra' : 'Lesão'}
              </button>

              {/* Curativo */}
              <button
                type="button"
                onClick={() => setRealizadoCurativo(!realizadoCurativo)}
                className={`p-2 rounded-xl border text-center font-semibold cursor-pointer ${
                  realizadoCurativo
                    ? 'bg-[#133827] text-white border-[#133827]'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                Curativo: {realizadoCurativo ? 'Sim (Feito)' : 'Não'}
              </button>

              {/* Diurese */}
              <button
                type="button"
                onClick={() => setDiuresePresenca(!diuresePresenca)}
                className={`p-2 rounded-xl border text-center font-semibold cursor-pointer ${
                  diuresePresenca
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                Diurese: {diuresePresenca ? 'Presente' : 'Ausente'}
              </button>

              {/* Evacuação */}
              <button
                type="button"
                onClick={() => setEvacuacaoPresenca(!evacuacaoPresenca)}
                className={`p-2 rounded-xl border text-center font-semibold cursor-pointer ${
                  evacuacaoPresenca
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                Evacuação: {evacuacaoPresenca ? 'Presente' : 'Ausente'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Passagem de Plantão & Observações do Dia */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
            5. Passagem de Plantão & Anotações do Cuidador
          </span>
          <div className="flex gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusPassagem('sem_intercorrencia')}
              className={`px-3 py-1 rounded-lg font-bold border cursor-pointer ${
                statusPassagem === 'sem_intercorrencia'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-stone-50 text-stone-700 border-stone-200'
              }`}
            >
              Sem Intercorrência
            </button>
            <button
              type="button"
              onClick={() => setStatusPassagem('com_intercorrencia')}
              className={`px-3 py-1 rounded-lg font-bold border cursor-pointer ${
                statusPassagem === 'com_intercorrencia'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-stone-50 text-stone-700 border-stone-200'
              }`}
            >
              Com Intercorrência
            </button>
          </div>
        </div>

        {statusPassagem === 'com_intercorrencia' && (
          <input
            type="text"
            placeholder="Descreva a intercorrência observada..."
            value={relatoIntercorrencia}
            onChange={(e) => setRelatoIntercorrencia(e.target.value)}
            className="w-full bg-rose-50 border border-rose-300 rounded-xl px-3 py-2 text-xs text-rose-900"
          />
        )}

        <textarea
          rows={2}
          placeholder="Anotações gerais do cuidado diário (banho, rotina, comportamento e repasse)..."
          value={anotacoesGerais}
          onChange={(e) => setAnotacoesGerais(e.target.value)}
          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-800 focus:ring-2 focus:ring-[#133827]"
        />
      </div>

      {/* Botão Salvar com Carimbo Imediato */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#102c1e] text-white p-4 rounded-2xl border border-[#dfb842]/40 shadow-sm">
        <div className="flex items-center gap-2.5 text-xs">
          <UserCheck className="w-5 h-5 text-[#dfb842]" />
          <div>
            <span>Assinatura Digital Automática: </span>
            <strong className="text-amber-200">{cuidadorAtivo?.nomeCompleto}</strong>
            <span className="text-stone-400 font-mono ml-1">[{cuidadorAtivo?.matricula}]</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#dfb842] hover:bg-[#cfa532] text-[#133827] px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{salvando ? 'Salvando...' : 'Salvar Cuidado Diário'}</span>
        </button>
      </div>
    </form>
  );
};
