// Este archivo contiene las interfaces TypeScript generadas a partir del schema.prisma.
// No incluye lógica de base de datos ni decoradores de Prisma, solo las formas de los datos.

// --- Enums ---

export enum VideoType {
  External = "external",
  Mux = "mux",
  Youtube = "youtube",
  Vimeo = "vimeo",
}

export enum QuestionType {
  Single = "single",
  Multiple = "multiple",
  Text = "text",
}

// --- Interfaces de Modelos ---

export interface Course {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  isPublished: boolean;
  delete?: boolean | null;
  categoryId?: string | null;
  category?: Category | null; // Relación
  chapters: Chapter[]; // Relación
  attachments: Attachment[]; // Relación
  purchases: Purchase[]; // Relación
  data?: any | null; // JSON -> any o un tipo más específico si se conoce
  createdAt: Date;
  updatedAt: Date;
  user: User; // Relación
}

export interface Category {
  id: string;
  name: string;
  courses: Course[]; // Relación
  data?: any | null; // JSON
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  courseId: string;
  course: Course; // Relación
  data?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  delete?: boolean | null;
  video?: Video | null; // Relación
  courseId: string;
  course: Course; // Relación
  userProgress: UserProgress[]; // Relación
  data?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  type: VideoType;
  url?: string | null;
  assetId?: string | null;
  playbackId?: string | null;
  status?: string | null;
  duration?: number | null;
  resolution?: string | null;
  aspectRatio?: string | null;
  chapterId: string;
  chapter: Chapter; // Relación
  data?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  id: string;
  userId: string;
  chapterId: string;
  chapter: Chapter; // Relación
  isCompleted: boolean;
  data?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
  user: User; // Relación
}

export interface Purchase {
  id: string;
  userId: string;
  courseId: string;
  course: Course; // Relación
  data?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
  user: User; // Relación
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phone?: string | null;
  customRole: string;
  provider: string;
  lastSignInAt?: Date | null;
  metadata: any; // JSON
  isActive: boolean;
  isBanned: boolean;
  isDeleted: boolean;
  additionalStatus: string;
  createdAt: Date;
  updatedAt: Date;
  courses: Course[]; // Relación
  purchases: Purchase[]; // Relación
  userProgress: UserProgress[]; // Relación
  invoices: Invoice[]; // Relación
  examAttempts: ExamAttempt[]; // Relación
  certificates: Certificate[]; // Relación
  Subscription?: Subscription | null; // Relación
  PaymentMethod: PaymentMethod[]; // Relación
  Payment: Payment[]; // Relación
  AuditLog: AuditLog[]; // Relación
  Notification: Notification[]; // Relación
  UserAccess: UserAccess[]; // Relación
  LegalDocument: LegalDocument[]; // Relación (para `approvedBy` en LegalDocument)
}

export interface Invoice {
  id: string;
  userId: string;
  user: User; // Relación
  concept: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  issuedAt: Date;
  paidAt?: Date | null;
  data: any; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface Exam {
  id: string;
  title: string;
  description?: string | null;
  duration?: number | null;
  isPublished: boolean;
  questions: Question[]; // Relación
  attempts: ExamAttempt[]; // Relación
  data?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  examId: string;
  exam: Exam; // Relación
  text: string;
  type: QuestionType;
  options: Option[]; // Relación
  correctAnswers: string[];
  points: number;
  isVisible?: boolean | null;
  explanationText?: string | null;
  answers: Answer[]; // Relación
  data?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface Option {
  id: string;
  questionId: string;
  question: Question; // Relación
  text: string;
  isCorrect?: boolean | null;
  data?: any | null; // JSON
  createdAt: Date;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string;
  user: User; // Relación
  exam: Exam; // Relación
  startedAt: Date;
  submittedAt?: Date | null;
  score?: number | null;
  status: string;
  answers: Answer[]; // Relación
  data?: any | null; // JSON
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  attempt: ExamAttempt; // Relación
  question: Question; // Relación
  selectedOptionIds: string[];
  textResponse?: string | null;
  isCorrect?: boolean | null;
  data?: any | null; // JSON
  createdAt: Date;
}

export interface Certificate {
  id: string;
  userId: string;
  user: User; // Relación
  title: string;
  institution: string;
  issuedAt: Date;
  fileUrl?: string | null;
  code?: string | null;
  description?: string | null;
  data?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string; // Prisma maneja la unicidad a nivel DB
  user: User; // Relación
  isActive: boolean;
  startDate: Date;
  endDate?: Date | null;
  plan: string;
  metadata?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  user: User; // Relación
  type: string;
  provider?: string | null;
  last4?: string | null;
  token?: string | null;
  isDefault: boolean;
  metadata?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
  Payment: Payment[]; // Relación
}

export interface Payment {
  id: string;
  userId: string;
  user: User; // Relación
  methodId?: string | null;
  method?: PaymentMethod | null; // Relación
  amount: number;
  currency: string;
  status: string;
  referenceCode?: string | null;
  description?: string | null;
  metadata?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: User | null; // Relación
  action: string;
  context?: string | null;
  metadata?: any | null; // JSON
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  user: User; // Relación
  title: string;
  message: string;
  read: boolean;
  metadata?: any | null; // JSON
  createdAt: Date;
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  metadata?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAccess {
  id: string;
  userId: string;
  user: User; // Relación
  toolId: string;
  tool: Tool; // Relación
  accessType: string;
  expiresAt?: Date | null;
  isActive: boolean;
  metadata?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface Tool {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  type: string;
  price?: number | null;
  accessUrl?: string | null;
  isActive: boolean;
  metadata?: any | null; // JSON
  userAccess: UserAccess[]; // Relación
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalDocument {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: string;
  visibility: string; // "public" | "internal" | "private" (o usar un enum si prefieres)
  status: string; // "draft" | "pending_approval" | "approved" (o usar un enum)
  approvedById?: string | null;
  approvedBy?: User | null; // Relación
  effectiveFrom?: Date | null;
  metadata?: any | null; // JSON
  createdAt: Date;
  updatedAt: Date;
}

// Nota:
// - Los tipos `Json` de Prisma se han mapeado a `any` en TypeScript. Puedes
//   reemplazar `any` con tipos más específicos si conoces la estructura del JSON.
// - Los tipos `DateTime` de Prisma se mapean a `Date` en TypeScript.
// - Los tipos `Int` y `Float` de Prisma se mapean a `number` en TypeScript.
// - Los campos opcionales en Prisma (con `?`) se mapean a campos opcionales
//   en TypeScript (con `?:`) y pueden aceptar `null`.
// - Las relaciones se representan referenciando las otras interfaces.
// - Los atributos y directivas específicas de Prisma (@id, @default, @relation, @@index, etc.)
//   no se traducen directamente a la interfaz TypeScript, ya que definen
//   comportamiento de la base de datos, no la forma del objeto en el código.
