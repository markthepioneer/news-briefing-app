import React, { useState } from 'react';
import { Loader, Mail } from 'lucide-react';

interface AlternativeEmailButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const AlternativeEmailButton: React.FC<AlternativeEmailButtonProps> = ({ 
  onSuccess,
  onError 
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const response = await fetch('/api/test/alternative-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send alternative email');
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to send alternative email:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to send alternative email');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button
      onClick={handleSendEmail}
      disabled={isSending}
      className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSending ? (
        <>
          <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
          Sending Alt Email...
        </>
      ) : (
        <>
          <Mail className="h-4 w-4 mr-2" />
          Try Alternative Email
        </>
      )}
    </button>
  );
};

export default AlternativeEmailButton;
