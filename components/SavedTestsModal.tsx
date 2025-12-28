import React, { useEffect, useState } from 'react';
import { SavedTestRecord } from '../types';
import { getSavedTests, deleteTest } from '../services/storageService';

interface SavedTestsModalProps {
  onClose: () => void;
  onLoad: (record: SavedTestRecord) => void;
}

const SavedTestsModal: React.FC<SavedTestsModalProps> = ({ onClose, onLoad }) => {
  const [tests, setTests] = useState<SavedTestRecord[]>([]);

  useEffect(() => {
    setTests(getSavedTests());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this test?")) {
      const updated = deleteTest(id);
      setTests(updated);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Saved Assessments</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {tests.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p className="text-lg">No saved tests found.</p>
              <p className="text-sm mt-1">Generate a test and click "Save" to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => (
                <div 
                  key={test.id} 
                  className="border border-slate-200 rounded-lg p-4 hover:bg-indigo-50 transition-colors cursor-pointer group flex justify-between items-center"
                  onClick={() => onLoad(test)}
                >
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700">{test.name}</h3>
                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                      <span>📅 {formatDate(test.timestamp)}</span>
                      <span>📝 {test.data.matrixReport.totalQuestions} Questions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onLoad(test); }}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium hover:bg-indigo-200 transition"
                    >
                      Load
                    </button>
                    <button 
                      onClick={(e) => handleDelete(test.id, e)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl text-right">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedTestsModal;
