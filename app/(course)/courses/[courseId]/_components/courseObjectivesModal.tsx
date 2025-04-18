'use client'
import Image from 'next/image';
import React, { useState } from 'react';

const CourseObjectivesModal = ({ title, description, imageUrl, course }:any) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-green-500 text-TextCustom text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
        onClick={toggleModal}
      >
        Mostrar Objetivos del Curso
      </button>



      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full  w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-[50rem] shadow-lg rounded-md bg-[#FFFCF8]">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
              {imageUrl && <Image src={imageUrl} alt="Course Objective" className="mt-4 w-full rounded-md" height={1000} width={1000}/>}
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 align-">{description}</p>
               
              </div>
              <div className="items-center px-4 py-3">
                <button
                  className="px-4 py-2 bg-[#386329] text-TextCustom text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
