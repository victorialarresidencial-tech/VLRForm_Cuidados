export type GrauDependencia = 'grau1' | 'grau2' | 'grau3';
export type Mobilidade = 'independente' | 'bengala_andador' | 'cadeira_rodas' | 'acamado';
export type Sexo = 'feminino' | 'masculino' | 'outro';
export type TipoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'desconhecido';
export type TurnoPlantao = 'diurno' | 'noturno';
export type TurnoPrescricao = 'M' | 'T' | 'N'; // Manhã, Tarde, Noite

export interface MedicamentoContinuo {
  id: string;
  nome: string;
  dosagem: string;
  horario: string;
  instrucoes?: string;
}

export interface ResidenteResumo {
  id: string;
  nomeCompleto: string;
  nomeSocial?: string;
  dataNascimento: string;
  idade?: number;
  cpf: string;
  rg?: string;
  sexo: Sexo;
  quarto: string; // Ex: Quarto 04 - Ala Jardins
  grauDependencia: GrauDependencia;
  mobilidade: Mobilidade;
  tipoSanguineo: TipoSanguineo;
  dieta: string;
  alergias: string[];
  diagnosticos: string[];
  medicamentosContinuos?: MedicamentoContinuo[];
  convenioMedico?: string;
  hospitalReferencia?: string;
  nomeResponsavel?: string;
  telefoneResponsavel?: string;
  fotoUrl?: string;
  observacoesGerais?: string;
}

export interface CuidadorFuncionario {
  id: string;
  matricula: string; // Ex: MAT-101
  nomeCompleto: string;
  cargo: string; // Cuidador(a) de Idosos, Técnico(a) de Enfermagem, Enfermeiro(a) RT, etc.
  departamento: string;
  escala: string;
  registroProfissional?: string; // COREN-SP, etc.
  ativo: boolean;
  fotoUrl?: string;
}

export interface SinaisVitaisData {
  paSistolica?: string | number;
  paDiastolica?: string | number;
  freqCardiaca?: string | number;
  freqRespiratoria?: string | number;
  temperatura?: string | number;
  saturacaoO2?: string | number;
  glicemia?: string | number;
  horarioGlicemia?: string;
}

export interface AlimentacaoData {
  via: 'oral' | 'enteral';
  desjejum?: 'total' | 'parcial' | 'negacao' | 'ausente'; // 07:00
  suplementoManha?: 'total' | 'parcial' | 'negacao' | 'ausente'; // 09:00
  almoco?: 'total' | 'parcial' | 'negacao' | 'ausente'; // 12:00
  suplementoTarde?: 'total' | 'parcial' | 'negacao' | 'ausente'; // 14:00
  jantar?: 'total' | 'parcial' | 'negacao' | 'ausente'; // 17:00
  ceia?: 'total' | 'parcial' | 'negacao' | 'ausente'; // 20:00 (noturno)
  volumeHidricoMl?: string | number;
}

export interface PeleCurativosData {
  integridadeCutanea: 'preservada' | 'nao_preservada';
  realizadoCurativo: boolean;
  regiaoCurativo?: string;
  materialUtilizado?: string;
  edema: 'nao_apresenta' | 'mse' | 'msd' | 'mie' | 'mid';
  grauEdema?: string;
}

export interface EliminacoesData {
  diuresePresenca: boolean;
  diureseAspecto?: string; // Clara, Amarelo-citrino, Escura, etc.
  diureseVolumeAprox?: string;
  evacuacaoPresenca: boolean;
  evacuacaoAspecto?: string; // Pastosa, Normal, Líquida, Ressecada
  evacuacaoFrequencia?: string;
}

export interface AnotacaoDiariaPlantao {
  id: string;
  residenteId: string;
  data: string; // YYYY-MM-DD
  turno: TurnoPlantao; // 'diurno' | 'noturno'
  cuidadorMatricula: string;
  cuidadorNome: string;
  cuidadorCargo: string;
  cuidadorRegistro?: string;
  
  // 06:00 (ou 18:00) Recebimento do plantão
  recebimentoPlantao: {
    estado: 'acordado' | 'dormindo' | 'leito' | 'sala_tv' | 'deambulando' | 'ausente';
    nivelConsciencia: 'calma' | 'comunicativa' | 'orientada' | 'agitada' | 'agressiva' | 'confusa' | 'sonolenta';
    locomocao: 'acamada' | 'cadeirante' | 'deambulando_auxilio' | 'deambulando_sem_auxilio';
  };

  sinaisVitais: SinaisVitaisData;
  alimentacao: AlimentacaoData;
  peleCurativos: PeleCurativosData;
  eliminacoes: EliminacoesData;

  passagemPlantao: {
    status: 'sem_intercorrencia' | 'ausente' | 'com_intercorrencia';
    relatoIntercorrencia?: string;
    anotacoesGerais?: string;
  };

  criadoEm: string;
  atualizadoEm?: string;
}

export interface ItemPrescricaoEnfermagem {
  id: number;
  descricao: string;
  turnosAplicaveis: ('M' | 'T' | 'N')[];
  categoria: 'medicacao' | 'higiene' | 'alimentacao' | 'mobilidade' | 'observacao' | 'conforto';
}

export interface ChecagemPrescricaoRegistro {
  checado: boolean;
  cuidadorMatricula: string;
  cuidadorNome: string;
  hora: string;
  observacao?: string;
}

export interface MapaPrescricaoMensal {
  id: string;
  residenteId: string;
  mes: number; // 1-12
  ano: number;
  // chave: `${itemId}_dia${dia}_${turno}`
  checagens: Record<string, ChecagemPrescricaoRegistro>;
  atualizadoEm: string;
}

export interface EvolucaoEnfermagem {
  id: string;
  residenteId: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  cuidadorMatricula: string;
  cuidadorNome: string;
  cuidadorCargo: string;
  cuidadorRegistro?: string;
  estadoGeral: 'bom' | 'regular' | 'ruim';
  sinaisVitais?: {
    pa?: string;
    fc?: string;
    temp?: string;
    spo2?: string;
  };
  condicoesGerais: {
    lucida: boolean;
    orientada: boolean;
    confusa: boolean;
    desorientada: boolean;
    mobilidadePreservada: boolean;
    mobilidadeReduzida: boolean;
    acamada: boolean;
    alimentacaoBoa: boolean;
    alimentacaoRegular: boolean;
    alimentacaoRuim: boolean;
    hidratacaoAdequada: boolean;
    peleIntegra: boolean;
    peleComLesao: boolean;
    usoFralda: boolean;
  };
  diagnosticosEnfermagem: string[];
  relatoEvolucao: string;
  condutaEEncaminhamentos: string;
  familiarInformado: boolean;
  criadoEm: string;
}

export interface RegistroGlicemiaSinais {
  id: string;
  residenteId: string;
  data: string;
  horario: string;
  tipo: 'glicemia' | 'sinais_vitais' | 'ambos';
  glicemia?: number;
  momento?: '05:00' | '11:30' | '17:00' | '21:00' | 'jejum' | 'pos_prandial' | 'outro';
  pressaoArterial?: string;
  freqCardiaca?: number;
  freqRespiratoria?: number;
  temperatura?: number;
  saturacaoO2?: number;
  cuidadorMatricula: string;
  cuidadorNome: string;
  observacoes?: string;
  criadoEm: string;
}
