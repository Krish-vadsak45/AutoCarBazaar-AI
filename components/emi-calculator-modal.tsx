'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface EmiCalculatorModalProps {
  isOpen: boolean;
  setIsEmiModalOpen: (isOpen: boolean) => void;
  onClose: () => void;
  carPrice: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function EmiCalculatorModal({ isOpen, onClose, carPrice }: EmiCalculatorModalProps) {
  const [vehiclePrice, setVehiclePrice] = useState(carPrice);
  const [downPayment, setDownPayment] = useState(Math.round(carPrice * 0.15));
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(4);

  // Calculate derived values
  const downPaymentPercent = ((downPayment / vehiclePrice) * 100).toFixed(1);
  const loanAmount = vehiclePrice - downPayment;

  // Calculate monthly payment
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTerm * 12;
  let monthlyPayment = 0;

  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / totalMonths;
  } else {
    monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const totalPayments = monthlyPayment * totalMonths;
  const totalInterest = totalPayments - loanAmount;
  const totalAmount = downPayment + totalPayments;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 ">
      <div className="bg-white  dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide ">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Vehicl Car Loan Calculator
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vehicle Price */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-gray-900 dark:text-white">
              Vehicle Price
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">$</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {vehiclePrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="1000"
              value={vehiclePrice}
              onChange={(e) => {
                const newPrice = Number(e.target.value);
                setVehiclePrice(newPrice);
                setDownPayment(Math.min(downPayment, newPrice));
              }}
              className="w-full h-2 bg-gray-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Down Payment */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-gray-900 dark:text-white">
              Down Payment
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">$</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {downPayment.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={vehiclePrice}
              step="100"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Down payment: {downPaymentPercent}% of vehicle price
            </p>
          </div>

          {/* Interest Rate & Loan Term */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-lg font-semibold text-gray-900 dark:text-white">
                Interest Rate
              </label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {interestRate.toFixed(1)}
                </span>
                <span className="text-gray-600 dark:text-gray-400">%</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-3">
              <label className="text-lg font-semibold text-gray-900 dark:text-white">
                Loan Term
              </label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{loanTerm}</span>
                <span className="text-gray-600 dark:text-gray-400">Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full h-2 bg-gray-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Monthly Payment */}
          <div className="bg-blue-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-slate-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Monthly Payment</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(monthlyPayment)}
            </p>
          </div>

          {/* Breakdown */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Vehicle Price</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(vehiclePrice)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Down Payment</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(downPayment)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Loan Amount</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(loanAmount)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Total Interest</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(totalInterest)}
              </span>
            </div>

            <div className="flex justify-between py-3 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 mt-3 border border-gray-200 dark:border-slate-700">
              <span className="font-semibold text-gray-900 dark:text-white">
                Total Amount (Down Payment + Total Payments)
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4">
            This is an estimate. Actual EMI may vary based on your credit score and lender terms.
          </p>
        </div>
      </div>
    </div>
  );
}
