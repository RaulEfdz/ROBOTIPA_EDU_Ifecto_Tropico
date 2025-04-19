// locales/course-create.ts

// Reusable structure for translations
interface TranslationSet {
  es: string; // Spanish
  en: string; // English
}

// Specific texts for the CreatePage component
interface CourseCreateTexts {
  pageTitle: TranslationSet;
  pageDescription: TranslationSet;
  pageSubDescription: TranslationSet;
  titleLabel: TranslationSet;
  titlePlaceholder: TranslationSet;
  titleDescription: TranslationSet;
  cancelButton: TranslationSet;
  continueButton: TranslationSet;
  submittingButton: TranslationSet;
  backButton: TranslationSet;
  successMessage: TranslationSet;
  successDescription: TranslationSet;
  errorMessage: TranslationSet;
  errorDescription: TranslationSet;
  validationTitleRequired: TranslationSet; // For Zod validation
  validationTitleTooLong: TranslationSet; // For Zod validation
}

// Export the texts
export const texts: CourseCreateTexts = {
  pageTitle: {
    es: "Crea tu curso",
    en: "Create your course",
  },
  pageDescription: {
    es: "Crea un nuevo curso",
    en: "Create a new course",
  },
  pageSubDescription: {
    es: "Dale un nombre atractivo a tu curso. Puedes cambiarlo más tarde.",
    en: "Give your course an engaging name. You can change it later.",
  },
  titleLabel: {
    es: "Título del curso",
    en: "Course title",
  },
  titlePlaceholder: {
    es: "ej. 'Capacitación en habilidades avanzadas'",
    en: "e.g., 'Advanced Skill Training'",
  },
  titleDescription: {
    es: "Describe brevemente lo que abordarás en este curso.",
    en: "Briefly describe what you will cover in this course.",
  },
  cancelButton: {
    es: "Cancelar",
    en: "Cancel",
  },
  continueButton: {
    es: "Continuar",
    en: "Continue",
  },
  submittingButton: {
    es: "Creando...",
    en: "Creating...",
  },
  backButton: {
    es: "Volver",
    en: "Go back",
  },
  successMessage: {
    es: "¡Curso creado con éxito!",
    en: "Course created successfully!",
  },
  successDescription: {
    es: "Ahora puedes comenzar a añadir contenido a tu curso.",
    en: "You can now start adding content to your course.",
  },
  errorMessage: {
    es: "Error al crear el curso",
    en: "Error creating course",
  },
  errorDescription: {
    es: "Hubo un problema al crear tu curso. Por favor intenta nuevamente.",
    en: "There was a problem creating your course. Please try again.",
  },
  validationTitleRequired: {
    es: "El título del curso es obligatorio (mínimo 3 caracteres)",
    en: "Course title is required (minimum 3 characters)",
  },
  validationTitleTooLong: {
    es: "El título no puede exceder los 60 caracteres",
    en: "The title cannot exceed 60 characters",
  },
};

// Define available languages and the default
export type Language = "es" | "en";
export const defaultLanguage: Language = "es";

// Helper function type
export type TFunction = (key: keyof CourseCreateTexts) => string;