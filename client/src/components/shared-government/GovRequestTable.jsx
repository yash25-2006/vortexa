import React from 'react';
import { Eye, AlertCircle, RotateCw, Database, Languages, MapPin, CheckCircle2 } from 'lucide-react';

export default function GovRequestTable({
  requests = [],
  total = 0,
  isLoading,
  onSelectRequest,
  onRefresh
}) {
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col">
      {/* Table Title Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-[#002B49] uppercase tracking-wider flex items-center space-x-2">
            <span>State Citizen Development Requests</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
              {total} records
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Normalized across Indian languages using Google Gemini semantic classification
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Table Scroll Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
            <tr>
              <th scope="col" className="py-3.5 px-4">Request ID</th>
              <th scope="col" className="py-3.5 px-4">Category</th>
              <th scope="col" className="py-3.5 px-4 min-w-[220px]">Classified Issue</th>
              <th scope="col" className="py-3.5 px-3">Language</th>
              <th scope="col" className="py-3.5 px-3">State</th>
              <th scope="col" className="py-3.5 px-3">District</th>
              <th scope="col" className="py-3.5 px-3">Urgency</th>
              <th scope="col" className="py-3.5 px-3">Date</th>
              <th scope="col" className="py-3.5 px-3">Status</th>
              <th scope="col" className="py-3.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan="10" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-[#002B49] border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading regional development requests...</span>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-700 text-sm">No requests match the selected filters</p>
                    <p className="text-xs text-slate-400">Try switching district or resetting category selection.</p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectRequest(item)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  {/* Request Code */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <span>{item.request_code || `REQ-${item.id}`}</span>
                      {item.is_synthetic && (
                        <span className="inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200" title="Synthetic Demonstration Dataset">
                          Demo
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {item.category}
                    </span>
                  </td>

                  {/* Classified Issue */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 line-clamp-1">{item.issue}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.ai_summary}
                    </div>
                  </td>

                  {/* Language */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-700">{item.language || 'Unknown'}</span>
                  </td>

                  {/* State */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                    {item.state || 'Maharashtra'}
                  </td>

                  {/* District */}
                  <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-slate-800">
                    {item.district || 'Unassigned'}
                  </td>

                  {/* Urgency */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border ${getUrgencyBadge(item.urgency)}`}>
                      {item.urgency}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-500">
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.status || 'New'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRequest(item);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#002B49] hover:text-white text-slate-700 text-[11px] font-bold transition-colors shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Showing {requests.length} of {total} registered state requests</span>
        <span className="text-[11px] text-slate-400">Click any row to inspect original citizen statement & Gemini breakdown</span>
      </div>
    </div>
  );
}
