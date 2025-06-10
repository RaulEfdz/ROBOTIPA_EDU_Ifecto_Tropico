-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Answer (
  data jsonb,
  id text NOT NULL,
  attemptId text NOT NULL,
  questionId text NOT NULL,
  selectedOptionIds ARRAY,
  textResponse text,
  isCorrect boolean,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Answer_pkey PRIMARY KEY (id),
  CONSTRAINT Answer_questionId_fkey FOREIGN KEY (questionId) REFERENCES public.Question(id),
  CONSTRAINT Answer_attemptId_fkey FOREIGN KEY (attemptId) REFERENCES public.ExamAttempt(id)
);
CREATE TABLE public.Attachment (
  data jsonb,
  id text NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  courseId text NOT NULL,
  updatedAt timestamp without time zone NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Attachment_pkey PRIMARY KEY (id),
  CONSTRAINT Attachment_courseId_fkey FOREIGN KEY (courseId) REFERENCES public.Course(id)
);
CREATE TABLE public.AuditLog (
  id text NOT NULL,
  userId text,
  action text NOT NULL,
  context text,
  metadata jsonb,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT AuditLog_pkey PRIMARY KEY (id),
  CONSTRAINT AuditLog_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Category (
  data jsonb,
  id text NOT NULL,
  name text NOT NULL,
  CONSTRAINT Category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Certificate (
  id text NOT NULL,
  userId text NOT NULL,
  title text NOT NULL,
  institution text NOT NULL,
  issuedAt timestamp without time zone NOT NULL,
  fileUrl text,
  description text,
  data jsonb,
  updatedAt timestamp without time zone NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  courseId text NOT NULL,
  code text NOT NULL,
  pdfUrl text,
  templateId text,
  CONSTRAINT Certificate_pkey PRIMARY KEY (id),
  CONSTRAINT Certificate_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT Certificate_courseId_fkey FOREIGN KEY (courseId) REFERENCES public.Course(id)
);
CREATE TABLE public.Chapter (
  data jsonb,
  id text NOT NULL,
  title text NOT NULL,
  description text,
  position integer NOT NULL,
  courseId text NOT NULL,
  updatedAt timestamp without time zone NOT NULL,
  isPublished boolean NOT NULL DEFAULT false,
  isFree boolean NOT NULL DEFAULT false,
  delete boolean DEFAULT false,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Chapter_pkey PRIMARY KEY (id),
  CONSTRAINT Chapter_courseId_fkey FOREIGN KEY (courseId) REFERENCES public.Course(id)
);
CREATE TABLE public.Course (
  data jsonb,
  examId text,
  id text NOT NULL,
  userId text NOT NULL,
  title text NOT NULL,
  description text,
  imageUrl text,
  price double precision,
  categoryId text,
  updatedAt timestamp without time zone NOT NULL,
  isPublished boolean NOT NULL DEFAULT false,
  delete boolean DEFAULT false,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Course_pkey PRIMARY KEY (id),
  CONSTRAINT Course_examId_fkey FOREIGN KEY (examId) REFERENCES public.Exam(id),
  CONSTRAINT Course_categoryId_fkey FOREIGN KEY (categoryId) REFERENCES public.Category(id),
  CONSTRAINT Course_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Exam (
  data jsonb,
  id text NOT NULL,
  title text NOT NULL,
  description text,
  duration integer,
  updatedAt timestamp without time zone NOT NULL,
  isPublished boolean NOT NULL DEFAULT false,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Exam_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ExamAttempt (
  data jsonb,
  id text NOT NULL,
  userId text NOT NULL,
  examId text NOT NULL,
  submittedAt timestamp without time zone,
  score double precision,
  startedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status text NOT NULL DEFAULT 'in_progress'::text,
  CONSTRAINT ExamAttempt_pkey PRIMARY KEY (id),
  CONSTRAINT ExamAttempt_examId_fkey FOREIGN KEY (examId) REFERENCES public.Exam(id),
  CONSTRAINT ExamAttempt_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.FeatureFlag (
  id text NOT NULL,
  key text NOT NULL,
  metadata jsonb,
  updatedAt timestamp without time zone NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT FeatureFlag_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Invoice (
  id text NOT NULL,
  userId text NOT NULL,
  concept text NOT NULL,
  amount double precision NOT NULL,
  currency text NOT NULL,
  status text NOT NULL,
  issuedAt timestamp without time zone NOT NULL,
  paidAt timestamp without time zone,
  data jsonb NOT NULL,
  updatedAt timestamp without time zone NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paymentMethod text NOT NULL,
  CONSTRAINT Invoice_pkey PRIMARY KEY (id),
  CONSTRAINT Invoice_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.LegalDocument (
  id text NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  type text NOT NULL,
  approvedById text,
  effectiveFrom timestamp without time zone,
  metadata jsonb,
  updatedAt timestamp without time zone NOT NULL,
  visibility text NOT NULL DEFAULT 'public'::text,
  status text NOT NULL DEFAULT 'draft'::text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT LegalDocument_pkey PRIMARY KEY (id),
  CONSTRAINT LegalDocument_approvedById_fkey FOREIGN KEY (approvedById) REFERENCES public.User(id)
);
CREATE TABLE public.Notification (
  id text NOT NULL,
  userId text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb,
  read boolean NOT NULL DEFAULT false,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Notification_pkey PRIMARY KEY (id),
  CONSTRAINT Notification_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Option (
  data jsonb,
  isCorrect boolean,
  id text NOT NULL,
  questionId text NOT NULL,
  text text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Option_pkey PRIMARY KEY (id),
  CONSTRAINT Option_questionId_fkey FOREIGN KEY (questionId) REFERENCES public.Question(id)
);
CREATE TABLE public.Payment (
  id text NOT NULL,
  userId text NOT NULL,
  methodId text,
  amount double precision NOT NULL,
  currency text NOT NULL,
  status text NOT NULL,
  referenceCode text,
  description text,
  metadata jsonb,
  updatedAt timestamp without time zone NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Payment_pkey PRIMARY KEY (id),
  CONSTRAINT Payment_methodId_fkey FOREIGN KEY (methodId) REFERENCES public.PaymentMethod(id),
  CONSTRAINT Payment_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.PaymentMethod (
  id text NOT NULL,
  userId text NOT NULL,
  type text NOT NULL,
  provider text,
  last4 text,
  token text,
  metadata jsonb,
  updatedAt timestamp without time zone NOT NULL,
  isDefault boolean NOT NULL DEFAULT false,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT PaymentMethod_pkey PRIMARY KEY (id),
  CONSTRAINT PaymentMethod_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Purchase (
  metadata jsonb,
  paymentId text,
  id text NOT NULL,
  userId text NOT NULL,
  courseId text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Purchase_pkey PRIMARY KEY (id),
  CONSTRAINT Purchase_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT Purchase_paymentId_fkey FOREIGN KEY (paymentId) REFERENCES public.Payment(id),
  CONSTRAINT Purchase_courseId_fkey FOREIGN KEY (courseId) REFERENCES public.Course(id)
);
CREATE TABLE public.Question (
  data jsonb,
  explanationText text,
  isVisible boolean,
  id text NOT NULL,
  examId text NOT NULL,
  text text NOT NULL,
  type USER-DEFINED NOT NULL,
  correctAnswers ARRAY,
  updatedAt timestamp without time zone NOT NULL,
  points double precision NOT NULL DEFAULT 1.0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Question_pkey PRIMARY KEY (id),
  CONSTRAINT Question_examId_fkey FOREIGN KEY (examId) REFERENCES public.Exam(id)
);
CREATE TABLE public.Subscription (
  id text NOT NULL,
  userId text NOT NULL,
  endDate timestamp without time zone,
  plan text NOT NULL,
  metadata jsonb,
  updatedAt timestamp without time zone NOT NULL,
  isActive boolean NOT NULL DEFAULT true,
  startDate timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Subscription_pkey PRIMARY KEY (id),
  CONSTRAINT Subscription_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Tool (
  id text NOT NULL,
  key text NOT NULL,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  price double precision,
  accessUrl text,
  metadata jsonb,
  updatedAt timestamp without time zone NOT NULL,
  isActive boolean NOT NULL DEFAULT true,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Tool_pkey PRIMARY KEY (id)
);
CREATE TABLE public.User (
  id text NOT NULL,
  email text NOT NULL,
  fullName text NOT NULL,
  username text NOT NULL,
  phone text,
  customRole text NOT NULL,
  provider text NOT NULL,
  lastSignInAt timestamp without time zone,
  metadata jsonb NOT NULL,
  updatedAt timestamp without time zone NOT NULL,
  isActive boolean NOT NULL DEFAULT true,
  isBanned boolean NOT NULL DEFAULT false,
  isDeleted boolean NOT NULL DEFAULT false,
  additionalStatus text NOT NULL DEFAULT 'active'::text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT User_pkey PRIMARY KEY (id)
);
CREATE TABLE public.UserAccess (
  id text NOT NULL,
  userId text NOT NULL,
  toolId text NOT NULL,
  accessType text NOT NULL,
  expiresAt timestamp without time zone,
  metadata jsonb,
  updatedAt timestamp without time zone NOT NULL,
  isActive boolean NOT NULL DEFAULT true,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT UserAccess_pkey PRIMARY KEY (id),
  CONSTRAINT UserAccess_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT UserAccess_toolId_fkey FOREIGN KEY (toolId) REFERENCES public.Tool(id)
);
CREATE TABLE public.UserProgress (
  data jsonb,
  id text NOT NULL,
  userId text NOT NULL,
  chapterId text NOT NULL,
  updatedAt timestamp without time zone NOT NULL,
  isCompleted boolean NOT NULL DEFAULT false,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT UserProgress_pkey PRIMARY KEY (id),
  CONSTRAINT UserProgress_chapterId_fkey FOREIGN KEY (chapterId) REFERENCES public.Chapter(id),
  CONSTRAINT UserProgress_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Video (
  data jsonb,
  id text NOT NULL,
  type USER-DEFINED NOT NULL,
  url text,
  assetId text,
  playbackId text,
  status text,
  duration double precision,
  resolution text,
  aspectRatio text,
  updatedAt timestamp without time zone NOT NULL,
  chapterId text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Video_pkey PRIMARY KEY (id),
  CONSTRAINT Video_chapterId_fkey FOREIGN KEY (chapterId) REFERENCES public.Chapter(id)
);
CREATE TABLE public._CourseExams (
  A text NOT NULL,
  B text NOT NULL,
  CONSTRAINT _CourseExams_A_fkey FOREIGN KEY (A) REFERENCES public.Course(id),
  CONSTRAINT _CourseExams_B_fkey FOREIGN KEY (B) REFERENCES public.Exam(id)
);
CREATE TABLE public._prisma_migrations (
  id character varying NOT NULL,
  checksum character varying NOT NULL,
  finished_at timestamp with time zone,
  migration_name character varying NOT NULL,
  logs text,
  rolled_back_at timestamp with time zone,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  applied_steps_count integer NOT NULL DEFAULT 0,
  CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id)
);