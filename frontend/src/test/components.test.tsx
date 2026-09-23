import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskFlagPanel } from '../components/analysis/RiskFlagPanel';
import { UploadZone } from '../components/upload/UploadZone';
import { RiskFlag } from '../types/legal';

describe('DisclaimerBanner Component', () => {
  it('renders the non-negotiable legal disclaimer in the banner', () => {
    render(<DisclaimerBanner variant="top" />);
    expect(screen.getByText(/This is general information, not legal advice/i)).toBeInTheDocument();
  });

  it('renders the persistent footer disclaimer', () => {
    render(<DisclaimerBanner variant="footer" />);
    expect(screen.getByText(/Consult a licensed attorney for your specific situation/i)).toBeInTheDocument();
  });
});

describe('RiskBadge Accessibility Component', () => {
  it('pairs color with text and icon for high-risk level', () => {
    render(<RiskBadge level="high-risk" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('High Risk');
    expect(badge).toHaveAttribute('aria-label', 'High Risk Level');
  });

  it('renders Caution label and accessible ARIA attributes', () => {
    render(<RiskBadge level="caution" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Caution');
    expect(badge).toHaveAttribute('aria-label', 'Caution Risk Level');
  });
});

describe('RiskFlagPanel Component', () => {
  const sampleFlags: RiskFlag[] = [
    {
      id: 'flag-1',
      title: 'Unilateral Entry Without Notice',
      severity: 'high-risk',
      severity_label: 'High Risk',
      clause_reference: 'Section 7.3',
      verbatim_text: 'Landlord may enter without notice.',
      plain_explanation: 'Landlord claims right to enter anytime.',
      why_it_matters: 'Violates statutory quiet enjoyment rights.',
      who_it_favors: 'Landlord'
    }
  ];

  it('renders risk flags with plain explanation and triggers click callback', () => {
    const handleSelect = vi.fn();
    render(<RiskFlagPanel flags={sampleFlags} onSelectFlag={handleSelect} />);

    expect(screen.getByText('Unilateral Entry Without Notice')).toBeInTheDocument();
    expect(screen.getByText(/Violates statutory quiet enjoyment/i)).toBeInTheDocument();

    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(handleSelect).toHaveBeenCalledWith(sampleFlags[0]);
  });
});

describe('UploadZone Component', () => {
  it('renders upload instructions and quick sample demo buttons', () => {
    const onUpload = vi.fn();
    const onSample = vi.fn();
    render(<UploadZone onUploadSuccess={onUpload} onSelectSample={onSample} />);

    expect(screen.getByText(/Upload Any Legal Agreement or Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Residential Lease/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Residential Lease/i));
    expect(onSample).toHaveBeenCalledWith('doc-sample-lease');
  });
});
