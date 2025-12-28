import React, { useState } from 'react';
import { AppStep, TestConfig, GeneratedTest, SavedTestRecord } from './types';
import StepUpload from './components/StepUpload';
import StepConfigure from './components/StepConfigure';
import StepResults from './components/StepResults';
import SavedTestsModal from './components/SavedTestsModal';
import { generateTestFromMaterial } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [materialContent, setMaterialContent] = useState<string>('');
  const [testData, setTestData] = useState<GeneratedTest | null>(null);
  const [currentConfig, setCurrentConfig] = useState<TestConfig | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleUploadNext = (content: string) => {
    setMaterialContent(content);
    setStep(AppStep.CONFIGURE);
  };

  const handleConfigNext = async (config: TestConfig) => {
    setLoading(true);
    setStep(AppStep.PROCESSING);
    setCurrentConfig(config);
    try {
      const result = await generateTestFromMaterial(materialContent, config);
      setTestData(result);
      setStep(AppStep.RESULTS);
    } catch (error) {
      alert("Failed to generate test. Please try again or reduce input size.");
      setStep(AppStep.CONFIGURE);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSavedTest = (record: SavedTestRecord) => {
    setTestData(record.data);
    setCurrentConfig(record.config);
    setShowHistory(false);
    setStep(AppStep.RESULTS);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-indigo-700 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep(AppStep.UPLOAD)}>
              <span className="text-2xl">📚</span>
              <span className="font-bold text-lg tracking-wide">VN-EdTech Gen</span>
              <span className="bg-indigo-800 text-xs px-2 py-1 rounded ml-2 text-indigo-200">CV 7991 Compliant</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowHistory(true)}
                className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded transition flex items-center gap-1"
              >
                <span>📜</span> History
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 py-10 px-4 sm:px-6">
        {step === AppStep.UPLOAD && <StepUpload onNext={handleUploadNext} />}
        
        {step === AppStep.CONFIGURE && (
          <StepConfigure onNext={handleConfigNext} onBack={() => setStep(AppStep.UPLOAD)} />
        )}

        {step === AppStep.PROCESSING && (
           <div className="flex flex-col items-center justify-center h-96">
             <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
             <h2 className="text-xl font-semibold text-slate-700">Generating Assessment Matrix...</h2>
             <p className="text-slate-500 mt-2 text-center max-w-md">
               The AI is analyzing content, extracting vocabulary, and building questions according to the MoET CV 7991 structure.
             </p>
           </div>
        )}

        {step === AppStep.RESULTS && testData && (
          <StepResults testData={testData} currentConfig={currentConfig} onReset={() => setStep(AppStep.UPLOAD)} />
        )}
      </main>

      {/* History Modal */}
      {showHistory && (
        <SavedTestsModal 
          onClose={() => setShowHistory(false)} 
          onLoad={handleLoadSavedTest} 
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} VN-EdTech System. Compliance with MoET Guidelines.
        </div>
      </footer>
    </div>
  );
};

export default App;
