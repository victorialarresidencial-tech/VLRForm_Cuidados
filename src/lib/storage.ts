import {
  collection,
  doc,
  getDocs,
  setDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, reportFirestoreError, handleFirestoreError, OperationType } from './firebase';
import {
  ResidenteResumo,
  CuidadorFuncionario,
  AnotacaoDiariaPlantao,
  ItemPrescricaoEnfermagem,
  MapaPrescricaoMensal,
  EvolucaoEnfermagem,
  RegistroGlicemiaSinais,
  ChecagemPrescricaoRegistro
} from '../types/care';

export const ITENS_PRESCRICAO_PADRAO: ItemPrescricaoEnfermagem[] = [
  { id: 1, descricao: 'Medicar conforme prescrição médica', turnosAplicaveis: ['M', 'T', 'N'], categoria: 'medicacao' },
  { id: 2, descricao: 'Realizar banho de aspersão e higiene pessoal', turnosAplicaveis: ['M', 'T'], categoria: 'higiene' },
  { id: 3, descricao: 'Realizar banho no leito e higiene pessoal', turnosAplicaveis: ['M'], categoria: 'higiene' },
  { id: 4, descricao: 'Aplicar creme hidratante no corpo após o banho', turnosAplicaveis: ['M', 'T'], categoria: 'conforto' },
  { id: 5, descricao: 'Auxiliar na alimentação (refeições principais)', turnosAplicaveis: ['M', 'T', 'N'], categoria: 'alimentacao' },
  { id: 6, descricao: 'Ofertar ingesta de líquidos frequente', turnosAplicaveis: ['M', 'T', 'N'], categoria: 'alimentacao' },
  { id: 7, descricao: 'Realizar higiene oral após refeições', turnosAplicaveis: ['M', 'T', 'N'], categoria: 'higiene' },
  { id: 8, descricao: 'Realizar massagem de conforto', turnosAplicaveis: ['T', 'N'], categoria: 'conforto' },
  { id: 9, descricao: 'Proporcionar interação com outros clientes/residentes', turnosAplicaveis: ['M', 'T'], categoria: 'conforto' },
  { id: 10, descricao: 'Observar e anotar s/n nível de consciência e alterações de comportamento', turnosAplicaveis: ['M', 'T', 'N'], categoria: 'observacao' },
  { id: 11, descricao: 'Observar e anotar s/n condições da pele', turnosAplicaveis: ['M', 'T', 'N'], categoria: 'observacao' },
  { id: 12, descricao: 'Observar e anotar s/n dificuldade na deglutição', turnosAplicaveis: ['M', 'T', 'N'], categoria: 'observacao' },
  { id: 13, descricao: 'Encaminhar ao banho de sol matinal', turnosAplicaveis: ['M'], categoria: 'mobilidade' },
  { id: 14, descricao: 'Auxiliar na movimentação e deambulação', turnosAplicaveis: ['M', 'T'], categoria: 'mobilidade' },
  { id: 15, descricao: 'Realizar troca de fralda e higiene íntima', turnosAplicaveis: ['M', 'T', 'N'], categoria: 'higiene' },
  { id: 16, descricao: 'Realizar mudança de decúbito de 3/3 horas s/necessário', turnosAplicaveis: ['M', 'T', 'N'], categoria: 'mobilidade' }
];

