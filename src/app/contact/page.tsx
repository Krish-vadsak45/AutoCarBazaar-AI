"use client";
import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  User,
  FileText,
  Headphones,
  Award,
  Shield,
  Zap,
} from "lucide-react";

const ContactUsGetInTouch = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const contactCards = [
    {
      title: "Phone Number",
      value: "+1 (555) 123-4567",
      description: "Call us for immediate assistance",
      icon: Phone,
      gradient: "from-blue-500 to-cyan-500",
      href: "tel:+15551234567",
    },
    {
      title: "Email Address",
      value: "support@carsale.com",
      description: "Send us your queries anytime",
      icon: Mail,
      gradient: "from-purple-500 to-pink-500",
      href: "mailto:support@carsale.com",
    },
    {
      title: "WhatsApp",
      value: "+1 (555) 987-6543",
      description: "Chat with us instantly",
      icon: MessageCircle,
      gradient: "from-green-500 to-emerald-500",
      href: "https://wa.me/15559876543",
    },
    {
      title: "Office Location",
      value: "123 Auto Street, Car City",
      description: "Visit our showroom",
      icon: MapPin,
      gradient: "from-orange-500 to-red-500",
      href: "#map",
    },
    {
      title: "Main Contact",
      value: "+1 (555) 111-2222",
      description: "Reach our sales team",
      icon: Phone,
      gradient: "from-indigo-500 to-blue-500",
      href: "tel:+15551112222",
    },
    {
      title: "Working Hours",
      value: "Mon - Sat: 9AM - 6PM",
      description: "Sunday closed",
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      href: null,
    },
  ];

  const reasons = [
    {
      title: "24/7 Support",
      description:
        "Our dedicated support team is available round the clock to answer your questions and help you find the perfect car.",
      icon: Headphones,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Expert Guidance",
      description:
        "Get personalized recommendations from our experienced car specialists who understand your needs and budget.",
      icon: Award,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Secure Process",
      description:
        "Your information is protected with bank-level security. We ensure safe and transparent transactions.",
      icon: Shield,
      gradient: "from-pink-500 to-rose-600",
    },
    {
      title: "Quick Response",
      description:
        "We value your time. Expect responses within 2 hours during business days and priority support for urgent queries.",
      icon: Zap,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const faqs = [
    {
      question: "How long does it take to get a response?",
      answer:
        "We typically respond to all inquiries within 2 hours during business hours. For urgent matters, please call us directly.",
    },
    {
      question: "Can I schedule a test drive through this form?",
      answer:
        "Yes! Simply mention your preferred car model and time in the message, and we'll arrange a test drive at your convenience.",
    },
    {
      question: "Do you offer virtual consultations?",
      answer:
        "Absolutely! We provide video calls and virtual tours of our vehicles. Just let us know your preference when contacting us.",
    },
    {
      question: "What information should I include in my inquiry?",
      answer:
        "Include your budget range, preferred car type, and any specific features you're looking for. This helps us provide better recommendations.",
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-white to-primary/5 dark:from-primary/5 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 animate-fade-in">
              Get In{" "}
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Touch
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Have questions about buying or selling a car? Our expert team is
              here to help you every step of the way. Reach out and let's find
              your perfect vehicle together.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-sm md:text-base">Instant Response</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm md:text-base">100% Secure</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm md:text-base">Expert Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Multiple Ways to{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Reach Us
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose your preferred method of communication. We're available
              through phone, email, WhatsApp, or visit us in person.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {contactCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <a
                  key={card.title}
                  href={card.href || "#"}
                  className={`group relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
                    !card.href ? "cursor-default" : "cursor-pointer"
                  }`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>
                  <div className="relative z-10">
                    <div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${card.gradient} mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}
                    >
                      <Icon
                        className="w-6 h-6 md:w-8 md:h-8 text-white"
                        strokeWidth={2}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-800 dark:text-gray-200 font-medium mb-1">
                      {card.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {card.description}
                    </p>
                  </div>
                  <div
                    className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${card.gradient} rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}
                  ></div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Contact Us Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Choose Our{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Support
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience exceptional customer service with our dedicated team
              committed to making your car buying journey smooth and
              stress-free.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {reasons.map((reason, idx) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className="group relative bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${reason.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>
                  <div className="relative z-10">
                    <div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${reason.gradient} mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}
                    >
                      <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-primary transition-colors duration-300">
                      {reason.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Send Us a{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Message
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Fill out the form below with your inquiry. Whether you're looking
              to buy, sell, or just have questions, we're here to help. Our team
              will respond within 2 hours during business days.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100 dark:border-slate-700"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4 text-primary" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-primary" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="w-4 h-4 text-primary" />
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
                  placeholder="Inquiry about buying a car"
                />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <MessageCircle className="w-4 h-4 text-primary" />
                Your Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none resize-none"
                placeholder="Tell us how we can help you find your perfect car. Include details like preferred model, budget, and any specific requirements..."
              />
            </div>

            <button
              type="submit"
              className="group w-full md:w-auto px-8 py-3 md:px-10 md:py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg font-semibold text-base md:text-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              Send Message
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
              Quick answers to common questions about contacting us
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-slate-800"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
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
              Visit Our{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Showroom
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Come see our extensive collection of quality vehicles in person.
              Our friendly staff is ready to give you a tour and answer all your
              questions. Click on the map for directions.
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

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Our Address
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                123 Auto Street, Car City
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                California, CA 90210
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Business Hours
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Monday - Saturday
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                9:00 AM - 6:00 PM
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Quick Contact
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Phone: +1 (555) 123-4567
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                WhatsApp: +1 (555) 987-6543
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsGetInTouch;
