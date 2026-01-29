import { AbsoluteFill } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { Scene1Hero } from '../components/Scene1Hero';
import { Scene2Money } from '../components/Scene2Money';
import { Scene3Paperwork } from '../components/Scene3Paperwork';
import { Scene4Benefits } from '../components/Scene4Benefits';
import { Scene5CTA } from '../components/Scene5CTA';

interface CampOwnerPromoProps {
  brandColor: string;
  backgroundColor: string;
}

export const CampOwnerPromo: React.FC<CampOwnerPromoProps> = ({
  brandColor,
  backgroundColor,
}) => {
  const sceneDuration = 120; // 4 seconds per scene at 30fps
  const transitionDuration = 20; // 0.67 seconds

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <TransitionSeries>
        {/* Scene 1: Hero Impact */}
        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <Scene1Hero brandColor={brandColor} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-right' })}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 2: Money/Payments */}
        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <Scene2Money brandColor={brandColor} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 3: Zero Paperwork */}
        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <Scene3Paperwork brandColor={brandColor} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-bottom' })}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 4: Platform Benefits */}
        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <Scene4Benefits brandColor={brandColor} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 5: Strong CTA */}
        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <Scene5CTA brandColor={brandColor} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
