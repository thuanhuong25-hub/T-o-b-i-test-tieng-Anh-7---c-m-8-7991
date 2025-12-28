import React, { useState } from 'react';

interface StepUploadProps {
  onNext: (content: string) => void;
}

const StepUpload: React.FC<StepUploadProps> = ({ onNext }) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    // Simple text extraction for demonstration
    // In a real app, this would use pdfjs or generic file readers.
    // Here we support .txt, .json, .md natively, and warn for others.
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText((event.target?.result as string) || '');
      };
      reader.readAsText(file);
    } else {
        // Fallback for demo: Ask user to copy paste content if file reading isn't supported purely client-side without heavy libs
        alert("For PDF/DOCX in this demo, please copy and paste the text content into the box below for best accuracy.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Material</h2>
        <p className="text-slate-500">
          Upload your teaching materials (Text/Notes) or paste content directly. 
          The AI will extract vocabulary, grammar, and context.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Paste Content (Recommended for accuracy)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors custom-scrollbar"
          placeholder="Paste lessons, reading passages, or vocabulary lists here..."
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-slate-500">TXT, MD (Copy-paste recommended for PDF/DOCX)</p>
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
        {fileName && <p className="mt-2 text-sm text-green-600 font-medium">Selected: {fileName}</p>}
      </div>

      <button
        onClick={() => onNext(text)}
        disabled={!text.trim()}
        className={`w-full py-3 px-6 rounded-lg text-white font-semibold text-lg transition-all ${
          text.trim() ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md' : 'bg-slate-300 cursor-not-allowed'
        }`}
      >
        Analyze & Continue
      </button>
    </div>
  );
};

export default StepUpload;
