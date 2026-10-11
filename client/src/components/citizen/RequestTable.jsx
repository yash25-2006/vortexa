import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  RotateCw,
  AlertCircle,
  Database
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Healthcare',
  'Education',
  'Roads & Transport',
  'Water & Sanitation',
  'Digital Connectivity',
  'Electricity',
  'Agriculture',
  'Housing',
  'Other'
];

const URGENCIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const LANGUAGES = ['All', 'Marathi', 'Hindi', 'English'];
const STATUSES = ['All', 'New', 'In Review', 'In Progress', 'Resolved'];

export default function RequestTable({
  requests,
  total,
  isLoading,
  filters,
  setFilters,
  onRefresh,
  onSelectRequest
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchTerm, offset: 0 }));
  };

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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Submitted Citizen Development Requests</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {total} total
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured civic requests categorized and summarized by Google Gemini AI.
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs w-fit"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh Table</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by ID, keyword, issue, or original text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          {/* Category Filter */}
          <div>
            <select
              value={filters.category || 'All'}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value, offset: 0 }))}
              className="w-full text-xs py-2 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <select
              value={filters.urgency || 'All'}
              onChange={(e) => setFilters((prev) => ({ ...prev, urgency: e.target.value, offset: 0 }))}
              className="w-full text-xs py-2 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            >
              {URGENCIES.map((urg) => (
                <option key={urg} value={urg}>
                  Urgency: {urg}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={filters.language || 'All'}
              onChange={(e) => setFilters((prev) => ({ ...prev, language: e.target.value, offset: 0 }))}
              className="w-full text-xs py-2 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  Language: {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
            <tr>
              <th scope="col" className="py-3 px-4">Request ID</th>
              <th scope="col" className="py-3 px-4">Category</th>
              <th scope="col" className="py-3 px-4 min-w-[200px]">Classified Issue</th>
              <th scope="col" className="py-3 px-3">Language</th>
              <th scope="col" className="py-3 px-3">Urgency</th>
              <th scope="col" className="py-3 px-4">Location</th>
              <th scope="col" className="py-3 px-3">Date</th>
              <th scope="col" className="py-3 px-3">Status</th>
              <th scope="col" className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading development requests from database...</span>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-700 text-sm">No requests match current filters</p>
                    <p className="text-xs text-slate-400">Try resetting the search query or category filters.</p>
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
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <span>{item.request_code || `REQ-${item.id}`}</span>
                      {item.is_synthetic && (
                        <span className="inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200" title="Synthetic Demonstration Record">
                          Demo
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {item.category}
                    </span>
                  </td>

                  {/* Issue */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 line-clamp-1">{item.issue}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.ai_summary}
                    </div>
                  </td>

                  {/* Language */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-medium text-slate-700">{item.language || 'Unknown'}</span>
                  </td>

                  {/* Urgency */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border ${getUrgencyBadge(item.urgency)}`}>
                      {item.urgency}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-slate-600 max-w-[150px] truncate">
                    {item.location_details || (item.latitude ? `${item.latitude}, ${item.longitude}` : 'N/A')}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRequest(item);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-[#002B49] hover:text-white text-slate-700 text-[11px] font-semibold transition-colors"
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
        <span>Showing {requests.length} of {total} registered requests</span>
        <span className="text-[11px] text-slate-400">Click any row to view complete AI breakdown & citizen text</span>
      </div>
    </div>
  );
}
