"use client";
import Image from "next/image";
import React, { useState } from "react";
import { usePrimaryColorStyle, isHexColor, getPrimaryColor, generateColorVariants } from "@/lib/colors";

const CourseObjectivesModal = ({
  title,
  description,
  imageUrl,
  course,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);

  // Obtener estilos dinámicos
  const getButtonStyles = () => {
    const primaryColor = getPrimaryColor();
    
    if (isHexColor(primaryColor)) {
      const variants = generateColorVariants(primaryColor);
      return {
        background: variants[500],
        hoverBackground: variants[700],
        focusRing: variants[300],
        isCustom: true,
      };
    }
    
    const colorName = primaryColor.toLowerCase();
    return {
      className: `bg-${colorName}-500 hover:bg-${colorName}-700 focus:ring-${colorName}-300`,
      isCustom: false,
    };
  };

  const buttonStyles = getButtonStyles();

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        className={`px-4 py-2 text-TextCustom text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 ${
          buttonStyles.isCustom ? '' : buttonStyles.className
        }`}
        style={buttonStyles.isCustom ? {
          backgroundColor: buttonStyles.background,
        } : undefined}
        onMouseEnter={(e) => {
          if (buttonStyles.isCustom) {
            e.currentTarget.style.backgroundColor = buttonStyles.hoverBackground;
          }
        }}
        onMouseLeave={(e) => {
          if (buttonStyles.isCustom) {
            e.currentTarget.style.backgroundColor = buttonStyles.background;
          }
        }}
        onClick={toggleModal}
      >
        Mostrar Objetivos del Curso
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full  w-full"
          id="my-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-[50rem] shadow-lg rounded-md bg-[#FFFCF8]">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Course Objective"
                  className="mt-4 w-full rounded-md"
                  height={1000}
                  width={1000}
                />
              )}
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 align-">{description}</p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  className={`px-4 py-2 text-TextCustom text-base font-medium rounded-md w-full shadow-sm focus:outline-none focus:ring-2 ${
                    buttonStyles.isCustom ? '' : buttonStyles.className
                  }`}
                  style={buttonStyles.isCustom ? {
                    backgroundColor: buttonStyles.background,
                  } : undefined}
                  onMouseEnter={(e) => {
                    if (buttonStyles.isCustom) {
                      e.currentTarget.style.backgroundColor = buttonStyles.hoverBackground;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (buttonStyles.isCustom) {
                      e.currentTarget.style.backgroundColor = buttonStyles.background;
                    }
                  }}
                  onClick={toggleModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseObjectivesModal;
