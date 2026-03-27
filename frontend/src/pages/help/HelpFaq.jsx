import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How do I submit a complaint?',
    a: 'Go to your dashboard, open Submit Complaint, fill mandatory fields, attach image proof, and submit.',
  },
  {
    q: 'How can I track complaint status?',
    a: 'Use your complaint ID in the public Track page or check My Complaints in your citizen dashboard.',
  },
  {
    q: 'Why can status only move forward?',
    a: 'The system enforces accountability with a strict workflow: Pending → In Progress → Resolved.',
  },
  {
    q: 'Can I update a resolved complaint?',
    a: 'No. Resolved complaints are locked and cannot be modified.',
  },
];

export default function HelpFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-4xl mx-auto card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-500 mb-6">Quick answers to common user questions.</p>

        <div className="space-y-3">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.q} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-700">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
