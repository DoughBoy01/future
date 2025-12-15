import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  GraduationCap,
  Users,
  MapPin,
  Calendar,
  Award,
  Mail,
  Building2,
  CheckCircle2,
} from 'lucide-react';

// Types
interface FormData {
  schoolName: string;
  contactName: string;
  email: string;
  phone: string;
  campType: string;
  location: string;
  pupilAge: string;
  numberOfPupils: string;
  abilityLevel: string;
  desiredDates: string;
  budget: string;
  additionalInfo: string;
}

// Constants
const BENEFITS = [
  {
    icon: Award,
    title: 'Bespoke Programs',
    description:
      'Custom-designed camps across STEM, arts, sports, and more—tailored to your curriculum needs and educational objectives',
  },
  {
    icon: Users,
    title: 'Expert Instructors',
    description:
      'Qualified educators, technologists, artists, coaches, and specialists experienced in working with diverse school groups',
  },
  {
    icon: MapPin,
    title: 'Global Reach',
    description:
      'Partner venues worldwide or on-site at your school—we serve educational institutions globally',
  },
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description:
      'Programs that fit any academic calendar, from single days to full weeks, year-round',
  },
] as const;

const CAMP_TYPES = [
  'STEM & Robotics',
  'Coding & Technology',
  'Sports & Athletics',
  'Arts & Creativity',
  'Outdoor Adventure',
  'Science & Innovation',
  'Leadership & Life Skills',
  'Music & Performing Arts',
  'Environmental Studies',
  'Multi-Activity',
  'Language Immersion',
  'Academic Enrichment',
  'Other',
] as const;

const AGE_RANGES = [
  '4-6 years (Pre-K/Kindergarten)',
  '7-9 years (Primary/Elementary)',
  '10-12 years (Upper Primary/Middle School)',
  '13-15 years (Secondary/High School)',
  '16-18 years (Senior/College Prep)',
  'Mixed age groups',
] as const;

const ABILITY_LEVELS = [
  'Beginner - No prior experience',
  'Intermediate - Some experience',
  'Advanced - Regular participants',
  'Mixed ability group',
] as const;

const BUDGET_RANGES = [
  'Under $2,500',
  '$2,500 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  'Over $50,000',
] as const;

// Reusable Components
const BenefitCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-airbnb-pink-100 rounded-lg flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-airbnb-pink-600" />
    </div>
    <h3 className="text-lg font-semibold text-airbnb-grey-900 mb-2">{title}</h3>
    <p className="text-airbnb-grey-600">{description}</p>
  </div>
);

const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="bg-airbnb-grey-50 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-airbnb-grey-900 mb-4 flex items-center gap-2">
      <Icon className="w-5 h-5" />
      {title}
    </h3>
    {children}
  </div>
);

