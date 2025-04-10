// Enums
export enum VideoType {
  external = "external",
  mux = "mux"
}

export enum QuestionType {
  single = "single",    // Una sola respuesta correcta
  multiple = "multiple",// Varias respuestas correctas
  text = "text"         // Respuesta abierta escrita
}

// Interfaces de modelos

export interface Course {
  id: string;
  userId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  isPublished: boolean;
  delete?: boolean;
  categoryId?: string;
  category?: Category;
  chapters: Chapter[];
  attachments: Attachment[];
  purchases: Purchase[];
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  courses: Course[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  courseId: string;
  course: Course;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  delete?: boolean;
  video?: Video;
  courseId: string;
  course: Course;
  userProgress: UserProgress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  type: VideoType;
  url?: string;
  assetId?: string;
  playbackId?: string;
  status?: string;
  duration?: number;
  resolution?: string;
  aspectRatio?: string;
  createdAt: Date;
  updatedAt: Date;
  chapterId: string;
  chapter: Chapter;
}

export interface UserProgress {
  id: string;
  userId: string;
  chapterId: string;
  chapter: Chapter;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface Purchase {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phone?: string;
  customRole: string;
  provider: string;
  lastSignInAt?: Date;
  metadata: any; // se podría especificar más el tipo si se conoce la estructura del JSON
  isActive: boolean;
  isBanned: boolean;
  isDeleted: boolean;
  additionalStatus: string;
  createdAt: Date;
  updatedAt: Date;
  courses: Course[];
  purchases: Purchase[];
  userProgress: UserProgress[];
  invoices: Invoice[];
  examAttempts: ExamAttempt[];
}

export interface Invoice {
  id: string;
  userId: string;
  user: User;
  concept: string;
  amount: number;
  currency: string;
  status: string;         // Ej: 'pending', 'paid', 'failed', etc.
  paymentMethod: string;  // Ej: 'yappy', 'paypal', 'transfer'
  issuedAt: Date;
  paidAt?: Date;
  data: any;              // Datos adicionales según el método (tipo JSON)
  createdAt: Date;
  updatedAt: Date;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration?: number;       // Duración en minutos
  isPublished: boolean;
  questions: Question[];
  attempts: ExamAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  examId: string;
  exam: Exam;
  text: string;
  type: QuestionType;
  options: Option[];
  correctAnswers: string[]; // IDs de las opciones correctas
  points: number;
  answers: Answer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Option {
  id: string;
  questionId: string;
  question: Question;
  text: string;
  createdAt: Date;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string;
  user: User;
  exam: Exam;
  startedAt: Date;
  submittedAt?: Date;
  score?: number;
  status: string;         // Ej: "in_progress"
  answers: Answer[];
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  attempt: ExamAttempt;
  question: Question;
  selectedOptionIds: string[];
  textResponse?: string;
  isCorrect?: boolean;
  createdAt: Date;
}
