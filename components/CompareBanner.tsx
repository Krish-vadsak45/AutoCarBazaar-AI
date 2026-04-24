'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeftRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CompareSelectionModal } from '@/components/CompareSelectionModal';
import { useCompareStore } from '@/hooks/use-compare-store';

import { Button } from './ui/button';

export function CompareBanner() {
  const { selectedCars, removeCar, clearCars } = useCompareStore();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  if (selectedCars.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 transform translate-y-0 transition-transform bg-white dark:bg-slate-900 border-t shadow-[0_-10px_30px_rgba(0,0,0,0.1)] dark:border-slate-700">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-sm mr-4 hidden md:block">Comparing Cars</h3>

            <div className="flex gap-2">
              {[0, 1, 2].map((index) => {
                const car = selectedCars[index];
                if (car) {
                  return (
                    <div
                      key={car.id}
                      className="relative w-16 h-16 rounded-md overflow-hidden border"
                    >
                      <Image
                        src={
                          typeof car.image === 'string' && car.image.trim() !== ''
                            ? car.image
                            : '/placeholder.svg'
                        }
                        alt={car.title || 'Compare Car'}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => removeCar(car.id)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <button
                      key={`empty-${index}`}
                      onClick={() => setModalOpen(true)}
                      className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-gray-400 text-xl">+</span>
                    </button>
                  );
                }
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <Button variant="outline" onClick={clearCars} className="flex-1 md:flex-none">
              Clear All
            </Button>
            <Button
              className="flex-1 md:flex-none gap-2"
              disabled={selectedCars.length < 2}
              onClick={() => router.push('/compare')}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Compare ({selectedCars.length}/3)
            </Button>
          </div>
        </div>
      </div>
      <CompareSelectionModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
