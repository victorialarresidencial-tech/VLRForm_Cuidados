import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Check,
  Clock,
  Printer,
  ShieldCheck,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  ResidenteResumo,
  CuidadorFuncionario,
  MapaPrescricaoMensal,
  ItemPrescricaoEnfermagem,
  TurnoPrescricao
} from '../types/care';
import {
  ITENS_PRESCRICAO_PADRAO,
  getMapaPrescricao,
  saveMapaPrescricao,
  subscribeToAllData
} from '../lib/storage';

interface PrescriptionCheckGridProps {
  residente: ResidenteResumo;
  cuidadorAtivo: CuidadorFuncionario | null;
  dataHojeStr: string; // YYYY-MM-DD
  dataHojeFormatada: string;
}

export const PrescriptionCheckGrid: React.FC<PrescriptionCheckGridProps> = ({
  residente,
  cuidadorAtivo,
  dataHojeStr,
  dataHojeFormatada
}) => {
  const dataObj = new Date();
  const diaHoje = dataObj.getDate();
  const mesHoje = dataObj.getMonth() + 1;
  const anoHoje = dataObj.getFullYear();
  const horaAtual = dataObj.getHours();

  // Define automaticamente o turno atual sugerido baseado na hora
  const turnoAtualSugerido: TurnoPrescricao =
    horaAtual >= 6 && horaAtual < 13 ? 'M' : horaAtual >= 13 && horaAtual < 19 ? 'T' : 'N';

  const [mapa, setMapa] = useState<MapaPrescricaoMensal | null>(null);
  const [alerta, setAlerta] = useState<string>('');
  const [detalheItem, setDetalheItem] = useState<{
    item: string;
    turno: string;
    cuidador: string;
    matricula: string;
    hora: string;
  } | null>(null);

  useEffect(() => {
    const carregado = getMapaPrescricao(residente.id, mesHoje, anoHoje);
    setMapa(carregado);

    const unsub = subscribeToAllData(() => {
      const atualizado = getMapaPrescricao(residente.id, mesHoje, anoHoje);
      setMapa(atualizado);
    });
    return () => unsub();
  }, [residente.id, mesHoje, anoHoje]);

  const toggleChecagem = (item: ItemPrescricaoEnfermagem, turno: TurnoPrescricao) => {
    if (!mapa) return;
    if (!cuidadorAtivo) {
      setAlerta('Identifique o cuidador por matrícula na barra superior para assinar o cuidado.');
      setTimeout(() => setAlerta(''), 4000);
      return;
    }

    const key = `${item.id}_dia${diaHoje}_${turno}`;
    const existente = mapa.checagens[key];

    const novoMapa: MapaPrescricaoMensal = {
      ...mapa,
      checagens: { ...mapa.checagens }
    };

    if (existente && existente.checado) {
      delete novoMapa.checagens[key];
    } else {
      const agora = new Date();
      const horaStr = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
      novoMapa.checagens[key] = {
        checado: true,
        cuidadorMatricula: cuidadorAtivo.matricula,
        cuidadorNome: cuidadorAtivo.nomeCompleto,
        hora: horaStr
      };
    }

    setMapa(novoMapa);
    saveMapaPrescricao(novoMapa);
  };

  const checarTurnoCompleto = (turno: TurnoPrescricao) => {
    if (!mapa || !cuidadorAtivo) return;
    const novoMapa: MapaPrescricaoMensal = {
      ...mapa,
      checagens: { ...mapa.checagens }
    };

    const agora = new Date();
    const horaStr = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    ITENS_PRESCRICAO_PADRAO.forEach((item) => {
      if (item.turnosAplicaveis.includes(turno)) {
        const key = `${item.id}_dia${diaHoje}_${turno}`;
        novoMapa.checagens[key] = {
          checado: true,
          cuidadorMatricula: cuidadorAtivo.matricula,
          cuidadorNome: cuidadorAtivo.nomeCompleto,
          hora: horaStr
        };
      }
    });

    setMapa(novoMapa);
    saveMapaPrescricao(novoMapa);
  };

  // Contagem de cuidados concluídos hoje
  const totalAplicaveisHoje = ITENS_PRESCRICAO_PADRAO.reduce(
    (acc, curr) => acc + curr.turnosAplicaveis.length,
    0
  );

  const totalChecadosHoje = ITENS_PRESCRICAO_PADRAO.reduce((acc, curr) => {
    let somador = 0;
    curr.turnosAplicaveis.forEach((t) => {
      const key = `${curr.id}_dia${diaHoje}_${t}`;
      if (mapa?.checagens[key]?.checado) somador++;
    });
    return acc + somador;
  }, 0);

  const percentualHoje = Math.round((totalChecadosHoje / totalAplicaveisHoje) * 100);

  return (
    <div className="space-y-5">
      {alerta && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{alerta}</span>
        </div>
      )}
      {/* Cabeçalho Diário Minimalista (Data Capturada Automaticamente) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#dfb842] uppercase tracking-wider">
                Prescrição de Enfermagem • Controle Diário
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Hoje • {dataHojeFormatada}
              </span>
            </div>
            <h3 className="font-serif-brand font-bold text-lg text-stone-900 mt-0.5">
              Grade Diária de Cuidados • {residente.nomeCompleto}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Sem necessidade de preencher datas: o sistema atribui automaticamente a data atual e sua matrícula ({cuidadorAtivo?.matricula}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => checarTurnoCompleto(turnoAtualSugerido)}
              className="inline-flex items-center gap-1.5 bg-[#133827] hover:bg-[#1b4d36] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#dfb842]" />
              <span>
                Checar Turno Atual ({turnoAtualSugerido === 'M' ? 'Manhã' : turnoAtualSugerido === 'T' ? 'Tarde' : 'Noite'})
              </span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold px-3 py-2 rounded-xl border border-stone-300 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Folha do Dia</span>
            </button>
          </div>
        </div>

        {/* Barra de Progresso Minimalista de Cuidados do Dia */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Progresso do Dia:</span>
            <span className="font-bold font-mono text-[#133827]">
              {totalChecadosHoje} de {totalAplicaveisHoje} checagens ({percentualHoje}%)
            </span>
          </div>

          <div className="w-full sm:w-64 bg-stone-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#dfb842] to-[#133827] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${percentualHoje}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista Diária Minimalista dos 16 Cuidados Prescritos */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {/* Cabeçalho de colunas */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between text-xs font-bold text-stone-600 uppercase tracking-wider">
          <span className="flex-1">Prescrição de Cuidado (Dia Atual)</span>
          <div className="flex items-center gap-3 sm:gap-6 pr-1">
            <span className="w-20 text-center flex items-center justify-center gap-1 text-amber-700">
              <Sun className="w-3.5 h-3.5" /> Manhã
            </span>
            <span className="w-20 text-center flex items-center justify-center gap-1 text-orange-700">
              <Sunset className="w-3.5 h-3.5" /> Tarde
            </span>
            <span className="w-20 text-center flex items-center justify-center gap-1 text-indigo-700">
              <Moon className="w-3.5 h-3.5" /> Noite
            </span>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {ITENS_PRESCRICAO_PADRAO.map((item) => {
            const turnos: TurnoPrescricao[] = ['M', 'T', 'N'];
            return (
              <div
                key={item.id}
                className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 hover:bg-stone-50/70 transition-colors"
              >
                {/* Nome do cuidado com numeração */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {item.id}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                    {item.descricao}
                  </span>
                </div>

                {/* Botões rápidos M, T, N */}
                <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                  {turnos.map((turno) => {
                    const aplicavel = item.turnosAplicaveis.includes(turno);
                    const key = `${item.id}_dia${diaHoje}_${turno}`;
                    const reg = mapa?.checagens[key];
                    const isChecado = reg?.checado;

                    if (!aplicavel) {
                      return (
                        <div
                          key={turno}
                          className="w-20 h-9 rounded-xl bg-stone-50 border border-dashed border-stone-200 flex items-center justify-center text-stone-300 text-xs font-mono select-none"
                          title="Não aplicável a este turno"
                        >
                          -
                        </div>
                      );
                    }

                    return (
                      <button
                        key={turno}
                        type="button"
                        onClick={() => toggleChecagem(item, turno)}
                        className={`w-20 h-9 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          isChecado
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800'
                            : 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                        title={
                          isChecado
                            ? `Checado por ${reg.cuidadorNome} (${reg.cuidadorMatricula}) às ${reg.hora}`
                            : `Clique para checar e assinar no turno ${turno}`
                        }
                      >
                        {isChecado ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#dfb842]" />
                            <span className="font-mono text-[11px]">{reg.hora}</span>
                          </>
                        ) : (
                          <span className="text-stone-500 font-semibold text-[11px]">
                            {turno === 'M' ? 'M (08h)' : turno === 'T' ? 'T (14h)' : 'N (20h)'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
