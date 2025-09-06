import React, { useState, useEffect } from 'react';
import { ChevronDown, Stethoscope, Shield, Clock, Users, Star, ArrowRight, Menu, X, CheckCircle, Phone, Mail, MapPin, User, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Smart OCR Technology',
    desc: 'Extract structured data from prescriptions using advanced AI-powered optical character recognition.',
    icon: <Stethoscope className="w-6 h-6" />
  },
  {
    title: 'Medication Reminders',
    desc: 'Stay on track with intelligent schedule adherence tracking and personalized notifications.',
    icon: <Clock className="w-6 h-6" />
  },
  {
    title: 'Real-time Chat',
    desc: 'Connect with healthcare providers instantly through our secure messaging platform.',
    icon: <Users className="w-6 h-6" />
  },
  {
    title: 'Role-Based Access',
    desc: 'Tailored workflows for patients, doctors, and administrators with secure data management.',
    icon: <Shield className="w-6 h-6" />
  }
];

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Cardiologist",
    content: "MediTrack has revolutionized how I manage patient prescriptions. The OCR technology is incredibly accurate.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Patient",
    content: "I never miss my medications anymore. The reminders are perfect and the interface is so easy to use.",
    rating: 5
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Family Physician",
    content: "The real-time chat feature has improved my patient communication tremendously. Highly recommended!",
    rating: 5
  }
];

