import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  title: string;
  subtitle: string;
  acceptedFiles: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, title, subtitle, acceptedFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };
  
  const handleClick = () => {
      fileInputRef.current?.click();
  }

  return (
    <div 
        className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
        ${isDragging ? 'border-indigo-500 bg-indigo-50 shadow-lg' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-indigo-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        <h3 className="mb-2 text-xl font-semibold text-gray-700">{title}</h3>
        <p className="text-gray-500">{subtitle}</p>
        <input type="file" accept={acceptedFiles} className="hidden" onChange={handleFileChange} ref={fileInputRef} />
    </div>
  );
};
