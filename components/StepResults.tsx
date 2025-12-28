import React, { useState } from 'react';
import { GeneratedTest, Question, TestConfig } from '../types';
import { exportToDocx, exportToPdfDirect } from '../services/exportService';
import { saveTest } from '../services/storageService';

interface StepResultsProps {
  testData: GeneratedTest;
  currentConfig?: TestConfig; // Optional because legacy data might not have it immediately in this view, but needed for saving
  onReset: () => void;
}

const StepResults: React.FC<StepResultsProps> = ({ testData, currentConfig, onReset }) => {
  const [activeTab, setActiveTab] = useState<'test' | 'key' | 'script' | 'matrix'>('test');
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadDocx = async () => {
    setIsExporting(true);
    try {
        await exportToDocx(testData);
    } catch (e) {
        console.error(e);
        alert("Error creating DOCX");
    }
    setIsExporting(false);
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
        // We export the hidden 'all-content' div
        await exportToPdfDirect('pdf-export-container', 'generated_test_full.pdf');
    } catch (e) {
        console.error(e);
        alert("Error creating PDF");
    }
    setIsExporting(false);
  };

  const handleSaveToStorage = () => {
    const name = prompt("Enter a name for this test to save:", testData.testTitle || "My Assessment");
    if (name) {
      // Create a dummy config if one wasn't passed down (fallback)
      const configToSave = currentConfig || {
        listeningTopic1: "Unknown",
        listeningTopic2: "Unknown",
        readingTopic: "Unknown",
        writingTopic: "Unknown"
      };
      
      saveTest(name, testData, configToSave);
      alert("Test saved successfully! You can access it from the History menu.");
    }
  };

  const handleDownloadJson = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(testData, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = "generated-test.json";
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  const renderQuestion = (q: Question, idx: number, showAnswer: boolean = false) => (
    <div key={idx} className="mb-4 pl-4 border-l-2 border-slate-200">
      <p className="font-medium text-slate-800 mb-1">
        <span className="text-indigo-600 font-bold mr-2">Q{q.id}.</span> 
        {q.questionText}
      </p>
      {q.type === 'MCQ' || q.type === 'TRUE_FALSE' ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 ml-6">
          {q.options?.map((opt, i) => (
            <div key={i} className="text-slate-600">
              <span className="font-bold mr-1">{String.fromCharCode(65 + i)}.</span> {opt}
            </div>
          ))}
        </div>
      ) : null}
      
      {showAnswer && (
        <div className="mt-2 text-sm bg-green-50 text-green-800 p-2 rounded">
          <strong>Key:</strong> {q.correctAnswer} <span className="text-xs text-slate-400 ml-2">({q.level})</span>
        </div>
      )}
    </div>
  );

  const renderTestContent = () => (
    <div className="space-y-8 font-serif">
        {/* Part A */}
        <section>
        <h3 className="text-lg font-bold text-slate-900 border-b-2 border-slate-900 pb-2 mb-4">{testData.partA.title}</h3>
        <div className="mb-6">
            <h4 className="font-bold text-slate-700 mb-2">TASK 1</h4>
            {testData.partA.task1.questions.map((q, i) => renderQuestion(q, i))}
        </div>
        <div>
            <h4 className="font-bold text-slate-700 mb-2">TASK 2</h4>
            {testData.partA.task2.questions.map((q, i) => renderQuestion(q, i))}
        </div>
        </section>

        {/* Part B */}
        <section>
        <h3 className="text-lg font-bold text-slate-900 border-b-2 border-slate-900 pb-2 mb-4">{testData.partB.title}</h3>
        <div className="mb-6">
            <h4 className="font-bold text-slate-700 mb-2">I. Multiple Choice</h4>
            {testData.partB.section1_mcq.map((q, i) => renderQuestion(q, i))}
        </div>
        <div className="mb-6">
            <h4 className="font-bold text-slate-700 mb-2">II. Error Identification</h4>
            {testData.partB.section2_error.map((q, i) => renderQuestion(q, i))}
        </div>
        <div>
            <h4 className="font-bold text-slate-700 mb-2">III. Verb Forms</h4>
            {testData.partB.section3_verbs.map((q, i) => renderQuestion(q, i))}
        </div>
        </section>

        {/* Part C */}
        <section>
        <h3 className="text-lg font-bold text-slate-900 border-b-2 border-slate-900 pb-2 mb-4">{testData.partC.title}</h3>
        <div className="mb-6">
            <h4 className="font-bold text-slate-700 mb-2">I. Sign / Picture</h4>
            {renderQuestion(testData.partC.signQuestion, 0)}
        </div>
        <div className="mb-6">
            <h4 className="font-bold text-slate-700 mb-2">II. Cloze Test</h4>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4 text-justify italic leading-relaxed">
                {testData.partC.clozePassage.text}
            </div>
            {testData.partC.clozePassage.questions.map((q, i) => renderQuestion(q, i))}
        </div>
        <div>
            <h4 className="font-bold text-slate-700 mb-2">III. Reading Comprehension</h4>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4 text-justify leading-relaxed">
                {testData.partC.comprehensionPassage.text}
            </div>
            {testData.partC.comprehensionPassage.questions.map((q, i) => renderQuestion(q, i))}
        </div>
        </section>

        {/* Part D */}
        <section>
        <h3 className="text-lg font-bold text-slate-900 border-b-2 border-slate-900 pb-2 mb-4">{testData.partD.title}</h3>
        <div className="mb-6">
            <h4 className="font-bold text-slate-700 mb-2">I. Reordering</h4>
            {testData.partD.reordering.map((q, i) => renderQuestion(q, i))}
        </div>
        <div className="mb-6">
            <h4 className="font-bold text-slate-700 mb-2">II. Rewriting</h4>
            {testData.partD.rewriting.map((q, i) => renderQuestion(q, i))}
        </div>
        <div>
            <h4 className="font-bold text-slate-700 mb-2">III. Paragraph Writing</h4>
            <div className="bg-blue-50 p-4 rounded border border-blue-100">
                <p className="font-semibold">{testData.partD.paragraph.prompt}</p>
            </div>
        </div>
        </section>
    </div>
  );

  const renderKeyContent = () => (
    <div className="space-y-8">
        <h3 className="text-2xl font-bold text-green-700 mb-4">Marking Scheme & Answer Key</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h4 className="font-bold text-slate-900 mb-2 bg-slate-100 p-2">Part A: Listening</h4>
            {testData.partA.task1.questions.map((q) => <div key={q.id}>Q{q.id}: <strong>{q.correctAnswer}</strong></div>)}
            {testData.partA.task2.questions.map((q) => <div key={q.id}>Q{q.id}: <strong>{q.correctAnswer}</strong></div>)}
        </div>
        <div>
            <h4 className="font-bold text-slate-900 mb-2 bg-slate-100 p-2">Part B: Language Focus</h4>
            {testData.partB.section1_mcq.map((q) => <div key={q.id}>Q{q.id}: <strong>{q.correctAnswer}</strong></div>)}
            {testData.partB.section2_error.map((q) => <div key={q.id}>Q{q.id}: <strong>{q.correctAnswer}</strong></div>)}
            {testData.partB.section3_verbs.map((q) => <div key={q.id}>Q{q.id}: <strong>{q.correctAnswer}</strong></div>)}
        </div>
        <div>
            <h4 className="font-bold text-slate-900 mb-2 bg-slate-100 p-2">Part C: Reading</h4>
            <div className="mb-2">Sign: <strong>{testData.partC.signQuestion.correctAnswer}</strong></div>
            <div className="font-semibold text-sm text-slate-500 mt-2">Cloze</div>
            {testData.partC.clozePassage.questions.map((q) => <div key={q.id}>Q{q.id}: <strong>{q.correctAnswer}</strong></div>)}
            <div className="font-semibold text-sm text-slate-500 mt-2">Comprehension</div>
            {testData.partC.comprehensionPassage.questions.map((q) => <div key={q.id}>Q{q.id}: <strong>{q.correctAnswer}</strong></div>)}
        </div>
        <div>
            <h4 className="font-bold text-slate-900 mb-2 bg-slate-100 p-2">Part D: Writing</h4>
            {testData.partD.reordering.map((q) => <div key={q.id} className="text-sm mb-1">Q{q.id}: <strong>{q.correctAnswer}</strong></div>)}
            {testData.partD.rewriting.map((q) => <div key={q.id} className="text-sm mb-1">Q{q.id}: <strong>{q.correctAnswer}</strong></div>)}
            <div className="mt-4 p-4 bg-green-50 rounded border border-green-100">
                <span className="font-bold text-green-800">Sample Paragraph:</span>
                <p className="text-sm text-slate-700 italic mt-1">{testData.partD.paragraph.sampleAnswer}</p>
            </div>
        </div>
        </div>
    </div>
  );

  const renderScriptContent = () => (
    <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-4">Teacher's Audio Script</h3>
        
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
        <h4 className="text-lg font-bold text-yellow-800 mb-2 uppercase tracking-wide">Task 1 Script</h4>
        <div className="prose prose-slate whitespace-pre-line">
            {testData.partA.task1.script}
        </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
        <h4 className="text-lg font-bold text-yellow-800 mb-2 uppercase tracking-wide">Task 2 Script</h4>
        <div className="prose prose-slate whitespace-pre-line">
            {testData.partA.task2.script}
        </div>
        </div>
    </div>
  );

  const renderMatrixContent = () => (
    <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-4">MoET Specification Matrix (CV 7991)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-8">
            <div className="bg-blue-100 p-4 rounded-xl">
                <div className="text-3xl font-bold text-blue-700">{testData.matrixReport.recognitionCount}</div>
                <div className="text-sm text-blue-900 font-medium">Recognition (Target ~40%)</div>
            </div>
            <div className="bg-emerald-100 p-4 rounded-xl">
                <div className="text-3xl font-bold text-emerald-700">{testData.matrixReport.comprehensionCount}</div>
                <div className="text-sm text-emerald-900 font-medium">Comprehension (Target ~45%)</div>
            </div>
            <div className="bg-purple-100 p-4 rounded-xl">
                <div className="text-3xl font-bold text-purple-700">{testData.matrixReport.applicationCount}</div>
                <div className="text-sm text-purple-900 font-medium">Application (Target ~15%)</div>
            </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-2">Compliance Analysis</h4>
            <p className="text-slate-600">{testData.matrixReport.complianceNote}</p>
        </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[85vh]">
      {/* Header */}
      <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>📝</span> {testData.testTitle || 'Generated Assessment'}
        </h2>
        <div className="flex gap-2">
          <button onClick={onReset} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs sm:text-sm transition border border-slate-600">New</button>
          
          <div className="h-6 w-px bg-slate-600 mx-1"></div>
          
          <button 
             onClick={handleSaveToStorage} 
             className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs sm:text-sm transition font-medium text-white flex items-center gap-1"
             title="Save to Browser"
          >
             💾 Save
          </button>

          <button 
            onClick={handleDownloadDocx} 
            disabled={isExporting}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs sm:text-sm transition font-medium flex items-center gap-1"
          >
             📄 DOCX
          </button>
          <button 
            onClick={handleDownloadPdf} 
            disabled={isExporting}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded text-xs sm:text-sm transition font-medium flex items-center gap-1"
          >
             📕 PDF
          </button>
          <button 
             onClick={handleDownloadJson} 
             className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-xs sm:text-sm transition font-medium text-slate-300"
             title="Download Raw JSON"
          >
             {} JSON
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
        {['test', 'key', 'script', 'matrix'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium text-sm transition-colors uppercase tracking-wider whitespace-nowrap ${
              activeTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab === 'test' ? 'Test Paper' : tab === 'key' ? 'Answer Key' : tab === 'script' ? 'Listening Scripts' : 'Matrix Report'}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar relative">
        {activeTab === 'test' && renderTestContent()}
        {activeTab === 'key' && renderKeyContent()}
        {activeTab === 'script' && renderScriptContent()}
        {activeTab === 'matrix' && renderMatrixContent()}
      </div>

      {/* Hidden Container for PDF Generation - Contains ALL sections */}
      <div 
        id="pdf-export-container" 
        className="absolute left-[-9999px] top-0 w-[800px] bg-white p-10"
      >
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">{testData.testTitle}</h1>
            <p className="text-center text-slate-500">Generated by VN-EdTech AI</p>
        </div>
        <hr className="my-6"/>
        
        {renderTestContent()}
        <div className="h-8"></div>
        
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">ANSWER KEY</h2>
        {renderKeyContent()}
        <div className="h-8"></div>

        <h2 className="text-2xl font-bold mb-4 border-b pb-2">LISTENING SCRIPTS</h2>
        {renderScriptContent()}
        <div className="h-8"></div>

        <h2 className="text-2xl font-bold mb-4 border-b pb-2">MATRIX REPORT</h2>
        {renderMatrixContent()}
      </div>

    </div>
  );
};

export default StepResults;