// Base cadastral mínima inicial (enxuta, sem excesso de exemplos)
export const RESIDENTES_INICIAIS: ResidenteResumo[] = [
  {
    id: 'res-001',
    nomeCompleto: 'Maria Elisabete Gonçalves',
    dataNascimento: '1942-05-18',
    idade: 84,
    cpf: '245.891.032-15',
    rg: '14.892.301-8',
    sexo: 'feminino',
    quarto: 'Suíte 102 - Ala Tulipas',
    grauDependencia: 'grau2',
    mobilidade: 'bengala_andador',
    tipoSanguineo: 'O+',
    dieta: 'Diabética, hipossódica, fracionada',
    alergias: ['Penicilina', 'Dipirona'],
    diagnosticos: ['Diabetes Mellitus Tipo 2', 'Hipertensão Arterial Sistêmica', 'Artrose moderada'],
    medicamentosContinuos: [
      { id: 'm1', nome: 'Insulina NPH', dosagem: '18 UI', horario: '07:00 e 21:00', instrucoes: 'Subcutânea prévia ao desjejum e ceia' },
      { id: 'm2', nome: 'Losartana Potássica', dosagem: '50mg', horario: '08:00', instrucoes: 'Via oral' },
      { id: 'm3', nome: 'Metformina', dosagem: '850mg', horario: '12:30', instrucoes: 'Após almoço' }
    ],
    convenioMedico: 'Amil Sênior',
    hospitalReferencia: 'Hospital Brasil Santo André',
    nomeResponsavel: 'Cláudia Gonçalves (Filha)',
    telefoneResponsavel: '(11) 98765-4321',
    observacoesGerais: 'Necessita de aferição de glicemia capilar às 05h, 11h30 e 17h. Boa aceitação da hidratação.'
  }
];

export const CUIDADORES_INICIAIS: CuidadorFuncionario[] = [
  {
    id: 'func-101',
    matricula: 'MAT-101',
    nomeCompleto: 'Juliana Rocha Mendes',
    cargo: 'Cuidador(a) de Idosos',
    departamento: 'Cuidados & Enfermagem',
    escala: '12x36_diurno (07:00 às 19:00)',
    ativo: true
  },
  {
    id: 'func-102',
    matricula: 'MAT-102',
    nomeCompleto: 'Carlos Eduardo Barbosa',
    cargo: 'Técnico(a) de Enfermagem',
    departamento: 'Cuidados & Enfermagem',
    escala: '12x36_noturno (19:00 às 07:00)',
    registroProfissional: 'COREN-SP 482.910-TE',
    ativo: true
  }
];

// Estado reativo em memória sincronizado 100% via Firestore (ZERO localStorage)
let cachedResidentes: ResidenteResumo[] = [...RESIDENTES_INICIAIS];
let cachedCuidadores: CuidadorFuncionario[] = [...CUIDADORES_INICIAIS];
let cachedAnotacoes: AnotacaoDiariaPlantao[] = [];
let cachedMapas: Record<string, MapaPrescricaoMensal> = {};
let cachedEvolucoes: EvolucaoEnfermagem[] = [];
let cachedGlicemiaSinais: RegistroGlicemiaSinais[] = [];
let cachedCuidadorAtivo: CuidadorFuncionario | null = CUIDADORES_INICIAIS[0];

const listeners = new Set<() => void>();
function notifySubscribers() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('[Firebase] Erro em subscriber:', e);
    }
  });
}

