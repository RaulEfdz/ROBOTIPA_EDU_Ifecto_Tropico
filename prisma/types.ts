export interface UserResponse {
  success: boolean;
  clerkUser: ClerkUserData;
  dbUser: UserProfile | null;
  error?: string;
}

export interface ClerkUserData {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  publicMetadata?: Record<string, unknown>;
  privateMetadata?: Record<string, unknown>;
}
export interface UserProfile {
    id: string; // ID único del usuario
    emailAddress: string; // Dirección de correo electrónico
    fullName: string; // Nombre completo
    phoneNumber: string; // Número de teléfono
    countryOfResidence: string; // País de residencia
    age: number; // Edad
    gender: string; // Género
    university: string; // Universidad
    educationLevel: string; // Nivel educativo
    major: string; // Carrera principal
    otherMajor: string; // Otra carrera
    specializationArea: string; // Área de especialización
    learningObjectives: string[]; // Objetivos de aprendizaje
    otherObjective: string; // Otro objetivo de aprendizaje adicional
    communicationPreferences: string[]; // Preferencias de comunicación
    acceptsTerms: boolean; // Indica si el usuario acepta los términos
    role: 'developer' | 'admin' | 'user'; // Rol del usuario
    available: boolean; // Indica si el usuario está disponible
    avatar: string; // URL de avatar
    isEmailVerified: boolean; // Indica si el correo ha sido verificado
    isAdminVerified: boolean; // Indica si ha sido verificado por un administrador
    createdAt: Date; // Fecha de creación
    updatedAt: Date; // Fecha de actualización
    deviceType: string; // Tipo de dispositivo desde donde se conecta
  }


export interface User {
  id: string;
  emailAddress: string;
  fullName: string;
  phoneNumber: string;
  countryOfResidence: string;
  age?: number | null;
  gender: string;
  university: string;
  educationLevel: string;
  major: string;
  otherMajor: string;
  specializationArea: string;
  learningObjectives: string[];
  otherObjective: string;
  communicationPreferences: string[];
  acceptsTerms: boolean;
  role: string;
  available: boolean;
  avatar: string;
  isEmailVerified: boolean;
  isAdminVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deviceType: string;
  courses: Course[];
  purchases?: Purchase[];
  userProgresses?: UserProgress[];
  stripeCustomer?: StripeCustomer | null;
}

export interface Course {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  isPublished: boolean;
  categoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  chapters: Chapter[];
  attachments: Attachment[];
  purchases: Purchase[];
  user: User;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
  muxData?: MuxData | null;
  userProgress: UserProgress[];
}

export interface MuxData {
  id: string;
  assetId: string;
  playbackId?: string | null;
  chapterId: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  course: Course;
}

export interface UserProgress {
  id: string;
  userId: string;
  chapterId: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StripeCustomer {
  id: string;
  userId: string;
  stripeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface muxVideoTypes {
  id: string;
  type: 'mux';
  url: string;
  assetId: string;
  playbackId: string;
  status: 'ready' | 'processing' | 'errored'; // puedes ajustar si hay más estados posibles
  duration: number;
  resolution: string;
  aspectRatio: string;
  createdAt: string; // o Date, si vas a convertirlo al objeto Date
  updatedAt: string; // o Date, igual que arriba
  chapterId: string;
}

