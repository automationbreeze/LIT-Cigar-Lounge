import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Instagram, Play, X } from 'lucide-react';

interface MediaItem {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video';
  format: string;
  width: number;
  height: number;
}

export default function EventsPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const fetchGallery = async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-brand pt-32 pb-20">
      {/* Header Section */}
      <section className="max-w-[1800px] mx-auto px-6 md:px-8 mb-16 md:mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
        >
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-12 bg-ink/30" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-ink/60 font-serif font-bold">Exclusive Access</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-serif text-ink tracking-tighter uppercase leading-[0.9] mb-8">
              Events & <br />
              <span className="text-ink/40 italic">Moments</span>
            </h1>
            <p className="text-lg md:text-xl text-ink/70 font-serif max-w-2xl leading-relaxed">
              A visual chronicle of the exceptional gatherings, private tastings, and unforgettable evenings at LIT Cigar Lounge. 
            </p>
          </div>
          
          <button 
            onClick={() => fetchGallery(true)}
            disabled={loading}
            className="text-[10px] uppercase tracking-[0.3em] text-ink/40 hover:text-ink transition-colors flex items-center gap-2 group disabled:opacity-50"
          >
            <div className={`w-1.5 h-1.5 rounded-full bg-ink/20 group-hover:bg-ink transition-colors ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Gallery'}
          </button>
        </motion.div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-[1800px] mx-auto px-6 md:px-8">
        {media.some(m => m.public_id.startsWith('mock')) && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-[11px] uppercase tracking-widest text-amber-700 font-serif">
              Demo Mode: Showing sample gallery. Please configure Cloudinary credentials to see your uploads.
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-2 border-ink/10 border-t-ink rounded-full animate-spin" />
            <span className="text-[10px] uppercase tracking-widest text-ink/40 font-serif">Curating Gallery...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {media.length > 0 ? (
              media.map((item, i) => (
                <motion.div
                  key={item.public_id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  onClick={() => setSelectedMedia(item)}
                  className="group relative aspect-[4/5] overflow-hidden bg-ink/5 cursor-pointer rounded-sm"
                >
                  {item.resource_type === 'video' ? (
                    <div className="w-full h-full relative">
                      <video 
                        src={item.secure_url} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        muted
                        playsInline
                        onMouseOver={(e) => {
                          const v = e.target as HTMLVideoElement;
                          v.play().catch(() => {}); // Ignore play errors
                        }}
                        onMouseOut={(e) => {
                          const v = e.target as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={item.secure_url} 
                      alt={`Event moment ${i}`}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1 font-serif">
                      {item.resource_type === 'video' ? 'Video' : 'Photography'}
                    </span>
                    <div className="h-[1px] w-8 bg-white/30 mb-2" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center border border-ink/10 rounded-xl">
                <Calendar className="w-12 h-12 text-ink/10 mx-auto mb-4" />
                <p className="text-ink/40 font-serif italic">No moments captured yet. Check back soon.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-[100] bg-brand/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            className="absolute top-8 right-8 text-ink/60 hover:text-ink transition-colors"
            onClick={() => setSelectedMedia(null)}
          >
            <X size={32} />
          </button>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-6xl w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.resource_type === 'video' ? (
              <video 
                src={selectedMedia.secure_url} 
                controls 
                autoPlay 
                className="max-w-full max-h-full shadow-2xl rounded-sm"
              />
            ) : (
              <img 
                src={selectedMedia.secure_url} 
                alt="Selected moment" 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                referrerPolicy="no-referrer"
              />
            )}
          </motion.div>
        </div>
      )}

      {/* Instagram CTA */}
      <section className="max-w-[1800px] mx-auto px-6 md:px-8 mt-32">
        <div className="bg-ink text-white p-12 md:p-20 rounded-sm flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Follow the Journey</h2>
            <p className="text-white/60 font-serif text-lg max-w-xl">
              Get real-time updates on upcoming events, new arrivals, and special announcements directly on our social channels.
            </p>
          </div>
          <a 
            href="https://www.instagram.com/litcigarloungepgh/" 
            target="_blank" 
            className="flex items-center gap-4 px-8 py-4 bg-white text-ink font-display uppercase tracking-widest hover:bg-zinc-200 transition-all group"
          >
            <Instagram className="w-5 h-5" />
            <span>litcigarloungepgh</span>
          </a>
        </div>
      </section>
    </div>
  );
}