export function subscribeToAllData(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Flags para prevenir disparos concorrentes de seed
let seedingResidentes = false;
let seedingCuidadores = false;
let seedingAnotacoes = false;
let seedingMapas = false;
let seedingEvolucoes = false;
let seedingGlicemia = false;
let isRealtimeStarted = false;

export function initFirebaseRealtimeSync() {
  if (isRealtimeStarted) return;
  isRealtimeStarted = true;

  try {
    // 1. Residentes
    onSnapshot(
      collection(db, 'residentes'),
      (snapshot) => {
        if (snapshot.empty && !seedingResidentes) {
          seedingResidentes = true;
          seedInitialResidentes();
        } else if (!snapshot.empty) {
          cachedResidentes = snapshot.docs.map((d) => d.data() as ResidenteResumo);
          notifySubscribers();
        }
      },
      (err) => reportFirestoreError(err, OperationType.LIST, 'residentes')
    );

    // 2. Cuidadores
    onSnapshot(
      collection(db, 'cuidadores'),
      (snapshot) => {
        if (snapshot.empty && !seedingCuidadores) {
          seedingCuidadores = true;
          seedInitialCuidadores();
        } else if (!snapshot.empty) {
          cachedCuidadores = snapshot.docs.map((d) => d.data() as CuidadorFuncionario);
          notifySubscribers();
        }
      },
      (err) => reportFirestoreError(err, OperationType.LIST, 'cuidadores')
    );

    // 3. Anotações de Plantão
    onSnapshot(
      collection(db, 'anotacoes_plantao'),
      (snapshot) => {
        if (snapshot.empty && !seedingAnotacoes) {
          seedingAnotacoes = true;
          seedInitialAnotacoes();
        } else if (!snapshot.empty) {
          cachedAnotacoes = snapshot.docs.map((d) => d.data() as AnotacaoDiariaPlantao);
          notifySubscribers();
        }
      },
      (err) => reportFirestoreError(err, OperationType.LIST, 'anotacoes_plantao')
    );

    // 4. Mapas de Prescrição
    onSnapshot(
      collection(db, 'mapas_prescricao'),
      (snapshot) => {
        if (snapshot.empty && !seedingMapas) {
          seedingMapas = true;
          seedInitialMapas();
        } else if (!snapshot.empty) {
          const next: Record<string, MapaPrescricaoMensal> = {};
          snapshot.docs.forEach((d) => {
            const item = d.data() as MapaPrescricaoMensal;
            next[item.id] = item;
          });
          cachedMapas = next;
          notifySubscribers();
        }
      },
      (err) => reportFirestoreError(err, OperationType.LIST, 'mapas_prescricao')
    );

    // 5. Evoluções de Enfermagem
    onSnapshot(
      collection(db, 'evolucoes_enfermagem'),
      (snapshot) => {
        if (snapshot.empty && !seedingEvolucoes) {
          seedingEvolucoes = true;
          seedInitialEvolucoes();
        } else if (!snapshot.empty) {
          cachedEvolucoes = snapshot.docs.map((d) => d.data() as EvolucaoEnfermagem);
          notifySubscribers();
        }
      },
      (err) => reportFirestoreError(err, OperationType.LIST, 'evolucoes_enfermagem')
    );

    // 6. Glicemia & Sinais Vitais
    onSnapshot(
      collection(db, 'glicemia_vitais'),
      (snapshot) => {
        if (snapshot.empty && !seedingGlicemia) {
          seedingGlicemia = true;
          seedInitialGlicemia();
        } else if (!snapshot.empty) {
          cachedGlicemiaSinais = snapshot.docs.map((d) => d.data() as RegistroGlicemiaSinais);
          notifySubscribers();
        }
      },
      (err) => reportFirestoreError(err, OperationType.LIST, 'glicemia_vitais')
    );

    // 7. Sessão de Cuidador Ativo no Terminal
    onSnapshot(
      doc(db, 'configuracoes_sessao', 'ativa'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.cuidadorAtivo) {
            cachedCuidadorAtivo = data.cuidadorAtivo as CuidadorFuncionario;
            notifySubscribers();
          }
        }
      },
      (err) => reportFirestoreError(err, OperationType.GET, 'configuracoes_sessao/ativa')
    );
  } catch (err) {
    reportFirestoreError(err, OperationType.LIST, 'init_realtime');
  }
}

// Inicia listeners em tempo real automaticamente
initFirebaseRealtimeSync();

// Seeds mínimos no Firestore
async function seedInitialResidentes() {
  try {
    const batch = writeBatch(db);
    RESIDENTES_INICIAIS.forEach((res) => {
      batch.set(doc(db, 'residentes', res.id), res);
    });
    await batch.commit();
  } catch (e) {
    reportFirestoreError(e, OperationType.WRITE, 'seed_residentes');
  }
}

async function seedInitialCuidadores() {
  try {
    const batch = writeBatch(db);
    CUIDADORES_INICIAIS.forEach((c) => {
      batch.set(doc(db, 'cuidadores', c.id), c);
    });
    await batch.commit();
  } catch (e) {
    reportFirestoreError(e, OperationType.WRITE, 'seed_cuidadores');
  }
}

