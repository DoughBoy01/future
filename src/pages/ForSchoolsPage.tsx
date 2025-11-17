import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { GraduationCap, Users, MapPin, Calendar, Award, Phone, Mail, Building2, CheckCircle2 } from 'lucide-react';

export function ForSchoolsPage() {
  const [formData, setFormData] = useState({
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
    additionalInfo: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Integrate with Supabase to save school enquiry
      // const { error } = await supabase
      //   .from('school_enquiries')
      //   .insert([{ ...formData, created_at: new Date().toISOString() }]);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

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
        additionalInfo: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const benefits = [
    {
      icon: Award,
      title: 'Bespoke Programs',
      description: 'Custom-designed camps tailored to your curriculum needs and educational objectives'
    },
    {
      icon: Users,
      title: 'Expert Instructors',
      description: 'Qualified coaches and educators experienced in working with school groups'
    },
    {
      icon: MapPin,
      title: 'Flexible Locations',
      description: 'Choose from our partner venues or we can come to your school'
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Programs that fit your academic calendar, from single days to full weeks'
    }
  ];

  const campTypes = [
    'Football',
    'Basketball',
    'Tennis',
    'Multi-Sport',
    'Athletics',
    'Swimming',
    'Cricket',
    'Rugby',
    'STEM & Sports',
    'Other'
  ];

  const ageRanges = [
    'Reception (4-5 years)',
    'Key Stage 1 (5-7 years)',
    'Key Stage 2 (7-11 years)',
    'Key Stage 3 (11-14 years)',
    'Key Stage 4 (14-16 years)',
    'Sixth Form (16-18 years)'
  ];

  const abilityLevels = [
    'Beginner - No prior experience',
    'Intermediate - Some experience',
    'Advanced - Regular participants',
    'Mixed ability group'
  ];

  const budgetRanges = [
    'Under £1,000',
    '£1,000 - £2,500',
    '£2,500 - £5,000',
    '£5,000 - £10,000',
    '£10,000+'
  ];

  return (
    <>
      <Helmet>
        <title>For Schools | FutureEdge - Bespoke Sports Camps</title>
        <meta
          name="description"
          content="Partner with FutureEdge to create bespoke sports camps tailored to your school's extra-curricular needs. Expert coaching, flexible scheduling, and custom programs."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 bg-gradient-to-br from-airbnb-pink-500 to-airbnb-pink-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="w-8 h-8" />
                <span className="text-white/90 font-medium">B2B Partnerships</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Bespoke Sports Camps for Your School
              </h1>
              <p className="text-xl sm:text-2xl text-white/95 leading-relaxed mb-8">
                Partner with FutureEdge to deliver exceptional extra-curricular sports programs tailored to your school's unique needs
              </p>
              <div className="flex flex-wrap gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Custom Programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Expert Coaches</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Flexible Scheduling</span>
                </div>
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
                We work closely with schools to create engaging, safe, and educational sports experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-airbnb-pink-100 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-airbnb-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-airbnb-grey-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-airbnb-grey-600">
                    {benefit.description}
                  </p>
                </div>
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
                <div className="bg-airbnb-grey-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-airbnb-grey-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    School Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="schoolName" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                        School Name *
                      </label>
                      <input
                        type="text"
                        id="schoolName"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                        placeholder="Enter your school name"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-airbnb-grey-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-airbnb-grey-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="contactName" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                          placeholder="your.email@school.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                          placeholder="0123 456 7890"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Camp Requirements */}
                <div className="bg-airbnb-grey-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-airbnb-grey-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Camp Requirements
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="campType" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                        Type of Camp *
                      </label>
                      <select
                        id="campType"
                        name="campType"
                        value={formData.campType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Select camp type</option>
                        {campTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                        Desired Location(s) *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                        placeholder="e.g., On-site at school, Local sports centre, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="pupilAge" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                          Pupil Age Range *
                        </label>
                        <select
                          id="pupilAge"
                          name="pupilAge"
                          value={formData.pupilAge}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all bg-white"
                        >
                          <option value="">Select age range</option>
                          {ageRanges.map((range) => (
                            <option key={range} value={range}>
                              {range}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="numberOfPupils" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                          Number of Pupils *
                        </label>
                        <input
                          type="number"
                          id="numberOfPupils"
                          name="numberOfPupils"
                          value={formData.numberOfPupils}
                          onChange={handleChange}
                          required
                          min="1"
                          className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                          placeholder="e.g., 30"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="abilityLevel" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                        Ability Level *
                      </label>
                      <select
                        id="abilityLevel"
                        name="abilityLevel"
                        value={formData.abilityLevel}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Select ability level</option>
                        {abilityLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="desiredDates" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                          Desired Dates
                        </label>
                        <input
                          type="text"
                          id="desiredDates"
                          name="desiredDates"
                          value={formData.desiredDates}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                          placeholder="e.g., Half-term October 2025"
                        />
                      </div>

                      <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                          Budget Range
                        </label>
                        <select
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all bg-white"
                        >
                          <option value="">Select budget range</option>
                          {budgetRanges.map((range) => (
                            <option key={range} value={range}>
                              {range}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="additionalInfo" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                        Additional Information
                      </label>
                      <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all resize-none"
                        placeholder="Tell us more about your requirements, curriculum objectives, or any special considerations..."
                      />
                    </div>
                  </div>
                </div>

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
                <h3 className="text-2xl font-bold text-airbnb-grey-900 mb-2">
                  Thank You!
                </h3>
                <p className="text-lg text-airbnb-grey-700 mb-6">
                  We've received your enquiry and will be in touch within 24 hours to discuss your requirements.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-airbnb-pink-600 hover:text-airbnb-pink-700 font-medium"
                >
                  Submit another enquiry
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 sm:py-20 bg-airbnb-grey-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-airbnb-grey-900 mb-6">
                Trusted by Schools Across the UK
              </h2>
              <p className="text-lg text-airbnb-grey-600 max-w-3xl mx-auto mb-8">
                Join hundreds of schools that have partnered with FutureEdge to deliver outstanding sports programs that inspire, engage, and develop young people
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-4xl font-bold text-airbnb-pink-600 mb-2">500+</div>
                  <div className="text-airbnb-grey-600">Schools Partnered</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-4xl font-bold text-airbnb-pink-600 mb-2">50,000+</div>
                  <div className="text-airbnb-grey-600">Pupils Engaged</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-4xl font-bold text-airbnb-pink-600 mb-2">98%</div>
                  <div className="text-airbnb-grey-600">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
