'use client';

import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { Star } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  testDriveId: string;
  onSuccess?: () => void;
}

export function ReviewModal({ isOpen, onClose, carId, testDriveId, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/reviews', {
        carId,
        testDriveId,
        rating,
        comment,
      });
      toast.success('Review submitted successfully!');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error: string }>;
      toast.error(axiosError.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    (hover || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Your experience</label>
            <Textarea
              placeholder="Tell us about your test drive experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
