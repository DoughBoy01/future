import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface Scene3PaperworkProps {
  brandColor: string;
}

export const Scene3Paperwork: React.FC<Scene3PaperworkProps> = ({ brandColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Papers flying away animation
  const paper1X = interpolate(frame, [25, 60], [0, -600], {
    extrapolateRight: 'clamp',
  });
  const paper1Rotation = interpolate(frame, [25, 60], [0, -45], {
    extrapolateRight: 'clamp',
  });
  const paper1Opacity = interpolate(frame, [25, 50, 60], [1, 0.5, 0], {
    extrapolateRight: 'clamp',
  });

  const paper2X = interpolate(frame, [30, 65], [0, 650], {
    extrapolateRight: 'clamp',
  });
  const paper2Rotation = interpolate(frame, [30, 65], [0, 55], {
    extrapolateRight: 'clamp',
  });
  const paper2Opacity = interpolate(frame, [30, 55, 65], [1, 0.5, 0], {
    extrapolateRight: 'clamp',
  });

  const paper3Y = interpolate(frame, [35, 70], [0, -500], {
    extrapolateRight: 'clamp',
  });
  const paper3Rotation = interpolate(frame, [35, 70], [0, 20], {
    extrapolateRight: 'clamp',
  });
  const paper3Opacity = interpolate(frame, [35, 60, 70], [1, 0.5, 0], {
    extrapolateRight: 'clamp',
  });

  // Checkmark appears
  const checkmarkSpring = spring({
    frame: frame - 65,
    fps,
    config: { damping: 12, stiffness: 150 },
  });
  const checkmarkScale = interpolate(checkmarkSpring, [0, 1], [0, 1]);
  const checkmarkOpacity = interpolate(frame, [65, 75], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // "All Automated" text
  const automatedOpacity = interpolate(frame, [80, 95], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const automatedY = interpolate(frame, [80, 95], [20, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: 80,
          fontWeight: 800,
          fontFamily: 'Inter, sans-serif',
          color: '#222222',
          margin: 0,
          marginBottom: 100,
          opacity: titleOpacity,
          position: 'absolute',
          top: 100,
        }}
      >
        Zero <span style={{ color: brandColor }}>Paperwork</span>
      </h2>

      {/* Flying papers */}
      <div
        style={{
          position: 'absolute',
          left: '30%',
          top: '45%',
          width: 200,
          height: 260,
          background: '#FFFFFF',
          border: '3px solid #DDDDDD',
          borderRadius: 8,
          padding: 20,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: `translateX(${paper1X}px) rotate(${paper1Rotation}deg)`,
          opacity: paper1Opacity,
        }}
      >
        {/* Simulated document lines */}
        <div style={{ width: '80%', height: 8, background: '#DDDDDD', marginBottom: 8, borderRadius: 2 }} />
        <div style={{ width: '60%', height: 8, background: '#DDDDDD', marginBottom: 8, borderRadius: 2 }} />
        <div style={{ width: '90%', height: 8, background: '#DDDDDD', marginBottom: 16, borderRadius: 2 }} />
        <div style={{ width: '75%', height: 8, background: '#DDDDDD', marginBottom: 8, borderRadius: 2 }} />
        <div style={{ width: '85%', height: 8, background: '#DDDDDD', borderRadius: 2 }} />
      </div>

      <div
        style={{
          position: 'absolute',
          right: '25%',
          top: '40%',
          width: 200,
          height: 260,
          background: '#FFFFFF',
          border: '3px solid #DDDDDD',
          borderRadius: 8,
          padding: 20,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: `translateX(${paper2X}px) rotate(${paper2Rotation}deg)`,
          opacity: paper2Opacity,
        }}
      >
        <div style={{ width: '70%', height: 8, background: '#DDDDDD', marginBottom: 8, borderRadius: 2 }} />
        <div style={{ width: '85%', height: 8, background: '#DDDDDD', marginBottom: 8, borderRadius: 2 }} />
        <div style={{ width: '65%', height: 8, background: '#DDDDDD', marginBottom: 16, borderRadius: 2 }} />
        <div style={{ width: '90%', height: 8, background: '#DDDDDD', marginBottom: 8, borderRadius: 2 }} />
        <div style={{ width: '75%', height: 8, background: '#DDDDDD', borderRadius: 2 }} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 200,
          height: 260,
          background: '#FFFFFF',
          border: '3px solid #DDDDDD',
          borderRadius: 8,
          padding: 20,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: `translate(-50%, -50%) translateY(${paper3Y}px) rotate(${paper3Rotation}deg)`,
          opacity: paper3Opacity,
        }}
      >
        <div style={{ width: '80%', height: 8, background: '#DDDDDD', marginBottom: 8, borderRadius: 2 }} />
        <div style={{ width: '90%', height: 8, background: '#DDDDDD', marginBottom: 8, borderRadius: 2 }} />
        <div style={{ width: '70%', height: 8, background: '#DDDDDD', marginBottom: 16, borderRadius: 2 }} />
        <div style={{ width: '85%', height: 8, background: '#DDDDDD', marginBottom: 8, borderRadius: 2 }} />
        <div style={{ width: '60%', height: 8, background: '#DDDDDD', borderRadius: 2 }} />
      </div>

      {/* Giant checkmark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${checkmarkScale})`,
          opacity: checkmarkOpacity,
        }}
      >
        <svg width="300" height="300" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="140" fill="#10B981" opacity="0.15" />
          <circle cx="150" cy="150" r="120" fill="#10B981" opacity="0.25" />
          <circle cx="150" cy="150" r="100" fill="#10B981" />
          <path
            d="M 80 150 L 125 195 L 220 100"
            stroke="#FFFFFF"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          textAlign: 'center',
          opacity: automatedOpacity,
          transform: `translateY(${automatedY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            color: '#10B981',
            margin: 0,
            marginBottom: 10,
          }}
        >
          All Automated
        </p>
        <p
          style={{
            fontSize: 32,
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            color: '#717171',
            margin: 0,
          }}
        >
          Registration forms, waivers, medical info — collected automatically
        </p>
      </div>
    </AbsoluteFill>
  );
};
