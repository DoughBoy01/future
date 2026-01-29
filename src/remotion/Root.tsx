import { Composition } from 'remotion';
import { CampOwnerPromo } from './compositions/CampOwnerPromo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CampOwnerPromo"
        component={CampOwnerPromo}
        durationInFrames={600} // 20 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          brandColor: '#FF385C',
          backgroundColor: '#FFFFFF',
        }}
      />
    </>
  );
};
