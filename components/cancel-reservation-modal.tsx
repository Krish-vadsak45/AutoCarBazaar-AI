'use client';

import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';

interface ReservationData {
  _id: string;
  title: string;
  selectedDate: string;
  selectedTime: string;
}

interface CancelReservationModalProps {
  reservation: ReservationData;
  onClose: () => void;
  onConfirm: (reservationId: string) => void;
}

export function CancelReservationModal({
  reservation,
  onClose,
  onConfirm,
}: CancelReservationModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header Pattern */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 pt-10 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6 text-red-600 dark:text-red-500">
              <AlertTriangle className="w-8 h-8" strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Cancel Appointment?
            </h2>

            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm mb-8">
              You are about to cancel your test drive for <br />
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                {reservation.title}
              </span>
              <br /> on{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                {formatDate(reservation.selectedDate)} at {reservation.selectedTime}
              </span>
              .
              <br /> This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="py-6 rounded-xl border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Keep it
              </Button>
              <Button
                onClick={() => onConfirm(reservation._id)}
                className="py-6 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
