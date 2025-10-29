import React, { useState, useRef } from 'react';
import type { StudyPlan } from '../types';
import { generateStudyPlan } from '../services/geminiService';
import { PlannerIcon, UploadIcon, DocumentIcon, TrashIcon } from './icons';

interface StudyPlannerCreatorProps {
  onPlanCreated: (plan: StudyPlan) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove data:application/pdf;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};

const StudyPlannerCreator: React.FC<StudyPlannerCreatorProps> = ({ onPlanCreated }) => {
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState('');
  const [duration, setDuration] = useState(7);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError("Please upload a valid PDF file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0] || null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDraggingOver(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (!isLoading) {
      processFile(e.dataTransfer.files?.[0] || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!file && (!subject.trim() || !topics.trim())) || duration <= 0) {
      setError("Please provide subject and topics, or upload a PDF. Duration must be a positive number.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      let pdfBase64: string | undefined = undefined;
      if (file) {
        pdfBase64 = await fileToBase64(file);
      }

      const generatedPart = await generateStudyPlan(subject, topics, duration, pdfBase64);
      const newPlan: StudyPlan = {
        id: `plan-${Date.now()}`,
        subject: subject.trim() || (file ? `Plan for ${file.name}` : "AI Generated Plan"),
        topics: topics.trim() || (file ? "Topics from PDF" : "AI Generated Topics"),
        duration,
        createdAt: new Date().toISOString(),
        ...generatedPart
      };
      onPlanCreated(newPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <PlannerIcon className="w-12 h-12 mx-auto text-primary mb-2" />
            <h1 className="text-3xl font-bold">Create a New Study Plan</h1>
            <p className="text-base-content/70 mt-2">Let our AI craft the perfect study schedule for you.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-base-200 p-8 rounded-xl shadow-lg space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-base-content/80 mb-2">Subject</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Modern History"
              className="w-full bg-base-300 border-base-300 rounded-lg p-3 focus:ring-primary focus:border-primary"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="topics" className="block text-sm font-medium text-base-content/80 mb-2">Key Topics</label>
            <textarea
              id="topics"
              rows={4}
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g., World War I, The Cold War, Post-War Reconstruction"
              className="w-full bg-base-300 border-base-300 rounded-lg p-3 focus:ring-primary focus:border-primary"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <div className="flex-grow border-t border-base-300"></div>
            <span className="flex-shrink mx-4 text-base-content/60">OR</span>
            <div className="flex-grow border-t border-base-300"></div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-base-content/80 mb-2">
                Generate plan from a PDF document
            </label>
            {file ? (
                <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg flex-grow min-w-0 border-2 border-primary transition-all">
                    <DocumentIcon className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                        <p className="font-semibold truncate" title={file.name}>{file.name}</p>
                        <p className="text-xs text-base-content/60">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => !isLoading && setFile(null)} 
                        className="ml-auto btn btn-ghost btn-sm btn-circle flex-shrink-0 text-error/70 hover:bg-error hover:text-error-content" 
                        disabled={isLoading}
                        aria-label="Remove file"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-base-300 border-dashed rounded-lg transition-colors duration-200 ${isDraggingOver ? 'border-primary bg-primary/10' : 'hover:border-primary/50'} ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                    <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-base-content/50" />
                    <div className="flex text-sm text-base-content/60">
                        <p className="pl-1">Drag & drop a PDF, or <span className="font-semibold text-primary">browse</span></p>
                    </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        id="pdf-file"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isLoading}
                    />
                </div>
            )}
          </div>


          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-base-content/80 mb-2">Duration (in days)</label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              min="1"
              max="90"
              className="w-full bg-base-300 border-base-300 rounded-lg p-3 focus:ring-primary focus:border-primary"
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full btn btn-primary bg-primary hover:bg-primary-focus text-primary-content font-bold py-3 rounded-lg shadow-lg flex items-center justify-center disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Plan...
                </>
            ) : "Generate My Plan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudyPlannerCreator;