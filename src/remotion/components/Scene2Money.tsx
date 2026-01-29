import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface Scene2MoneyProps {
  brandColor: string;
}

export const Scene2Money: React.FC<Scene2MoneyProps> = ({ brandColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(frame, [0, 20], [-40, 0], {
    extrapolateRight: 'clamp',
  });

  // Money split animation - animated pie chart
  const splitAnimation = spring({
    frame: frame - 25,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  // 85% arc (your share - larger portion)
  const yourArc = interpolate(splitAnimation, [0, 1], [0, 306]); // 85% of 360 = 306 degrees
  // 15% arc (platform fee)
  const feeArc = interpolate(splitAnimation, [0, 1], [0, 54]); // 15% of 360 = 54 degrees

  // Dollar signs floating up animation
  const dollar1Y = interpolate(frame, [40, 90], [0, -150], {
    extrapolateRight: 'clamp',
  });
  const dollar1Opacity = interpolate(frame, [40, 70, 90], [0, 1, 0], {
    extrapolateRight: 'clamp',
  });

  const dollar2Y = interpolate(frame, [50, 100], [0, -180], {
    extrapolateRight: 'clamp',
  });
  const dollar2Opacity = interpolate(frame, [50, 80, 100], [0, 1, 0], {
    extrapolateRight: 'clamp',
  });

  const dollar3Y = interpolate(frame, [60, 110], [0, -160], {
    extrapolateRight: 'clamp',
  });
  const dollar3Opacity = interpolate(frame, [60, 90, 110], [0, 1, 0], {
    extrapolateRight: 'clamp',
  });

  // "Instant" badge pulse
  const badgeScale = spring({
    frame: frame - 35,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  // Percentage labels
  const labelsOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating dollar signs */}
      <div
        style={{
          position: 'absolute',
          left: '15%',
          top: '50%',
          fontSize: 80,
          opacity: dollar1Opacity,
          transform: `translateY(${dollar1Y}px)`,
          color: '#10B981',
        }}
      >
        $
      </div>
      <div
        style={{
          position: 'absolute',
          right: '18%',
          top: '55%',
          fontSize: 100,
          opacity: dollar2Opacity,
          transform: `translateY(${dollar2Y}px)`,
          color: '#10B981',
        }}
      >
        $
      </div>
      <div
        style={{
          position: 'absolute',
          left: '25%',
          top: '45%',
          fontSize: 70,
          opacity: dollar3Opacity,
          transform: `translateY(${dollar3Y}px)`,
          color: '#10B981',
        }}
      >
        $
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: 72,
          fontWeight: 800,
          fontFamily: 'Inter, sans-serif',
          color: '#222222',
          margin: 0,
          marginBottom: 80,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Get Paid <span style={{ color: '#10B981' }}>Instantly</span>
      </h2>

      {/* Pie chart container */}
      <div style={{ position: 'relative', width: 400, height: 400 }}>
        {/* SVG Pie Chart */}
        <svg width="400" height="400" viewBox="0 0 400 400">
          {/* 85% - Your share (green) */}
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="none"
            stroke="#10B981"
            strokeWidth="60"
            strokeDasharray={`${(yourArc / 360) * 942} 942`}
            strokeDashoffset="0"
            transform="rotate(-90 200 200)"
            strokeLinecap="round"
          />

          {/* 15% - Platform fee (pink) */}
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="none"
            stroke={brandColor}
            strokeWidth="60"
            strokeDasharray={`${(feeArc / 360) * 942} 942`}
            strokeDashoffset={`${-(yourArc / 360) * 942}`}
            transform="rotate(-90 200 200)"
            strokeLinecap="round"
          />
        </svg>

        {/* Center labels */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              color: '#10B981',
              opacity: labelsOpacity,
            }}
          >
            85%
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              color: '#717171',
              opacity: labelsOpacity,
            }}
          >
            You Keep
          </div>
        </div>

        {/* "Instant" badge */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            background: `linear-gradient(135deg, ${brandColor} 0%, #fe4d39 100%)`,
            color: '#FFFFFF',
            padding: '12px 28px',
            borderRadius: 50,
            fontSize: 24,
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            transform: `scale(${badgeScale})`,
            boxShadow: '0 8px 24px rgba(255, 56, 92, 0.4)',
          }}
        >
          INSTANT
        </div>
      </div>

      {/* Bottom text */}
      <p
        style={{
          fontSize: 36,
          fontWeight: 500,
          fontFamily: 'Inter, sans-serif',
          color: '#717171',
          marginTop: 50,
          opacity: labelsOpacity,
        }}
      >
        Only 15% commission. No hidden fees.
      </p>
    </AbsoluteFill>
  );
};
