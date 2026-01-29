import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface Scene1HeroProps {
  brandColor: string;
}

export const Scene1Hero: React.FC<Scene1HeroProps> = ({ brandColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated gradient background
  const gradientProgress = interpolate(frame, [0, 120], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Main title animation - powerful scale + fade entrance
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80, mass: 2 }, // Heavy, dramatic entrance
  });

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const titleScale = interpolate(titleSpring, [0, 1], [0.8, 1]);

  // Subtitle delay and fade in
  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const subtitleY = interpolate(frame, [30, 50], [30, 0], {
    extrapolateRight: 'clamp',
  });

  // Animated underline beneath "Fill Your Camps"
  const underlineWidth = interpolate(frame, [20, 45], [0, 100], {
    extrapolateRight: 'clamp',
  });

  // Pulsing particles/circles in background
  const particle1 = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });

  const particle2 = spring({
    frame: frame - 25,
    fps,
    config: { damping: 200 },
  });

  const particle3 = spring({
    frame: frame - 40,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg,
          rgba(255, 56, 92, ${0.05 + gradientProgress * 0.1}) 0%,
          rgba(251, 207, 232, ${0.2 + gradientProgress * 0.3}) 50%,
          rgba(255, 237, 213, ${0.15 + gradientProgress * 0.25}) 100%)`,
        display: 'flex',
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
          top: '10%',
          left: '15%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `rgba(255, 56, 92, ${particle1 * 0.15})`,
          filter: 'blur(60px)',
          transform: `scale(${particle1})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: `rgba(251, 191, 36, ${particle2 * 0.2})`,
          filter: 'blur(80px)',
          transform: `scale(${particle2})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: `rgba(255, 56, 92, ${particle3 * 0.12})`,
          filter: 'blur(70px)',
          transform: `scale(${particle3})`,
        }}
      />

      {/* Main content */}
      <div
        style={{
          textAlign: 'center',
          zIndex: 10,
          padding: '0 60px',
        }}
      >
        {/* Main Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
          }}
        >
          <h1
            style={{
              fontSize: 120,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              color: '#222222',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            Fill Your Camps
          </h1>

          {/* Animated underline */}
          <div
            style={{
              width: `${underlineWidth}%`,
              height: 8,
              background: brandColor,
              margin: '20px auto',
              borderRadius: 4,
            }}
          />

          <h1
            style={{
              fontSize: 120,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              color: brandColor,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            Faster.
          </h1>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 42,
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            color: '#717171',
            marginTop: 40,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          Get more bookings. Save 10+ hours per week.
        </p>
      </div>
    </AbsoluteFill>
  );
};