async function seedInitialAnotacoes() {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const initialNote: AnotacaoDiariaPlantao = {
      id: 'anot-001',
      residenteId: 'res-001',
      data: hoje,
      turno: 'diurno',
      cuidadorMatricula: 'MAT-101',
      cuidadorNome: 'Juliana Rocha Mendes',
      cuidadorCargo: 'Cuidador(a) de Idosos',
      recebimentoPlantao: {
        estado: 'acordado',
        nivelConsciencia: 'orientada',
        locomocao: 'deambulando_auxilio'
      },
      sinaisVitais: {
        paSistolica: 120,
        paDiastolica: 80,
        freqCardiaca: 74,
        freqRespiratoria: 18,
        temperatura: 36.4,
        saturacaoO2: 97,
        glicemia: 114,
        horarioGlicemia: '07:00'
      },
      alimentacao: {
        via: 'oral',
        desjejum: 'total',
        suplementoManha: 'total',
        almoco: 'total',
        suplementoTarde: 'parcial',
        jantar: 'total',
        volumeHidricoMl: 1400
      },
      peleCurativos: {
        integridadeCutanea: 'preservada',
        realizadoCurativo: false,
        edema: 'nao_apresenta'
      },
      eliminacoes: {
        diuresePresenca: true,
        diureseAspecto: 'Amarelo claro, odor fisiológico',
        diureseVolumeAprox: '3 trocas no plantão',
        evacuacaoPresenca: true,
        evacuacaoAspecto: 'Fezes pastosas normais',
        evacuacaoFrequencia: '1x manhã'
      },
      passagemPlantao: {
        status: 'sem_intercorrencia',
        relatoIntercorrencia: '',
        anotacoesGerais: 'Residente tranquila durante o dia. Glicemia 114 mg/dL prévia ao café.'
      },
      criadoEm: new Date().toISOString()
    };
    await setDoc(doc(db, 'anotacoes_plantao', initialNote.id), initialNote);
  } catch (e) {
    reportFirestoreError(e, OperationType.WRITE, 'seed_anotacoes');
  }
}

async function seedInitialMapas() {
  try {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth() + 1;
    const diaAtual = agora.getDate();

    const checagens: Record<string, ChecagemPrescricaoRegistro> = {};
    ITENS_PRESCRICAO_PADRAO.slice(0, 3).forEach((item) => {
      const key = `${item.id}_dia${diaAtual}_M`;
      checagens[key] = {
        checado: true,
        cuidadorMatricula: 'MAT-101',
        cuidadorNome: 'Juliana Rocha Mendes',
        hora: '08:30'
      };
    });

    const mapa: MapaPrescricaoMensal = {
      id: `res-001_${ano}_${mes}`,
      residenteId: 'res-001',
      mes,
      ano,
      checagens,
      atualizadoEm: new Date().toISOString()
    };
    await setDoc(doc(db, 'mapas_prescricao', mapa.id), mapa);
  } catch (e) {
    reportFirestoreError(e, OperationType.WRITE, 'seed_mapas');
  }
}

async function seedInitialEvolucoes() {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const evo: EvolucaoEnfermagem = {
      id: 'evo-001',
      residenteId: 'res-001',
      data: hoje,
      hora: '10:00',
      cuidadorMatricula: 'MAT-102',
      cuidadorNome: 'Carlos Eduardo Barbosa',
      cuidadorCargo: 'Técnico(a) de Enfermagem',
      cuidadorRegistro: 'COREN-SP 482.910-TE',
      estadoGeral: 'bom',
      sinaisVitais: {
        pa: '120x80 mmHg',
        fc: '74 bpm',
        temp: '36.4 °C',
        spo2: '97%'
      },
      condicoesGerais: {
        lucida: true,
        orientada: true,
        confusa: false,
        desorientada: false,
        mobilidadePreservada: false,
        mobilidadeReduzida: true,
        acamada: false,
        alimentacaoBoa: true,
        alimentacaoRegular: false,
        alimentacaoRuim: false,
        hidratacaoAdequada: true,
        peleIntegra: true,
        peleComLesao: false,
        usoFralda: true
      },
      diagnosticosEnfermagem: ['Risco de glicemia instável', 'Risco de queda'],
      relatoEvolucao: 'Residente lúcida e orientada, deambulando com auxílio de andador. Boa aceitação da dieta e hidratação regular. Sinais vitais estáveis.',
      condutaEEncaminhamentos: 'Manter plano de cuidados vigente e vigilância contínua para prevenção de quedas.',
      familiarInformado: true,
      criadoEm: new Date().toISOString()
    };
    await setDoc(doc(db, 'evolucoes_enfermagem', evo.id), evo);
  } catch (e) {
    reportFirestoreError(e, OperationType.WRITE, 'seed_evolucoes');
  }
}

