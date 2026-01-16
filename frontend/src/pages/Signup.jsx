import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    number: false,
    special: false,
    uppercase: false
  });
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (passwordValue) => {
    setPasswordRequirements({
      length: passwordValue.length >= 6,
      number: /\d/.test(passwordValue),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
      uppercase: /[A-Z]/.test(passwordValue)
    });
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    
    // Check if passwords match when confirm password is already filled
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    // Check if passwords match
    if (password && value && password !== value) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const isPasswordValid = () => {
    return Object.values(passwordRequirements).every(req => req === true);
  };

  const validateEmail = (emailValue) => {
    if (!emailValue) {
      setEmailError('');
      return false;
    }

    // Simple and effective regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Extract local part (before @)
    const localPart = emailValue.split('@')[0];

    // Check for invalid characters in local part (only allow letters, numbers, dots, underscores, hyphens)
    if (!/^[a-zA-Z0-9._-]+$/.test(localPart)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Check for consecutive special characters (more than 2 in a row)
    if (/[^a-zA-Z0-9]{3,}/.test(localPart)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Check for too many special characters (more than 3 total)
    const specialCharCount = (localPart.match(/[^a-zA-Z0-9]/g) || []).length;
    if (specialCharCount > 3) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Must contain at least 3 letters
    const letterCount = (localPart.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < 3) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Local part should be at least 3 characters
    if (localPart.length < 3) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // List of allowed email domains
    const allowedDomains = [
      '@gmail.com', '@outlook.com', '@yahoo.com', '@mca.ajce.in',
      '@hotmail.com', '@aol.com', '@comcast.net', '@icloud.com',
      '@msn.com', '@hotmail.co.uk', '@sbcglobal.net', '@live.com',
      '@yahoo.co.in', '@me.com', '@att.net', '@mail.ru',
      '@bellsouth.net', '@rediffmail.com', '@cox.net', '@yahoo.co.uk',
      '@verizon.net', '@ymail.com', '@hotmail.it', '@kw.com',
      '@yahoo.com.tw', '@mac.com', '@live.se', '@live.nl',
      '@yahoo.com.br', '@googlemail.com', '@libero.it', '@web.de',
      '@allstate.com', '@btinternet.com', '@online.no', '@charter.net',
      '@yahoo.ca', '@yahoo.com.au', '@rambler.ru', '@hotmail.de',
      '@tiscali.it', '@shaw.ca', '@yahoo.co.jp', '@sky.com',
      '@earthlink.net', '@optonline.net', '@freenet.de', '@t-online.de',
      '@aliceadsl.fr', '@virgilio.it', '@qq.com'
    ];

    const emailLower = emailValue.toLowerCase();
    const isValidDomain = allowedDomains.some(domain => emailLower.endsWith(domain));

    if (!isValidDomain) {
      setEmailError('Please use a valid email provider');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email) {
      setError('Please fill in your email address');
      return;
    }

    if (!password) {
      setError('Please fill in your password');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your password');
      return;
    }

    if (emailError) {
      setError('Please provide a valid email address');
      return;
    }

    if (!isPasswordValid()) {
      setError('Password does not meet all requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await signup(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/tickets');
    } else {
      // Show backend errors in the main error div
      if (result.message.includes('already exists')) {
        setError('An account with this email already exists');
      } else if (result.message.includes('valid email')) {
        setError('Please provide a valid email address');
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up to get started with Helpdesk</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {emailError && <span className="field-error">{emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
            <div className="password-requirements">
              <div className="requirements-heading">Password must contain:</div>
              <div className={`requirement ${passwordRequirements.length ? 'valid' : 'invalid'}`}>
                <span className="requirement-icon">{passwordRequirements.length ? '✓' : '✕'}</span>
                At least 6 characters
              </div>
              <div className={`requirement ${passwordRequirements.uppercase ? 'valid' : 'invalid'}`}>
                <span className="requirement-icon">{passwordRequirements.uppercase ? '✓' : '✕'}</span>
                One uppercase letter
              </div>
              <div className={`requirement ${passwordRequirements.number ? 'valid' : 'invalid'}`}>
                <span className="requirement-icon">{passwordRequirements.number ? '✓' : '✕'}</span>
                One number
              </div>
              <div className={`requirement ${passwordRequirements.special ? 'valid' : 'invalid'}`}>
                <span className="requirement-icon">{passwordRequirements.special ? '✓' : '✕'}</span>
                One special character (!@#$%^&*)
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
            {confirmPasswordError && <span className="field-error">{confirmPasswordError}</span>}
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
