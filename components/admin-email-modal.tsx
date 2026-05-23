'use client';

import { useState } from 'react';
import { X, Send, Mail, Loader2, FileText, Type } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AdminEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminEmailModal({ isOpen, onClose }: AdminEmailModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSend = async () => {
    if (!to || !subject || !body) {
      toast.error('Please fill in all fields (To, Subject, and Body).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('/api/admin/send-email', { to, subject, body });
      toast.success('Email sent successfully!');
      setTo('');
      setSubject('');
      setBody('');
      onClose();
    } catch (error: unknown) {
      console.error('Email send error:', error);
      let errorMessage = 'Failed to send email. Please try again.';
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shadow-inner">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Send Custom Email</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Write a direct message to a specific vendor/email.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body scrollable area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Recipient Email <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. vendor@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={isLoading}
              className="w-full bg-muted/20 focus-visible:ring-primary/50 shadow-sm"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Type className="h-4 w-4 text-muted-foreground" />
              Subject Line <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="What is this regarding?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isLoading}
              className="w-full bg-muted/20 focus-visible:ring-primary/50 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Message Body <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Write your email here. Line breaks will be preserved..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isLoading}
              className="w-full min-h-[250px] resize-y bg-muted/20 focus-visible:ring-primary/50 shadow-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/10 flex justify-end gap-3 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-28 font-medium shadow-sm"
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleSend}
            className="w-36 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
