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
    <div className="navbar bg-base-100 flex flex-wrap items-center justify-between">
      <div className="flex items-center">
        <Image
          height={1000}
          width={1000}
          src="/logo.png"
          alt="Logo"
          className="h-10 w-auto mr-4"
        />
        <a className="btn btn-ghost text-xl">daisyUI</a>
      </div>
      <div className="flex-none flex items-center space-x-4">
        <div className="hidden md:flex" id="navbar-right">
          {buttons.map((button, index) => (
            <button
              key={index}
              className="btn btn-ghost"
              onClick={button.onClick}
            >
              {button.title}
            </button>
          ))}
        </div>
        <button
          className="btn btn-square btn-ghost md:hidden"
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
            className="inline-block h-5 w-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
