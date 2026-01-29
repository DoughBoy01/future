import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface Scene5CTAProps {
  brandColor: string;
}

export const Scene5CTA: React.FC<Scene5CTAProps> = ({ brandColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background gradient animation
  const gradientProgress = interpolate(frame, [0, 120], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Main CTA text - powerful entrance
  const ctaSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.9, 1]);
  const ctaOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // "Join 100+ Camp Owners" badge
  const badgeSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 20, stiffness: 150 },
  });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0, 1]);

  // Button animation
  const buttonSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  const buttonScale = interpolate(buttonSpring, [0, 1], [0.8, 1]);

  // Button pulse effect
  const pulseAnimation = Math.sin((frame - 60) * 0.1) * 0.05 + 1;
  const buttonPulse = frame > 60 ? pulseAnimation : 1;

  // Website URL
  const urlOpacity = interpolate(frame, [70, 85], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Decorative elements
  const particle1 = spring({
    frame: frame - 15,
    fps,
    config: { damping: 200 },
  });
  const particle2 = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg,
          rgba(255, 56, 92, ${0.15 + gradientProgress * 0.1}) 0%,
          rgba(255, 255, 255, 1) 50%,
          rgba(251, 191, 36, ${0.15 + gradientProgress * 0.1}) 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background particles */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `rgba(255, 56, 92, ${particle1 * 0.15})`,
          filter: 'blur(80px)',
          transform: `scale(${particle1})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: `rgba(251, 191, 36, ${particle2 * 0.2})`,
          filter: 'blur(90px)',
          transform: `scale(${particle2})`,
        }}
      />

      {/* Main content */}
      <div
        style={{
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        {/* "Join 100+ Camp Owners" Badge */}
        <div
          style={{
            display: 'inline-block',
            marginBottom: 40,
            transform: `scale(${badgeScale})`,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              padding: '16px 40px',
              borderRadius: 50,
              fontSize: 28,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15 9L22 10L17 15L18 22L12 18L6 22L7 15L2 10L9 9L12 2Z"
                fill="#FFFFFF"
              />
            </svg>
            Join 100+ Camp Owners
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15 9L22 10L17 15L18 22L12 18L6 22L7 15L2 10L9 9L12 2Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
        </div>

        {/* Main CTA Headline */}
        <h1
          style={{
            fontSize: 100,
            fontWeight: 900,
            fontFamily: 'Inter, sans-serif',
            color: '#222222',
            margin: 0,
            marginBottom: 20,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
          }}
        >
          Start Filling Camps
        </h1>
        <h1
          style={{
            fontSize: 100,
            fontWeight: 900,
            fontFamily: 'Inter, sans-serif',
            color: brandColor,
            margin: 0,
            marginBottom: 50,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
          }}
        >
          Today
        </h1>

        {/* CTA Button */}
        <div
          style={{
            display: 'inline-block',
            transform: `scale(${buttonScale * buttonPulse})`,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${brandColor} 0%, #fe4d39 100%)`,
              color: '#FFFFFF',
              padding: '28px 70px',
              borderRadius: 16,
              fontSize: 42,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 12px 40px rgba(255, 56, 92, 0.5)',
              cursor: 'pointer',
              border: '4px solid #FFFFFF',
            }}
          >
            List Your First Camp FREE
          </div>
        </div>

        {/* Website URL */}
        <p
          style={{
            fontSize: 36,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            color: '#717171',
            marginTop: 40,
            opacity: urlOpacity,
          }}
        >
          futureedge.com/camp-owners
        </p>

        {/* Trust indicators */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            justifyContent: 'center',
            marginTop: 30,
            opacity: urlOpacity,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              color: '#717171',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L6 8L2 9L6 13L5 18L10 15L15 18L14 13L18 9L14 8L10 2Z"
                fill="#10B981"
              />
            </svg>
            No setup fees
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              color: '#717171',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L6 8L2 9L6 13L5 18L10 15L15 18L14 13L18 9L14 8L10 2Z"
                fill="#10B981"
              />
            </svg>
            Only 15% commission
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              color: '#717171',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L6 8L2 9L6 13L5 18L10 15L15 18L14 13L18 9L14 8L10 2Z"
                fill="#10B981"
              />
            </svg>
            Instant payouts
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
