type ThemeMode = "light" | "dark";

interface ThemeStyles {
  mode: ThemeMode;
  light: {
    backgrounds: {
      page: string;
      panel: string;
      banner: string;
    };
    texts: {
      primary: string;
      secondary: string;
      link: string;
    };
    borders: {
      default: string;
    };
    buttons: {
      primary: string;
      primaryText: string;
    };
  };
  dark: {
    backgrounds: {
      page: string;
      panel: string;
      banner: string;
    };
    texts: {
      primary: string;
      secondary: string;
      link: string;
    };
    borders: {
      default: string;
    };
    buttons: {
      primary: string;
      primaryText: string;
    };
  };
}

interface LoginConfig {
  layout: {
    backgroundImage: string[];
    backgroundColor: string;
    coverColor: string;
  };
  logo: {
    show: boolean;
    src: string;
    alt: string;
    width: number;
  };
  leftPanel: {
    show: boolean;
    taglineTitle: string;
    taglineSubtitle: string;
    backToWebsite: {
      show: boolean;
      text: string;
      url: string;
    };
  };
  rightPanel: {
    createAccount: {
      show: boolean;
      title: string;
      subtitle: {
        text: string;
        linkText: string;
      };
      form: {
        fullNamePlaceholder: string;
        usernamePlaceholder: string;
        emailPlaceholder: string;
        passwordPlaceholder: string;
        confirmPasswordPlaceholder: string;
        createButtonText: string;
      };
    };
    login: {
      show: boolean;
      title: string;
      subtitle: {
        text: string;
        linkText: string;
      };
      form: {
        emailPlaceholder: string;
        passwordPlaceholder: string;
        loginButtonText: string;
        forgotPasswordLinkText: string;
      };
    };
  };
  eventBanner: {
    show: boolean;
    title: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
  };
  styles: ThemeStyles;
}

export const loginConfig: LoginConfig = {
  layout: {
    backgroundImage: [
      "https://res.cloudinary.com/deuos3ssm/image/upload/v1743388329/infecto-tropico/nz38pmrdv4xjmr235qe4.jpg",
      "https://res.cloudinary.com/deuos3ssm/image/upload/v1743388329/infecto-tropico/qtp57jlaye0rj2rphfo4.jpg",
    ],
    backgroundColor: "#FFFFFF", // Add a valid background color
    coverColor: "#000000", // o 'none' si no quieres capa encima
  },
  logo: {
    show: false,
    src: "/images/logo-infectotropico.png",
    alt: "Infectotrópico",
    width: 160,
  },

  leftPanel: {
    show: true,
    taglineTitle: "",
    taglineSubtitle:
      "",
    backToWebsite: {
      show: true,
      text: "← Volver al sitio web",
      url: "https://www.infectotropico.com",
    },
  },

  rightPanel: {
    createAccount: {
      show: true,
      title: `Registro en ${process.env.NEXT_PUBLIC_NAME_APP || 'Infectotrópico Academy'}`,
      subtitle: {
        text: "¿Ya tienes una cuenta?",
        linkText: "Inicia sesión",
      },
      form: {
        fullNamePlaceholder: "Nombre completo",
        usernamePlaceholder: "Nombre de usuario",
        emailPlaceholder: "Correo",
        passwordPlaceholder: "Contraseña",
        confirmPasswordPlaceholder: "Confirmar contraseña",
        createButtonText: "Crear cuenta",
      },
    },
    login: {
      show: true,
      title: "",
      subtitle: {
        text: "¿Aún no tienes una cuenta?",
        linkText: "Crear cuenta",
      },
      form: {
        emailPlaceholder: "usuario@infectotropico.com",
        passwordPlaceholder: "••••••••",
        loginButtonText: "Iniciar sesión",
        forgotPasswordLinkText: "¿Olvidaste tu contraseña?",
      },
    },
  },

  eventBanner: {
    show: true,
    title: "Taller: Arbovirus y Salud Global",
    description: "4 y 5 de abril · Universidad de Panamá - Chiriquí",
    ctaText: "Inscribirme",
    ctaUrl: "/eventos/arbovirus-chiriqui",
  },

  styles: {
    mode: "light",
    light: {
      backgrounds: {
        page: "#FFFCF8",
        panel: "#FFFFFF",
        banner: "#FFFCF8",
      },
      texts: {
        primary: "#5A3E34",
        secondary: "#386329",
        link: "#47724B",
      },
      borders: {
        default: "#ACBC64",
      },
      buttons: {
        primary: "#47724B",
        primaryText: "#FFFCF8",
      },
    },
    dark: {
      backgrounds: {
        page: "#1E1E2F",
        panel: "#2C2C3A",
        banner: "#33334D",
      },
      texts: {
        primary: "#ffffff",
        secondary: "#a7a7b5",
        link: "#90cdf4",
      },
      borders: {
        default: "#3d3d55",
      },
      buttons: {
        primary: "#90cdf4",
        primaryText: "#1E1E2F",
      },
    },
  },
};
