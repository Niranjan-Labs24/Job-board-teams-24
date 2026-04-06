'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    question: "Does Teams24 offer in-office jobs?",
    answer: "Yes. Teams24 offers both in-office and remote roles. Both Roles open to candidates across India."
  },
  {
    question: "Where is the Teams24 office located?",
    answer: "Shakti Tower 1, 766, Anna Salai, Thousand Lights, Chennai — 600002, Tamil Nadu."
  },
  {
    question: "What kind of clients will I work with?",
    answer: "Startups and growth-stage companies, MNC's from the US, Europe, and India across SaaS, FinTech, LegalTech, and E-commerce."
  },
  {
    question: "How fast is the hiring process?",
    answer: "Most candidates hear back within 48–72 hours. Full process — screening, interview, and offer — typically completed within one week."
  },
  {
    question: "What roles does Teams24 hire for?",
    answer: "Full-Stack Development, Performance Marketing, Salesforce, SAP, Automation Testing, Customer Support, Project Management, and Operations — both in-office and remotely across India."
  },
  {
    question: "Does Teams24 hire freshers?",
    answer: "Most roles require 2+ years of experience. We do take on interns and junior profiles for specific positions."
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`border rounded-2xl transition-all duration-300 h-fit mb-4 ${
        isOpen 
          ? 'border-indigo-600 bg-indigo-50/30' 
          : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 md:p-8 text-left"
      >
        <span className={`text-lg md:text-xl font-bold tracking-tight ${
          isOpen ? 'text-indigo-900' : 'text-gray-900'
        }`}>
          {question}
        </span>
        <div className={`p-2 rounded-full transition-colors flex-shrink-0 ml-4 ${
          isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-400'
        }`}>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 md:p-8 pt-0 text-gray-600 leading-relaxed font-medium text-lg border-t border-indigo-100/20">
          {answer}
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const midPoint = Math.ceil(faqData.length / 2);
  const leftColumn = faqData.slice(0, midPoint);
  const rightColumn = faqData.slice(midPoint);

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-24" id="faq">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
          Frequently asked questions
        </h2>
        <p className="text-gray-500 font-medium text-lg">
          Everything you need to know about joining Teams24
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-0 md:gap-6">
        <div className="flex-1">
          {leftColumn.map((item, index) => (
            <FAQItem key={index} {...item} />
          ))}
        </div>
        <div className="flex-1">
          {rightColumn.map((item, index) => (
            <FAQItem key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
