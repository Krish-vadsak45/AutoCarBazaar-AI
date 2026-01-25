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
      icon: Phone,
      gradient: "from-blue-500 to-cyan-500",
      href: "tel:+15551234567",
    },
    {
      title: "Email Address",
      value: "support@carsale.com",
      icon: Mail,
      gradient: "from-purple-500 to-pink-500",
      href: "mailto:support@carsale.com",
    },
    {
      title: "WhatsApp",
      value: "+1 (555) 987-6543",
      icon: MessageCircle,
      gradient: "from-green-500 to-emerald-500",
      href: "https://wa.me/15559876543",
    },
    {
      title: "Office Location",
      value: "123 Auto Street, Car City, CA 90210",
      icon: MapPin,
      gradient: "from-orange-500 to-red-500",
      href: "#map",
    },
    {
      title: "Main Contact",
      value: "+1 (555) 111-2222",
      icon: Phone,
      gradient: "from-indigo-500 to-blue-500",
      href: "tel:+15551112222",
    },
    {
      title: "Working Hours",
      value: "Mon - Sat: 9AM - 6PM",
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      href: null,
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100">
              Get In{" "}
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Touch
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-7xl">
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
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                      {card.value}
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

      {/* Form Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Send Us a{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Message
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Fill out the form below and our team will get back to you within
              24 hours
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100 dark:border-slate-800"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="w-4 h-4 text-primary" />
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none"
                  placeholder="Inquiry about..."
                />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <MessageCircle className="w-4 h-4 text-primary" />
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 outline-none resize-none"
                placeholder="Tell us how we can help you..."
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
                Location
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find us at our showroom. Click on the map to get directions.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl h-96 md:h-[500px] group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.5692754181457!2d-118.24368368478942!3d34.05223908060668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
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
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Address
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                123 Auto Street, Car City, CA 90210
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Business Hours
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Monday - Saturday: 9AM - 6PM
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Quick Contact
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsGetInTouch;
