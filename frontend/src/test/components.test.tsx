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
  it('renders upload instructions and dropzone without hardcoded demo contracts', () => {
    const onUpload = vi.fn();
    render(<UploadZone onUploadSuccess={onUpload} />);

    expect(screen.getByText(/Upload Any Legal Agreement or Policy/i)).toBeInTheDocument();
    expect(screen.queryByText(/Residential Lease/i)).not.toBeInTheDocument();
  });
});

import { AuthModal } from '../components/auth/AuthModal';
import { Navbar } from '../components/common/Navbar';

describe('AuthModal Component', () => {
  it('renders sign in modal when isOpen is true', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(<AuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Sign in to LegalEase')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(<AuthModal isOpen={false} onClose={onClose} onSuccess={onSuccess} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('switches between Sign In and Create Account tabs', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(<AuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    const createAccountTab = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(createAccountTab);

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
  });

  it('populates demo credentials when clicking Fill Demo', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(<AuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    const fillDemoBtn = screen.getByRole('button', { name: 'Fill Demo' });
    fireEvent.click(fillDemoBtn);

    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;

    expect(emailInput.value).toBe('demo@legalease.com');
    expect(passwordInput.value).toBe('demo1234');
  });

  it('toggles password visibility between password and text', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(<AuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByLabelText('Show password');
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');

    const hideBtn = screen.getByLabelText('Hide password');
    fireEvent.click(hideBtn);
    expect(passwordInput.type).toBe('password');
  });
});

describe('Navbar Auth Integration', () => {
  const defaultProps = {
    activeTab: 'analyze' as const,
    setActiveTab: vi.fn(),
    documents: [],
    selectedDocId: 'doc-sample',
    onSelectDocument: vi.fn(),
    isDarkMode: false,
    setIsDarkMode: vi.fn(),
    onOpenTour: vi.fn(),
    currentUser: null,
    onOpenAuthModal: vi.fn(),
    onLogout: vi.fn(),
  };

  it('renders Sign In / Sign Up button when user is not logged in', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Sign In \/ Sign Up/i })).toBeInTheDocument();
  });

  it('renders user avatar and name when user is logged in', () => {
    const loggedInProps = {
      ...defaultProps,
      currentUser: {
        id: 'usr-123',
        email: 'alex@example.com',
        full_name: 'Alex Morgan',
        is_active: true,
      },
    };
    render(<Navbar {...loggedInProps} />);
    expect(screen.queryByRole('button', { name: /Sign In \/ Sign Up/i })).not.toBeInTheDocument();
    expect(screen.getByText('AM')).toBeInTheDocument();
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
  });
});

import { LoginPage } from '../components/auth/LoginPage';
import { SidebarNav } from '../components/common/SidebarNav';
import { TopHeader } from '../components/common/TopHeader';
import { ModernDashboard } from '../components/dashboard/ModernDashboard';

describe('LoginPage Component', () => {
  it('renders login start page with greeting, tab switcher, and demo fill', () => {
    const onLoginSuccess = vi.fn();
    const onGuest = vi.fn();
    render(<LoginPage onLoginSuccess={onLoginSuccess} onContinueAsGuest={onGuest} />);

    expect(screen.getByText(/Welcome back 👋/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fill Demo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explore as Guest/i })).toBeInTheDocument();
  });

  it('populates demo credentials when clicking Fill Demo on LoginPage', () => {
    const onLoginSuccess = vi.fn();
    const onGuest = vi.fn();
    render(<LoginPage onLoginSuccess={onLoginSuccess} onContinueAsGuest={onGuest} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fill Demo' }));
    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;

    expect(emailInput.value).toBe('demo@legalease.com');
    expect(passwordInput.value).toBe('demo1234');
  });

  it('triggers onContinueAsGuest callback when clicked', () => {
    const onLoginSuccess = vi.fn();
    const onGuest = vi.fn();
    render(<LoginPage onLoginSuccess={onLoginSuccess} onContinueAsGuest={onGuest} />);

    fireEvent.click(screen.getByRole('button', { name: /Explore as Guest/i }));
    expect(onGuest).toHaveBeenCalled();
  });
});

describe('SidebarNav Component', () => {
  it('renders navigation tabs and triggers tab change', () => {
    const setActiveTab = vi.fn();
    const onOpenUpload = vi.fn();
    const setIsDarkMode = vi.fn();
    const onOpenTour = vi.fn();

    render(
      <SidebarNav
        activeTab="dashboard"
        setActiveTab={setActiveTab}
        onOpenUpload={onOpenUpload}
        isDarkMode={false}
        setIsDarkMode={setIsDarkMode}
        onOpenTour={onOpenTour}
      />
    );

    const compareBtn = screen.getByTitle('Compare Agreement Versions');
    fireEvent.click(compareBtn);
    expect(setActiveTab).toHaveBeenCalledWith('compare');

    const uploadBtn = screen.getByTitle('Upload Document');
    fireEvent.click(uploadBtn);
    expect(onOpenUpload).toHaveBeenCalled();
  });
});

describe('TopHeader Component', () => {
  it('renders welcome title, search input, and user profile', () => {
    const onSearchChange = vi.fn();
    const onLogout = vi.fn();
    const user = {
      id: 'usr-1',
      email: 'jordan@example.com',
      full_name: 'Jordan Lee',
      is_active: true,
    };

    render(
      <TopHeader
        currentUser={user}
        searchQuery=""
        onSearchChange={onSearchChange}
        onLogout={onLogout}
      />
    );

    expect(screen.getByText(/Welcome back 👋/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search documents or clauses/i)).toBeInTheDocument();
    expect(screen.getByText('JL')).toBeInTheDocument();
    expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
  });
});

describe('ModernDashboard Component', () => {
  it('renders pastel activity cards, metrics, and calendar schedule', () => {
    const onSelect = vi.fn();
    const onUpload = vi.fn();
    const onNav = vi.fn();
    const onUploadFile = vi.fn();

    render(
      <ModernDashboard
        documents={[]}
        onSelectDocument={onSelect}
        onOpenUpload={onUpload}
        onNavigateTab={onNav}
        onUploadFile={onUploadFile}
      />
    );

    expect(screen.getByText('Document Workspace')).toBeInTheDocument();
    expect(screen.getByText('Compare Versions')).toBeInTheDocument();
    expect(screen.getByText('Review schedule')).toBeInTheDocument();
    expect(screen.getByText(/Notice & Cure Periods/i)).toBeInTheDocument();
  });
});


