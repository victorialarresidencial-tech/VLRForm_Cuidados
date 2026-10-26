import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, ChevronDown, CheckCircle2, UserCheck, Calendar, Cloud } from 'lucide-react';
import { CuidadorFuncionario } from '../types/care';
import { getCuidadores, findCuidadorByMatricula, setCuidadorAtivo, subscribeToAllData } from '../lib/storage';

interface CaregiverBadgeBarProps {
  cuidadorAtivo: CuidadorFuncionario | null;
  onCuidadorChange: (cuidador: CuidadorFuncionario) => void;
  dataHojeFormatada: string;
}

export const CaregiverBadgeBar: React.FC<CaregiverBadgeBarProps> = ({
  cuidadorAtivo,
  onCuidadorChange,
  dataHojeFormatada
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [inputMatricula, setInputMatricula] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cuidadores, setCuidadores] = useState<CuidadorFuncionario[]>(getCuidadores());

  useEffect(() => {
    const unsub = subscribeToAllData(() => {
      setCuidadores(getCuidadores());
    });
    return () => unsub();
  }, []);

  // Se não houver cuidador selecionado ao abrir, abre modal para identificação rápida por matrícula
  useEffect(() => {
    if (!cuidadorAtivo) {
      setIsOpenModal(true);
    }
  }, [cuidadorAtivo]);

  const handleValidarMatricula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMatricula.trim()) {
      setErrorMsg('Informe o número de matrícula ou ID do cuidador.');
      return;
    }
    const encontrado = findCuidadorByMatricula(inputMatricula);
    if (encontrado) {
      setCuidadorAtivo(encontrado);
      onCuidadorChange(encontrado);
      setIsOpenModal(false);
      setInputMatricula('');
      setErrorMsg('');
    } else {
      setErrorMsg(`Matrícula "${inputMatricula}" não encontrada no cadastro.`);
    }
  };

  const handleSelecionarDireto = (cuidador: CuidadorFuncionario) => {
    setCuidadorAtivo(cuidador);
    onCuidadorChange(cuidador);
    setIsOpenModal(false);
    setErrorMsg('');
  };

  return (
    <>
      {/* Barra Minimalista de Identificação Superior */}
      <div className="bg-[#0f281b] text-stone-200 border-b border-[#dfb842]/30 px-4 sm:px-6 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Data do Cuidado Reconhecida Automaticamente */}
          <div className="flex items-center gap-2 text-stone-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <Calendar className="w-3.5 h-3.5 text-[#dfb842]" />
            <span className="font-medium text-stone-400">Data do Plantão:</span>
            <span className="font-bold text-white tracking-wide">
              {dataHojeFormatada}
            </span>
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              Reconhecida Automaticamente
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded-full font-semibold">
              <Cloud className="w-3 h-3 text-[#dfb842]" />
              <span>Firebase 100% Nuvem</span>
            </span>
          </div>

          {/* Cuidador Reconhecido por Matrícula */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#173e2a] px-3 py-1 rounded-xl border border-emerald-600/40 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-[#dfb842]" />
              <span className="text-stone-400">Cuidador(a):</span>
              <span className="font-bold text-white">
                {cuidadorAtivo?.nomeCompleto || 'Identifique-se'}
              </span>
              {cuidadorAtivo && (
                <span className="bg-[#dfb842] text-[#133827] text-[10px] font-bold px-1.5 py-0.2 rounded uppercase font-mono">
                  {cuidadorAtivo.matricula}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsOpenModal(true)}
              className="inline-flex items-center gap-1.5 bg-stone-800/80 hover:bg-stone-700 text-amber-200 hover:text-white px-2.5 py-1 rounded-lg border border-stone-600/60 transition-colors cursor-pointer text-xs"
              title="Trocar matrícula do cuidador de plantão"
            >
              <KeyRound className="w-3 h-3 text-[#dfb842]" />
              <span>Trocar Matrícula</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Reconhecimento por Matrícula ID */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#133827] to-[#1b4d36] px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#dfb842]/20 border border-[#dfb842]/40 flex items-center justify-center text-[#dfb842]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-brand font-bold text-base text-amber-200">
                    Reconhecimento do Cuidador
                  </h3>
                  <p className="text-xs text-stone-300">
                    Digite sua Matrícula ID cadastrada para iniciar os registros
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <form onSubmit={handleValidarMatricula} className="space-y-3">
                <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px]">
                  Número de Matrícula ou ID:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Ex: MAT-101 ou 101"
                    value={inputMatricula}
                    onChange={(e) => {
                      setInputMatricula(e.target.value);
                      setErrorMsg('');
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl font-mono uppercase font-bold text-[#133827] focus:outline-none focus:ring-2 focus:ring-[#133827]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#133827] hover:bg-[#1b4d36] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#dfb842]" />
                    <span>Reconhecer</span>
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2 font-medium">
                    {errorMsg}
                  </p>
                )}
              </form>

              <div className="border-t border-stone-200 pt-3">
                <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Ou selecione seu nome na escala:
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {cuidadores.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelecionarDireto(c)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        cuidadorAtivo?.id === c.id
                          ? 'bg-emerald-50 border-[#133827] ring-1 ring-[#133827]'
                          : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#133827] text-white flex items-center justify-center font-bold text-xs">
                          {c.nomeCompleto.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 leading-tight">
                            {c.nomeCompleto}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {c.cargo}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                        {c.matricula}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {cuidadorAtivo && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsOpenModal(false)}
                    className="text-stone-500 hover:text-stone-800 text-xs font-medium cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