export default function ForSchoolsPage() {
  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    contactName: '',
    email: '',
    phone: '',
    campType: '',
    location: '',
    pupilAge: '',
    numberOfPupils: '',
    abilityLevel: '',
    desiredDates: '',
    budget: '',
    additionalInfo: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Integrate Supabase later
      // await supabase.from('school_enquiries').insert([{ ...formData }]);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API

      setSubmitted(true);
      setFormData({
        schoolName: '',
        contactName: '',
        email: '',
        phone: '',
        campType: '',
        location: '',
        pupilAge: '',
        numberOfPupils: '',
        abilityLevel: '',
        desiredDates: '',
        budget: '',
        additionalInfo: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setSubmitted(false);

  return (
    <>
      <Helmet>
        <title>For Schools | FutureEdge - Bespoke Educational Camps</title>
        <meta
          name="description"
          content="Partner with FutureEdge to create bespoke educational camps tailored to your school's extra-curricular needs. STEM, arts, sports, outdoor adventure and more. Expert instruction, flexible scheduling, and custom programs."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 bg-gradient-to-br from-airbnb-pink-500 to-airbnb-pink-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="w-8 h-8" />
                <span className="text-white/90 font-medium">B2B Partnerships</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Bespoke Educational Camps for Your School
              </h1>
              <p className="text-xl sm:text-2xl text-white/95 leading-relaxed mb-8">
                Partner with FutureEdge to deliver exceptional extra-curricular programs—from STEM and arts to sports and outdoor adventure—tailored to your school's unique needs
              </p>
              <div className="flex flex-wrap gap-4 text-white/90">
                {['Custom Programs', 'Expert Coaches', 'Flexible Scheduling'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-20 bg-airbnb-grey-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-airbnb-grey-900 mb-4">
                Why Partner With FutureEdge?
              </h2>
              <p className="text-lg text-airbnb-grey-600 max-w-2xl mx-auto">
                We work closely with schools worldwide to create engaging, safe, and educational experiences across STEM, arts, sports, and more
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {BENEFITS.map((benefit) => (
                <BenefitCard key={benefit.title} {...benefit} />
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-airbnb-grey-900 mb-4">
                Get Started Today
              </h2>
              <p className="text-lg text-airbnb-grey-600">
                Fill out the form below and our team will be in touch within 24 hours to discuss your requirements
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* School Information */}
                <Section title="School Information" icon={Building2}>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your school name"
                    className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                  />
                </Section>

                {/* Contact Information */}
                <Section title="Contact Information" icon={Mail}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@school.com"
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="0123 456 7890"
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </Section>

                {/* Camp Requirements */}
                <Section title="Camp Requirements" icon={Users}>
                  <div className="space-y-4">
                    <select
                      name="campType"
                      value={formData.campType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select camp type</option>
                      {CAMP_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="e.g., On-site at school, Partner venue, City/Region"
                      className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <select
                        name="pupilAge"
                        value={formData.pupilAge}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select age range</option>
                        {AGE_RANGES.map((range) => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        name="numberOfPupils"
                        value={formData.numberOfPupils}
                        onChange={handleChange}
                        required
                        min="1"
                        placeholder="e.g., 30"
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <select
                      name="abilityLevel"
                      value={formData.abilityLevel}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select ability level</option>
                      {ABILITY_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="desiredDates"
                        value={formData.desiredDates}
                        onChange={handleChange}
                        placeholder="e.g., Summer 2025, Winter break, Specific dates"
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                      />
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select budget range</option>
                        {BUDGET_RANGES.map((range) => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>
                    </div>

                    <textarea
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us more about your requirements, curriculum objectives, or any special considerations..."
                      className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent resize-none"
                    />
                  </div>
                </Section>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-airbnb-pink-600 hover:bg-airbnb-pink-700 disabled:bg-airbnb-grey-400 text-white font-medium py-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                >
                  {loading ? 'Submitting...' : 'Submit Enquiry'}
                </button>

                <p className="text-sm text-airbnb-grey-500 text-center">
                  By submitting this form, you agree to be contacted by FutureEdge regarding your enquiry
                </p>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-airbnb-grey-900 mb-2">Thank You!</h3>
                <p className="text-lg text-airbnb-grey-700 mb-6">
                  We've received your enquiry and will be in touch within 24 hours to discuss your requirements.
                </p>
                <button onClick={resetForm} className="text-airbnb-pink-600 hover:text-airbnb-pink-700 font-medium">
                  Submit another enquiry
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 sm:py-20 bg-airbnb-grey-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-airbnb-grey-900 mb-6">
              Trusted by Schools Worldwide
            </h2>
            <p className="text-lg text-airbnb-grey-600 max-w-3xl mx-auto mb-8">
              Join hundreds of schools globally that have partnered with FutureEdge to deliver outstanding educational programs that inspire, engage, and develop young people
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { stat: '500+', label: 'Schools Partnered' },
                { stat: '50,000+', label: 'Pupils Engaged' },
                { stat: '98%', label: 'Satisfaction Rate' },
              ].map(({ stat, label }) => (
                <div key={label} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-4xl font-bold text-airbnb-pink-600 mb-2">{stat}</div>
                  <div className="text-airbnb-grey-600">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}