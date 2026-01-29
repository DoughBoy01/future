import { useState } from 'react';
import { DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RevenueCalculator() {
  const [numCamps, setNumCamps] = useState(3);
  const [avgPrice, setAvgPrice] = useState(300);
  const [avgBookings, setAvgBookings] = useState(25);

  // Calculations
  const totalRevenue = numCamps * avgPrice * avgBookings;
  const platformFee = totalRevenue * 0.15;
  const yourEarnings = totalRevenue * 0.85;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-pink-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Revenue Calculator</h3>
      </div>

      {/* Input Sliders */}
      <div className="space-y-8 mb-10">
        {/* Number of Camps */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700">
              Number of Camps
            </label>
            <span className="text-2xl font-bold text-pink-600">{numCamps}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={numCamps}
            onChange={(e) => setNumCamps(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 camp</span>
            <span>10 camps</span>
          </div>
        </div>

        {/* Average Price */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700">
              Average Price per Camper
            </label>
            <span className="text-2xl font-bold text-pink-600">
              {formatCurrency(avgPrice)}
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="1000"
            step="50"
            value={avgPrice}
            onChange={(e) => setAvgPrice(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$100</span>
            <span>$1,000</span>
          </div>
        </div>

        {/* Average Bookings */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700">
              Average Bookings per Camp
            </label>
            <span className="text-2xl font-bold text-pink-600">{avgBookings}</span>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            value={avgBookings}
            onChange={(e) => setAvgBookings(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10 bookings</span>
            <span>50 bookings</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4 mb-8">
        {/* Total Revenue */}
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">
                Total Revenue
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(totalRevenue)}
              </div>
            </div>
            <TrendingUp className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        {/* Split Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          {/* Your Earnings */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-300">
            <div className="text-sm font-medium text-green-700 mb-1">
              You Keep (85%)
            </div>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(yourEarnings)}
            </div>
          </div>

          {/* Platform Fee */}
          <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
            <div className="text-sm font-medium text-pink-700 mb-1">
              Platform Fee (15%)
            </div>
            <div className="text-2xl font-bold text-pink-900">
              {formatCurrency(platformFee)}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Breakdown */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Revenue Split</span>
        </div>
        <div className="flex h-8 rounded-lg overflow-hidden border-2 border-gray-300">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm"
            style={{ width: '85%' }}
          >
            85% to you
          </div>
          <div
            className="bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm"
            style={{ width: '15%' }}
          >
            15%
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/signup?role=camp_owner"
        className="block w-full text-center px-6 py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        Start Earning {formatCurrency(yourEarnings)}
      </Link>

      {/* Fine Print */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Based on {numCamps} {numCamps === 1 ? 'camp' : 'camps'} × {avgBookings} bookings × {formatCurrency(avgPrice)} per camper
      </p>
    </div>
  );
}
