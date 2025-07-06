import React, { useEffect } from 'react';

const FloatingAlert = ({ message, setShowAlert, color }:any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [setShowAlert]);

  // Objeto para mapear los colores a clases de Tailwind
  const colorClasses:any = {
    blue: 'bg-[#386329]',
    red: 'bg-red-500',
    green: 'bg-primary-500',
    // ...otros colores según sea necesario
  };

  // Obtener la clase de color correspondiente
  const backgroundColorClass = colorClasses[color] || colorClasses.blue; // 'bg-[#386329]' como valor por defecto

  return (
    <div className={`${backgroundColorClass} fixed top-5 left-2 text-TextCustom p-4 rounded-md shadow-lg z-50`}>
      {message}
    </div>
  );
};

export default FloatingAlert;