async function seedInitialGlicemia() {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const reg: RegistroGlicemiaSinais = {
      id: 'gs-001',
      residenteId: 'res-001',
      data: hoje,
      horario: '07:00',
      tipo: 'ambos',
      glicemia: 114,
      pressaoArterial: '120x80',
      freqCardiaca: 74,
      temperatura: 36.4,
      saturacaoO2: 97,
      momento: '05:00',
      cuidadorMatricula: 'MAT-101',
      cuidadorNome: 'Juliana Rocha Mendes',
      observacoes: 'Glicemia de jejum estável prévia à primeira refeição.',
      criadoEm: new Date().toISOString()
    };
    await setDoc(doc(db, 'glicemia_vitais', reg.id), reg);
  } catch (e) {
    reportFirestoreError(e, OperationType.WRITE, 'seed_glicemia');
  }
}

// 1. Residentes (100% Firestore)
export function getResidentes(): ResidenteResumo[] {
  return cachedResidentes;
}

export async function fetchResidentesFromFirestore(): Promise<ResidenteResumo[]> {
  try {
    const snap = await getDocs(collection(db, 'residentes'));
    if (!snap.empty) {
      cachedResidentes = snap.docs.map((d) => d.data() as ResidenteResumo);
      notifySubscribers();
    }
    return cachedResidentes;
  } catch (err) {
    reportFirestoreError(err, OperationType.GET, 'residentes');
    return cachedResidentes;
  }
}

export async function saveResidentes(list: ResidenteResumo[]) {
  try {
    cachedResidentes = [...list];
    notifySubscribers();
    const batch = writeBatch(db);
    list.forEach((res) => {
      const docRef = doc(db, 'residentes', res.id);
      batch.set(docRef, res);
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'residentes');
  }
}

export async function saveResidente(residente: ResidenteResumo) {
  try {
    const docRef = doc(db, 'residentes', residente.id);
    await setDoc(docRef, residente);
    const idx = cachedResidentes.findIndex((r) => r.id === residente.id);
    if (idx >= 0) {
      cachedResidentes[idx] = residente;
    } else {
      cachedResidentes.push(residente);
    }
    notifySubscribers();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `residentes/${residente.id}`);
  }
}

// 2. Cuidadores (100% Firestore)
export function getCuidadores(): CuidadorFuncionario[] {
  return cachedCuidadores;
}

export async function saveCuidadores(list: CuidadorFuncionario[]) {
  try {
    cachedCuidadores = [...list];
    notifySubscribers();
    const batch = writeBatch(db);
    list.forEach((c) => {
      const docRef = doc(db, 'cuidadores', c.id);
      batch.set(docRef, c);
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'cuidadores');
  }
}

export async function saveCuidador(cuidador: CuidadorFuncionario) {
  try {
    const docRef = doc(db, 'cuidadores', cuidador.id);
    await setDoc(docRef, cuidador);
    const idx = cachedCuidadores.findIndex((c) => c.id === cuidador.id);
    if (idx >= 0) {
      cachedCuidadores[idx] = cuidador;
    } else {
      cachedCuidadores.push(cuidador);
    }
    notifySubscribers();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `cuidadores/${cuidador.id}`);
  }
}

export function findCuidadorByMatricula(matricula: string): CuidadorFuncionario | undefined {
  const clean = matricula.trim().toUpperCase();
  return cachedCuidadores.find(
    (c) =>
      c.matricula.toUpperCase() === clean ||
      c.matricula.replace(/\D/g, '') === clean.replace(/\D/g, '') ||
      c.id.toUpperCase() === clean
  );
}

// 3. Cuidador Ativo no Terminal (Sessão sincronizada no Firestore)
export function getCuidadorAtivo(): CuidadorFuncionario | null {
  return cachedCuidadorAtivo;
}

