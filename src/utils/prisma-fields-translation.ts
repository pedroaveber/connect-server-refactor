// Model name translations
const modelTranslations: Record<string, string> = {
  Ambulance: "Ambulância",
  AmbulanceDestinationCommands: "Comando de Destino da Ambulância",
  AmbulanceDocuments: "Documento da Ambulância",
  AmbulanceShift: "Plantão da Ambulância",
  AmbulanceStatus: "Status da Ambulância",
  Base: "Base",
  Chat: "Chat",
  Company: "Empresa",
  CompanyGroup: "Grupo de Empresas",
  CompanyModule: "Módulo Contratado",
  Integration: "Integração",
  MessageReadReceipt: "Confirmação de Leitura",
  Messages: "Mensagem",
  Module: "Módulo",
  Phone: "Telefone",
  Role: "Função",
  Unit: "Unidade",
  User: "Usuário",
};

// Field name translations
const fieldTranslations: Record<string, string> = {
  // Campos comuns
  id: "identificador",
  name: "nome",
  createdAt: "data de criação",
  updatedAt: "data de atualização",
  deletedAt: "data de exclusão",
  observation: "observação",

  // Localização
  latitude: "latitude",
  longitude: "longitude",
  address: "endereço",

  // Ambulância
  plateNumber: "placa",
  linkingCode: "código de vínculo",
  ambulanceBaseId: "base da ambulância",
  ambulanceId: "ambulância",

  // Ambulância - documentos
  documentTitle: "título do documento",
  documentType: "tipo do documento",
  documentUrl: "URL do documento",
  validUntil: "válido até",

  // Ambulância - destino/comando
  baseId: "base",
  attended: "atendido",
  attendedAt: "data de atendimento",

  // Ambulância - plantão
  startDate: "data de início",
  endDate: "data de término",
  userId: "usuário",

  // Ambulância - status
  status: "status",

  // Base
  base: "base",
  baseName: "nome da base",

  // Empresa e Grupo
  companyId: "empresa",
  companyGroupId: "grupo de empresas",
  document: "documento",
  customPrice: "preço personalizado",
  quantity: "quantidade contratada",
  startDateContract: "início do contrato",
  endDateContract: "término do contrato",
  billingCycle: "ciclo de cobrança",
  contractedAt: "data da contratação",
  active: "ativo",

  // Integrações
  type: "tipo",
  url: "URL",
  login: "login",
  password: "senha",
  apiKey: "chave de API",
  config: "configuração",
  isCompanyGroupWide: "abrange todo o grupo",

  // Mensagens
  messageContent: "conteúdo da mensagem",
  messageType: "tipo de mensagem",
  messageFile: "arquivo da mensagem",
  chatId: "chat",
  readAt: "lido em",

  // Módulos
  moduleId: "módulo",
  billingType: "tipo de cobrança",
  defaultPrice: "preço padrão",
  internal: "interno",

  // Telefones
  number: "número de telefone",

  // Usuário
  documentUser: "documento",
  passwordUser: "senha",
  birthDate: "data de nascimento",
  avatarUrl: "foto de perfil",
  roles: "funções",

  // Unit
  unitId: "unidade",

  // Relations genéricos
  phones: "telefones",
  ambulanceShift: "plantões da ambulância",
  ambulanceStatus: "status da ambulância",
  ambulanceDocuments: "documentos da ambulância",
  ambulanceDestinationCommands: "comandos de destino",
  chat: "chat",
  messages: "mensagens",
  messageReadReceipt: "confirmações de leitura",
};

// Traduz modelo ou campo
export function translateName(name: string, isModel = false): string {
  const translations = isModel ? modelTranslations : fieldTranslations;
  return translations[name] || name;
}

// Formata nome de campo para exibição legível
export function formatFieldName(fieldName: string | undefined): string {
  if (!fieldName) {
    return "";
  }
  return translateName(fieldName)
    .toLowerCase()
    .replace(/_/g, " ");
}
