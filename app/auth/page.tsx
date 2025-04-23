"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { LoginForm } from "./SignIn/LoginForm";
import { SignupForm } from "./SignUp/SignupForm";
import { EmailConfirmationPending } from "./SignUp/confirm-action/EmailConfirmationPending";
import { PasswordRecoveryForm } from "./ResetPass/PasswordRecoveryForm";
import { loginConfig } from "./config/loginConfig";
import { printDebug } from "@/utils/debug/log";
// import { getCurrentUserFromDB, UserDB } from "./CurrentUser/getCurrentUserFromDB";
import {
  getCurrentUserFromDB,
  UserDB,
} from "./CurrentUser/getCurrentUserFromDB";
import ClearCacheButton from "./clearSiteData";

const metaDataPage = {
  title: "auth",
  route: "app/auth/page.tsx",
  index: 0,
};

printDebug(`${metaDataPage.index} ${metaDataPage.route}`);

export default function AuthPage() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState<UserDB | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { layout, logo, leftPanel, rightPanel, eventBanner, styles } =
    loginConfig;

  const backgroundImages = Array.isArray(layout?.backgroundImage)
    ? layout.backgroundImage
    : [layout?.backgroundImage];

  const currentStyles = styles?.[styles.mode] || styles.light;

  // Leer email pendiente de verificación
  useEffect(() => {
    const storedEmail = localStorage.getItem("pendingEmailVerification");
    if (storedEmail) {
      setEmail(storedEmail);
      setShowConfirmationMessage(true);
    }
  }, []);

  // Verificar si hay un usuario no confirmado
  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUserFromDB();
      if (!user) return;

      setUserData(user);

      const metadata = user.metadata || {};
      const email = user.email;
      const emailVerified = metadata?.email_verified ?? true; // puedes ajustarlo si guardas ese dato

      if (email && !emailVerified) {
        localStorage.setItem("pendingEmailVerification", email);
        setEmail(email);
        setShowConfirmationMessage(true);
      }
    };
    fetchData();
  }, []);

  // Animación de carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Verificar sesión e insertar usuario
  useEffect(() => {
    const checkSession = async () => {
      const user = await getCurrentUserFromDB();
      printDebug(`checkSession > user: ${JSON.stringify(user)}`);

      if (user) {
        setIsLoggedIn(true);

        try {
          const response = await fetch("/api/auth/insertUser");
          const result = await response.json();
          printDebug(`insertUser > response: ${JSON.stringify(result)}`);

          if (!response.ok) {
            toast.error(
              result.error || "Ocurrió un error al registrar el usuario"
            );
            return;
          }

          if (result.success) {
            toast.success("Sesión iniciada. ¡Bienvenido!");
          } else if (result.message === "Usuario ya existe") {
            toast.info("Bienvenido de nuevo 👋");
          } else {
            toast("Usuario validado");
          }

          router.push("/");
        } catch (error) {
          console.error("❌ Error al llamar a /api/auth/insertUser:", error);
          toast.error("Error al conectar con el servidor.");
        }
      }
    };

    checkSession();
  }, [router]);

  // Redirección si ya está logueado
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  const handleSignupSuccess = () => {
    setShowConfirmationMessage(true);
  };

  if (isLoggedIn) return null;
  if (showConfirmationMessage) {
    return <EmailConfirmationPending email={email} />;
  }
  const defaultVisitorRoleId = process.env.NEXT_PUBLIC_VISITOR_ID || "";

  return (
    <div
      className="flex h-screen w-full"
      style={{ backgroundColor: currentStyles.backgrounds.panel }}
    >
      {/* Panel izquierdo */}
      {leftPanel?.show && (
        <div className="hidden md:flex w-1/2 items-center justify-center relative">
          <Image
            key={backgroundImages[currentImageIndex]}
            src={backgroundImages[currentImageIndex]}
            alt="Fondo del carrusel"
            width={800}
            height={1200}
            className="absolute inset-0 object-contain w-full h-full opacity-90 p-2 transition-all duration-1000"
          />
          {layout?.coverColor !== "none" && (
            <div
              className="absolute inset-0 m-2 rounded-md"
              style={{ backgroundColor: layout?.coverColor, opacity: 0 }}
            />
          )}
          <div className="relative z-10 text-center px-10 text-TextCustom">
            {logo?.show && (
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.width}
                className="mx-auto mb-4"
              />
            )}
            <h1 className="text-3xl font-bold mb-2">
              {leftPanel.taglineTitle}
            </h1>
            <p
              className="text-sm"
              style={{ color: currentStyles.texts.secondary }}
            >
              {leftPanel.taglineSubtitle}
            </p>
          </div>
          {leftPanel.backToWebsite?.show && (
            <div className="absolute top-0 right-0 z-10 m-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(leftPanel.backToWebsite.url)}
              >
                {leftPanel.backToWebsite.text}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Panel derecho */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <div
          className="w-full max-w-md space-y-6 p-6 rounded-lg shadow"
          style={{ backgroundColor: currentStyles.backgrounds.panel }}
        >
          {/* Banner */}
          {eventBanner?.show && (
            <div
              className="p-4 rounded-md shadow-sm text-center"
              style={{
                backgroundColor: currentStyles.backgrounds.banner,
                borderColor: currentStyles.borders.default,
                borderWidth: 1,
                borderStyle: "solid",
                color: currentStyles.texts.primary,
              }}
            >
              <h3 className="text-base font-semibold">{eventBanner.title}</h3>
              <p
                className="text-sm"
                style={{ color: currentStyles.texts.secondary }}
              >
                {eventBanner.description}
              </p>
              <a
                href={eventBanner.ctaUrl}
                className="inline-block mt-2 text-sm font-medium underline"
                style={{ color: currentStyles.texts.link }}
              >
                {eventBanner.ctaText}
              </a>
            </div>
          )}

          {/* Título de sección */}
          <div>
            <h2
              className="text-3xl font-semibold"
              style={{ color: currentStyles.texts.primary }}
            >
              {isLoginFormVisible
                ? rightPanel.login.title
                : rightPanel.createAccount.title}
            </h2>
          </div>

          {/* Formularios */}
          {isLoginFormVisible ? (
            isPasswordRecovery ? (
              <PasswordRecoveryForm />
            ) : (
              <LoginForm
                onAuthStateChange={() => setIsLoggedIn(true)}
                email={email}
                setEmail={setEmail}
                setIsPasswordRecovery={setIsPasswordRecovery}
                config={rightPanel.login.form}
                styles={currentStyles}
              />
            )
          ) : (
            <SignupForm
              onSignupSuccess={handleSignupSuccess}
              setEmail={setEmail}
              config={{
                ...rightPanel.createAccount.form,
                defaultRoleId: defaultVisitorRoleId, // ✅ ← ¡AQUÍ EL CAMBIO CLAVE!
              }}
              styles={currentStyles}
            />
          )}

          {/* Footer switch login/signup */}
          <p
            className="text-sm pt-10"
            style={{ color: currentStyles.texts.secondary }}
          >
            {isLoginFormVisible
              ? rightPanel.login.subtitle.text
              : rightPanel.createAccount.subtitle.text}{" "}
            <button
              onClick={() => {
                setIsPasswordRecovery(false);
                setIsLoginFormVisible(!isLoginFormVisible);
              }}
              className="underline transition"
              style={{ color: currentStyles.texts.link }}
            >
              {isLoginFormVisible
                ? rightPanel.login.subtitle.linkText
                : rightPanel.createAccount.subtitle.linkText}
            </button>
          </p>
          <ClearCacheButton />
        </div>
      </div>
    </div>
  );
}
