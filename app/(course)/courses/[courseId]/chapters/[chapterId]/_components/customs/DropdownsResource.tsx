'use client'
import React, { useState, useRef, useEffect } from "react";
import { listResources } from "./HeaderChapter";
import { FileIcon, FilesIcon } from "lucide-react";

export const DropdownsResource: React.FC<listResources> = ({ listOptions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);


  let elementosConJson :any= [];
  const elementosSinJson = listOptions.reduce((acumulador, item) => {
    if (item.title.endsWith('.json')) {
      elementosConJson.push(item);
    } else {
      acumulador.push(item);
    }
    return acumulador;
  }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); 


  return (
    <div className="relative inline-block text-left">
      {elementosSinJson.length > 0 &&
        <>
          <div>
            <button onClick={() => { setIsOpen(!isOpen) }} type="button" className="bg-primaryCustom  inline-flex w-full justify-center gap-x-1.5 rounded-md text-TextCustom px-3 py-2 border-none " id="menu-button" aria-expanded="true" aria-haspopup="true">
              <FilesIcon />
              <span>Recursos</span>
              <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="#ffffff" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          {isOpen &&
            <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[#FFFCF8] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
              <div className="py-1" role="none">
                {elementosSinJson.map((item: { title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.PromiseLikeOfReactNode | null | undefined; url: string | number | boolean; }, index: React.Key | null | undefined) => {

                  return (
                    <a
                      key={index}
                      href={`https://docs.google.com/gview?url=${encodeURIComponent(item.url)}&embedded=true`}
                      target="_blank"
                      className="cursor-pointer  px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-300 transform hover:bg-[#77FD925D] flex ">
                      <FileIcon className="mx-2" />
                      <p>{item.title}</p>
                    </a>
                  )

                })}
              </div>
            </div>
          }
        </>
      }
      {elementosConJson.length > 0 &&
        <>
          {/* <QuestionForm jsonLink={elementosConJson[0].url} /> */}
        </>
      }
    </div>


  );
};
