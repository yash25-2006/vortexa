import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Search,
  MapPin,
  Landmark,
  IndianRupee,
  Layers,
  ArrowRight,
  Info,
  ChevronRight
} from 'lucide-react';
import { TRANSLATIONS } from '../../constants/translations';
import { fetchGovernmentPlans } from '../../services/api';

const CATEGORY_COLORS = {
  Healthcare: 'bg-rose-50 text-rose-700 border-rose-200',
  'Roads & Transport': 'bg-amber-50 text-amber-700 border-amber-200',
  'Water & Sanitation': 'bg-sky-50 text-sky-700 border-sky-200',
  Education: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Electricity: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'Waste Management': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Housing: 'bg-purple-50 text-purple-700 border-purple-200',
  Agriculture: 'bg-lime-50 text-lime-800 border-lime-200',
  Other: 'bg-slate-50 text-slate-700 border-slate-200'
};

export default function GovernmentPlansModal({ language = 'en', onClose, initialPlan = null }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [activeTab, setActiveTab] = useState(initialPlan && initialPlan.status === 'completed' ? 'completed' : 'upcoming');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(initialPlan || null);

  const loadPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchGovernmentPlans({
        status: activeTab,
        category: categoryFilter !== 'All' ? categoryFilter : null,
        search: searchQuery.trim() || null
      });
      setPlans(data || []);
    } catch (err) {
      console.error('Failed to load government plans:', err);
      setError(err.message || 'Failed to retrieve government plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [activeTab, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPlans();
  };

  const getPlanTitle = (plan) => {
    if (language === 'mr' && plan.title_mr) return plan.title_mr;
    if (language === 'hi' && plan.title_hi) return plan.title_hi;
    return plan.title || plan.title_mr || plan.title_hi || 'Government Development Plan';
  };

  const getPlanDescription = (plan) => {
    if (language === 'mr' && plan.description_mr) return plan.description_mr;
    if (language === 'hi' && plan.description_hi) return plan.description_hi;
    return plan.description || plan.description_mr || plan.description_hi || '';
  };

  const formatExecutionDate = (dateString) => {
    if (!dateString) {
      return t.dateNotSpecified || 'Execution date: Not specified in the available government plan';
    }
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const categories = [
    'All',
    'Healthcare',
    'Roads & Transport',
    'Water & Sanitation',
    'Education',
    'Electricity',
    'Waste Management',
    'Housing',
    'Agriculture',
    'Other'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {t.governmentPlansTitle || 'Government Development Plans'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {t.governmentPlansSubtitle || 'Upcoming and completed public infrastructure projects in your area'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Search Bar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto">
              <button
                onClick={() => { setActiveTab('upcoming'); setSelectedPlan(null); }}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                  activeTab === 'upcoming'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{t.upcomingPlansTab || 'Upcoming Plans'}</span>
              </button>
              <button
                onClick={() => { setActiveTab('completed'); setSelectedPlan(null); }}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                  activeTab === 'completed'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.completedPlansTab || 'Completed Plans'}</span>
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                <option value="All">{t.allCategories || 'All Sectors'}</option>
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlansPlaceholder || 'Search by title, location, department...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </form>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {selectedPlan ? (
            /* Plan Detail View */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>← {t.back || 'Back to plans'}</span>
                </button>
                <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {selectedPlan.plan_code || selectedPlan.planCode || `PLAN-${selectedPlan.id}`}
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    CATEGORY_COLORS[selectedPlan.category] || CATEGORY_COLORS.Other
                  }`}>
                    {selectedPlan.category}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    selectedPlan.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedPlan.status === 'ongoing'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedPlan.status === 'completed' ? '✓ Completed' : selectedPlan.status === 'ongoing' ? '⏳ Ongoing' : '🗓️ Upcoming Plan'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {getPlanTitle(selectedPlan)}
                </h3>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Description
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {getPlanDescription(selectedPlan)}
                </p>
              </div>

              {/* Meta details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Location</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {[selectedPlan.ward || selectedPlan.village, selectedPlan.district, selectedPlan.state].filter(Boolean).join(', ') || selectedPlan.location_name || 'All Districts'}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex items-start space-x-3">
                  <Landmark className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium">{t.department || 'Department'}</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {selectedPlan.department || 'Public Works & Development'}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium">{t.executionDate || 'Planned Completion Date'}</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {selectedPlan.planned_completion_date || selectedPlan.plannedCompletionDate
                        ? formatExecutionDate(selectedPlan.planned_completion_date || selectedPlan.plannedCompletionDate)
                        : (t.dateNotSpecified || 'Execution date: Not specified in the available government plan')}
                    </div>
                  </div>
                </div>

                {selectedPlan.estimated_budget || selectedPlan.estimatedBudget ? (
                  <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex items-start space-x-3">
                    <IndianRupee className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">{t.budget || 'Estimated Budget'}</div>
                      <div className="text-sm font-semibold text-slate-800">
                        {selectedPlan.estimated_budget || selectedPlan.estimatedBudget}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Source Link */}
              {selectedPlan.source_url || selectedPlan.sourceUrl ? (
                <div className="pt-2">
                  <a
                    href={selectedPlan.source_url || selectedPlan.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors border border-blue-200"
                  >
                    <span>{t.officialSource || 'Official Source / Government Portal'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : null}
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 font-medium">{t.loading || 'Loading government plans...'}</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700">
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-700">
                {activeTab === 'upcoming'
                  ? (t.noUpcomingPlans || 'No upcoming government plans are available.')
                  : (t.noCompletedPlans || 'No completed government plans found.')}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {categoryFilter !== 'All' ? `Try changing the sector filter from '${categoryFilter}' to 'All'.` : 'Check back later as new public infrastructure projects are sanctioned.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                        CATEGORY_COLORS[plan.category] || CATEGORY_COLORS.Other
                      }`}>
                        {plan.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-medium">
                        {plan.plan_code || `PLAN-${plan.id}`}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {getPlanTitle(plan)}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {getPlanDescription(plan)}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center text-xs text-slate-500 space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        {[plan.ward || plan.village, plan.district].filter(Boolean).join(', ') || plan.district || 'All Districts'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="font-medium">
                          {plan.planned_completion_date
                            ? formatExecutionDate(plan.planned_completion_date)
                            : (t.dateNotSpecified || 'Execution date: Not specified in the available government plan')}
                        </span>
                      </div>
                      <span className="text-blue-600 font-semibold flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Official Government Infrastructure Planning Record</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            {t.closeBtn || 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
