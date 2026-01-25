"use client";
import React from "react";
import {
  Users,
  Target,
  Award,
  Heart,
  Shield,
  Zap,
  TrendingUp,
  Sparkles,
  Linkedin,
  Twitter,
  Mail,
} from "lucide-react";

export default function AboutUsHero() {
  const stats = [
    {
      label: "Happy Customers",
      value: "10K+",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Cars Sold",
      value: "5K+",
      icon: Award,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "Years Experience",
      value: "15+",
      icon: Target,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Satisfaction Rate",
      value: "98%",
      icon: Heart,
      gradient: "from-red-500 to-rose-500",
    },
  ];

  const values = [
    {
      title: "Trust & Transparency",
      description:
        "We believe in honest dealings and clear communication at every step of your car buying journey.",
      icon: Shield,
      gradient: "from-blue-500 to-indigo-600",
      hoverEffect: "hover:rotate-12",
    },
    {
      title: "Quality Assurance",
      description:
        "Every vehicle is thoroughly inspected and verified to meet our high standards before listing.",
      icon: Award,
      gradient: "from-emerald-500 to-teal-600",
      hoverEffect: "hover:-rotate-12",
    },
    {
      title: "Customer First",
      description:
        "Your satisfaction is our priority. We're here to help you find the perfect car for your needs.",
      icon: Heart,
      gradient: "from-pink-500 to-rose-600",
      hoverEffect: "hover:scale-110",
    },
    {
      title: "Innovation",
      description:
        "We leverage AI and modern technology to make car buying smarter and more efficient.",
      icon: Zap,
      gradient: "from-amber-500 to-orange-600",
      hoverEffect: "hover:rotate-180",
    },
  ];

  const team = [
    {
      name: "John Smith",
      role: "CEO & Founder",
      image: "/logo.png",
      bio: "15+ years in automotive industry",
      social: { linkedin: "#", twitter: "#", email: "john@example.com" },
      gradient: "from-blue-500 to-purple-600",
    },
    {
      name: "Sarah Johnson",
      role: "Head of Operations",
      image: "/ford.webp",
      bio: "Operations expert with MBA",
      social: { linkedin: "#", twitter: "#", email: "sarah@example.com" },
      gradient: "from-pink-500 to-rose-600",
    },
    {
      name: "Mike Chen",
      role: "Tech Lead",
      image: "/placeholder.svg",
      bio: "AI & Machine Learning specialist",
      social: { linkedin: "#", twitter: "#", email: "mike@example.com" },
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      name: "Emily Davis",
      role: "Customer Success",
      image: "/placeholder.svg",
      bio: "Customer satisfaction champion",
      social: { linkedin: "#", twitter: "#", email: "emily@example.com" },
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-white to-primary/5 dark:from-primary/5 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Your Trusted Car Partner
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                About{" "}
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Us
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Revolutionizing the way people buy and sell cars with trust,
                technology, and exceptional service since 2009.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Verified Listings
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                  <Award className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Award Winning
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    10K+ Customers
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    15+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Years Experience
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    5K+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Cars Sold
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    98%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Satisfaction
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent z-10 group-hover:opacity-0 transition-opacity duration-500"></div>

                {/* Main Image */}
                <img
                  src="/placeholder.svg"
                  alt="About our dealership"
                  className="w-full h-[400px] md:h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Floating Stats Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 shadow-xl z-20 transform group-hover:translate-y-2 transition-transform duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Trusted by
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          10,000+ Customers
                        </div>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-white dark:border-slate-900"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white dark:border-slate-900"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-white dark:border-slate-900"></div>
                    </div>
                  </div>
                </div>

                {/* Corner Badge */}
                <div className="absolute top-6 right-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg z-20 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold text-sm">
                    Best Dealership 2024
                  </span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:scale-110 cursor-pointer overflow-hidden"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  ></div>
                  <div className="relative z-10">
                    <div
                      className={`inline-flex p-3 rounded-full bg-gradient-to-br ${stat.gradient} mb-3 transform group-hover:rotate-360 transition-transform duration-700`}
                    >
                      <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                Our{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Story
                </span>
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Founded in 2009, we started with a simple mission: to make car
                buying and selling transparent, efficient, and enjoyable. What
                began as a small dealership has grown into a trusted platform
                serving thousands of customers.
              </p>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Today, we combine cutting-edge AI technology with personalized
                service to help you find your dream car or sell your vehicle
                with confidence. Every member of our team is committed to
                delivering excellence at every touchpoint.
              </p>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
              <img
                src="/placeholder.svg"
                alt="Our showroom"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="group relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>
                  <div className="relative z-10">
                    <div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${value.gradient} mb-4 transform ${value.hoverEffect} transition-all duration-500`}
                    >
                      <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-primary transition-colors duration-300">
                      {value.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                  <div
                    className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${value.gradient} rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Meet Our{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Team
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The dedicated professionals behind your car buying experience
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {team.map((member, idx) => (
              <div
                key={member.name}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-200 dark:bg-slate-800">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-10`}
                  ></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Social Icons Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                    <a
                      href={member.social.linkedin}
                      className="p-2 bg-white dark:bg-slate-800 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg"
                    >
                      <Linkedin className="w-5 h-5 text-blue-600" />
                    </a>
                    <a
                      href={member.social.twitter}
                      className="p-2 bg-white dark:bg-slate-800 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg"
                    >
                      <Twitter className="w-5 h-5 text-sky-500" />
                    </a>
                    <a
                      href={`mailto:${member.social.email}`}
                      className="p-2 bg-white dark:bg-slate-800 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg"
                    >
                      <Mail className="w-5 h-5 text-red-600" />
                    </a>
                  </div>
                </div>

                <div className="p-4 md:p-6 text-center relative">
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${member.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                  ></div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-sm md:text-base text-primary dark:text-primary/90 font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 dark:from-rose-600 dark:via-orange-600 dark:to-amber-600 overflow-hidden group ">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/30 dark:bg-yellow-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-400/30 dark:bg-red-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <div className="inline-flex p-2 bg-white/20 dark:bg-white/10 rounded-full mb-4 backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-yellow-300 dark:text-yellow-200 animate-pulse group-hover:animate-bounce" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            Ready to Find Your Perfect Car?
          </h2>
          <p className="text-base md:text-lg text-white/95 dark:text-white/90 mb-6">
            Join thousands of satisfied customers who found their dream cars
            with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button className="group/second relative px-6 py-2.5 md:px-8 md:py-3 bg-white dark:bg-white text-orange-600 dark:text-orange-700 rounded-lg font-semibold text-sm md:text-base hover:bg-orange-50 dark:hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-white/40 dark:hover:shadow-white/30 hover:scale-105 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Browse Cars Now
                <TrendingUp className="w-4 h-4 group-hover/second:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-amber-100/50 dark:from-orange-50/50 dark:to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button className="group/first relative px-6 py-2.5 md:px-8 md:py-3 bg-white/20 dark:bg-white/10 text-white border-2 border-white/60 dark:border-white/50 rounded-lg font-semibold text-sm md:text-base hover:bg-white hover:text-orange-600 dark:hover:text-orange-700 transition-all duration-300 backdrop-blur-sm hover:scale-105 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Contact Us
                <Mail className="w-4 h-4 group-hover/first:rotate-12 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover/first:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
