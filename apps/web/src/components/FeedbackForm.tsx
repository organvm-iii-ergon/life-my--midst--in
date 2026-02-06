'use client';

import { useState, useCallback } from 'react';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FeedbackFormProps {
  profileId: string;
  userId: string;
  onSubmitSuccess?: () => void;
}

interface FeedbackFormData {
  category: 'bug' | 'feature-request' | 'improvement' | 'other';
  subject: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
  affectedFeatures?: string[];
  email?: string;
  followUp: boolean;
}

const FEEDBACK_CATEGORIES = [
  { value: 'bug', label: '🐛 Bug Report', description: "Something isn't working right" },
  { value: 'feature-request', label: '✨ Feature Request', description: 'I want something new' },
  { value: 'improvement', label: '📈 Improvement', description: 'Something could be better' },
  { value: 'other', label: '💭 Other', description: 'General feedback' },
];

const FEATURES = [
  'Profile Building',
  'Personas',
  'Hunter Protocol',
  'Inverted Interview',
  'Analytics Dashboard',
  'Onboarding',
  'UI/UX',
  'Performance',
  'Mobile Experience',
];

export default function FeedbackForm({ profileId, userId, onSubmitSuccess }: FeedbackFormProps) {
  const [formData, setFormData] = useState<FeedbackFormData>({
    category: 'improvement',
    subject: '',
    description: '',
    severity: 'medium',
    affectedFeatures: [],
    email: '',
    followUp: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string>('');

  const handleCategoryChange = useCallback((category: FeedbackFormData['category']) => {
    setFormData((prev) => ({
      ...prev,
      category,
      severity: category === 'bug' ? prev.severity : 'medium',
    }));
  }, []);

  const handleFeatureToggle = useCallback((feature: string) => {
    setFormData((prev) => ({
      ...prev,
      affectedFeatures: prev.affectedFeatures?.includes(feature)
        ? prev.affectedFeatures.filter((f) => f !== feature)
        : [...(prev.affectedFeatures || []), feature],
    }));
  }, []);

  const handleInputChange = useCallback(
    (field: keyof FeedbackFormData, value: FeedbackFormData[keyof FeedbackFormData]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.subject.trim() || !formData.description.trim()) {
        setSubmitStatus('error');
        setSubmitError('Subject and description are required');
        return;
      }

      setIsSubmitting(true);
      setSubmitStatus('idle');
      setSubmitError('');

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileId,
            userId,
            ...formData,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to submit feedback: ${response.statusText}`);
        }

        setSubmitStatus('success');
        setFormData({
          category: 'improvement',
          subject: '',
          description: '',
          severity: 'medium',
          affectedFeatures: [],
          email: '',
          followUp: true,
        });

        if (onSubmitSuccess) {
          setTimeout(onSubmitSuccess, 2000);
        }
      } catch (error) {
        setSubmitStatus('error');
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, profileId, userId, onSubmitSuccess],
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900">Thank you for your feedback!</h3>
            <p className="text-sm text-green-800 mt-1">
              We appreciate your input and will review it shortly.
              {formData.followUp && formData.email && (
                <>
                  {' '}
                  We'll follow up with you at <strong>{formData.email}</strong>.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error submitting feedback</h3>
            <p className="text-sm text-red-800 mt-1">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold text-gray-900">Feedback Type</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FEEDBACK_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryChange(cat.value as FeedbackFormData['category'])}
                className={`p-4 text-left rounded-lg border-2 transition-all ${
                  formData.category === cat.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">{cat.label}</div>
                <div className="text-sm text-gray-600 mt-1">{cat.description}</div>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
            Subject *
          </label>
          <input
            id="subject"
            type="text"
            placeholder="Brief summary of your feedback"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
          />
          <div className="text-xs text-gray-500 mt-1">{formData.subject.length}/100</div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            placeholder="What happened? What did you expect? Include as much detail as helpful."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            maxLength={1000}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            required
          />
          <div className="text-xs text-gray-500 mt-1">{formData.description.length}/1000</div>
        </div>

        {/* Severity (for bugs) */}
        {formData.category === 'bug' && (
          <div>
            <label htmlFor="severity" className="block text-sm font-semibold text-gray-900 mb-2">
              Severity
            </label>
            <select
              id="severity"
              value={formData.severity}
              onChange={(e) => handleInputChange('severity', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="low">Low - Minor inconvenience</option>
              <option value="medium">Medium - Affects some workflows</option>
              <option value="high">High - Blocks important feature</option>
            </select>
          </div>
        )}

        {/* Affected Features */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-900">
            Affected Features (optional)
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FEATURES.map((feature) => (
              <label key={feature} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.affectedFeatures?.includes(feature) || false}
                  onChange={() => handleFeatureToggle(feature)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Follow-up Consent */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.followUp}
              onChange={(e) => handleInputChange('followUp', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              I'd like the team to follow up with me about this feedback
            </span>
          </label>

          {formData.followUp && (
            <input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      {/* Privacy Note */}
      <p className="text-xs text-gray-500 text-center mt-6">
        Your feedback is valuable and helps us improve. We take your privacy seriously and won't
        share your feedback without permission.
      </p>
    </div>
  );
}
