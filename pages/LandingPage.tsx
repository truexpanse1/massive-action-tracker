import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        backgroundColor: '#f5f7fb',
        color: '#111827',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>
        Massive Action Tracker
      </h1>
      <p style={{ maxWidth: 520, fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        Welcome to your MAT workspace. Use the navigation to jump into Activity,
        Pipeline, Marketing, Leadership, or the EOD Report and start tracking your KPIs.
      </p>
      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
        (Placeholder landing page component – here so the build can succeed.)
      </p>
    </div>
  );
};

export default LandingPage;
