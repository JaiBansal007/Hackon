"use client";

import { useState, useEffect } from "react";
import { Play, Users, Zap, Target, Star, ArrowRight, Menu, X, ChevronDown, Sparkles, Globe, Shield, Heart, Award, Tv, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();

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
      color: "from-cyan-400 to-blue-500",
      bgColor: "from-cyan-500/20 to-blue-500/20",
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
      color: "from-teal-400 to-cyan-500",
      bgColor: "from-teal-500/20 to-cyan-500/20",
      stats: "30 languages"
    },
    {
      icon: Star,
      title: "Gamified Experience",
      desc: "Earn badges, complete challenges, and unlock exclusive content. Turn watching into an adventure.",
      color: "from-blue-400 to-indigo-500",
      bgColor: "from-blue-500/20 to-indigo-500/20",
      stats: "50+ rewards"
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      avatar: "👩‍💻",
      text: "FireTV completely changed how I discover content. The mood-based recommendations are eerily accurate!",
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
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-transparent to-black/60" />
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-black/90 backdrop-blur-xl border-b border-gray-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* Updated logo style to match sign-in page */}
                <img 
                  src="/logo.jpg" 
                  alt="FireTV" 
                  className="w-10 h-10 rounded-xl shadow-xl object-cover"
                />
              </div>
              <div>
                <span className="text-2xl font-black text-white">
                  Fire
                  <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text">TV</span>
                </span>
                <div className="text-xs text-cyan-400 font-medium">AI-POWERED</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'About', 'Testimonials'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="relative group text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-amber-400 group-hover:w-full transition-all duration-300" />
                </button>
              ))}
              <div className="flex items-center space-x-3 ml-4">
                <button 
                  className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-400 hover:to-blue-400 text-white px-6 py-2.5 rounded-md font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2"
                  onClick={() => navigate('/signin')}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
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
            <div className="md:hidden mt-4 pb-4 border-t border-gray-700/50">
              <div className="flex flex-col space-y-4 pt-4">
                {['Features', 'About', 'Testimonials'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="text-left text-gray-300 hover:text-blue-400 transition-colors font-medium"
                  >
                    {item}
                  </button>
                ))}
                <div className="flex flex-col space-y-2 pt-2">
                  <button
                    className="bg-gradient-to-r from-blue-500 to-blue-500 text-white px-4 py-2 rounded-md font-semibold w-fit flex items-center space-x-2"
                    onClick={() => navigate('/signin')}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 pt-16">
          <div className="text-center max-w-6xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-blue-500/20 border border-blue-500/30 rounded-full px-6 py-3 mb-8">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">Powered by Advanced AI</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                Fire TV Experience
              </span>
            </h1>

            <p className="text-lg md:text-xl mb-12 text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Discover content that matches your <span className="text-blue-400 font-medium">mood</span>, 
              watch with <span className="text-cyan-400 font-medium">friends anywhere</span>, 
              and never miss a beat with <span className="text-violet-400 font-medium">AI-powered summaries</span>.
            </p>

            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button 
                className="group bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-400 hover:to-blue-400 text-white px-10 py-4 rounded-md font-bold text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-2"
                onClick={() => navigate('/signin')}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-gray-600 text-gray-300 hover:border-white hover:text-white px-10 py-4 rounded-md font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2">
                <Tv className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div> */}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="mb-3">
                    <stat.icon className="w-8 h-8 mx-auto text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 bg-gradient-to-b from-black via-gray-900/20 to-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-transparent">
                  Revolutionary Features
                </span>
              </h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                Experience the future of entertainment with cutting-edge AI technology
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Feature showcase */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                      activeFeature === index
                        ? 'bg-gray-800/60 border-blue-500/50 scale-[1.02]'
                        : 'bg-gray-900/30 border-gray-700/30 hover:border-gray-600/50 hover:bg-gray-800/40'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center shadow-lg`}>
                        <feature.icon className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                          <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{feature.stats}</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual showcase */}
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/30">
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tv className="w-12 h-12 text-blue-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gradient-to-r from-blue-400 to-transparent rounded-full w-3/4" />
                    <div className="h-2 bg-gradient-to-r from-cyan-400 to-transparent rounded-full w-1/2" />
                    <div className="h-2 bg-gradient-to-r from-violet-400 to-transparent rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-6 bg-gray-900/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  What Users Say
                </span>
              </h2>
              <p className="text-lg text-gray-400">Join millions who've transformed their viewing experience</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-800/40 p-6 rounded-xl border border-gray-700/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:bg-gray-800/60"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic text-sm leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-6 bg-gradient-to-b from-black via-gray-900/20 to-black">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Built for Everyone
                </span>
              </h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                Whether you're a casual viewer or entertainment enthusiast, FireTV adapts to your unique style
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Casual Viewers",
                  desc: "Just want to unwind after a long day? Our mood detection finds the perfect comfort content for your relaxation time.",
                  icon: "🛋️",
                  color: "from-cyan-500/20 to-blue-500/20",
                  border: "border-cyan-500/30"
                },
                {
                  title: "Busy Binge-Watchers", 
                  desc: "Juggling multiple shows? Smart summaries and personalized queues keep you organized and up-to-date.",
                  icon: "⚡",
                  color: "from-blue-500/20 to-indigo-500/20",
                  border: "border-blue-500/30"
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
                  className={`bg-gradient-to-br ${item.color} p-6 rounded-xl border ${item.border} backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-gray-900/30 via-black to-gray-900/30">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-blue-500/20 border border-blue-500/30 rounded-full px-6 py-3 mb-8">
                <Award className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-cyan-300">Join 2.5M+ Happy Users</span>
              </div>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              Ready to <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Revolutionize</span>
              <br />
              Your Entertainment?
            </h2>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Start your free trial today and discover why millions choose FireTV for their entertainment needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="group bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-400 hover:to-blue-400 text-white px-10 py-4 rounded-md font-bold text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-2"
                onClick={() => navigate('/signin')}
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-gray-600 text-gray-300 hover:border-white hover:text-white px-10 py-4 rounded-md font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2">
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Contact Sales</span> 
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-gray-900/50 border-t border-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                {/* Updated logo style to match sign-in page */}
                <img 
                  src="/logo.jpg" 
                  alt="FireTV" 
                  className="w-10 h-10 rounded-xl shadow-xl object-cover"
                />
                <div>
                  <span className="text-xl font-black text-white">
                    Fire
                    <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text">TV</span>
                  </span>
                  <div className="text-xs text-cyan-400 font-medium">AI-POWERED</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-500">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-500">Available Worldwide</span>
                </div>
              </div>
            </div>
            
            <div className="text-center text-gray-500 text-sm border-t border-gray-800 pt-6">
              © 2024 FireTV. Transforming entertainment with AI-powered innovation.
              <br />
              <span className="text-blue-400">Built with ❤️ for the future of streaming</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}