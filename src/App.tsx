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
  Star,
  Phone
} from 'lucide-react';
import { useState, useEffect, FormEvent, useRef, MouseEvent } from 'react';
import FoodMenu from './FoodMenu';

// --- Components ---

const Navbar = ({ currentPage, setCurrentPage }: { currentPage: string, setCurrentPage: (page: string) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > window.innerHeight - 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: string, hash?: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled || isMobileMenuOpen || currentPage !== 'home' ? 'bg-brand/95 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 flex justify-between items-center relative">
        <div className="flex-none md:flex-1 flex justify-start">
          <div className={`hidden md:flex gap-4 lg:gap-8 text-[12px] lg:text-[15px] font-serif font-semibold transition-colors duration-500 ${isScrolled || currentPage !== 'home' ? 'text-ink/90' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'}`}>
            {[
              { label: 'Drink', target: '#services' },
              { label: 'Food', target: 'food', isPage: true },
              { label: 'Events', target: '#events' },
              { label: 'About', target: '#ritual' }
            ].map((item) => (
              <button 
                key={item.label}
                onClick={() => item.isPage ? handleNavClick(item.target) : handleNavClick('home', item.target)} 
                className="relative group py-1 uppercase tracking-[0.2em] transition-opacity hover:opacity-100 whitespace-nowrap"
              >
                <span className="relative z-10">{item.label}</span>
                <span className={`absolute bottom-0 left-0 w-full h-[1px] transition-transform duration-500 origin-right scale-x-0 group-hover:scale-x-100 group-hover:origin-left ${isScrolled || currentPage !== 'home' ? 'bg-ink/40' : 'bg-white/40'}`} />
              </button>
            ))}
          </div>

          <button 
            className={`md:hidden transition-colors duration-500 ${isScrolled || isMobileMenuOpen || currentPage !== 'home' ? 'text-ink' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <button onClick={() => handleNavClick('home')} className={`absolute md:relative left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 transition-all duration-500 flex-none mx-2 lg:mx-4 ${isScrolled || isMobileMenuOpen || currentPage !== 'home' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <span className="text-[13px] min-[375px]:text-[15px] sm:text-lg md:text-xl lg:text-2xl font-display font-bold tracking-tight text-ink whitespace-nowrap">
            LIT CIGAR LOUNGE
          </span>
        </button>

        <div className="flex-none md:flex-1 flex justify-end items-center gap-3 sm:gap-4 lg:gap-8">
          <a 
            href="tel:4124926902" 
            className={`transition-colors duration-500 flex items-center gap-2 ${isScrolled || isMobileMenuOpen || currentPage !== 'home' ? 'text-ink hover:text-zinc-800' : 'text-white hover:text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'}`}
          >
            <Phone size={18} className="sm:hidden" />
            <span className="hidden sm:block text-[11px] lg:text-[13px] font-serif font-semibold tracking-wider whitespace-nowrap">
              (412) 492-6902
            </span>
          </a>
          <button 
            onClick={() => handleNavClick('home', '#contact')} 
            className="bg-ink text-white px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-[9px] sm:text-[10px] lg:text-[11px] uppercase tracking-widest transition-all hover:bg-zinc-800 whitespace-nowrap"
          >
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Book A Section</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <motion.div 
        initial={false}
        animate={isMobileMenuOpen ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
        className="md:hidden overflow-hidden bg-brand/95 backdrop-blur-md border-b border-white/10"
      >
        <div className="px-8 py-12 flex flex-col gap-8 text-2xl font-serif text-ink">
          <button onClick={() => handleNavClick('home', '#services')} className="text-left uppercase">Drink</button>
          <button onClick={() => handleNavClick('food')} className="text-left uppercase">Food</button>
          <button onClick={() => handleNavClick('home', '#events')} className="text-left uppercase">Events</button>
          <button onClick={() => handleNavClick('home', '#ritual')} className="text-left uppercase">About</button>
        </div>
      </motion.div>
    </nav>
  );
};

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  return (
    <section id="home" className="relative min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden bg-[#fdf2f4]">
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-90"
          poster="https://i.ibb.co/bRCrTGKH/Gemini-Generated-Image-aa3y0zaa3y0zaa3y-1.webp"
        >
          <source src="https://res.cloudinary.com/dwsustie8/video/upload/v1774341059/Gen-4_Turbo_Animate_the_tip_of_the_cigar_and_the_smoke_coming_from_it_to_appear_as_though_it_is_a_real_smoking_cigar_1837837253_1_a9qie3.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1800px] px-4 md:px-8 text-center mt-8 md:mt-0">
        <div className="grid grid-cols-3 items-center mb-8 md:mb-12 border-b border-white/40 pb-6 md:pb-8 w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-end">
            <div className="hidden md:block flex-1 h-px bg-white/40"></div>
            <h2 className="text-xl sm:text-2xl md:text-5xl font-serif italic text-white px-2 sm:px-6 md:px-12 drop-shadow-lg">Cigars</h2>
            <div className="w-6 sm:w-12 md:flex-1 h-px bg-white/40"></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-5xl font-serif italic text-white px-2 sm:px-6 md:px-12 drop-shadow-lg">Drinks</h2>
          </div>
          <div className="flex items-center justify-start">
            <div className="w-6 sm:w-12 md:flex-1 h-px bg-white/40"></div>
            <h2 className="text-xl sm:text-2xl md:text-5xl font-serif italic text-white px-2 sm:px-6 md:px-12 whitespace-nowrap drop-shadow-lg">Live Music</h2>
            <div className="hidden md:block flex-1 h-px bg-white/40"></div>
          </div>
        </div>

        <h1 className="text-[19vw] md:text-[14vw] font-display font-bold leading-[0.85] text-white tracking-tight uppercase drop-shadow-2xl">
          LIT CIGAR LOUNGE
        </h1>
      </div>
    </section>
  );
};

const Services = () => {
  const categories = [
    {
      title: "High Quality Cigars",
      items: [
        { name: "Arturo Fuente", detail: "Rare Opus X Selection" },
        { name: "Davidoff", detail: "White Label Series" },
        { name: "Padrón", detail: "1926 Anniversary" },
      ]
    },
    {
      title: "Food & Drink Specials",
      items: [
        { name: "Craft Cocktails", detail: "Signature Lounge Blends" },
        { name: "Single Malt Scotch", detail: "Curated Global Selection" },
        { name: "Gourmet Bites", detail: "Chef-Inspired Pairings" },
      ]
    },
    {
      title: "Live Bands & Events",
      items: [
        { name: "Live Jazz", detail: "Every Friday & Saturday" },
        { name: "Private Events", detail: "Corporate & Social Bookings" },
        { name: "Member Tastings", detail: "Exclusive Monthly Events" },
      ]
    }
  ];

  return (
    <section id="services" className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1920" 
          alt="Cocktails Selection Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px]"></div>
      </div>
      <div className="relative z-10 max-w-[1800px] mx-auto px-8">
        <div className="grid lg:grid-cols-3 gap-16">
          {categories.map((cat, i) => (
            <div key={i}>
              <span className="text-white/70 text-[11px] uppercase tracking-[0.3em] mb-12 block">{cat.title}</span>
              <div className="space-y-8">
                {cat.items.map((item, j) => (
                  <div key={j} className="flex justify-between items-end border-b border-white/10 pb-4 group cursor-pointer">
                    <div>
                      <h3 className="text-2xl font-serif text-white group-hover:text-orange-500 transition-colors">{item.name}</h3>
                      <p className="text-white/60 text-sm italic">{item.detail}</p>
                    </div>
                    <div className="text-white/50 group-hover:text-orange-500 transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Ritual = () => {
  const images = [
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
    "https://i.ibb.co/JjpCPDcT/litcigarbar1-1.webp",
    "https://i.ibb.co/JWVnnWQ1/ligcigarbar2-1.webp",
    "https://i.ibb.co/KjTQNHVV/Gemini-Generated-Image-hfuac8hfuac8hfua-1.webp"
  ];

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <section id="ritual" className="bg-brand py-20 overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-8">
        <div className="max-w-5xl mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif leading-[1.6] text-ink tracking-tight font-light">
            Lit Cigar Lounge is an upscale destination in Pittsburgh designed for those seeking a sophisticated atmosphere. Located in the Larimer neighborhood, the multi-leveled lounge features a luxury humidor and a modern environment with comfortable seating and specialized ventilation. In addition to a curated selection, the establishment includes a full-service bar with crafted cocktails and premium spirits, along with a kitchen offering a variety of dining options from small bites to filling dinners. With a schedule often featuring live jazz and R&B, the lounge provides a polished space for guests to relax and enjoy a premium experience.
          </h2>
        </div>
      </div>

      <div className="relative flex overflow-hidden">
        <motion.div 
          className="flex gap-8 whitespace-nowrap"
          animate={{
            x: ["0%", "-50%"]
          }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity
          }}
        >
          {duplicatedImages.map((img, i) => (
            <div key={i} className="min-w-[300px] md:min-w-[400px] aspect-[3/4] overflow-hidden">
              <img 
                src={img} 
                alt={`Lounge Detail ${i}`} 
                className="w-full h-full object-cover transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Portfolio = () => {
  return (
    <section id="events" className="py-20 md:py-32 bg-black overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-4 md:gap-0">
          <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tighter uppercase">The Latest</h2>
          <a href="https://www.instagram.com/litcigarloungepgh/" target="_blank" className="text-white/40 text-[10px] md:text-[11px] uppercase tracking-[0.3em] hover:text-white transition-colors">
            Follow @litcigarloungepgh
          </a>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-8">
        <div className="elfsight-app-1b4cc4ee-f3f8-49b5-bc3c-0cec3e73a505" data-elfsight-app-lazy></div>
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
    <section id="contact" className="py-20 bg-brand">
      <div className="max-w-[1800px] mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32">
          <div>
            <h2 className="text-5xl md:text-7xl font-serif text-ink mb-8 md:mb-12 tracking-tighter">Book A Section</h2>
            <p className="text-ink/70 text-lg md:text-xl font-serif leading-relaxed max-w-md">
              Join us for an evening of sophisticated relaxation. For groups larger than 6, please contact us directly.
            </p>
            
            <div className="mt-12 md:mt-20 space-y-6 md:space-y-8 text-ink/90 font-serif">
              <div>
                <h4 className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] mb-2 opacity-40">Location</h4>
                <p className="text-xl md:text-2xl">Pittsburgh, PA 15222</p>
              </div>
              <div>
                <h4 className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] mb-2 opacity-40">Hours</h4>
                <p className="text-xl md:text-2xl">Mon-Thu: 2PM - 11PM</p>
                <p className="text-xl md:text-2xl">Fri-Sat: 12PM - 1AM</p>
              </div>
              <div>
                <h4 className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] mb-2 opacity-40">Phone</h4>
                <a href="tel:4124926902" className="text-xl md:text-2xl hover:text-ink/70 transition-colors">(412) 492-6902</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {formState === 'success' ? (
              <div className="text-center py-20">
                <h3 className="text-3xl md:text-4xl font-serif text-ink mb-4">Confirmed</h3>
                <p className="text-ink/60">We look forward to seeing you.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
                <input 
                  required
                  type="text" 
                  placeholder="Full Name"
                  className="w-full bg-transparent border-b border-ink/20 py-4 text-ink text-xl md:text-2xl font-serif outline-none focus:border-ink transition-colors placeholder:text-ink/20"
                />
                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                  <input 
                    required
                    type="date" 
                    className="w-full bg-transparent border-b border-ink/20 py-4 text-ink text-xl md:text-2xl font-serif outline-none focus:border-ink transition-colors"
                  />
                  <input 
                    required
                    type="time" 
                    className="w-full bg-transparent border-b border-ink/20 py-4 text-ink text-xl md:text-2xl font-serif outline-none focus:border-ink transition-colors"
                  />
                </div>
                <button 
                  disabled={formState === 'submitting'}
                  className="w-full bg-ink text-white py-5 md:py-6 font-display text-xl md:text-2xl uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                  {formState === 'submitting' ? 'Processing...' : 'Request Reservation'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {
  const handleNavClick = (e: MouseEvent, page: string, hash?: string) => {
    e.preventDefault();
    setCurrentPage(page);
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="bg-black py-16">
      <div className="max-w-[1800px] mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-16">
          <div className="max-w-md">
            <h3 className="text-4xl font-display text-white mb-8">LIT CIGAR LOUNGE</h3>
            <p className="text-white/60 font-serif leading-relaxed">
              Pittsburgh's premier sanctuary for cigar enthusiasts and professionals. 
              Experience the art of relaxation in an atmosphere of unparalleled sophistication.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-20">
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.3em] text-white/70 mb-8">Navigation</h4>
              <ul className="space-y-4 font-serif text-white/90">
                <li><a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#services" onClick={(e) => handleNavClick(e, 'home', '#services')} className="hover:text-white transition-colors">Drink</a></li>
                <li><a href="#events" onClick={(e) => handleNavClick(e, 'home', '#events')} className="hover:text-white transition-colors">Events</a></li>
                <li><a href="#ritual" onClick={(e) => handleNavClick(e, 'home', '#ritual')} className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.3em] text-white/70 mb-8">Social</h4>
              <ul className="space-y-4 font-serif text-white/90">
                <li><a href="https://www.instagram.com/litcigarloungepgh/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="https://www.facebook.com/p/Lit-Cigar-Lounge-Pgh-61561142032341/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/10 flex justify-between text-[11px] uppercase tracking-[0.3em] text-white/50">
          <p>© 2026 LIT Cigar Lounge Pittsburgh.</p>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="relative">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main>
        {currentPage === 'home' ? (
          <>
            <Hero />
            <Services />
            <Ritual />
            <Portfolio />
            <Contact />
          </>
        ) : (
          <FoodMenu />
        )}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
