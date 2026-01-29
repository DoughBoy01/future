import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface Scene4BenefitsProps {
  brandColor: string;
}

export const Scene4Benefits: React.FC<Scene4BenefitsProps> = ({ brandColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Three benefit cards stagger in
  const card1Spring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  const card1X = interpolate(card1Spring, [0, 1], [-400, 0]);
  const card1Opacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const card2Spring = spring({
    frame: frame - 35,
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  const card2Y = interpolate(card2Spring, [0, 1], [400, 0]);
  const card2Opacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const card3Spring = spring({
    frame: frame - 50,
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  const card3X = interpolate(card3Spring, [0, 1], [400, 0]);
  const card3Opacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Icons pulse
  const iconPulse = (delay: number) => {
    return spring({
      frame: frame - delay,
      fps,
      config: { damping: 10, stiffness: 150 },
    });
  };

  // Stats count up animation
  const statsOpacity = interpolate(frame, [70, 85], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 50%, #FFF1F2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 60,
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: 64,
          fontWeight: 800,
          fontFamily: 'Inter, sans-serif',
          color: '#222222',
          margin: 0,
          marginBottom: 80,
          opacity: titleOpacity,
        }}
      >
        Why Camp Owners Choose <span style={{ color: brandColor }}>FutureEdge</span>
      </h2>

      {/* Three benefit cards */}
      <div
        style={{
          display: 'flex',
          gap: 50,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 60,
        }}
      >
        {/* Card 1 - Smart Matching */}
        <div
          style={{
            width: 350,
            height: 280,
            background: '#FFFFFF',
            borderRadius: 16,
            padding: 40,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: `3px solid ${brandColor}20`,
            transform: `translateX(${card1X}px)`,
            opacity: card1Opacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Icon - Target */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${brandColor}20, ${brandColor}40)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              transform: `scale(${iconPulse(25)})`,
            }}
          >
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="25" r="20" stroke={brandColor} strokeWidth="3" />
              <circle cx="25" cy="25" r="12" stroke={brandColor} strokeWidth="3" />
              <circle cx="25" cy="25" r="4" fill={brandColor} />
            </svg>
          </div>
          <h3
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              color: '#222222',
              margin: 0,
              marginBottom: 10,
            }}
          >
            Smart Matching
          </h3>
          <p
            style={{
              fontSize: 18,
              fontWeight: 400,
              fontFamily: 'Inter, sans-serif',
              color: '#717171',
              margin: 0,
            }}
          >
            Our quiz connects you with families actively searching
          </p>
        </div>

        {/* Card 2 - No Setup Fees */}
        <div
          style={{
            width: 350,
            height: 280,
            background: '#FFFFFF',
            borderRadius: 16,
            padding: 40,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '3px solid #10B98120',
            transform: `translateY(${card2Y}px)`,
            opacity: card2Opacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Icon - Crossed-out dollar */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B98120, #10B98140)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              transform: `scale(${iconPulse(40)})`,
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 48, color: '#10B981', fontWeight: 700 }}>$0</span>
          </div>
          <h3
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              color: '#222222',
              margin: 0,
              marginBottom: 10,
            }}
          >
            No Setup Fees
          </h3>
          <p
            style={{
              fontSize: 18,
              fontWeight: 400,
              fontFamily: 'Inter, sans-serif',
              color: '#717171',
              margin: 0,
            }}
          >
            Free to list. Only pay when you get bookings.
          </p>
        </div>

        {/* Card 3 - Dashboard */}
        <div
          style={{
            width: 350,
            height: 280,
            background: '#FFFFFF',
            borderRadius: 16,
            padding: 40,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '3px solid #FBBF2420',
            transform: `translateX(${card3X}px)`,
            opacity: card3Opacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Icon - Dashboard grid */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FBBF2420, #FBBF2440)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              transform: `scale(${iconPulse(55)})`,
            }}
          >
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <rect x="5" y="5" width="18" height="18" rx="3" fill="#FBBF24" />
              <rect x="27" y="5" width="18" height="18" rx="3" fill="#FBBF24" opacity="0.6" />
              <rect x="5" y="27" width="18" height="18" rx="3" fill="#FBBF24" opacity="0.6" />
              <rect x="27" y="27" width="18" height="18" rx="3" fill="#FBBF24" opacity="0.6" />
            </svg>
          </div>
          <h3
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              color: '#222222',
              margin: 0,
              marginBottom: 10,
            }}
          >
            One Dashboard
          </h3>
          <p
            style={{
              fontSize: 18,
              fontWeight: 400,
              fontFamily: 'Inter, sans-serif',
              color: '#717171',
              margin: 0,
            }}
          >
            Manage all camps, bookings, and payments in one place
          </p>
        </div>
      </div>

      {/* Stats bar at bottom */}
      <div
        style={{
          display: 'flex',
          gap: 80,
          opacity: statsOpacity,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              color: brandColor,
            }}
          >
            100+
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              color: '#717171',
            }}
          >
            Camp Organizers
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              color: '#10B981',
            }}
          >
            10+
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              color: '#717171',
            }}
          >
            Hours Saved/Week
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              color: '#FBBF24',
            }}
          >
            40%
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              color: '#717171',
            }}
          >
            Higher Conversion
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
