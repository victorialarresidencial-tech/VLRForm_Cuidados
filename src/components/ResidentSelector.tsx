import React, { useState } from 'react';
import {
  Search,
  User,
  Heart,
  AlertTriangle,
  Pill,
  Home,
  Activity,
  ChevronDown,
  Calendar,
  ShieldAlert,
  Phone,
  Droplet,
  Utensils
} from 'lucide-react';
import { ResidenteResumo, GrauDependencia, Mobilidade } from '../types/care';

interface ResidentSelectorProps {
  residentes: ResidenteResumo[];
  residenteSelecionado: ResidenteResumo | null;
  onSelectResidente: (residente: ResidenteResumo) => void;
  onOpenDataModal?: () => void;
}

export const ResidentSelector: React.FC<ResidentSelectorProps> = ({
  residentes,
  residenteSelecionado,
  onSelectResidente,
  onOpenDataModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroGrau, setFiltroGrau] = useState<string>('todos');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formatarGrauDependencia = (grau: GrauDependencia) => {
    switch (grau) {
      case 'grau1':
        return { label: 'Grau I (Independente)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'grau2':
        return { label: 'Grau II (Semidependente)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'grau3':
        return { label: 'Grau III (Totalmente Dependente)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
  };

  const formatarMobilidade = (mob: Mobilidade) => {
    switch (mob) {
      case 'independente':
        return 'Deambula sem auxílio';
      case 'bengala_andador':
        return 'Deambula c/ auxílio (Bengala/Andador)';
      case 'cadeira_rodas':
        return 'Cadeirante';
      case 'acamado':
        return 'Acamado(a)';
    }
  };

  const residentesFiltrados = residentes.filter((r) => {
    const matchesSearch =
      r.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.quarto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cpf.includes(searchTerm);
    const matchesGrau = filtroGrau === 'todos' || r.grauDependencia === filtroGrau;
    return matchesSearch && matchesGrau;
  });

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden mb-6">
      {/* Barra de Filtro de Residentes */}
      <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#133827] text-[#dfb842] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-stone-900 text-sm sm:text-base">
                Paciente Selecionado
              </h2>
              <p className="text-[11px] text-stone-500">
                Dados cadastrais integrados sem duplicidade
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Campo de busca textual */}
            <div className="relative min-w-[200px] sm:min-w-[260px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, quarto ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#133827]"
              />
            </div>

            {/* Filtro por grau de dependência */}
            <select
              value={filtroGrau}
              onChange={(e) => setFiltroGrau(e.target.value)}
              className="text-xs bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#133827]"
            >
              <option value="todos">Todos os Graus</option>
              <option value="grau1">Grau I</option>
              <option value="grau2">Grau II</option>
              <option value="grau3">Grau III</option>
            </select>

            {/* Botão de lista dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex items-center gap-1.5 bg-[#133827] hover:bg-[#1b4d36] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <span>Trocar Residente ({residentes.length})</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#dfb842]" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 z-30 max-h-72 overflow-y-auto divide-y divide-stone-100">
                  <div className="p-2 text-[11px] font-bold text-stone-500 uppercase tracking-wider bg-stone-50">
                    Selecione para abrir o prontuário:
                  </div>
                  {residentesFiltrados.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => {
                        onSelectResidente(res);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 hover:bg-stone-50 transition-colors flex items-center justify-between cursor-pointer ${
                        residenteSelecionado?.id === res.id ? 'bg-emerald-50/80 font-bold' : ''
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          {res.nomeCompleto}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Home className="w-3 h-3 text-stone-400" />
                          <span>{res.quarto}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-stone-100 text-stone-700">
                        {res.grauDependencia.toUpperCase()}
                      </span>
                    </button>
                  ))}
                  {residentesFiltrados.length === 0 && (
                    <div className="p-4 text-center text-xs text-stone-400">
                      Nenhum residente encontrado para este filtro.
                    </div>
                  )}
                </div>
              )}
            </div>

            {onOpenDataModal && (
              <button
                onClick={onOpenDataModal}
                className="text-xs text-[#133827] font-semibold hover:underline bg-[#dfb842]/20 hover:bg-[#dfb842]/30 px-2.5 py-1.5 rounded-xl border border-[#dfb842]/40 transition-colors cursor-pointer"
                title="Sincronizar base de cadastros externos"
              >
                Gerenciar Cadastros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cartão de Identidade do Residente Selecionado (Dados pré-carregados) */}
      {residenteSelecionado ? (
        <div className="p-4 sm:p-6 bg-gradient-to-b from-white to-stone-50/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border-b border-stone-200/80 pb-5">
            {/* Bloco de Nome e Acomodação */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#133827] to-[#1e583c] text-white flex items-center justify-center font-serif-brand font-bold text-2xl shadow-md border-2 border-[#dfb842]/50 shrink-0">
                {residenteSelecionado.nomeCompleto.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif-brand font-bold text-xl sm:text-2xl text-stone-900 tracking-tight">
                    {residenteSelecionado.nomeCompleto}
                  </h3>
                  {residenteSelecionado.sexo && (
                    <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                      {residenteSelecionado.sexo === 'feminino' ? 'Feminino' : 'Masculino'}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                  <span className="flex items-center gap-1.5 font-semibold text-[#133827]">
                    <Home className="w-3.5 h-3.5 text-[#dfb842]" />
                    {residenteSelecionado.quarto}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    Nascimento: {residenteSelecionado.dataNascimento} ({residenteSelecionado.idade || '80+'} anos)
                  </span>
                  <span className="font-mono text-stone-500">
                    CPF: {residenteSelecionado.cpf}
                  </span>
                  {residenteSelecionado.tipoSanguineo && (
                    <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      <Droplet className="w-3 h-3 text-rose-500" />
                      Tipo: {residenteSelecionado.tipoSanguineo}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Badges de Cuidados & Mobilidade */}
            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                const dep = formatarGrauDependencia(residenteSelecionado.grauDependencia);
                return (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${dep.color}`}>
                    {dep.label}
                  </span>
                );
              })()}
              <span className="text-xs font-medium bg-stone-100 text-stone-800 border border-stone-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-stone-500" />
                {formatarMobilidade(residenteSelecionado.mobilidade)}
              </span>
            </div>
          </div>

          {/* Linha clínica de segurança (Alergias, Medicamentos, Dieta) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4 text-xs">
            {/* Alergias conhecidas */}
            <div className={`p-3 rounded-xl border ${
              residenteSelecionado.alergias.length > 0 && !residenteSelecionado.alergias.includes('Nenhuma conhecida')
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Alergias Documentadas:</span>
              </div>
              <div className="flex flex-wrap gap-1 font-semibold">
                {residenteSelecionado.alergias.map((al, idx) => (
                  <span
                    key={idx}
                    className="bg-white/80 border border-rose-300 text-rose-700 px-2 py-0.5 rounded shadow-2xs"
                  >
                    {al}
                  </span>
                ))}
              </div>
            </div>

            {/* Dieta e Alimentação prescrita */}
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] mb-1">
                <Utensils className="w-3.5 h-3.5 text-amber-700" />
                <span>Dieta Prescrita:</span>
              </div>
              <p className="text-stone-700 leading-relaxed font-medium">
                {residenteSelecionado.dieta}
              </p>
            </div>

            {/* Medicamentos e Responsável */}
            <div className="p-3 rounded-xl bg-stone-100/70 border border-stone-200 text-stone-800">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
                  <Pill className="w-3.5 h-3.5 text-[#133827]" />
                  <span>Medicamentos Contínuos:</span>
                </div>
                <span className="text-[10px] text-stone-500">
                  {residenteSelecionado.medicamentosContinuos?.length || 0} prescritos
                </span>
              </div>
              <div className="text-[11px] text-stone-600 truncate">
                {residenteSelecionado.medicamentosContinuos && residenteSelecionado.medicamentosContinuos.length > 0
                  ? residenteSelecionado.medicamentosContinuos.map(m => `${m.nome} (${m.horario})`).join(', ')
                  : 'Nenhum medicamento contínuo cadastrado'}
              </div>
              {residenteSelecionado.nomeResponsavel && (
                <div className="mt-1 pt-1 border-t border-stone-200 flex items-center gap-1 text-[11px] text-stone-500">
                  <Phone className="w-3 h-3 text-stone-400" />
                  <span>{residenteSelecionado.nomeResponsavel}: {residenteSelecionado.telefoneResponsavel}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-stone-50 text-stone-500">
          <User className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">Nenhum residente selecionado no momento.</p>
          <p className="text-xs">Escolha um paciente na lista acima para visualizar e registrar os cuidados.</p>
        </div>
      )}
    </div>
  );
};
