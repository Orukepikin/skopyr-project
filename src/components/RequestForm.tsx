import { useEffect, useMemo, useState } from 'react';
import { colors, fonts, SelectedCategory } from '@/lib/constants';
import type { RequestDraft } from '@/lib/marketplace';
import Button from './Button';

interface Props {
  category: SelectedCategory;
  onSubmit: (draft: RequestDraft) => void | Promise<void>;
  onBack: () => void;
}

export default function RequestForm({ category, onSubmit, onBack }: Props) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState('ASAP');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    background: colors.card,
    border: `1px solid ${focused === field ? colors.accent : colors.border}`,
    borderRadius: 10,
    padding: '14px 16px',
    color: colors.text1,
    fontSize: 14,
    fontFamily: fonts.body,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focused === field ? `0 0 0 3px ${colors.accentDim}` : 'none',
    boxSizing: 'border-box',
  });

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: fonts.body,
    fontWeight: 700,
    color: colors.text2,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: 6,
    display: 'block',
  };

  const isReady = useMemo(() => {
    const min = Number.parseInt(budgetMin.replace(/[^0-9]/g, ''), 10);
    const max = Number.parseInt(budgetMax.replace(/[^0-9]/g, ''), 10);
    return Boolean(
      title.trim() &&
        summary.trim() &&
        location.trim() &&
        urgency &&
        Number.isFinite(min) &&
        Number.isFinite(max) &&
        min > 0 &&
        max >= min,
    );
  }, [budgetMax, budgetMin, location, summary, title, urgency]);

  const handleSubmit = async () => {
    const min = Number.parseInt(budgetMin.replace(/[^0-9]/g, ''), 10);
    const max = Number.parseInt(budgetMax.replace(/[^0-9]/g, ''), 10);

    if (!isReady || !Number.isFinite(min) || !Number.isFinite(max)) {
      setMessage('Add a title, summary, budget, and location before posting the request.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await onSubmit({
        categoryId: category.id,
        categoryName: category.name,
        title: title.trim(),
        summary: summary.trim(),
        budgetMin: min,
        budgetMax: max,
        location: location.trim(),
        urgency,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to post the request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text3,
            fontFamily: fonts.body,
            fontSize: 13,
            cursor: 'pointer',
            padding: 0,
            marginBottom: 40,
            fontWeight: 500,
          }}
        >
          {'<-'} Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>{category.icon}</span>
          <span
            style={{
              fontSize: 11,
              fontFamily: fonts.body,
              fontWeight: 700,
              color: colors.accent,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            {`Step 2 / 3 - ${category.name}`}
          </span>
        </div>

        <h2
          style={{
            fontSize: 30,
            fontFamily: fonts.display,
            fontWeight: 700,
            color: colors.text1,
            margin: '0 0 6px',
            letterSpacing: '-1px',
          }}
        >
          Describe the job
        </h2>

        <p
          style={{
            fontSize: 14,
            fontFamily: fonts.body,
            color: colors.text3,
            margin: '0 0 32px',
          }}
        >
          Real requests are saved to your profile and show up in the provider feed.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              value={title}
              style={inputStyle('title')}
              placeholder={`e.g. ${category.name} job I need help with today`}
              onChange={(event) => setTitle(event.target.value)}
              onFocus={() => setFocused('title')}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div>
            <label style={labelStyle}>Details</label>
            <textarea
              value={summary}
              placeholder="Brand, model, when it started, what you have tried, and what outcome you need..."
              onChange={(event) => setSummary(event.target.value)}
              onFocus={() => setFocused('summary')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputStyle('summary'),
                minHeight: 110,
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Min budget (NGN)</label>
              <input
                value={budgetMin}
                style={inputStyle('budget-min')}
                placeholder="10000"
                onChange={(event) => setBudgetMin(event.target.value)}
                onFocus={() => setFocused('budget-min')}
                onBlur={() => setFocused(null)}
              />
            </div>
            <div>
              <label style={labelStyle}>Max budget (NGN)</label>
              <input
                value={budgetMax}
                style={inputStyle('budget-max')}
                placeholder="25000"
                onChange={(event) => setBudgetMax(event.target.value)}
                onFocus={() => setFocused('budget-max')}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Location</label>
            <input
              value={location}
              style={inputStyle('location')}
              placeholder="e.g. Games Village Estate, Abuja"
              onChange={(event) => setLocation(event.target.value)}
              onFocus={() => setFocused('location')}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div>
            <label style={labelStyle}>When do you need this?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {['ASAP', 'Today', 'Tomorrow', 'This week'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setUrgency(option)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: urgency === option ? colors.accentDim : colors.card,
                    border: `1px solid ${urgency === option ? colors.accent : colors.border}`,
                    color: urgency === option ? colors.accent : colors.text2,
                    fontSize: 13,
                    fontFamily: fonts.body,
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {message && (
            <div
              style={{
                fontSize: 12,
                fontFamily: fonts.body,
                color: colors.text2,
                lineHeight: 1.6,
              }}
            >
              {message}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <Button full onClick={handleSubmit} disabled={submitting || !isReady}>
              {submitting ? 'Posting request...' : 'Post request -> Get bids'}
            </Button>
            <p
              style={{
                fontSize: 11,
                fontFamily: fonts.body,
                color: colors.text3,
                textAlign: 'center',
                marginTop: 14,
              }}
            >
              Payment remains protected by Paystack escrow after you accept a provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
