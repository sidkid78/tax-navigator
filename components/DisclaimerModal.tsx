import React, { useState, useEffect } from 'react';

export const DisclaimerModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already accepted in this session or local storage
    const accepted = localStorage.getItem('tax_disclaimer_accepted');
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('tax_disclaimer_accepted', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4 text-emerald-400">
            <i className="fas fa-shield-alt text-2xl"></i>
            <h2 className="text-xl font-bold text-white">Legal Disclaimer</h2>
          </div>
          
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>
              <strong>TaxNavigator AI</strong> is an automated tool designed to assist with tax-related information using publicly available data (IRS.gov, Data.gov).
            </p>
            <p className="bg-slate-800/50 p-3 rounded border-l-4 border-amber-500 text-amber-100">
              <strong className="text-amber-500 uppercase text-xs block mb-1">Important</strong>
              This application does <strong>not</strong> provide professional legal, tax, or accounting advice. Tax laws are subject to change and vary by individual circumstances.
            </p>
            <p>
              Always consult with a qualified CPA or tax professional before filing. By continuing, you acknowledge that you are using this tool for informational purposes only.
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleAccept}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};