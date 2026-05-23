'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Check,
  X,
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Gauge,
  Fuel,
  Info,
} from 'lucide-react';

import { useCompareStore } from '@/hooks/use-compare-store';
import { Button } from '@/components/ui/button';
import { CarListItem } from '@/src/types';

type CompareCar = CarListItem & {
  _id: string;
  title: string;
  price: number | string;
  features?: string[];
};

export default function ComparePage() {
  const router = useRouter();
  const { selectedCars, removeCar } = useCompareStore();
  const [fullCars, setFullCars] = useState<CompareCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiConclusion, setAiConclusion] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  useEffect(() => {
    if (selectedCars.length === 0) {
      router.push('/');
      return;
    }

    const fetchFullDetails = async () => {
      setLoading(true);
      try {
        const carDetails = await Promise.all(
          selectedCars.map((c) =>
            axios.get(`/api/cars/${c.id}`).then((res) => res.data.car || res.data)
          )
        );
        const fetchedCars = carDetails.filter(Boolean);
        setFullCars(fetchedCars);

        if (fetchedCars.length >= 2) {
          fetchAiConclusion(fetchedCars);
        }
      } catch (error) {
        console.error('Failed to fetch full car details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullDetails();
  }, [selectedCars, router]);

  const fetchAiConclusion = async (cars: CompareCar[]) => {
    setLoadingAi(true);
    setAiConclusion(null);
    try {
      const res = await axios.post('/api/compare-ai', { cars });
      setAiConclusion(res.data.conclusion);
    } catch (error) {
      console.error('AI Conclusion error', error);
      setAiConclusion('Unable to generate AI conclusion at this time.');
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[128px] animate-pulse delay-700"></div>
        <div className="flex flex-col items-center gap-6 z-10">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-4 border-l-4 border-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-b-4 border-r-4 border-indigo-500 animate-spin-slow"></div>
            <div className="absolute inset-0 flex justify-center items-center">
              <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 animate-pulse">
            Analyzing Vehicle DNA...
          </h2>
          <p className="text-slate-400 font-medium tracking-wide">Gathering comparative datasets</p>
        </div>
      </div>
    );
  }

  const allFeatures = Array.from(new Set(fullCars.flatMap((car) => car.features || []))).sort();

  const specificationGroups = [
    {
      title: 'General Details',
      icon: <Info className="w-5 h-5 text-indigo-400" />,
      items: [
        { label: 'Make', key: 'specs.make' },
        { label: 'Model', key: 'specs.model' },
        { label: 'Year', key: 'specs.year' },
        { label: 'Color', key: 'specs.color' },
        { label: 'Status', key: 'status' },
      ],
    },
    {
      title: 'Performance & Build',
      icon: <Gauge className="w-5 h-5 text-indigo-400" />,
      items: [
        { label: 'Body Type', key: 'bodyType' },
        { label: 'Transmission', key: 'transmission' },
      ],
    },
    {
      title: 'Efficiency',
      icon: <Fuel className="w-5 h-5 text-indigo-400" />,
      items: [
        { label: 'Fuel Type', key: 'specs.fuelType' },
        { label: 'Mileage', key: 'specs.mileage' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030305] relative overflow-hidden pb-24">
      {/* Immersive Background Elements */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-900/10 dark:from-indigo-900/20 to-transparent pointer-events-none"></div>
      <div className="absolute -top-[30%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-500/5 dark:bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 dark:bg-purple-600/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10 pt-10">
        {/* Superior Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-white/10">
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm  mt-7 font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all group py-1"
            >
              <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </div>
              Back to Showroom
            </button>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
              Compare{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
                Models
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {fullCars.length} of 3 Selected
            </span>
          </div>
        </div>

        {/* AI Insight Engine Widget */}
        {fullCars.length >= 2 && (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-1 flex flex-col md:flex-row overflow-hidden shadow-2xl shadow-blue-900/5 dark:shadow-none">
              {/* Decorative side panel */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.75rem] p-6 lg:p-8 md:w-1/3 relative overflow-hidden flex flex-col justify-center min-h-[220px]">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20">
                  <BrainCircuit className="w-48 h-48 text-white" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-widest uppercase items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    AutoCarBazaar AI
                  </div>
                  <h2 className="text-3xl font-extrabold text-white leading-tight">
                    Intelligent Verdict
                  </h2>
                  <p className="text-blue-100/80 text-sm font-medium">
                    Our multimodal AI analyzes specs, market data, and value to help you decide.
                  </p>
                </div>
              </div>

              {/* Mobile Toggle Handle */}
              <button
                onClick={() => setIsAiExpanded(!isAiExpanded)}
                className="md:hidden flex w-full justify-between items-center px-6 py-4 bg-white/5 border-t border-white/10 text-blue-100 font-semibold"
              >
                <span>{isAiExpanded ? 'Hide AI Conclusion' : 'Read AI Conclusion'}</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${isAiExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Content Panel */}
              <div
                className={`p-6 lg:p-8 md:w-2/3 items-center bg-transparent ${isAiExpanded ? 'flex' : 'hidden md:flex'}`}
              >
                {loadingAi ? (
                  <div className="flex flex-col gap-4 w-full h-full justify-center">
                    <div className="flex items-center gap-4 text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
                      <div className="relative w-8 h-8">
                        <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                      </div>
                      Synthesizing deep comparison...
                    </div>
                    <div className="space-y-3 w-full">
                      <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-full animate-pulse w-full"></div>
                      <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-full animate-pulse w-5/6"></div>
                      <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-full animate-pulse w-4/6"></div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full">
                    <div className="text-gray-700 dark:text-gray-300 text-lg md:text-xl leading-relaxed font-medium">
                      {aiConclusion}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* The Matrix Setup */}
        <div className="mt-12">
          {/* Sticky Image Headers Grid */}
          <div className="grid grid-cols-[1fr] sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 sticky top-4 z-40">
            {/* First Cell is empty on desktop, handles header layout */}
            <div className="hidden lg:flex flex-col justify-end bg-transparent p-6 rounded-3xl">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                Side-by-Side
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Detailed metrics, broken down point by point.
              </p>
            </div>

            {/* Render Cars */}
            {fullCars.map((car) => (
              <div
                key={`header-${car._id}`}
                className="group relative flex flex-col justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 h-[380px]"
              >
                <div className="relative w-full h-[60%] rounded-2xl overflow-hidden mb-4 bg-gray-200 dark:bg-slate-800">
                  <button
                    onClick={() => removeCar(car._id)}
                    className="absolute right-3 top-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white transition-all scale-100 sm:scale-0 sm:group-hover:scale-100 origin-center"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                  </button>
                  <Image
                    src={
                      typeof car.images?.[0] === 'string' && car.images[0].trim() !== ''
                        ? car.images[0]
                        : '/placeholder.svg'
                    }
                    alt={car.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white line-clamp-1 mb-1 drop-shadow-md">
                      {car.title}
                    </h3>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between px-2 pb-2">
                  <p className="text-2xl font-black text-slate-900 dark:text-blue-400 drop-shadow-md mb-2">
                    ${typeof car.price === 'number' ? car.price.toLocaleString() : car.price}
                  </p>
                  <Button
                    className="w-full h-12 rounded-xl text-md font-bold bg-slate-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all border-none shadow-md"
                    onClick={() => router.push(`/car/${car._id}`)}
                  >
                    View Details &rarr;
                  </Button>
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 3 - fullCars.length) }).map((_, idx) => (
              <div
                key={`empty-head-${idx}`}
                className="flex flex-col items-center justify-center bg-gray-100/50 dark:bg-slate-800/20 backdrop-blur-sm border-2 border-dashed border-gray-300 dark:border-slate-700/50 rounded-3xl p-4 lg:p-6 h-[380px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-200/50 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                  Available Slot
                </p>
              </div>
            ))}
          </div>

          {/* Comparison Sections */}
          <div className="space-y-8 lg:space-y-12 transition-all">
            {specificationGroups.map((group, groupIdx) => (
              <div
                key={groupIdx}
                className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm"
              >
                <div className="px-6 py-6 border-b border-gray-200 dark:border-white/10 md:px-8 bg-gray-50/50 dark:bg-black/20 flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                    {group.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                    {group.title}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {group.items.map((spec) => (
                    <div
                      key={spec.label}
                      className="grid grid-cols-4 hover:bg-white dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="p-4 lg:p-8 flex items-center col-span-1">
                        <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {spec.label}
                        </span>
                      </div>
                      {fullCars.map((car) => {
                        const keys = spec.key.split('.');
                        let val: unknown = car;
                        for (const k of keys) {
                          val =
                            val && typeof val === 'object'
                              ? (val as Record<string, unknown>)[k]
                              : undefined;
                        }
                        return (
                          <div
                            key={`${car._id}-${spec.label}`}
                            className="p-4 lg:p-8 flex items-center border-l border-gray-100 dark:border-white/5 text-base lg:text-lg font-semibold text-slate-900 dark:text-gray-200"
                          >
                            {val ? (
                              String(val)
                            ) : (
                              <span className="text-gray-300 dark:text-slate-700">—</span>
                            )}
                          </div>
                        );
                      })}
                      {Array.from({
                        length: Math.max(0, 3 - fullCars.length),
                      }).map((_, idx) => (
                        <div
                          key={`empty-spec-${idx}`}
                          className="block p-4 lg:p-8 border-l border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-black/10"
                        ></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Features Checklist */}
            {allFeatures.length > 0 && (
              <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="px-6 py-6 border-b border-gray-200 dark:border-white/10 md:px-8 bg-gray-50/50 dark:bg-black/20 flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                    Premium Features
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {allFeatures.map((feature) => (
                    <div
                      key={feature}
                      className="grid grid-cols-4 hover:bg-white dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <div className="p-4 lg:p-8 flex items-center col-span-1">
                        <span className="text-[15px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {feature}
                        </span>
                      </div>
                      {fullCars.map((car) => {
                        const hasFeature = car.features?.includes(feature);
                        return (
                          <div
                            key={`${car._id}-${feature}`}
                            className="p-4 lg:p-8 flex items-center border-l border-gray-100 dark:border-white/5"
                          >
                            {hasFeature ? (
                              <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-emerald-50 dark:ring-emerald-950/30 shadow-inner">
                                <Check className="w-5 h-5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-gray-50 dark:ring-slate-900/50">
                                <X className="w-5 h-5 stroke-[2]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {Array.from({
                        length: Math.max(0, 3 - fullCars.length),
                      }).map((_, idx) => (
                        <div
                          key={`empty-feat-${idx}`}
                          className="block p-4 lg:p-8 border-l border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-black/10"
                        ></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
