"use client";

import { useState, useEffect } from "react";
import { X, ArrowLeft, Upload, Loader2, Linkedin } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useSearchParams, useRouter } from "next/navigation";
import { Job } from "./JobLanding";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface ApplicationFormProps {
  job: Job;
  onClose?: () => void;
  onBack?: () => void;
  isStandalone?: boolean;
}

export function ApplicationForm({
  job,
  onClose,
  onBack,
  isStandalone = false,
}: ApplicationFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    portfolio: "",
    coverLetter: "",
  });

  /* 
  useEffect(() => {
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const linkedinUrl = searchParams.get('linkedinUrl');
    
    if (name || email || linkedinUrl) {
      setFormData(prev => ({
        ...prev,
        fullName: name || prev.fullName,
        email: email || prev.email,
        linkedIn: linkedinUrl || prev.linkedIn
      }));
      
      // Clean up URL
      const newPath = window.location.pathname;
      router.replace(newPath);
    }
  }, [searchParams, router]);
  */
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const uploadResume = async (file: File): Promise<string | null> => {
    try {
      console.log(
        "Starting resume upload for file:",
        file.name,
        "size:",
        file.size
      );

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      console.log("Uploading to path:", filePath);

      const { data, error } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (error) {
        console.error("Upload error details:", error);
        return null;
      }

      console.log("Upload successful, data:", data);

      const {
        data: { publicUrl },
      } = supabase.storage.from("resumes").getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);
      return publicUrl;
    } catch (err) {
      console.error("Unexpected error during resume upload:", err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let resumeUrl = null;
      if (resume) {
        resumeUrl = await uploadResume(resume);
      }

      if (!resumeUrl) {
        throw new Error("Failed to upload resume. Please try again.");
      }

      const applicationData = {
        job_id: job.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        position: job.title,
        linkedin: formData.linkedIn || null,
        portfolio: formData.portfolio || null,
        cover_letter: formData.coverLetter || null,
        experience: "",
        resume_url: resumeUrl,
      };

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const successContent = (
    <div className={`bg-white rounded-2xl p-8 text-center ${isStandalone ? '' : 'max-w-md w-full shadow-xl'}`}>
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="mb-4 text-2xl font-bold">Application Submitted!</h2>
      <p className="text-gray-600 mb-8">
        Thank you for applying to the {job.title} position. We&apos;ll
        review your application and get back to you soon.
      </p>
      {onClose ? (
        <button
          onClick={() => {
            setIsNavigating(true);
            onClose?.();
          }}
          disabled={isNavigating}
          className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-all font-bold flex items-center justify-center gap-2"
        >
          {isNavigating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Closing...
            </>
          ) : (
            "Close"
          )}
        </button>
      ) : isStandalone ? (
        <a
          href="/careers"
          onClick={() => setIsNavigating(true)}
          className={`inline-block w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-all font-bold text-center flex items-center justify-center gap-2 ${isNavigating ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isNavigating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading...
            </>
          ) : (
            "Back to Careers"
          )}
        </a>
      ) : null}
    </div>
  );

  if (isSubmitted) {
    if (isStandalone) {
      return (
        <div className="max-w-2xl mx-auto py-12 px-6">
          {successContent}
        </div>
      );
    }
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
        {successContent}
      </div>
    );
  }

  const formContent = (
    <div className={`bg-white ${isStandalone ? 'rounded-3xl border border-gray-100 shadow-sm' : 'rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'}`}>
      {/* Header */}
      <div className={`sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-6 flex justify-between items-center z-10 ${isStandalone ? 'rounded-t-3xl' : ''}`}>
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={() => {
                setIsNavigating(true);
                onBack?.();
              }}
              disabled={isNavigating}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center"
            >
              {isNavigating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply for {job.title}</h2>
            {isStandalone && (
               <p className="text-sm text-gray-500">{job.type} • {job.location}</p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            data-testid="close-application-btn"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">
        {/* Apply with LinkedIn Button - Temporarily Disabled
        <div className="pb-4 border-b border-gray-100">
          <button
            type="button"
            onClick={() => {
              window.location.href = `/api/auth/linkedin?jobId=${job.id}&jobSlug=${job.slug}`;
            }}
            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-[#0077B5] text-[#0077B5] rounded-2xl font-bold hover:bg-[#0077B5] hover:text-white transition-all group shadow-sm hover:shadow-md"
          >
            <Linkedin className="w-5 h-5 fill-current" />
            Apply with LinkedIn
          </button>
          <div className="relative mt-6 text-center">
            <span className="px-4 bg-white text-gray-400 text-sm font-medium relative z-10 uppercase tracking-widest">or apply manually</span>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 -z-0"></div>
          </div>
        </div>
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all outline-none text-lg"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all outline-none text-lg"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all outline-none text-lg"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              LinkedIn Profile
            </label>
            <input
              type="url"
              name="linkedIn"
              value={formData.linkedIn}
              onChange={handleInputChange}
              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all outline-none text-lg"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            Resume / CV *
          </label>
          <div className="relative group">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
              className="hidden"
              id="resume-upload"
              required={!isSubmitted}
            />
            <label 
              htmlFor="resume-upload" 
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 transition-all cursor-pointer ${
                resume 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 bg-gray-50 hover:border-black hover:bg-white shadow-sm'
              }`}
            >
              <Upload className={`w-10 h-10 mb-4 ${resume ? 'text-green-600' : 'text-gray-400 group-hover:text-black'}`} />
              {resume ? (
                <div className="text-center">
                  <p className="text-lg font-bold text-green-700">{resume.name}</p>
                  <p className="text-sm text-green-600/70 mt-1">Ready to upload</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">Click to upload resume</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Accepts PDF, DOC, DOCX up to 5MB
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            Portfolio / Website
          </label>
          <input
            type="url"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleInputChange}
            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all outline-none text-lg"
            placeholder="https://yourportfolio.com"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            Cover Letter
          </label>
          <textarea
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all outline-none text-lg resize-none"
            placeholder="Why are you a great fit for this role?"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-5 rounded-3xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold shadow-xl shadow-black/10 active:scale-[0.98]"
          data-testid="submit-application-btn"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting Application...
            </>
          ) : (
            "Review & Submit"
          )}
        </button>
      </form>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-[#fafafa] py-12 md:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      {formContent}
    </div>
  );
}
