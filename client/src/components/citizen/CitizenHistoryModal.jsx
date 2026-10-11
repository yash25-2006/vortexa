import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCw,
  Bell,
  Sparkles,
  Check,
  Send,
  Star,
  MessageSquare
} from 'lucide-react';
import { TRANSLATIONS } from '../../constants/translations';
import { fetchCitizenRequests, sendCitizenReminder, submitCitizenRating } from '../../services/api';

export default function CitizenHistoryModal({ language, citizenId, citizenName, onClose }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remindingId, setRemindingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState({ id: null, type: '', text: '' });

  // Citizen Rating State per completed request
  const [ratingInputs, setRatingInputs] = useState({}); // { [reqId]: { rating: 5, feedback: '', resQuality: 5, timeliness: 5 } }
  const [hoverRatings, setHoverRatings] = useState({}); // { [reqId]: number }
  const [submittingRatingId, setSubmittingRatingId] = useState(null);

  const loadRequests = () => {
    if (!citizenId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetchCitizenRequests(citizenId)
      .then((data) => setRequests(data || []))
      .catch((err) => console.warn('Could not load citizen requests:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, [citizenId]);

  const handleSendReminder = async (reqId) => {
    setRemindingId(reqId);
    setFeedbackMsg({ id: null, type: '', text: '' });
    try {
      const res = await sendCitizenReminder(reqId, citizenId, 'Citizen followed up via portal reminder.');
      setFeedbackMsg({
        id: reqId,
        type: 'success',
        text: res.message || 'Reminder sent to government authorities successfully!'
      });
      // Refresh requests to update last_reminded_at and next_reminder_at
      await loadRequests();
    } catch (err) {
      setFeedbackMsg({
        id: reqId,
        type: 'error',
        text: err.message || 'Unable to send reminder at this time.'
      });
    } finally {
      setRemindingId(null);
    }
  };

  const handleSetRatingStar = (reqId, starVal) => {
    setRatingInputs((prev) => ({
      ...prev,
      [reqId]: {
        ...(prev[reqId] || {}),
        rating: starVal
      }
    }));
  };

  const handleSetRatingFeedback = (reqId, commentText) => {
    setRatingInputs((prev) => ({
      ...prev,
      [reqId]: {
        ...(prev[reqId] || {}),
        feedback: commentText
      }
    }));
  };

  const handleSubmitRating = async (reqId) => {
    const input = ratingInputs[reqId] || {};
    const starVal = input.rating;

    if (!starVal || starVal < 1 || starVal > 5) {
      setFeedbackMsg({
        id: reqId,
        type: 'error',
        text: 'Please select a rating score between 1 and 5 stars.'
      });
      return;
    }

    setSubmittingRatingId(reqId);
    setFeedbackMsg({ id: null, type: '', text: '' });

    try {
      const res = await submitCitizenRating(reqId, {
        citizenId,
        rating: starVal,
        feedback: (input.feedback || '').trim(),
        resolutionQuality: input.resQuality || starVal,
        timeliness: input.timeliness || starVal,
        overallSatisfaction: starVal
      });

      // Update local request object so it transitions to read-only rated state immediately
      setRequests((prev) =>
        prev.map((r) =>
          r.id === reqId
            ? {
                ...r,
                citizen_rating: starVal,
                citizen_feedback: (input.feedback || '').trim(),
                rated_at: new Date().toISOString()
              }
            : r
        )
      );

      setFeedbackMsg({
        id: reqId,
        type: 'success',
        text: res.message || 'Rating submitted. Thank you for your feedback!'
      });
    } catch (err) {
      console.error('Error submitting rating:', err);
      setFeedbackMsg({
        id: reqId,
        type: 'error',
        text: err.message || 'Failed to submit rating. Please try again.'
      });
    } finally {
      setSubmittingRatingId(null);
    }
  };

  // Helper to compute reminder cooldown status
  const getReminderEligibility = (req) => {
    const isCompletedOrRejected = ['Completed', 'Rejected'].includes(req.status);
    if (isCompletedOrRejected) {
      return { eligible: false, reason: 'completed' };
    }

    const lastTimestamp = req.last_reminded_at
      ? new Date(req.last_reminded_at).getTime()
      : new Date(req.created_at).getTime();

    const now = Date.now();
    const msDiff = now - lastTimestamp;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    if (msDiff >= sevenDaysMs) {
      return { eligible: true };
    } else {
      const remainingMs = sevenDaysMs - msDiff;
      const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      return { eligible: false, remainingDays, reason: 'cooldown' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[88vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#FF9933]" />
            <div>
              <h3 className="font-bold text-sm font-indic">
                {t.myRequestsTitle}
              </h3>
              <p className="text-[11px] text-slate-300">
                {citizenName} ({citizenId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="w-6 h-6 border-2 border-[#002B49] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-xs">{t.loading}</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium font-indic">{t.noRequestsYet}</p>
            </div>
          ) : (
            requests.map((req) => {
              const reminderStatus = getReminderEligibility(req);
              const isReminding = remindingId === req.id;
              const isComplaint = (req.request_type || '').toLowerCase() === 'complaint';
              const isCompleted = req.status === 'Completed';
              const hasRating = req.citizen_rating || req.rating || (ratingInputs[req.id]?.submitted);
              const currentRatingScore = req.citizen_rating || req.rating || ratingInputs[req.id]?.rating || 0;
              const currentFeedback = req.citizen_feedback || req.feedback || '';

              return (
                <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3 text-xs shadow-2xs">
                  {/* Top Bar: Code + Type + Status */}
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {req.request_code || `REQ-${req.id}`}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isComplaint
                          ? 'bg-rose-100 text-rose-900 border border-rose-200'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}>
                        {isComplaint ? '⚠️ Complaint' : '🏗️ Demand'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {req.reminder_count > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold flex items-center space-x-1">
                          <Bell className="w-2.5 h-2.5 text-amber-700" />
                          <span>Reminded {req.reminder_count}x</span>
                        </span>
                      )}
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        req.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : req.status === 'Approved'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : req.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{req.status || 'Pending'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Verbatim Request Text */}
                  <p className="text-slate-800 font-indic text-sm font-medium leading-relaxed">
                    &ldquo;{req.original_text}&rdquo;
                  </p>

                  {/* Photo Thumbnail if present */}
                  {req.photo_url && (
                    <div className="flex items-center space-x-2 pt-0.5">
                      <img
                        src={req.photo_url}
                        alt="Attachment"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        📷 {t.attachedPhoto || 'Attached Photo'}
                      </span>
                    </div>
                  )}

                  {/* 8. CITIZEN NOTIFICATION / FIELD TEAM COMPLETION REPORT */}
                  {isCompleted && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-950 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Official Work Completion Report</span>
                        </span>
                        {req.completed_at && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            Resolved: {new Date(req.completed_at).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>

                      {req.assigned_team_name && (
                        <p className="text-[11px] font-bold text-slate-700">
                          Restoration Squad: <span className="font-extrabold text-[#002B49]">{req.assigned_team_name}</span>
                        </p>
                      )}

                      {/* Before & After Photos Side-by-Side */}
                      {(req.before_photo_url || req.after_photo_url) && (
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1">
                              Before Work
                            </span>
                            {req.before_photo_url ? (
                              <img
                                src={req.before_photo_url}
                                alt="Before Repair"
                                className="h-24 w-full object-cover rounded-xl border border-slate-300"
                              />
                            ) : (
                              <div className="h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-[10px]">
                                No Photo
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-emerald-800 block mb-1">
                              After Completion
                            </span>
                            {req.after_photo_url ? (
                              <img
                                src={req.after_photo_url}
                                alt="After Repair"
                                className="h-24 w-full object-cover rounded-xl border border-emerald-400 shadow-xs"
                              />
                            ) : (
                              <div className="h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-[10px]">
                                No Photo
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Completion Note */}
                      {req.completion_notes && (
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-[11px] text-slate-800 space-y-0.5">
                          <span className="font-bold text-emerald-900 block text-[10px] uppercase">
                            Squad Completion Note:
                          </span>
                          <p className="font-medium leading-relaxed">
                            {req.completion_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 9. CITIZEN RATING & FEEDBACK SECTION (Only Available When Status = Completed) */}
                  {isCompleted && (
                    <div className="mt-1">
                      {req.citizen_rating || req.rating ? (
                        /* ALREADY RATED: Clean Read-Only Summary */
                        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-extrabold text-amber-950 text-xs">{t.yourRating || 'Your Rating'}:</span>
                              <div className="flex items-center space-x-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= (req.citizen_rating || req.rating)
                                        ? 'text-amber-500 fill-amber-400'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-bold text-amber-900 text-xs ml-0.5">
                                ({req.citizen_rating || req.rating}/5)
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                              <Check className="w-2.5 h-2.5" />
                              <span>{t.ratingSubmitted || 'Rating Submitted'}</span>
                            </span>
                          </div>

                          {(req.citizen_feedback || req.feedback) && (
                            <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-[11px] text-slate-800 font-indic leading-relaxed">
                              &ldquo;{req.citizen_feedback || req.feedback}&rdquo;
                            </div>
                          )}

                          <p className="text-[10px] text-slate-500 font-medium">
                            {t.thankYouFeedback || 'Thank you for your feedback.'}
                          </p>
                        </div>
                      ) : (
                        /* UNRATED: Interactive 5-Star Rating & Optional Feedback Form */
                        <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[#002B49] text-xs flex items-center space-x-1.5 font-indic">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                              <span>{t.rateYourResolution || 'Rate Your Resolved Complaint'}</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">1–5 Stars</span>
                          </div>

                          {/* 5-Star Interactive Rating Selector */}
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const selected = (ratingInputs[req.id]?.rating || 0);
                                const hovered = (hoverRatings[req.id] || 0);
                                const isLit = star <= (hovered || selected);

                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleSetRatingStar(req.id, star)}
                                    onMouseEnter={() => setHoverRatings((prev) => ({ ...prev, [req.id]: star }))}
                                    onMouseLeave={() => setHoverRatings((prev) => ({ ...prev, [req.id]: 0 }))}
                                    className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                    title={`Rate ${star} Star`}
                                  >
                                    <Star
                                      className={`w-6 h-6 transition-colors ${
                                        isLit
                                          ? 'text-amber-500 fill-amber-400 drop-shadow-xs'
                                          : 'text-slate-300 hover:text-amber-300'
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                              {ratingInputs[req.id]?.rating > 0 && (
                                <span className="text-xs font-bold text-slate-700 ml-2">
                                  {ratingInputs[req.id]?.rating === 5 ? '⭐⭐⭐⭐⭐ Excellent' :
                                   ratingInputs[req.id]?.rating === 4 ? '⭐⭐⭐⭐ Good' :
                                   ratingInputs[req.id]?.rating === 3 ? '⭐⭐⭐ Satisfactory' :
                                   ratingInputs[req.id]?.rating === 2 ? '⭐⭐ Needs Attention' : '⭐ Unsatisfactory'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Optional Comment / Feedback Textarea */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700 block font-indic">
                              {t.howSatisfied || 'How satisfied are you with the resolution?'} <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <textarea
                              rows={2}
                              value={ratingInputs[req.id]?.feedback || ''}
                              onChange={(e) => handleSetRatingFeedback(req.id, e.target.value)}
                              placeholder={t.feedbackPlaceholder || 'Write optional feedback or comment (e.g. The pothole was repaired properly)...'}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none placeholder-slate-400 font-indic"
                            />
                          </div>

                          {/* Submit Rating Button */}
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              disabled={!ratingInputs[req.id]?.rating || submittingRatingId === req.id}
                              onClick={() => handleSubmitRating(req.id)}
                              className="px-4 py-2 rounded-xl bg-[#002B49] hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {submittingRatingId === req.id ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>{t.submittingRating || 'Submitting...'}</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5 text-amber-300" />
                                  <span>{t.submitRating || 'Submit Rating'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reminder Action Row */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>
                        <span>{t.dateLabel} {new Date(req.created_at).toLocaleDateString('en-IN')}</span> &bull; <span>{req.category || 'General'}</span>
                      </div>
                      {req.last_reminded_at && (
                        <div className="text-[10px] text-slate-400">
                          Last reminded: {new Date(req.last_reminded_at).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </div>

                    {/* 7-Day Reminder Button or Countdown */}
                    {!['Completed', 'Rejected'].includes(req.status) && (
                      <div className="self-start sm:self-auto">
                        {reminderStatus.eligible ? (
                          <button
                            type="button"
                            disabled={isReminding}
                            onClick={() => handleSendReminder(req.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#002B49] hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer"
                          >
                            <Bell className="w-3.5 h-3.5 text-amber-300" />
                            <span>{isReminding ? 'Sending...' : 'Remind Authorities'}</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-600 text-[11px] font-semibold flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Remind in {reminderStatus.remainingDays || 7}d (7-day cooldown)</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Feedback Message */}
                  {feedbackMsg.id === req.id && (
                    <div className={`p-2.5 rounded-xl text-[11px] font-bold ${
                      feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {feedbackMsg.text}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
