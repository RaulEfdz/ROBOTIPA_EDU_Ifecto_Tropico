import Image from "next/image";
import React from "react";

// Define una interfaz para los botones
interface ButtonProps {
  title: string;
  onClick: () => void;
  // Puedes añadir más propiedades si es necesario, como estilo o icono
}

interface NavbarProps {
  buttons: ButtonProps[];
}

export const Navbar: React.FC<NavbarProps> = ({ buttons }) => {
  return (
    <nav className="w-full bg-base border-b border-default shadow-card flex flex-wrap items-center justify-between font-[Renogare Soft, ChaletBook, sans-serif]">
      <div className="flex items-center py-2 pl-4">
        <Image
          height={1000}
          width={1000}
          src="/logo.png"
          alt="Logo"
          className="h-10 w-auto mr-4"
        />
        <span className="title-h2 text-brand-primary">RobotiPA EDU</span>
      </div>
      <div className="flex-none flex items-center space-x-4 pr-4">
        <div className="hidden md:flex" id="navbar-right">
          {buttons.map((button, index) => (
            <button
              key={index}
              className="btn-primary"
              onClick={button.onClick}
            >
              {button.title}
            </button>
          ))}
        </div>
        <button
          className="btn-secondary btn-square md:hidden"
          aria-label="Abrir menú"
          onClick={() => {
            const navbarRight = document.getElementById("navbar-right");
            if (navbarRight) {
              navbarRight.classList.toggle("hidden");
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-6 w-6 stroke-brand-primary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 8h16M4 16h16"
            ></path>
          </svg>
        </button>
      </div>
    </nav>
  );
};