export async function setCuidadorAtivo(cuidador: CuidadorFuncionario | null) {
  cachedCuidadorAtivo = cuidador;
  notifySubscribers();
  try {
    const sessaoDoc = doc(db, 'configuracoes_sessao', 'ativa');
    await setDoc(
      sessaoDoc,
      {
        id: 'ativa',
        cuidadorAtivo: cuidador,
        atualizadoEm: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    reportFirestoreError(err, OperationType.WRITE, 'configuracoes_sessao/ativa');
  }
}

// 4. Anotações Diárias de Plantão (100% Firestore)
export function getAnotacoesPlantao(residenteId?: string): AnotacaoDiariaPlantao[] {
  if (residenteId) {
    return cachedAnotacoes.filter((item) => item.residenteId === residenteId);
  }
  return cachedAnotacoes;
}

export async function saveAnotacaoPlantao(anotacao: AnotacaoDiariaPlantao): Promise<AnotacaoDiariaPlantao> {
  const docRef = doc(db, 'anotacoes_plantao', anotacao.id);
  const dataToSave = {
    ...anotacao,
    atualizadoEm: new Date().toISOString()
  };

  const index = cachedAnotacoes.findIndex((a) => a.id === anotacao.id);
  if (index >= 0) {
    cachedAnotacoes[index] = dataToSave;
  } else {
    cachedAnotacoes.unshift(dataToSave);
  }
  notifySubscribers();

  try {
    await setDoc(docRef, dataToSave);
    return dataToSave;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `anotacoes_plantao/${anotacao.id}`);
    return dataToSave;
  }
}

// 5. Checagem de Prescrições (100% Firestore)
export function getMapaPrescricao(residenteId: string, mes: number, ano: number): MapaPrescricaoMensal {
  const mapId = `${residenteId}_${ano}_${mes}`;
  if (cachedMapas[mapId]) {
    return cachedMapas[mapId];
  }

  const novo: MapaPrescricaoMensal = {
    id: mapId,
    residenteId,
    mes,
    ano,
    checagens: {},
    atualizadoEm: new Date().toISOString()
  };
  return novo;
}

export async function saveMapaPrescricao(mapa: MapaPrescricaoMensal) {
  const dataToSave: MapaPrescricaoMensal = {
    ...mapa,
    atualizadoEm: new Date().toISOString()
  };
  cachedMapas[mapa.id] = dataToSave;
  notifySubscribers();

  try {
    const docRef = doc(db, 'mapas_prescricao', mapa.id);
    await setDoc(docRef, dataToSave);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `mapas_prescricao/${mapa.id}`);
  }
}

// 6. Evoluções de Enfermagem (100% Firestore)
export function getEvolucoes(residenteId?: string): EvolucaoEnfermagem[] {
  if (residenteId) {
    return cachedEvolucoes.filter((e) => e.residenteId === residenteId);
  }
  return cachedEvolucoes;
}

export async function saveEvolucao(evolucao: EvolucaoEnfermagem): Promise<EvolucaoEnfermagem> {
  const index = cachedEvolucoes.findIndex((e) => e.id === evolucao.id);
  if (index >= 0) {
    cachedEvolucoes[index] = evolucao;
  } else {
    cachedEvolucoes.unshift(evolucao);
  }
  notifySubscribers();

  try {
    const docRef = doc(db, 'evolucoes_enfermagem', evolucao.id);
    await setDoc(docRef, evolucao);
    return evolucao;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `evolucoes_enfermagem/${evolucao.id}`);
    return evolucao;
  }
}

// 7. Glicemia & Sinais Vitais (100% Firestore)
export function getGlicemiaSinais(residenteId?: string): RegistroGlicemiaSinais[] {
  if (residenteId) {
    return cachedGlicemiaSinais.filter((r) => r.residenteId === residenteId);
  }
  return cachedGlicemiaSinais;
}

export async function saveRegistroGlicemiaSinais(registro: RegistroGlicemiaSinais): Promise<RegistroGlicemiaSinais> {
  const index = cachedGlicemiaSinais.findIndex((r) => r.id === registro.id);
  if (index >= 0) {
    cachedGlicemiaSinais[index] = registro;
  } else {
    cachedGlicemiaSinais.unshift(registro);
  }
  notifySubscribers();

  try {
    const docRef = doc(db, 'glicemia_vitais', registro.id);
    await setDoc(docRef, registro);
    return registro;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `glicemia_vitais/${registro.id}`);
    return registro;
  }
}