const stats = [
  { number: "50K+", label: "Active Users" },
  { number: "99.9%", label: "Uptime" },
  { number: "24/7", label: "Support" },
  { number: "150+", label: "Healthcare Partners" }
];

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLoginDropdown && !event.target.closest('.login-dropdown')) {
        setShowLoginDropdown(false);
      }
      if (showRoleModal && !event.target.closest('.role-modal')) {
        setShowRoleModal(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLoginDropdown, showRoleModal]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    console.log('Get Started clicked!');
    setShowRoleModal(true);
  };

  const handleScheduleDemo = () => {
    console.log('Schedule Demo clicked!');
    scrollToSection('contact');
  };

  const handleStartTrial = () => {
    console.log('Start Trial clicked!');
    setShowRoleModal(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    if (contactForm.name.trim().length < 2) {
      setSubmitMessage('Name must be at least 2 characters long.');
      setIsSubmitting(false);
      return;
    }
    
    if (contactForm.message.trim().length < 10) {
      setSubmitMessage('Message must be at least 10 characters long.');
      setIsSubmitting(false);
      return;
    }
    
    if (contactForm.message.trim().length > 1000) {
      setSubmitMessage('Message must be less than 1000 characters.');
      setIsSubmitting(false);
      return;
    }

    console.log('Submitting contact form:', contactForm);

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (response.ok && data.success) {
        setSubmitMessage('Thank you for your message! We will get back to you soon.');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map(error => error.msg).join(', ');
          setSubmitMessage(`Please fix the following: ${errorMessages}`);
        } else {
          setSubmitMessage(data.message || 'Failed to send message. Please try again.');
        }
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', { name, value, currentForm: contactForm });
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-primary/10 dark:border-primary/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                MediTrack
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="hover:text-primary transition-colors font-medium">Home</button>
              <button onClick={() => scrollToSection('about')} className="hover:text-primary transition-colors font-medium">About</button>
              <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors font-medium">Features</button>
              <button onClick={() => scrollToSection('testimonials')} className="hover:text-primary transition-colors font-medium">Testimonials</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-primary transition-colors font-medium">Contact</button>
              <div className="relative login-dropdown">
                <button 
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showLoginDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showLoginDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 py-2 z-50">
                    <Link 
                      to="/auth?role=admin" 
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setShowLoginDropdown(false)}
                    >
                      <Shield className="w-4 h-4 text-red-500" />
                      <span>Admin Login</span>
                    </Link>
                    <Link 
                      to="/auth?role=doctor" 
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setShowLoginDropdown(false)}
                    >
                      <Stethoscope className="w-4 h-4 text-blue-500" />
                      <span>Doctor Login</span>
                    </Link>
                    <Link 
                      to="/auth?role=patient" 
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setShowLoginDropdown(false)}
                    >
                      <User className="w-4 h-4 text-green-500" />
                      <span>Patient Login</span>
                    </Link>
                  </div>
                )}
              </div>

              <button 
                onClick={handleGetStarted}
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-105 font-medium"
              >
                Get Started
              </button>
            </div>
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
            </button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-primary/10 dark:border-primary/20 shadow-xl">
              <div className="flex flex-col space-y-4 px-6 py-8">
                <button onClick={() => scrollToSection('home')} className="text-left hover:text-primary transition-colors font-medium py-2">Home</button>
                <button onClick={() => scrollToSection('about')} className="text-left hover:text-primary transition-colors font-medium py-2">About</button>
                <button onClick={() => scrollToSection('features')} className="text-left hover:text-primary transition-colors font-medium py-2">Features</button>
                <button onClick={() => scrollToSection('testimonials')} className="text-left hover:text-primary transition-colors font-medium py-2">Testimonials</button>
                <button onClick={() => scrollToSection('contact')} className="text-left hover:text-primary transition-colors font-medium py-2">Contact</button>

                <div className="border-t border-slate-200 dark:border-slate-600 pt-4 mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-3">Login Options:</p>
                  <div className="space-y-2">
                    <Link 
                      to="/auth?role=admin" 
                      className="flex items-center space-x-3 py-2 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4 text-red-500" />
                      <span>Admin Login</span>
                    </Link>
                    <Link 
                      to="/auth?role=doctor" 
                      className="flex items-center space-x-3 py-2 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Stethoscope className="w-4 h-4 text-blue-500" />
                      <span>Doctor Login</span>
                    </Link>
                    <Link 
                      to="/auth?role=patient" 
                      className="flex items-center space-x-3 py-2 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4 text-green-500" />
                      <span>Patient Login</span>
                    </Link>
                  </div>
                </div>

                <button 
                  onClick={handleGetStarted}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-full hover:shadow-lg transition-all w-fit font-medium"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:via-transparent dark:to-primary/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%235f6fff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative text-center px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12 text-left lg:text-left">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/20 dark:border-primary/30">
                  <span className="text-primary dark:text-primary/90 font-semibold text-sm">🏥 Trusted by 50,000+ Healthcare Providers</span>
                </div>
                
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent drop-shadow-sm">
                    MediTrack
                  </span>
                </h1>
                
                <p className="text-2xl md:text-3xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-2xl">
                  Smart prescription management, adherence insights and collaborative care for the digital age
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <button 
                  onClick={handleGetStarted}
                  className="group px-12 py-6 bg-gradient-to-r from-primary to-primary/90 text-white rounded-2xl text-xl font-bold hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:scale-105 flex items-center space-x-4 shadow-xl"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="px-12 py-6 border-2 border-primary/30 dark:border-primary/50 text-primary dark:text-primary/90 rounded-2xl text-xl font-bold hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center space-x-4 shadow-lg hover:shadow-xl"
                >
                  <span>Learn More</span>
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center space-x-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Join 50K+ users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">4.9/5 Rating</span>
                </div>
              </div>
            </div>
            <div className="relative lg:block">
              <div className="relative w-full h-[600px] bg-gradient-to-br from-primary/10 via-primary/5 to-primary/15 dark:from-primary/20 dark:via-primary/10 dark:to-primary/25 rounded-3xl border border-primary/20 dark:border-primary/30 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-8">
                    <div className="relative">
                      <div className="w-48 h-48 mx-auto bg-gradient-to-b from-primary/30 to-primary/50 dark:from-primary/40 dark:to-primary/60 rounded-full flex items-end justify-center overflow-hidden shadow-2xl">
                        <div className="w-32 h-40 bg-gradient-to-b from-primary/60 to-primary/80 dark:from-primary/70 dark:to-primary/90 rounded-t-full"></div>
                      </div>
                      <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-700">
                          <Stethoscope className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -top-20 -left-16 w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-white text-xl">💊</span>
                      </div>
                      <div className="absolute -top-16 right-8 w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-300">
                        <span className="text-white text-lg">🏥</span>
                      </div>
                      <div className="absolute top-8 -right-12 w-14 h-14 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-700">
                        <span className="text-white text-xl">❤️</span>
                      </div>
                      <div className="absolute top-16 -left-8 w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-1000">
                        <span className="text-white text-sm">📋</span>
                      </div>
                    </div>

                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-bold text-primary dark:text-primary/90">Dr. Sarah Johnson</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Chief Medical Officer</p>
                      <div className="px-6 py-3 bg-white/80 dark:bg-slate-800/80 rounded-full border border-primary/20 dark:border-primary/30 backdrop-blur-sm">
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">"MediTrack has revolutionized our patient care"</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-8 left-8 w-4 h-4 bg-primary/20 dark:bg-primary/30 rounded-full animate-ping"></div>
                <div className="absolute bottom-12 right-12 w-6 h-6 bg-primary/25 dark:bg-primary/35 rounded-full animate-ping delay-500"></div>
                <div className="absolute top-1/2 left-4 w-3 h-3 bg-primary/15 dark:bg-primary/25 rounded-full animate-ping delay-1000"></div>
              </div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/15 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-r from-primary/15 to-primary/5 dark:from-primary/25 dark:to-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>
          </div>
        </div>
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-full blur-2xl animate-pulse delay-300" />
        <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-primary/15 to-primary/5 dark:from-primary/25 dark:to-primary/10 rounded-full blur-lg animate-pulse delay-700" />
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 dark:border-primary/40 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <ChevronDown className="w-6 h-6 text-primary" />
          </div>
        </div>
      </section>
      <section className="py-32 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
              Trusted by Healthcare <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Leaders</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Join thousands of healthcare professionals who rely on MediTrack for better patient outcomes
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="p-8 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-primary/10 dark:via-slate-800 dark:to-primary/20 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/20 dark:hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/20">
                  <div className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">
                    {stat.number}
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 text-lg md:text-xl font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="about" className="py-32 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-primary/10 dark:via-slate-900 dark:to-primary/20 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/20 dark:border-primary/30 mb-8">
                  <span className="text-primary dark:text-primary/90 font-semibold text-sm">🏥 About Our Mission</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight text-slate-900 dark:text-white">
                  Transforming <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Healthcare</span> Together
                </h2>
                <p className="text-2xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  We're revolutionizing healthcare management through innovative technology that bridges the gap between patients and healthcare providers.
                </p>
              </div>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-6 p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-500 border border-slate-100 dark:border-slate-700 hover:border-primary/20 dark:hover:border-primary/30 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white group-hover:text-primary transition-colors">99.9% Accuracy</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">Our advanced OCR technology ensures perfect accuracy in prescription data extraction, reducing medication errors by 95%.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-500 border border-slate-100 dark:border-slate-700 hover:border-primary/20 dark:hover:border-primary/30 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white group-hover:text-primary transition-colors">HIPAA Compliant</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">Bank-level security with end-to-end encryption protects your sensitive health data and maintains patient privacy.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-500 border border-slate-100 dark:border-slate-700 hover:border-primary/20 dark:hover:border-primary/30 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white group-hover:text-primary transition-colors">Patient-Centered</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">Intuitive design focused on patient experience, improving medication adherence rates by 85%.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-[600px] bg-gradient-to-br from-primary/10 via-primary/5 to-primary/15 dark:from-primary/20 dark:via-primary/10 dark:to-primary/25 rounded-3xl flex items-center justify-center border border-primary/20 dark:border-primary/30 shadow-2xl overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 dark:opacity-20">
                    <svg className="w-full h-32" viewBox="0 0 400 100">
                      <path
                        d="M0,50 Q50,20 100,50 T200,50 Q250,80 300,50 T400,50"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        className="text-primary animate-pulse"
                      />
                      <path
                        d="M50,50 L60,30 L70,70 L80,20 L90,50"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-primary animate-pulse delay-300"
                      />
                    </svg>
                  </div>
                  <div className="relative z-10 text-center space-y-12">
                    <div className="relative inline-block">
                      <div className="w-40 h-40 bg-gradient-to-b from-primary/40 to-primary/60 dark:from-primary/50 dark:to-primary/70 rounded-full flex items-end justify-center overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700">
                        <div className="w-28 h-36 bg-gradient-to-b from-primary/70 to-primary/90 dark:from-primary/80 dark:to-primary rounded-t-full"></div>
                      </div>
                      <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                        <span className="text-white text-xl">❤️</span>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-6">
                      <div className="w-20 h-20 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full flex items-end justify-center overflow-hidden shadow-lg border-2 border-white dark:border-slate-700">
                        <div className="w-14 h-18 bg-gradient-to-b from-blue-600 to-blue-800 rounded-t-full"></div>
                      </div>
                      <div className="w-20 h-20 bg-gradient-to-b from-green-400 to-green-600 rounded-full flex items-end justify-center overflow-hidden shadow-lg border-2 border-white dark:border-slate-700">
                        <div className="w-14 h-18 bg-gradient-to-b from-green-600 to-green-800 rounded-t-full"></div>
                      </div>
                      <div className="w-20 h-20 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full flex items-end justify-center overflow-hidden shadow-lg border-2 border-white dark:border-slate-700">
                        <div className="w-14 h-18 bg-gradient-to-b from-purple-600 to-purple-800 rounded-t-full"></div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -top-32 left-16 w-10 h-10 bg-white/90 dark:bg-slate-800/90 rounded-lg flex items-center justify-center shadow-lg animate-bounce">
                        <span className="text-lg">💊</span>
                      </div>
                      <div className="absolute -top-20 right-12 w-8 h-8 bg-white/90 dark:bg-slate-800/90 rounded-lg flex items-center justify-center shadow-lg animate-bounce delay-300">
                        <span className="text-sm">🏥</span>
                      </div>
                      <div className="absolute top-4 -left-16 w-12 h-12 bg-white/90 dark:bg-slate-800/90 rounded-lg flex items-center justify-center shadow-lg animate-bounce delay-700">
                        <span className="text-lg">📋</span>
                      </div>
                    </div>

                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-bold text-primary dark:text-primary/90">Healthcare Team</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Working together for better outcomes</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/15 rounded-full opacity-60 blur-2xl" />
              <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-r from-primary/15 to-primary/5 dark:from-primary/25 dark:to-primary/10 rounded-full opacity-60 blur-3xl" />
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="py-32 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/20 dark:border-primary/30 mb-8">
              <span className="text-primary dark:text-primary/90 font-semibold text-sm">🚀 Powerful Features</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight text-slate-900 dark:text-white">
              Everything You <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Need</span>
            </h2>
            <p className="text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed font-medium">
              Comprehensive tools designed to transform your healthcare management experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="h-full p-10 bg-gradient-to-br from-white via-white to-primary/5 dark:from-slate-800 dark:via-slate-800 dark:to-primary/10 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary/90 transition-colors">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-20 text-center">
            <div className="max-w-4xl mx-auto p-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10 rounded-3xl border border-primary/20 dark:border-primary/30 shadow-xl">
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-3xl">🎯</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">85% Improvement in Medication Adherence</h3>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                Our intelligent reminder system and easy-to-use interface help patients stay on track with their medication schedules, leading to better health outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="testimonials" className="py-32 bg-gradient-to-br from-primary/10 via-white to-primary/5 dark:from-primary/20 dark:via-slate-900 dark:to-primary/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight text-slate-900 dark:text-white">
              What Our <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Users Say</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">Trusted by healthcare professionals and patients worldwide</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group">
                <div className="h-full p-10 bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-500 border border-slate-100 dark:border-slate-700 hover:border-primary/20 dark:hover:border-primary/30 hover:transform hover:scale-105">
                  <div className="flex items-center mb-8">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-primary fill-current" />
                    ))}
                  </div>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-8 font-medium">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white text-lg">{testimonial.name}</div>
                      <div className="text-primary dark:text-primary/90 font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="contact" className="py-32 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight text-slate-900 dark:text-white">
              Get In <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Touch</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">Ready to transform your healthcare management?</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 mb-20">
            <div className="text-center p-10 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-3xl border border-primary/10 dark:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Phone</h3>
              <p className="text-primary dark:text-primary/90 font-semibold text-lg">9987742369</p>
            </div>
            
            <div className="text-center p-10 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-3xl border border-primary/10 dark:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Email</h3>
              <p className="text-primary dark:text-primary/90 font-semibold text-lg">princemaurya8879@gmail.com</p>
            </div>
            
            <div className="text-center p-10 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-3xl border border-primary/10 dark:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Address</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Ghatkopar (W), Mumbai, India</p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSendMessage} className="p-12 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-primary/10 dark:via-slate-800 dark:to-primary/20 rounded-3xl border border-primary/10 dark:border-primary/20 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <input 
                  type="text" 
                  name="name"
                  value={contactForm.name || ''}
                  onChange={handleInputChange}
                  placeholder="Your Name" 
                  required
                  disabled={isSubmitting}
                  className="w-full p-5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary focus:outline-none transition-colors text-lg font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-white disabled:opacity-60"
                />
                <input 
                  type="email" 
                  name="email"
                  value={contactForm.email || ''}
                  onChange={handleInputChange}
                  placeholder="Your Email" 
                  required
                  disabled={isSubmitting}
                  className="w-full p-5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary focus:outline-none transition-colors text-lg font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-white disabled:opacity-60"
                />
              </div>
              <div className="relative">
                <textarea 
                  rows={6} 
                  name="message"
                  value={contactForm.message || ''}
                  onChange={handleInputChange}
                  placeholder="Your Message (minimum 10 characters)" 
                  required
                  disabled={isSubmitting}
                  className="w-full p-5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary focus:outline-none transition-colors text-lg font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-white mb-2 resize-none disabled:opacity-60"
                />
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-right">
                  {contactForm.message.length}/1000 characters
                  {contactForm.message.length < 10 && contactForm.message.length > 0 && (
                    <span className="text-red-500 ml-2">
                      (minimum 10 characters required)
                    </span>
                  )}
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-xl rounded-xl hover:shadow-2xl hover:shadow-primary/25 transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              
              {submitMessage && (
                <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
                  submitMessage.includes('Thank you') 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                }`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
      <section className="py-32 bg-gradient-to-r from-primary via-primary/90 to-primary/80 dark:from-primary/80 dark:via-primary/70 dark:to-primary/60 relative overflow-hidden transition-colors">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-10 text-white leading-tight">
            Ready to Take Control?
          </h2>
          <p className="text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Join thousands of patients and healthcare providers who trust MediTrack for their medication management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={handleStartTrial}
              className="px-12 py-5 bg-white dark:bg-slate-200 text-primary dark:text-primary font-bold text-xl rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-300 transition-colors transform hover:scale-105 shadow-2xl hover:shadow-white/20 dark:hover:shadow-slate-200/20"
            >
              Start Trial
            </button>
            <button 
              onClick={handleScheduleDemo}
              className="px-12 py-5 border-2 border-white dark:border-slate-200 text-white dark:text-slate-200 font-bold text-xl rounded-2xl hover:bg-white dark:hover:bg-slate-200 hover:text-primary dark:hover:text-primary transition-all transform hover:scale-105 backdrop-blur-sm"
            >
              Schedule Demo
            </button>
          </div>
        </div>
        
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </section>
      <footer className="py-16 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-700 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  MediTrack
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Revolutionizing healthcare management through innovative technology and patient-centered design.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors cursor-pointer">
                  <span className="text-primary text-lg">📧</span>
                </div>
                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors cursor-pointer">
                  <span className="text-primary text-lg">📱</span>
                </div>
                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors cursor-pointer">
                  <span className="text-primary text-lg">🌐</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Security</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#about" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">About</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Press</a></li>
                <li><a href="#contact" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Community</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-300 dark:border-slate-700">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-slate-600 dark:text-slate-400">
                © 2025 MediTrack. All rights reserved.
              </div>
              <div className="flex items-center space-x-8">
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Terms of Service</a>
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary/90 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="role-modal bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-slate-200 dark:border-slate-600 relative">
            <button
              onClick={() => setShowRoleModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors z-10"
            >
              <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                  Choose Your Role
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Select how you want to use MediTrack
                </p>
              </div>

              <div className="space-y-4">
                <Link 
                  to="/auth?role=patient"
                  className="block w-full p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 transition-all group hover:shadow-lg"
                  onClick={() => {
                    console.log('Patient role selected');
                    setShowRoleModal(false);
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-green-800 dark:text-green-300 group-hover:text-green-900 dark:group-hover:text-green-200 transition-colors">
                        I'm a Patient
                      </h3>
                      <p className="text-green-600 dark:text-green-400 text-sm">
                        Manage prescriptions and health records
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link 
                  to="/auth?role=doctor"
                  className="block w-full p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all group hover:shadow-lg"
                  onClick={() => {
                    console.log('Doctor role selected');
                    setShowRoleModal(false);
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-blue-200 transition-colors">
                        I'm a Doctor
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 text-sm">
                        Manage patients and prescriptions
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              <button
                onClick={() => {
                  console.log('Cancel clicked');
                  setShowRoleModal(false);
                }}
                className="w-full mt-6 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}