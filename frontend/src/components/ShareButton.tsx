'use client';

import { useState } from 'react';
import { Share2, Link2, Twitter, Linkedin, Mail, Facebook, Check, X } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url: string;
  description?: string;
}

export function ShareButton({ title, url, description }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || '');

  const shareLinks = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2] hover:bg-[#094d8a]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#1464d3]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodedTitle}&body=Check out this job opening: ${encodedUrl}%0A%0A${encodedDesc}`,
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        data-testid="share-job-btn"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Share this job</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Copy Link */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Copy link</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate">
                  {fullUrl}
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  data-testid="copy-link-btn"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Share on social media</label>
              <div className="grid grid-cols-2 gap-3">
                {shareLinks.map(({ name, icon: Icon, color, url }) => (
                  <button
                    key={name}
                    onClick={() => handleShare(url)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-colors ${color}`}
                    data-testid={`share-${name.toLowerCase()}-btn`}
                  >
                    <Icon className="w-5 h-5" />
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Native Share (Mobile) */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={async () => {
                  try {
                    await navigator.share({
                      title,
                      text: description,
                      url: fullUrl,
                    });
                    setShowModal(false);
                  } catch (err) {
                    console.error('Share failed:', err);
                  }
                }}
                className="w-full mt-4 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                More sharing options
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
