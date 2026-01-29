import { Check, X, Crown } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  us: boolean | string;
  eventbrite: boolean | string;
  diyWebsite: boolean | string;
  traditional: boolean | string;
}

export function ComparisonTable() {
  const data: ComparisonRow[] = [
    {
      feature: 'Commission / Fees',
      us: '15%',
      eventbrite: '3.5% + $1.79/ticket',
      diyWebsite: '$0 (but time cost)',
      traditional: '0% (but manual work)',
    },
    {
      feature: 'Setup Fee',
      us: '$0',
      eventbrite: '$0',
      diyWebsite: '$500-2,000',
      traditional: '$0',
    },
    {
      feature: 'Monthly Fee',
      us: '$0',
      eventbrite: '$0-79',
      diyWebsite: '$10-50',
      traditional: '$0',
    },
    {
      feature: 'Smart Parent Matching',
      us: true,
      eventbrite: false,
      diyWebsite: false,
      traditional: false,
    },
    {
      feature: 'Instant Payouts',
      us: true,
      eventbrite: '5-7 days',
      diyWebsite: 'Manual',
      traditional: 'Manual',
    },
    {
      feature: 'Automated Forms',
      us: true,
      eventbrite: false,
      diyWebsite: false,
      traditional: false,
    },
    {
      feature: 'Built-in Discovery',
      us: true,
      eventbrite: 'Limited',
      diyWebsite: false,
      traditional: false,
    },
    {
      feature: 'Professional Camp Pages',
      us: true,
      eventbrite: 'Basic',
      diyWebsite: 'DIY',
      traditional: false,
    },
    {
      feature: 'Time to First Booking',
      us: '<24 hours',
      eventbrite: '1-2 weeks',
      diyWebsite: '4-8 weeks',
      traditional: '2-4 weeks',
    },
    {
      feature: 'Setup Time',
      us: '30 mins',
      eventbrite: '1 hour',
      diyWebsite: '20-40 hours',
      traditional: '10-20 hours',
    },
  ];

  const renderCell = (value: boolean | string, isUs: boolean = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className={`w-6 h-6 mx-auto ${isUs ? 'text-green-600' : 'text-gray-400'}`} />
      ) : (
        <X className="w-6 h-6 mx-auto text-gray-300" />
      );
    }
    return <span className={isUs ? 'font-semibold text-gray-900' : 'text-gray-600'}>{value}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-4 text-left font-semibold text-gray-900 border-b-2 border-gray-200">
              Feature
            </th>
            <th className="p-4 text-center font-semibold border-b-2 border-pink-300 bg-gradient-to-br from-pink-50 to-pink-100 relative">
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-pink-600" />
                <span className="text-pink-900">Our Platform</span>
              </div>
              <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                BEST VALUE
              </div>
            </th>
            <th className="p-4 text-center font-semibold text-gray-700 border-b-2 border-gray-200">
              Eventbrite
            </th>
            <th className="p-4 text-center font-semibold text-gray-700 border-b-2 border-gray-200">
              DIY Website
            </th>
            <th className="p-4 text-center font-semibold text-gray-700 border-b-2 border-gray-200">
              Traditional
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.feature}
              className={`${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-pink-50 transition-colors`}
            >
              <td className="p-4 font-medium text-gray-900 border-b border-gray-100">
                {row.feature}
              </td>
              <td className="p-4 text-center border-b border-pink-100 bg-gradient-to-br from-pink-50/50 to-pink-100/50">
                {renderCell(row.us, true)}
              </td>
              <td className="p-4 text-center border-b border-gray-100">
                {renderCell(row.eventbrite)}
              </td>
              <td className="p-4 text-center border-b border-gray-100">
                {renderCell(row.diyWebsite)}
              </td>
              <td className="p-4 text-center border-b border-gray-100">
                {renderCell(row.traditional)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-6 mt-6">
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border-2 border-pink-300 relative">
          <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
            BEST VALUE
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-pink-600" />
            <h3 className="text-xl font-bold text-pink-900">Our Platform</h3>
          </div>
          <ul className="space-y-3">
            {data.map((row) => (
              <li key={row.feature} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{row.feature}</span>
                <span className="font-semibold text-gray-900">{renderCell(row.us, true)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Eventbrite</h3>
          <ul className="space-y-3">
            {data.map((row) => (
              <li key={row.feature} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{row.feature}</span>
                <span className="text-gray-900">{renderCell(row.eventbrite)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">DIY Website</h3>
          <ul className="space-y-3">
            {data.map((row) => (
              <li key={row.feature} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{row.feature}</span>
                <span className="text-gray-900">{renderCell(row.diyWebsite)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Traditional Registration</h3>
          <ul className="space-y-3">
            {data.map((row) => (
              <li key={row.feature} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{row.feature}</span>
                <span className="text-gray-900">{renderCell(row.traditional)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
