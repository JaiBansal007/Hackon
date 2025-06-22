"use client";

import { useState, useEffect } from "react";
import { Play, Users, Zap, Target, Star, ArrowRight, Menu, X, ChevronDown, Sparkles, Globe, Shield, Heart, Award, Tv, MessageCircle } from "lucide-react";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const features = [
    {
      icon: Target,
      title: "AI-Powered Mood Detection",
      desc: "Advanced algorithms analyze your viewing patterns, time of day, and preferences to suggest perfect content for your current mood.",
      color: "from-amber-400 to-orange-500",
      bgColor: "from-amber-500/20 to-orange-500/20",
      stats: "95% accuracy"
    },
    {
      icon: Users,
      title: "Synchronized Co-Watching",
      desc: "Watch with friends and family in real-time, no matter where they are. Share reactions, chat, and create memories together.",
      color: "from-cyan-400 to-blue-500",
      bgColor: "from-cyan-500/20 to-blue-500/20",
      stats: "10M+ sessions"
    },
    {
      icon: Zap,
      title: "Intelligent Summarization",
      desc: "Miss an episode? Our AI creates personalized summaries so you never lose track of your favorite shows.",
      color: "from-violet-400 to-purple-500",
      bgColor: "from-violet-500/20 to-purple-500/20",
      stats: "30 languages"
    },
    {
      icon: Star,
      title: "Gamified Experience",
      desc: "Earn badges, complete challenges, and unlock exclusive content. Turn watching into an adventure.",
      color: "from-emerald-400 to-green-500",
      bgColor: "from-emerald-500/20 to-green-500/20",
      stats: "50+ rewards"
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      avatar: "👩‍💻",
      text: "FireStream completely changed how I discover content. The mood-based recommendations are eerily accurate!",
      rating: 5
    },
    {
      name: "Marcus Rivera",
      role: "Film Enthusiast",
      avatar: "🎬",
      text: "Co-watching with friends who live across the country feels like we're in the same room. Amazing technology!",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Busy Parent",
      avatar: "👩‍👧‍👦",
      text: "The smart summaries are a lifesaver when I miss episodes during naptime. Perfect for busy parents!",
      rating: 5
    }
  ];

  const stats = [
    { value: "2.5M+", label: "Active Users", icon: Users },
    { value: "150M+", label: "Hours Watched", icon: Play },
    { value: "98%", label: "Satisfaction Rate", icon: Heart },
    { value: "45+", label: "Countries", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Play className="w-5 h-5 text-black" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Fire<span className="text-orange-400">Stream</span>
                </span>
                <div className="text-xs text-orange-400 font-medium">AI-POWERED</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'About', 'Testimonials'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="relative group text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 group-hover:w-full transition-all duration-300" />
                </button>
              ))}
              <div className="flex items-center space-x-3">
                <button className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </button>
                <button className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black px-6 py-2.5 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105">
                  Get Started
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/10">
              <div className="flex flex-col space-y-4 pt-4">
                {['Features', 'About', 'Testimonials'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="text-left text-gray-300 hover:text-orange-400 transition-colors"
                  >
                    {item}
                  </button>
                ))}
                <div className="flex flex-col space-y-2 pt-2">
                  <button className="text-left text-gray-300 hover:text-white">Sign In</button>
                  <button className="bg-gradient-to-r from-amber-400 to-orange-500 text-black px-4 py-2 rounded-full font-semibold w-fit">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="text-center max-w-6xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">Powered by Advanced AI</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                Fire TV Experience
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Discover content that matches your <span className="text-orange-400 font-semibold">mood</span>, 
              watch with <span className="text-cyan-400 font-semibold">friends anywhere</span>, 
              and never miss a beat with <span className="text-violet-400 font-semibold">AI-powered summaries</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button className="group bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/25 hover:scale-105">
                Start Your Journey
                <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/25">
                <Play className="inline mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="mb-2">
                    <stat.icon className="w-8 h-8 mx-auto text-orange-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Revolutionary Features
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience the future of entertainment with cutting-edge AI technology
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              {/* Feature showcase */}
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${
                      activeFeature === index
                        ? `bg-gradient-to-r ${feature.bgColor} border-white/20 scale-105`
                        : 'bg-gray-900/50 border-gray-700/50 hover:border-gray-600/50'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <feature.icon className="w-7 h-7 text-black" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                          <span className="text-sm font-medium text-orange-400">{feature.stats}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual showcase */}
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                  <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tv className="w-16 h-16 text-orange-400" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gradient-to-r from-orange-400 to-transparent rounded-full w-3/4" />
                    <div className="h-3 bg-gradient-to-r from-cyan-400 to-transparent rounded-full w-1/2" />
                    <div className="h-3 bg-gradient-to-r from-violet-400 to-transparent rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-32 px-6 bg-gradient-to-r from-gray-900/50 to-black/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  What Users Say
                </span>
              </h2>
              <p className="text-xl text-gray-300">Join millions who've transformed their viewing experience</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-8 rounded-2xl border border-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Built for Everyone
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Whether you're a casual viewer or entertainment enthusiast, FireStream adapts to your unique style
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Casual Viewers",
                  desc: "Just want to unwind after a long day? Our mood detection finds the perfect comfort content for your relaxation time.",
                  icon: "🛋️",
                  color: "from-emerald-500/20 to-green-500/20",
                  border: "border-emerald-500/30"
                },
                {
                  title: "Busy Binge-Watchers", 
                  desc: "Juggling multiple shows? Smart summaries and personalized queues keep you organized and up-to-date.",
                  icon: "⚡",
                  color: "from-amber-500/20 to-orange-500/20",
                  border: "border-amber-500/30"
                },
                {
                  title: "Social Enthusiasts",
                  desc: "Love sharing experiences? Co-watch with friends, share reactions, and build communities around your favorite content.",
                  icon: "🎭",
                  color: "from-cyan-500/20 to-blue-500/20",
                  border: "border-cyan-500/30"
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${item.color} p-8 rounded-2xl border ${item.border} backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}
                >
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full px-6 py-3 mb-8">
                <Award className="w-5 h-5 text-orange-400" />
                <span className="font-medium text-orange-300">Join 2.5M+ Happy Users</span>
              </div>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Ready to <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Revolutionize</span>
              <br />
              Your Entertainment?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Start your free trial today and discover why millions choose FireStream for their entertainment needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white px-12 py-6 rounded-full font-bold text-xl transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/25 hover:scale-105">
                Start Free Trial
                <ArrowRight className="inline ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-gray-600 text-gray-300 hover:border-white hover:text-white px-12 py-6 rounded-full font-bold text-xl transition-all duration-300">
                <MessageCircle className="inline mr-3 w-6 h-6 group-hover:scale-110 transition-transform" />
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 bg-black/90 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div className="flex items-center space-x-3 mb-6 md:mb-0">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-black" />
                </div>
                <div>
                  <span className="text-2xl font-bold">
                    Fire<span className="text-orange-400">Stream</span>
                  </span>
                  <div className="text-xs text-orange-400 font-medium">AI-POWERED</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Available Worldwide</span>
                </div>
              </div>
            </div>
            
            <div className="text-center text-gray-400 text-sm">
              © 2024 FireStream. Transforming entertainment with AI-powered innovation.
              <br />
              <span className="text-orange-400">Built with ❤️ for the future of streaming</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}