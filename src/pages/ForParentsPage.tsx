import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, Heart, Users, CheckCircle, FileText, Phone, Award, AlertCircle, Clock, MapPin } from 'lucide-react';
import { FAQSection } from '../components/camps/FAQSection';

export function ForParentsPage() {
  // FAQ data - easy to update by modifying this array
  const faqs = [
    {
      question: "How do you verify the safety standards of camp organizers?",
      answer: "All camp organizers undergo a rigorous verification process including background checks, license verification, insurance validation, and facility inspections. We require comprehensive documentation of safety protocols, emergency procedures, and staff qualifications before any camp is listed on our platform."
    },
    {
      question: "What health and safety measures are in place at camps?",
      answer: "Every camp must maintain comprehensive health and safety protocols including: qualified first aid staff on-site, emergency action plans, regular facility safety inspections, proper staff-to-child ratios, allergy and dietary accommodation procedures, and communication systems for emergencies. Camps must also comply with all local health department regulations."
    },
    {
      question: "Are camp staff properly trained and background checked?",
      answer: "Yes. All camp staff must complete background checks and provide clearances as required by law. Staff undergo training in child safety, emergency response, activity-specific skills, and age-appropriate supervision. Many camps also require CPR and First Aid certification for all staff members."
    },
    {
      question: "How do camps handle medical emergencies?",
      answer: "Each camp has documented emergency medical procedures, trained first aid staff, and established relationships with local medical facilities. Parents provide medical information and emergency contacts during registration. Camps maintain medication logs, allergy alerts, and immediate parent notification protocols for any medical incidents."
    },
    {
      question: "What if my child has special dietary needs or allergies?",
      answer: "Camps are required to accommodate dietary restrictions and allergies. During registration, you'll provide detailed information about your child's needs. Camp staff are trained in allergy awareness, and meals are prepared with strict protocols to prevent cross-contamination. Medication (like EpiPens) is securely stored and accessible to trained staff."
    },
    {
      question: "How can I communicate with camp staff during the session?",
      answer: "Most camps provide multiple communication channels including direct phone lines, email, and some offer parent portals with daily updates and photos. Emergency contacts are available 24/7. Specific communication policies vary by camp and are provided during the registration process."
    },
    {
      question: "What happens in case of severe weather or other emergencies?",
      answer: "Every camp has comprehensive emergency action plans covering weather events, evacuations, lockdowns, and other scenarios. Facilities include safe shelter areas, and staff are trained in emergency procedures. Parents are immediately notified of any significant emergencies through the emergency contact system."
    },
    {
      question: "Are facilities regularly inspected for safety?",
      answer: "Yes. All camp facilities undergo regular safety inspections by qualified professionals. This includes building safety, equipment maintenance, fire safety systems, water quality (for aquatic programs), and playground equipment. Inspection reports must be current and available for review."
    },
    {
      question: "What supervision ratios do camps maintain?",
      answer: "Camps follow strict adult-to-child ratios based on age groups and activities, typically exceeding minimum regulatory requirements. For example, younger children may have ratios of 1:6 or better, while older children might be 1:10. Higher-risk activities like swimming have enhanced supervision requirements."
    },
    {
      question: "How do you handle behavioral issues or bullying?",
      answer: "Camps maintain clear behavioral expectations and anti-bullying policies. Staff are trained to recognize and address behavioral issues promptly and appropriately. Parents are contacted regarding significant behavioral concerns, and camps work collaboratively with families to ensure a positive experience for all children."
    },
    {
      question: "What insurance coverage do camps carry?",
      answer: "All approved camps carry comprehensive general liability insurance and, where applicable, professional liability coverage. Many camps also offer optional accident insurance for participants. Insurance certificates are verified as part of our camp approval process."
    },
    {
      question: "Can I visit the camp before enrolling my child?",
      answer: "Absolutely! We encourage parents to visit camps before enrollment. Most camps offer open houses, facility tours, or scheduled visit opportunities. Contact the camp directly through our platform to arrange a visit and meet staff members."
    },
    {
      question: "What is your refund and cancellation policy?",
      answer: "Refund policies vary by camp and are clearly stated during the booking process. Most camps offer full or partial refunds for cancellations made within specific timeframes. We recommend reviewing the specific camp's policy and considering optional cancellation insurance for added flexibility."
    },
    {
      question: "How do camps support children with special needs?",
      answer: "Many camps offer inclusive programming and can accommodate children with various special needs. During registration, you can discuss your child's specific requirements with camp directors. Some camps specialize in specific needs, while others provide mainstream inclusion with appropriate support."
    },
    {
      question: "What transportation safety measures are in place?",
      answer: "For camps offering transportation, all drivers must have appropriate licenses, background checks, and clean driving records. Vehicles are properly insured and maintained, seat belts are mandatory, and adult supervision is provided on all transport. Transportation safety procedures are included in camp documentation."
    }
  ];

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Verified Safety Standards",
      description: "All camps undergo rigorous verification including background checks, facility inspections, and safety protocol reviews before being listed."
    },
    {
      icon: Heart,
      title: "Health & Well-being Priority",
      description: "Comprehensive health policies including trained first aid staff, allergy management, and emergency medical procedures at every camp."
    },
    {
      icon: Users,
      title: "Qualified Staff",
      description: "All camp staff complete background checks, safety training, and maintain appropriate certifications for their roles."
    },
    {
      icon: Award,
      title: "Accreditation & Compliance",
      description: "Camps meet or exceed industry standards and comply with all local regulations for youth programs and child safety."
    },
    {
      icon: AlertCircle,
      title: "Emergency Preparedness",
      description: "Documented emergency action plans, 24/7 emergency contacts, and established protocols for any situation."
    },
    {
      icon: FileText,
      title: "Transparent Documentation",
      description: "Access to safety policies, insurance information, and inspection reports to make informed decisions about your child's care."
    }
  ];

  const trustIndicators = [
    {
      stat: "100%",
      label: "Background Checks",
      description: "Every staff member"
    },
    {
      stat: "24/7",
      label: "Emergency Support",
      description: "Always available"
    },
    {
      stat: "Licensed",
      label: "Insured Facilities",
      description: "Full compliance"
    },
    {
      stat: "Verified",
      label: "Safety Protocols",
      description: "Rigorously reviewed"
    }
  ];

  return (
    <>
      <Helmet>
        <title>For Parents | FutureEdge - Your Child's Safety is Our Priority</title>
        <meta
          name="description"
          content="Discover how FutureEdge maintains the highest safety, health, and well-being standards for your child. Learn about our verification process, safety protocols, and parent resources."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-airbnb-pink-600 via-airbnb-pink-500 to-airbnb-pink-400 text-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Your Child's Safety, Health & Happiness Come First
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-pink-50">
                We understand that choosing the right camp for your child is one of the most important decisions you'll make. That's why we maintain the highest standards for safety, health, and well-being.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/camps"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-airbnb-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
                >
                  Browse Safe & Verified Camps
                </Link>
                <a
                  href="#faq"
                  className="inline-flex items-center justify-center px-8 py-4 bg-airbnb-pink-700 text-white rounded-lg font-semibold hover:bg-airbnb-pink-800 transition-colors"
                >
                  Read Safety FAQs
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 bg-airbnb-grey-50 border-y border-airbnb-grey-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-airbnb-pink-600 mb-2">
                    {indicator.stat}
                  </div>
                  <div className="text-lg font-semibold text-airbnb-grey-900 mb-1">
                    {indicator.label}
                  </div>
                  <div className="text-sm text-airbnb-grey-600">
                    {indicator.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Features Grid */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-airbnb-grey-900 mb-4">
                How We Ensure Your Child's Safety
              </h2>
              <p className="text-xl text-airbnb-grey-600 max-w-3xl mx-auto">
                Every camp on our platform meets rigorous standards across multiple areas of safety, health, and child well-being.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {safetyFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white border border-airbnb-grey-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-12 h-12 bg-airbnb-pink-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-airbnb-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold text-airbnb-grey-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-airbnb-grey-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Verification Process */}
        <section className="py-16 lg:py-24 bg-airbnb-grey-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-airbnb-grey-900 mb-4">
                Our Rigorous Verification Process
              </h2>
              <p className="text-xl text-airbnb-grey-600 max-w-3xl mx-auto">
                Before any camp appears on FutureEdge, it must pass our comprehensive verification process.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Documentation Review",
                    description: "We verify all business licenses, insurance certificates, facility permits, and accreditation documentation."
                  },
                  {
                    step: "2",
                    title: "Background Checks",
                    description: "All staff members must complete comprehensive background checks and provide required clearances."
                  },
                  {
                    step: "3",
                    title: "Safety Protocol Assessment",
                    description: "Review of emergency procedures, medical protocols, supervision policies, and staff training programs."
                  },
                  {
                    step: "4",
                    title: "Facility Inspection",
                    description: "Verification of safety inspections, equipment maintenance records, and compliance with health codes."
                  },
                  {
                    step: "5",
                    title: "Reference Verification",
                    description: "We contact references and review testimonials to ensure camps have a proven track record of excellence."
                  },
                  {
                    step: "6",
                    title: "Ongoing Monitoring",
                    description: "Continuous review of parent feedback, incident reports, and annual renewal of all safety documentation."
                  }
                ].map((step, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border border-airbnb-grey-200 flex gap-6 items-start hover:border-airbnb-pink-300 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-airbnb-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-airbnb-grey-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-airbnb-grey-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What Parents Should Look For */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-airbnb-grey-900 mb-4">
                What to Look For When Choosing a Camp
              </h2>
              <p className="text-xl text-airbnb-grey-600 max-w-3xl mx-auto">
                Here are key factors to consider when selecting the right camp for your child.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: CheckCircle,
                  title: "Accreditation & Licensing",
                  points: [
                    "Valid business licenses and permits",
                    "Accreditation by recognized organizations",
                    "Current insurance certificates",
                    "Regular inspection compliance"
                  ]
                },
                {
                  icon: Users,
                  title: "Staff Qualifications",
                  points: [
                    "Background checks for all staff",
                    "CPR and First Aid certifications",
                    "Age-appropriate staff training",
                    "Adequate staff-to-child ratios"
                  ]
                },
                {
                  icon: Heart,
                  title: "Health & Safety Protocols",
                  points: [
                    "Clear emergency action plans",
                    "On-site first aid capabilities",
                    "Allergy and medication management",
                    "Illness and injury procedures"
                  ]
                },
                {
                  icon: Phone,
                  title: "Communication & Transparency",
                  points: [
                    "Clear parent communication policies",
                    "24/7 emergency contact availability",
                    "Regular updates during sessions",
                    "Open facility visitation policies"
                  ]
                }
              ].map((category, index) => {
                const Icon = category.icon;
                return (
                  <div
                    key={index}
                    className="bg-white border border-airbnb-grey-200 rounded-xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-airbnb-pink-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-airbnb-pink-600" />
                      </div>
                      <h3 className="text-xl font-bold text-airbnb-grey-900">
                        {category.title}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {category.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-airbnb-grey-600">
                          <CheckCircle className="w-5 h-5 text-trust-success flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 lg:py-24 bg-airbnb-grey-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-airbnb-grey-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-airbnb-grey-600">
                Get answers to common questions about camp safety, health, and our verification process.
              </p>
            </div>
            <FAQSection faqs={faqs} />
          </div>
        </section>

        {/* Support Section */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-airbnb-pink-600 to-airbnb-pink-500 rounded-2xl p-8 lg:p-12 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Still Have Questions?
                </h2>
                <p className="text-xl mb-8 text-pink-50">
                  Our parent support team is here to help you find the perfect camp for your child and answer any questions about safety, health, or our verification process.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/talk-to-advisor"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-airbnb-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Talk to an Advisor
                  </Link>
                  <Link
                    to="/camps"
                    className="inline-flex items-center justify-center px-8 py-4 bg-airbnb-pink-700 text-white rounded-lg font-semibold hover:bg-airbnb-pink-800 transition-colors"
                  >
                    Browse Verified Camps
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
