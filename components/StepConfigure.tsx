import React, { useState } from 'react';
import { TestConfig } from '../types';

interface StepConfigureProps {
  onNext: (config: TestConfig) => void;
  onBack: () => void;
}

const StepConfigure: React.FC<StepConfigureProps> = ({ onNext, onBack }) => {
  const [config, setConfig] = useState<TestConfig>({
    listeningTopic1: 'Daily Life & Hobbies',
    listeningTopic2: 'School & Education',
    readingTopic: 'Environment & Green Living',
    writingTopic: 'Benefits of Technology',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Configure Test Matrix</h2>
        <p className="text-slate-500">Define the specific contexts for the generated sections based on MoET guidelines.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <span className="bg-blue-200 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">A</span>
            Part A: Listening (2.0 Points)
          </h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Task 1 Topic (Multiple Choice)</label>
              <input
                type="text"
                name="listeningTopic1"
                value={config.listeningTopic1}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Task 2 Topic (True/False or Gap Fill)</label>
              <input
                type="text"
                name="listeningTopic2"
                value={config.listeningTopic2}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
          <h3 className="font-semibold text-emerald-800 mb-3 flex items-center">
            <span className="bg-emerald-200 text-emerald-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">C</span>
            Part C: Reading (2.4 Points)
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Main Reading Topic</label>
            <input
              type="text"
              name="readingTopic"
              value={config.readingTopic}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
            <span className="bg-purple-200 text-purple-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">D</span>
            Part D: Writing (2.6 Points)
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Paragraph Writing Topic</label>
            <input
              type="text"
              name="writingTopic"
              value={config.writingTopic}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="w-1/3 py-3 px-6 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all"
        >
          Back
        </button>
        <button
          onClick={() => onNext(config)}
          className="w-2/3 py-3 px-6 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md transition-all"
        >
          Generate Test
        </button>
      </div>
    </div>
  );
};

export default StepConfigure;
