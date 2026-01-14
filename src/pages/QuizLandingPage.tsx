import { QuizContainer } from '../components/quiz/QuizContainer';

export function QuizLandingPage() {
  return (
    <div className="bg-gradient-to-b from-white via-airbnb-pink-50 to-white md:min-h-screen">
      {/* Quiz Container */}
      <section className="pt-16 md:pb-20">
        <QuizContainer autoStart={false} />
      </section>
    </div>
  );
}
