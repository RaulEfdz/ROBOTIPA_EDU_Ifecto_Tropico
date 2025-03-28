'use client'

import { FileTextIcon, FilesIcon } from 'lucide-react';
import React from 'react';
import { DropdownsResource } from './DropdownsResource';




interface PropHeaderChapter {
	title: string;
	attachments: any
}

export interface itemResources {
	title: string;
	url: string;
  }
  
  export interface listResources {
	listOptions: any[];
  }
  

const HeaderChapter: React.FC<PropHeaderChapter> = ({ title, attachments }) => {

    return (
        <header className="text-gray-600 body-font w-full bg-red-950">
            <div className=" mx-full flex flex-wrap items-center justify-between p-5 bg-black">
                <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0">
                    <FileTextIcon className='' />
                    <span className="ml-2 text-xl">{title}</span>
                </a>
                <nav className="hidden md:flex md:items-center">
                    {/* Items del menú */}
                </nav>
                {attachments.length > 0 && (
                    <div className="flex flex-grow justify-end">
                        <DropdownsResource listOptions={attachments} />
                    </div>
                )}
            </div>
        </header>
    );

}

export default HeaderChapter;

