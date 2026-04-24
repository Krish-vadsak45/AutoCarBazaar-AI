'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  User,
  FileText,
  Plus,
  Minus,
} from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const ContactUsGetInTouch = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    reset();
  };

  const contactTimeline = [
    {
      title: 'Call Us Anytime',
      value: '+1 (555) 123-4567',
      description: 'Our phone lines are open 24/7. Get instant support from our dedicated team.',
      icon: Phone,
      gradient: 'from-blue-500 to-cyan-500',
      href: 'tel:+15551234567',
    },
    {
      title: 'Email Support',
      value: 'support@carsale.com',
      description: "Send us your queries and we'll respond within 2 hours during business days.",
      icon: Mail,
      gradient: 'from-purple-500 to-pink-500',
      href: 'mailto:support@carsale.com',
    },
    {
      title: 'WhatsApp Chat',
      value: '+1 (555) 987-6543',
      description: 'Prefer instant messaging? Chat with us on WhatsApp for quick responses.',
      icon: MessageCircle,
      gradient: 'from-green-500 to-emerald-500',
      href: 'https://wa.me/15559876543',
    },
    {
      title: 'Visit Our Showroom',
      value: '123 Auto Street, Car City, CA 90210',
      description: 'Come see our collection in person. Our team is ready to welcome you.',
      icon: MapPin,
      gradient: 'from-orange-500 to-red-500',
      href: '#map',
    },
  ];

  const faqItems = [
    {
      question: 'What are your business hours?',
      answer:
        'We are open Monday through Saturday, 9:00 AM to 6:00 PM. We are closed on Sundays and public holidays. For urgent matters outside business hours, please use our WhatsApp service.',
    },
    {
      question: 'How long does it take to respond to inquiries?',
      answer:
        'We aim to respond to all inquiries within 24 hours during business days. For weekend inquiries, we will get back to you on the next business day.',
    },
    {
      question: 'Do you provide test drives?',
      answer:
        'Yes! We offer free test drives for all our vehicles. Please contact us to schedule an appointment at your preferred time.',
    },
    {
      question: 'What financing options are available?',
      answer:
        'We offer flexible financing options including bank loans, direct financing, and lease options. Our team will help you find the best solution for your needs.',
    },
    {
      question: 'Can I buy online?',
      answer:
        'Yes, we offer online purchasing with convenient delivery options. You can browse our inventory and complete the purchase process from our website.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl dark:from-blue-400/5"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl dark:from-purple-400/5"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Get in Touch with Us
              </p>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight text-balance">
              Let&apos;s Start a{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Have questions about our vehicles or services? Our dedicated team is here to help.
              Reach out to us today and let&apos;s find the perfect solution for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
                Contact Us Now
              </button>
              <button className="px-8 py-3 border border-border hover:bg-muted rounded-lg font-semibold transition-all duration-300">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Form and Timeline Section - Side by Side */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Let&apos;s{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Connect
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Fill out the form or reach us through any of our contact channels
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left - Contact Form */}
            <div className="order-2 lg:order-1">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100 dark:border-slate-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Send Us a Message
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4 text-primary" />
                      Full Name *
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
                      placeholder="John Doe"
                    />
                    {errors.name ? (
                      <span className="text-sm text-red-500">{errors.name.message}</span>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Mail className="w-4 h-4 text-primary" />
                      Email Address *
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
                      placeholder="john@example.com"
                    />
                    {errors.email ? (
                      <span className="text-sm text-red-500">{errors.email.message}</span>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Phone className="w-4 h-4 text-primary" />
                      Phone Number
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FileText className="w-4 h-4 text-primary" />
                      Subject *
                    </label>
                    <input
                      {...register('subject', {
                        required: 'Subject is required',
                      })}
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
                      placeholder="Inquiry about buying a car"
                    />
                    {errors.subject ? (
                      <span className="text-sm text-red-500">{errors.subject.message}</span>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      Your Message *
                    </label>
                    <textarea
                      {...register('message', {
                        required: 'Message is required',
                      })}
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none resize-none"
                      placeholder="Tell us how we can help you find your perfect car..."
                    />
                    {errors.message ? (
                      <span className="text-sm text-red-500">{errors.message.message}</span>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    className="group w-full px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg font-semibold text-base hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Send Message
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right - Timeline */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20"></div>

                {/* Timeline Items */}
                <div className="space-y-8">
                  {contactTimeline.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="relative pl-16">
                        {/* Timeline Dot */}
                        <div className="absolute left-0 flex items-center justify-center">
                          <div
                            className={`p-3 rounded-full bg-gradient-to-br ${item.gradient} shadow-lg`}
                          >
                            <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                          </div>
                        </div>

                        {/* Content Card */}
                        <a
                          href={item.href || '#'}
                          className={`group block bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 dark:border-slate-800 ${
                            !item.href ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-xl`}
                          ></div>
                          <div className="relative z-10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary transition-colors duration-300">
                              {item.title}
                            </h3>
                            <p className="text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                              {item.value}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section
        id="map"
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Visit Our{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Showroom
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Come see our extensive collection of quality vehicles in person. Click on the map for
              directions.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl h-96 md:h-[500px] group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.5692754181457!2d-118.24368368478942!3d34.05223908060668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA%2090210!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-500"
            ></iframe>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-muted/10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our services and vehicles.
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="border border-border rounded-xl overflow-hidden bg-card hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 md:px-8 py-4 md:py-5 flex items-center justify-between gap-4 hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors duration-300 group"
                >
                  <h3 className="text-left text-base md:text-lg font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {item.question}
                  </h3>
                  <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                    {expandedFaq === index ? (
                      <Minus className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Plus className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </button>

                {expandedFaq === index && (
                  <div className="px-6 md:px-8 py-4 md:py-5 border-t border-border bg-muted/20 dark:bg-muted/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-12 md:mt-16 p-8 md:p-10 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 text-center">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Can&apos;t find the answer you&apos;re looking for? Please contact our support team.
            </p>
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsGetInTouch;
