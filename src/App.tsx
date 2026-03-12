import { motion } from 'motion/react';
import { 
  Flame, 
  Wine, 
  Users, 
  Calendar, 
  MapPin, 
  Instagram, 
  ChevronRight, 
  Menu, 
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Events', href: '#events' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/90 backdrop-blur-xl py-4 border-b border-white/5' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#home" className="flex items-center gap-2">
          <img 
            src="https://i.ibb.co/TswVXV9/lit-logo.png" 
            alt="LIT Cigar Lounge Logo" 
            className="h-10 md:h-12 w-auto object-contain brightness-110"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden text-2xl font-serif font-bold tracking-tighter text-white">
            LIT<span className="text-orange-500">.</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="nav-link text-[11px] font-bold tracking-[0.2em] uppercase text-white/70 hover:text-orange-500"
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact" 
            className="bg-orange-500 hover:bg-orange-400 text-black px-8 py-2.5 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
          >
            Reserve
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-navy-900 p-6 flex flex-col gap-4 md:hidden border-t border-white/10"
        >
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white text-lg font-serif"
            >
              {link.name}
            </a>
          ))}
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1920" 
          alt="LIT Cigar Lounge Nightlife" 
          className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        <div className="absolute inset-0 bg-radial-gradient from-orange-500/10 via-transparent to-transparent opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-orange-500 font-bold tracking-[0.4em] uppercase text-[10px] mb-6 block">
            Pittsburgh's Premier Sanctuary
          </span>
          <h1 className="text-6xl md:text-9xl text-white font-bold mb-8 leading-[0.9] tracking-tighter">
            LIT <br />
            <span className="italic font-serif font-light text-orange-500">Lounge</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto mb-12 font-light leading-relaxed tracking-wide">
            Where sophistication meets timeless relaxation. A curated sanctuary for grown adults seeking a refined atmosphere and a truly good time.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <a 
              href="#services" 
              className="bg-orange-500 hover:bg-orange-400 text-black px-12 py-5 font-bold uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2"
            >
              The Collection <ChevronRight size={16} />
            </a>
            <a 
              href="#contact" 
              className="border border-white/20 hover:border-orange-500/50 text-white px-12 py-5 font-bold uppercase text-xs tracking-[0.2em] transition-all"
            >
              Join Us
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-px h-16 bg-gradient-to-b from-orange-500 to-transparent mx-auto opacity-50"></div>
      </motion.div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      icon: <Flame className="text-orange-500" size={28} />,
      title: "Curated Humidor",
      description: "A hand-picked selection of rare and premium cigars from the world's most renowned makers."
    },
    {
      icon: <Wine className="text-orange-500" size={28} />,
      title: "Private Spirits Bar",
      description: "Expertly paired whiskies, cognacs, and craft cocktails to complement your smoking experience."
    },
    {
      icon: <Users className="text-orange-500" size={28} />,
      title: "Exclusive Membership",
      description: "Join a community of high-power professionals with access to private lockers and VIP events."
    },
    {
      icon: <Calendar className="text-orange-500" size={28} />,
      title: "Private Events",
      description: "The perfect venue for corporate gatherings, bachelor parties, or intimate celebrations."
    }
  ];

  return (
    <section id="services" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24">
          <span className="text-orange-500 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Services</span>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">The Offerings</h2>
          <div className="w-12 h-px bg-orange-500"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-10 bg-black hover:bg-zinc-950 transition-all duration-500 group"
            >
              <div className="mb-8 transform group-hover:-translate-y-1 transition-transform duration-500">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-4 tracking-tight">{service.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed font-light">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  const steps = [
    {
      number: "01",
      title: "The Selection",
      description: "Consult with our expert tobacconists to find the perfect cigar for your palate."
    },
    {
      number: "02",
      title: "The Pairing",
      description: "Suggesting a premium spirit that enhances the complex notes of your choice."
    },
    {
      number: "03",
      title: "The Enjoyment",
      description: "Relax in our state-of-the-art lounge designed for an unparalleled experience."
    }
  ];

  return (
    <section className="py-32 bg-zinc-950 text-white overflow-hidden border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <span className="text-orange-500 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The Ritual</span>
            <h2 className="text-5xl md:text-6xl font-bold mb-10 tracking-tighter">Refined Sanctuary</h2>
            <p className="text-white/40 mb-16 text-lg leading-relaxed font-light">
              We believe smoking a cigar is more than just a habit—it's a ritual. 
              Our sanctuary ensures that every visit is a journey of discovery, relaxation, and sophisticated enjoyment.
            </p>
            
            <div className="space-y-16">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-8 items-start">
                  <span className="text-5xl font-serif text-orange-500/20 font-bold leading-none">{step.number}</span>
                  <div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-white/30 text-sm font-light leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&q=80&w=800" 
                alt="Cigar Ritual Nightlife" 
                className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-orange-500 p-12 hidden xl:block shadow-2xl">
              <p className="text-black font-serif font-bold text-3xl italic leading-tight">"The ultimate <br />sanctuary."</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Portfolio = () => {
  const items = [
    { title: "The Main Lounge", category: "Interior", img: "https://i.ibb.co/hRLwCfvD/image.jpg" },
    { title: "Premium Selection", category: "Humidor", img: "https://i.ibb.co/7tNWjBRG/image.jpg" },
    { title: "Evening Atmosphere", category: "Experience", img: "https://i.ibb.co/YFmpZyzC/image.jpg" },
    { title: "Rare Spirits", category: "Bar", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800" },
    { title: "Member Events", category: "Community", img: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=800" },
    { title: "Private Lockers", category: "Membership", img: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=800" },
  ];

  return (
    <section id="events" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <span className="text-orange-500 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Gallery</span>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">The Lifestyle</h2>
            <p className="text-white/40 max-w-md font-light">A glimpse into the refined sanctuary at LIT. From exclusive tastings to sophisticated relaxation with a mature crowd.</p>
          </div>
          <a href="https://www.instagram.com/litcigarloungepgh/" target="_blank" className="flex items-center gap-3 text-orange-500 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors">
            Follow Us <Instagram size={16} />
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="relative group overflow-hidden aspect-[4/5]"
            >
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-75 group-hover:brightness-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-orange-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">{item.category}</span>
                <h3 className="text-white text-2xl font-bold tracking-tight">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <section id="contact" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-32">
          <div>
            <span className="text-orange-500 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Contact</span>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-10 tracking-tighter">The Sanctuary</h2>
            <p className="text-white/40 mb-16 text-lg font-light leading-relaxed">
              Located in the heart of Pittsburgh, LIT is your sanctuary from the city's hustle. 
              Connect with us for reservations or exclusive membership.
            </p>

            <div className="space-y-12">
              <div className="flex gap-8 items-start">
                <div className="bg-zinc-950 p-5 text-orange-500 border border-white/5">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 tracking-tight">Location</h4>
                  <p className="text-white/30 text-sm">Pittsburgh, PA 15222</p>
                </div>
              </div>
              <div className="flex gap-8 items-start">
                <div className="bg-zinc-950 p-5 text-orange-500 border border-white/5">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 tracking-tight">Hours</h4>
                  <p className="text-white/30 text-sm">Mon-Thu: 2PM - 11PM</p>
                  <p className="text-white/30 text-sm">Fri-Sat: 12PM - 1AM</p>
                  <p className="text-white/30 text-sm">Sun: 12PM - 10PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-12 border border-white/5 shadow-2xl">
            {formState === 'success' ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-20"
              >
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-8">
                  <CheckCircle2 size={32} className="text-black" />
                </div>
                <h3 className="text-white text-2xl font-bold mb-4 tracking-tight">Confirmed</h3>
                <p className="text-white/40 text-sm font-light">We will contact you shortly.</p>
                <button 
                  onClick={() => setFormState('idle')}
                  className="mt-10 text-orange-500 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
                >
                  New Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border-b border-white/10 p-0 pb-4 text-white focus:border-orange-500 outline-none transition-all placeholder:text-white/10"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-white/5 border-b border-white/10 p-0 pb-4 text-white focus:border-orange-500 outline-none transition-all placeholder:text-white/10"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">Message</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full bg-white/5 border-b border-white/10 p-0 pb-4 text-white focus:border-orange-500 outline-none transition-all placeholder:text-white/10 resize-none"
                    placeholder="How can we help?"
                  ></textarea>
                </div>
                <button 
                  disabled={formState === 'submitting'}
                  className="w-full bg-orange-500 hover:bg-orange-400 text-black py-5 font-bold uppercase text-[10px] tracking-[0.3em] transition-all disabled:opacity-50"
                >
                  {formState === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-black py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-2">
            <img 
              src="https://i.ibb.co/TswVXV9/lit-logo.png" 
              alt="LIT Cigar Lounge Logo" 
              className="h-12 w-auto mb-8 object-contain brightness-110"
              referrerPolicy="no-referrer"
            />
            <p className="text-white/30 max-w-sm mb-10 font-light leading-relaxed">
              Pittsburgh's premier sanctuary for cigar enthusiasts and professionals. 
              Experience the art of relaxation in an atmosphere of unparalleled sophistication.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-white/30 hover:text-orange-500 transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white/30 hover:text-orange-500 transition-all">
                <Users size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold uppercase tracking-[0.2em] text-[10px] mb-8">Navigation</h4>
            <ul className="space-y-4 text-white/30 text-xs font-bold tracking-widest">
              <li><a href="#home" className="hover:text-orange-500 transition-colors">Home</a></li>
              <li><a href="#services" className="hover:text-orange-500 transition-colors">Services</a></li>
              <li><a href="#events" className="hover:text-orange-500 transition-colors">Events</a></li>
              <li><a href="#contact" className="hover:text-orange-500 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold uppercase tracking-[0.2em] text-[10px] mb-8">Newsletter</h4>
            <p className="text-white/30 text-xs mb-6 font-light">Stay updated with our latest arrivals.</p>
            <div className="flex border-b border-white/10">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-transparent p-3 text-white text-xs outline-none w-full placeholder:text-white/10"
              />
              <button className="text-orange-500 px-2">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-white/10 text-[10px] uppercase tracking-[0.3em] font-bold">
          <p>© 2026 LIT Cigar Lounge Pittsburgh.</p>
          <div className="flex gap-10">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  return (
    <div className="relative">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Process />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
