import React, { useState } from 'react';
import {
  X,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Wrench,
  UserCheck,
  Building,
  ArrowRight,
  HelpCircle,
  Sparkles,
  MapPin,
  Clock,
  Loader2
} from 'lucide-react';
import { getTeamsByCategory } from '../../constants/fieldTeams';
import { assignComplaintToTeam } from '../../services/api';
import {
  WARD_TRANSLATIONS,
  getTranslatedCitizenText,
  getLocalizedCategory,
  getLocalizedUrgency
} from '../../constants/wardTranslations';

/**
 * WardTeamAssignModal
 * Handles category-strict field team selection and task assignment from Ward In-charge.
 * Exclusively for complaints.
 */
export default function WardTeamAssignModal({
  complaint,
  wardName,
  userEmail,
  language = 'en',
  onClose,
  onAssigned
}) {
  const [selectedTeamCode, setSelectedTeamCode] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!complaint || (complaint.request_type || '').toLowerCase() === 'demand') return null;

  const wt = WARD_TRANSLATIONS[language] || WARD_TRANSLATIONS.en;
  const category = complaint.category || 'Roads & Transport';
  const matchingTeams = getTeamsByCategory(category);
  const selectedTeam = matchingTeams.find(
    (t) => t.teamCode === selectedTeamCode || t.id === selectedTeamCode
  );

  const handleProceedToConfirm = () => {
    if (!selectedTeamCode) {
      setErrorMsg('Please select a field team before proceeding.');
      return;
    }
    setErrorMsg('');
    setShowConfirmation(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedTeam) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        requestId: complaint.id,
        teamId: selectedTeam.teamCode || selectedTeam.id,
        teamName: selectedTeam.teamName,
        category: category,
        department: selectedTeam.department,
        notes: notes.trim() || null,
        ward: wardName || complaint.ward || 'Bavdhan',
        district: complaint.district || 'Pune',
        state: complaint.state || 'Maharashtra',
        priority: complaint.urgency || 'Medium'
      };

      const res = await assignComplaintToTeam(payload, userEmail);

      setSuccessMsg(`Task successfully assigned to ${selectedTeam.teamName}!`);
      setTimeout(() => {
        if (onAssigned) {
          onAssigned(res.data);
        }
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Error assigning team:', err);
      setErrorMsg(err.message || 'Failed to assign complaint to field team. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#002B49] via-slate-900 to-emerald-950 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 backdrop-blur-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/30">
                  {wt.wardTaskDispatch || 'Ward Task Dispatch'}
                </span>
                <span className="text-xs text-slate-300 font-mono font-bold">
                  {complaint.request_code || `REQ-${complaint.id}`}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                {wt.sendToGovFieldTeam || 'Send to Government Field Team'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center space-x-3 animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-extrabold text-sm">{successMsg}</p>
                <p className="text-xs text-emerald-700 mt-0.5">Updating status and redirecting...</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span className="text-xs font-bold">{errorMsg}</span>
            </div>
          )}

          {/* 1. Target Complaint Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                  📁 {getLocalizedCategory(complaint.category, language)}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  complaint.urgency === 'High' || complaint.urgency === 'Critical'
                    ? 'bg-rose-100 text-rose-900 border border-rose-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  ⚡ {getLocalizedUrgency(complaint.urgency || 'Medium', language)}
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{complaint.location_details || complaint.village || wardName || 'Ward Area'}</span>
              </span>
            </div>

            <blockquote className="font-bold text-sm text-[#002B49] bg-white p-3 rounded-xl border border-slate-200 leading-snug">
              &ldquo;{getTranslatedCitizenText(complaint.original_text || complaint.issue, language, complaint.original_language)}&rdquo;
            </blockquote>

            {complaint.ai_summary && (
              <p className="text-xs text-slate-600 font-medium">
                <span className="font-bold text-slate-800">{wt.aiContext || 'AI Context:'} </span>
                {getTranslatedCitizenText(complaint.ai_summary, language, complaint.original_language)}
              </p>
            )}
          </div>

          {/* 2. Category-Strict Team Selection Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-[#002B49] uppercase tracking-wider flex items-center space-x-2">
                  <span>{getLocalizedCategory(category, language)} {wt.authorizedFieldTeamsFor || 'Authorized Field Teams'}</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {wt.showingOnlyVerifiedSquads || 'Showing ONLY verified technical squads specialized in this category'}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                {matchingTeams.length} {wt.teamsAvailable || 'Teams Available'}
              </span>
            </div>

            {matchingTeams.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                No active field teams found for category &ldquo;{getLocalizedCategory(category, language)}&rdquo;.
              </div>
            ) : (
              <div className="space-y-3">
                {matchingTeams.map((team) => {
                  const isSelected = selectedTeamCode === team.teamCode || selectedTeamCode === team.id;
                  return (
                    <div
                      key={team.teamCode || team.id}
                      onClick={() => !isSubmitting && setSelectedTeamCode(team.teamCode || team.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 shadow-xs group ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Team Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-transform group-hover:scale-105 ${
                              isSelected
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Wrench className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-black text-sm text-[#002B49]">
                                {team.teamName}
                              </h5>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300">
                                {team.teamCode}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-semibold mt-0.5">
                              🏢 {team.department}
                            </p>
                          </div>
                        </div>

                        {/* Radio Checkmark Indicator */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'border-2 border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Team Operational Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                          <span>
                            <strong className="text-slate-900">{wt.lead || 'Lead:'}</strong> {team.leadOfficer} ({team.designation})
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <Users className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                          <span>
                            <strong className="text-slate-900">{wt.strength || 'Strength:'}</strong> {team.unitSize}
                          </span>
                        </div>
                      </div>

                      {team.operationalFocus && (
                        <p className="text-[11px] text-slate-500 font-medium bg-white/80 p-2 rounded-lg border border-slate-100">
                          🎯 <strong className="text-slate-700">{wt.focus || 'Focus:'}</strong> {team.operationalFocus}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Optional Instructions / Work Order Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {wt.workOrderInstructions || 'Work Order Instructions (Optional)'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              placeholder={wt.workOrderInstructionsPlaceholder || "Add specific instructions for the field team..."}
              className="w-full p-3 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 4. Confirmation Dialog Step */}
          {showConfirmation && selectedTeam && (
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3 animate-fadeIn">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-extrabold text-sm text-amber-950">
                    {wt.confirmWorkOrderAssignment || 'Confirm Work Order Assignment'}
                  </h5>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    {wt.confirmAssignText || 'Assign this complaint to'} <strong className="font-black text-amber-950">{selectedTeam.teamName}</strong> ({selectedTeam.teamCode})?
                  </p>
                  <p className="text-[11px] text-amber-800">
                    {wt.taskQueuedNotice || "The task will be queued directly on the field team's dashboard, and status will update to Assigned."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 cursor-pointer transition-all"
                >
                  {wt.cancel || 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssignment}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-emerald-800 hover:bg-emerald-900 shadow-md flex items-center space-x-1.5 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{wt.dispatchingTask || 'Dispatching Task...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{wt.confirmAssignment || 'Confirm Assignment'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        {!showConfirmation && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer transition-all"
            >
              {wt.cancel || 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleProceedToConfirm}
              disabled={!selectedTeamCode || isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-md flex items-center space-x-2 cursor-pointer transition-all"
            >
              <span>{wt.assignTask || 'Assign Task'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
