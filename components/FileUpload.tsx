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

  const UploadIcon = () => (
    <svg 
      className={`w-16 h-16 mx-auto mb-4 transition-all duration-300 ${isDragging ? 'text-indigo-600 scale-110' : 'text-indigo-400'}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );

  return (
    <div 
        className={`relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group
        ${isDragging 
          ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-[1.02] border-solid' 
          : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-indigo-50 hover:shadow-md hover:scale-[1.01]'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
    >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <UploadIcon />
        
        <h3 className={`mb-3 text-2xl font-bold transition-colors duration-300 ${isDragging ? 'text-indigo-700' : 'text-gray-700 group-hover:text-indigo-600'}`}>
          {title}
        </h3>
        
        <p className={`text-center text-lg mb-4 transition-colors duration-300 ${isDragging ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-600'}`}>
          {subtitle}
        </p>

        <div className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
          isDragging 
            ? 'bg-indigo-600 text-white shadow-lg' 
            : 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200 group-hover:shadow-md'
        }`}>
          {isDragging ? 'Drop file here' : 'Choose file or drag and drop'}
        </div>

        <p className="mt-3 text-sm text-gray-400">
          Supported formats: {acceptedFiles.split(',').join(', ')}
        </p>
        
        <input 
          type="file" 
          accept={acceptedFiles} 
          className="hidden" 
          onChange={handleFileChange} 
          ref={fileInputRef} 
        />
    </div>
  );
};
