import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Lock,
  Unlock,
  Check,
  Loader2,
  X,
  ChevronRight,
  Eye,
  Archive,
  Briefcase,
  User,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Mail,
  Sliders,
  DollarSign,
  FileText,
  Instagram
} from 'lucide-react';
import { Project, ArchiveItem, Capability, StudioInfo, TeamMember, SocialPost, SocialLink, ContactSubmission, ProjectMedia, Category } from './types';
import { api } from './utils/api';

export default function App() {
  // Intro Loading Sequence States
  const [introPercent, setIntroPercent] = useState(0);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [introOutro, setIntroOutro] = useState(false);

  // App Content States
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [archive, setArchive] = useState<ArchiveItem[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [studioInfo, setStudioInfo] = useState<StudioInfo | null>(null);
  const [manifesto, setManifesto] = useState<string[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  
  // UI Interaction States
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ project: Project; type: 'DETAILS' | 'SPECIFICATION' } | null>(null);
  const [archiveFilter, setArchiveFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactType, setContactType] = useState('CLIENT');
  const [contactBudget, setContactBudget] = useState('€50k - €100k');
  const [contactDescription, setContactDescription] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Admin Mode States
  const [adminActive, setAdminActive] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Work section popup trigger
  const [showWorkPopup, setShowWorkPopup] = useState(false);
  const workMarkerRef = useRef<HTMLDivElement | null>(null);
  const [popupProgress, setPopupProgress] = useState(0); // 0..1 intersection progress
    
    // Observe the work marker to show popup when scrolled into view
    useEffect(() => {
      const section = document.getElementById('work');
      if (!section) return;
      const thresholds = Array.from({ length: 101 }, (_, i) => i / 100);
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const ratio = Math.max(0, Math.min(1, entry.intersectionRatio));
            setPopupProgress(ratio);
            if (ratio > 0.04) {
              setShowWorkPopup(true);
            } else {
              setShowWorkPopup(false);
            }
          });
        },
        { threshold: thresholds }
      );
      observer.observe(section);
      return () => observer.disconnect();
    }, []);
  // Admin CMS States
  const [adminTab, setAdminTab] = useState<'PROJECTS' | 'CONTACTS'>('PROJECTS');
  const [adminProjects, setAdminProjects] = useState<Project[]>([]);
  const [adminContacts, setAdminContacts] = useState<ContactSubmission[]>([]);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isCmsActionLoading, setIsCmsActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // GMT+3 ticking clock
  useEffect(() => {
    const updateClock = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Europe/Moscow', // GMT+3
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      try {
        const formatter = new Intl.DateTimeFormat('en-US', options);
        setCurrentTime(formatter.format(new Date()));
      } catch (e) {
        // Fallback
        const d = new Date();
        const utc3 = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + (3 * 3600000));
        const hh = String(utc3.getHours()).padStart(2, '0');
        const mm = String(utc3.getMinutes()).padStart(2, '0');
        const ss = String(utc3.getSeconds()).padStart(2, '0');
        setCurrentTime(`${hh}:${mm}:${ss}`);
      }
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const [scrollY, setScrollY] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Scroll tracking for cinematic void reveal
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for playing/pausing the showreel video when visible
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoElement.play().catch((err) => {
              console.log("Autoplay handshake prevented or queued:", err);
            });
          } else {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(videoElement);
    return () => {
      if (videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, []);

  // 1. Intro Loading simulation on mount
  useEffect(() => {
    const timer = setInterval(() => {
      setIntroPercent((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Start cinematic fade-out of loading screen
          setTimeout(() => setIntroOutro(true), 600);
          setTimeout(() => setIntroCompleted(true), 1200);
          return 100;
        }
        // Random incremental hops
        const increment = Math.floor(Math.random() * 15) + 5;
        return Math.min(100, prev + increment);
      });
    }, 120);

    return () => clearInterval(timer);
  }, []);

  // 2. Fetch all site data dynamically from the API v1 endpoints
  const loadSiteData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const [
        projs,
        featProjs,
        arch,
        caps,
        studio,
        manif,
        tm,
        posts,
        links
      ] = await Promise.all([
        api.getProjects(),
        api.getFeaturedProjects(),
        api.getArchive(),
        api.getCapabilities(),
        api.getStudio(),
        api.getManifesto(),
        api.getTeam(),
        api.getSocialPosts(),
        api.getSocialLinks()
      ]);

      setProjects(projs);
      setFeaturedProjects(featProjs);
      setArchive(arch);
      setCapabilities(caps);
      setStudioInfo(studio);
      setManifesto(manif);
      setTeam(tm);
      setSocialPosts(posts);
      setSocialLinks(links);
    } catch (err: any) {
      console.error('Error loading portfolio assets:', err);
      setErrorState(err.message || 'The connection to Shadow Bureau servers was interrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (introCompleted) {
      loadSiteData();
    }
  }, [introCompleted]);

  // Fetch admin content when admin is authenticated
  const loadAdminData = async () => {
    try {
      const [cmsProjects, cmsContacts] = await Promise.all([
        api.admin.getProjects(),
        api.admin.getContacts()
      ]);
      setAdminProjects(cmsProjects);
      setAdminContacts(cmsContacts);
    } catch (err: any) {
      setAdminError('Failed to synchronize CMS data stream: ' + err.message);
    }
  };

  useEffect(() => {
    if (adminAuthenticated) {
      loadAdminData();
    }
  }, [adminAuthenticated]);

  // Handle Contact Form Submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError(null);
    try {
      await api.submitContact({
        name: contactName,
        email: contactEmail,
        projectType: contactType,
        budget: contactBudget,
        description: contactDescription
      });
      setContactSuccess(true);
      // Reset form
      setContactName('');
      setContactEmail('');
      setContactDescription('');
    } catch (err: any) {
      setContactError(err.message || 'Transmission failed. Verify server routes.');
    } finally {
      setContactSubmitting(false);
    }
  };

  // Authenticate Admin Panel (simple demonstrator key "shadow")
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (adminPassword.toLowerCase() === 'shadow') {
      setAdminAuthenticated(true);
      setAdminError(null);
    } else {
      setAdminError('INCORRECT ACCESS PROTOCOL CREDENTIALS.');
    }
  };

  // Toggle submission status
  const handleToggleContactStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'NEW' ? 'REVIEWED' : currentStatus === 'REVIEWED' ? 'ARCHIVED' : 'NEW';
    try {
      await api.admin.updateContact(id, nextStatus);
      // Refresh admin list
      loadAdminData();
    } catch (err: any) {
      alert('Failed to update submission status: ' + err.message);
    }
  };

  // Initialize a new blank project in CMS
  const handleInitNewProject = () => {
    setEditingProject({
      title: 'New Spatial Project',
      description: 'Speculative draft project detailing modern cinematic systems.',
      year: new Date().getFullYear(),
      projectType: 'CLIENT',
      status: 'DRAFT',
      featured: false,
      client: 'Avant-Garde Client',
      location: 'Paris // Berlin',
      objective: 'Core visual objective and space parameters.',
      approach: 'Creative direction approach and concept structures.',
      execution: 'Detailed logistical execution and tech stack.',
      results: 'Key results, physical exhibition count, and media outputs.',
      accentColor: '#FFFFFF',
      media: [
        { id: 'm-1', url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1200', type: 'IMAGE', isCover: true, altText: 'Default installation visual cover' }
      ],
      categories: [
        { id: 'cat-1', name: 'Spatial Curation', slug: 'spatial-curation' }
      ],
      capabilities: [
        { id: 'cap-1', name: 'Creative Direction', description: 'Concept development and scripting' }
      ]
    });
  };

  // Save project edits (Create or Update)
  const handleSaveProject = async () => {
    if (!editingProject?.title) {
      alert('A project title is strictly required.');
      return;
    }
    setIsCmsActionLoading(true);
    try {
      if (editingProject.id) {
        // Update
        await api.admin.updateProject(editingProject.id, editingProject as Project);
      } else {
        // Create
        await api.admin.createProject(editingProject as Omit<Project, 'id' | 'slug'>);
      }
      setEditingProject(null);
      // Refresh both admin data and main page listings
      await Promise.all([loadSiteData(), loadAdminData()]);
    } catch (err: any) {
      alert('CMS transaction error: ' + err.message);
    } finally {
      setIsCmsActionLoading(false);
    } 
  };

  // Delete project via CMS
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to purge this project from the database?')) return;
    try {
      await api.admin.deleteProject(id);
      await Promise.all([loadSiteData(), loadAdminData()]);
    } catch (err: any) {
      alert('purge failed: ' + err.message);
    }
  };

  // Helper to get cover media URL
  const getCoverUrl = (proj: Project) => {
    // Use a local generated image for specific project replacement when present
    if (proj.slug === 'chronostasis') {
      return '/Gemini_Generated_Image_kyz06dkyz06dkyz0.png';
    }
    if (proj.slug === 'neural-monolith') {
      return '/Gemini_Generated_Image_epxf6eepxf6eepxf.png';
    }
    const cover = proj.media.find(m => m.isCover);
    return cover ? cover.url : 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200';
  };

  // Filtering for archive
  const filteredArchive = archive.filter(item => {
    if (archiveFilter === 'ALL') return true;
    return item.projectType === archiveFilter;
  });

  // -------------------------------------------------------------
  // RENDER INTERACTIVE LOBBY / INTRO LOADING
  // -------------------------------------------------------------
  if (!introCompleted) {
    return (
      <div 
        className={`fixed inset-0 bg-[#020202] text-white flex flex-col justify-between p-8 md:p-16 z-[99999] transition-all duration-[1000ms] ease-in-out ${introOutro ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'}`}
        id="loading-screen"
      >
        {/* Cinematic Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Top bar info */}
        <div className="flex justify-between items-start font-mono text-[9px] text-zinc-500 tracking-[0.3em] uppercase relative z-10">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>SHADOW BUREAU // LINK DETECTED</span>
          </div>
          <span>SYSTEM VER: 9.84.C</span>
        </div>

        {/* Centered Premium Content */}
        <div className="my-auto max-w-xl space-y-8 relative z-10 mx-auto text-center md:text-left md:mx-0">
          <div className="space-y-4">
            <span className="font-mono text-[9px] text-zinc-600 tracking-[0.4em] uppercase block">
              INITIALIZING INTERFACE CODES
            </span>
            <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tighter text-white uppercase select-none leading-none">
              SHADOW<sup className="text-lg text-zinc-500 font-serif font-light">BUREAU</sup>
            </h1>
          </div>

          <div className="space-y-2 max-w-md">
            <p className="font-mono text-[10px] text-zinc-400 tracking-widest leading-relaxed">
              {introPercent < 30 ? "REGULATING VOLUMETRIC GRID METRICS..." :
               introPercent < 60 ? "DECRYPTING CINEMATIC CORE ASSETS..." :
               introPercent < 90 ? "OPTIMIZING INDIVIDUALITY PARADIGMS..." :
               "HANDSHAKE COMPLETE. STAND BY FOR DESCENT."}
            </p>
            <div className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
              [ SECURE_PORT: 3000 // STATUS: {introPercent}% ]
            </div>
          </div>
        </div>

        {/* Bottom Bar: Loading percentage & Tech metrics */}
        <div className="flex justify-between items-end relative z-10 border-t border-neutral-900/60 pt-6">
          <div className="font-mono text-zinc-500 text-[9px] tracking-widest space-y-1.5 uppercase text-left">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span>SECURE_SHELL_TUNNEL: ACTIVE</span>
            </div>
            <div>LATENCY: COMPILING GRID_9 FRAMEWORK</div>
          </div>
          
          <div className="flex flex-col items-end gap-1 font-mono">
            <span className="text-[10px] text-zinc-600 tracking-widest uppercase">LOADING MATRIX</span>
            <span className="text-5xl md:text-7xl font-sans font-black text-white leading-none tracking-tighter tabular-nums">
              {String(introPercent).padStart(3, '0')}
            </span>
          </div>
        </div>

        {/* Custom minimalist loading bar at the absolute bottom edge */}
        <div className="absolute bottom-0 left-0 h-[3px] bg-neutral-900 w-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300 shadow-[0_0_8px_#ffffff]"
            style={{ width: `${introPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-[#f5f5f5] selection:bg-neutral-800 selection:text-white flex flex-col relative scanlines geo-grid">
      {/* Background Decorative Gradient grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-950/40 via-[#030303]/90 to-[#030303] pointer-events-none" />

      {/* -------------------------------------------------------------
          EDITORIAL HEADER
         ------------------------------------------------------------- */}
      {/* -------------------------------------------------------------
          EDITORIAL HEADER WITH TICKING CLOCK & MENU TRIGGER
         ------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-[#020202]/95 border-b border-neutral-950 px-6 md:px-12 py-5 flex justify-between items-center transition-all duration-300 font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
        <a href="#hero" className="flex items-center gap-3 group text-white">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-neutral-800 flex-shrink-0 relative">
            <img 
              src="/Gosavi.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-sans text-xs font-black tracking-tighter text-white">
            SHADOW BUREAU
          </span>
        </a>

        {/* Elegant Menu Toggle */}
        <button 
          onClick={() => setMenuOpen(true)}
          className="text-zinc-300 hover:text-white font-mono text-[10px] font-bold tracking-[0.25em] flex items-center gap-2 cursor-pointer transition-colors ml-auto"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          ● MENU
        </button>
      </header>

      {/* Fullscreen Premium Overlay Menu */}
      {menuOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#020202] z-[9999] p-8 md:p-16 flex flex-col justify-between"
          id="fullscreen-menu-overlay"
        >
          {/* Top Bar matching header */}
          <div className="flex justify-between items-center font-mono text-[10px] text-zinc-500 tracking-widest">
            <span className="text-white font-bold">SHADOW BUREAU // INDEX</span>
            <button 
              onClick={() => setMenuOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer uppercase tracking-[0.3em]"
            >
              [ CLOSE ✕ ]
            </button>
          </div>

          {/* Large display links in the center */}
          <div className="my-auto max-w-4xl space-y-8">
            <span className="font-mono text-[9px] text-zinc-600 tracking-[0.4em] uppercase block border-b border-neutral-900 pb-3">
              SYSTEM DIRECTORY // COORDINATE NODES
            </span>
            <nav className="space-y-4">
              {[
                { label: "SELECTED WORK", href: "#work", num: "01" },
                { label: "THE STUDIO MANIFESTO", href: "#about", num: "02" },
                { label: "CONTACT HANDSHAKE", href: "#contact", num: "03" },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-baseline gap-6 py-2 border-b border-neutral-950 hover:border-neutral-850 transition-colors"
                >
                  <span className="font-mono text-[11px] text-zinc-600 group-hover:text-white transition-colors">{item.num}</span>
                  <span className="text-3xl sm:text-5xl font-sans font-black tracking-tighter text-zinc-400 group-hover:text-white transition-all uppercase leading-none">
                    {item.label}
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* Bottom Bar metrics */}
          <div className="border-t border-neutral-900/60 pt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 font-mono text-[9px] text-zinc-600 tracking-widest uppercase">
            <div>
              LATENCY: 12MS // ENVIRONMENT_STABLE
            </div>
            <div>
              CODENAME: DESCENT // DEVELOPER EDITION
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 space-y-24 py-12 relative z-10">

        {/* -------------------------------------------------------------
            ERROR STATE HERO NOTIFICATION
           ------------------------------------------------------------- */}
        {errorState && (
          <div className="bg-red-950/30 border border-red-900/40 p-6 rounded-2xl text-center space-y-2 max-w-2xl mx-auto my-12">
            <h3 className="font-serif text-lg font-bold text-red-400">SERVER OFFSYNC</h3>
            <p className="text-xs text-zinc-400 font-mono">{errorState}</p>
            <button
              onClick={loadSiteData}
              className="mt-2 text-xs font-mono bg-red-950 border border-red-800 text-white px-4 py-2 rounded hover:bg-red-900"
            >
              RE-ESTABLISH HANDSHAKE
            </button>
          </div>
        )}

        {/* -------------------------------------------------------------
            GRID9 THEMED CINEMATIC SCROLL REVEAL HERO SECTION
           ------------------------------------------------------------- */}
        <section id="hero" className="relative h-[200vh] w-full bg-[#020202] -mx-6 md:-mx-12 px-6 md:px-12 overflow-visible">
          {/* Sticky Viewport */}
          <div className="sticky top-[100px] left-0 w-full h-[85vh] overflow-hidden flex flex-col justify-between py-10 z-10">
            
             {/* 1. Skyscraper Background Image (Gets brighter on scroll down) */}
             <div className="absolute inset-0 z-0 bg-[#020202]">
               <img 
                 src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1920&auto=format&fit=crop"
                 alt="Skyscraper Skyline Background"
                 className="w-full h-full object-cover"
                 style={{
                   opacity: Math.min(1.0, 0.5 + (scrollY / 400)),
                   filter: `brightness(${Math.min(1.0, 0.35 + (scrollY / 450))}) contrast(1.15)`,
                   transform: `scale(${1 + (scrollY * 0.00015)}) translateY(${scrollY * 0.04}px)`,
                   transition: 'opacity 0.1s ease-out, filter 0.1s ease-out'
                 }}
                 referrerPolicy="no-referrer"
               />
              {/* Radial vignette / cinematic depth fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-black/20 to-[#020202]/90" />
            </div>

            {/* 2. Top bar inside hero viewport: Title & Coordinates overlay */}
            <div className="relative z-10 w-full flex justify-between items-start">
              <div className="space-y-4">
                <h1 
                  className="text-[9vw] sm:text-[7vw] font-sans font-black tracking-tighter leading-none text-white select-none relative -left-1 uppercase"
                  style={{
                    transform: `translateY(${scrollY * -0.1}px)`,
                    transition: 'transform 0.1s ease-out'
                  }}
                >
                  Shadow Bureau
                </h1>

                {/* Minimal Square Plus Button */}
                <div 
                  className="flex"
                  style={{
                    transform: `translateY(${scrollY * -0.05}px)`,
                    transition: 'transform 0.1s ease-out'
                  }}
                >
                  <a 
                    href="#work"
                    className="w-10 h-10 border border-neutral-850 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all text-zinc-400 group cursor-pointer bg-[#020202]/40 backdrop-blur-sm"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  </a>
                </div>
              </div>

              {/* System coordinates & clock metadata (Right Side) - Removed to clean up layout as requested */}
            </div>

            {/* 3. Bottom left of the viewport initially: DISCUSS PROJECT link */}
            <div 
              className="absolute bottom-10 left-0 z-20 flex flex-col font-mono text-[10px] tracking-widest text-zinc-400 uppercase transition-all duration-700"
              style={{
                opacity: Math.max(0, 1 - (scrollY / 180)),
                transform: `translateY(${scrollY * 0.15}px)`
              }}
            >
              <a 
                href="#contact" 
                className="hover:text-white font-bold flex items-center gap-2 border-b border-zinc-800 pb-1 group"
              >
                DISCUSS PROJECT <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>

            {/* 4. Bottom right of the viewport initially: Scroll indicator & Projects tag */}
            <div 
              className="absolute bottom-10 right-0 z-20 flex flex-col items-end font-mono text-[10px] tracking-widest text-zinc-400 uppercase transition-all duration-700"
              style={{
                opacity: Math.max(0, 1 - (scrollY / 180)),
                transform: `translateY(${scrollY * 0.15}px)`
              }}
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-ping" />
                <span>● PROJECTS [01]</span>
              </div>
              <span className="text-zinc-600 animate-bounce mt-2 text-[10px]">↓ SCROLL TO INITIATE REVEAL</span>
            </div>

            {/* 5. Lower Content Row: Slogans & Links (Pops in and becomes solid on scroll) */}
            <div 
              className="relative z-10 w-full border-t border-neutral-900/60 pt-8 bg-gradient-to-t from-black/60 to-transparent transition-all duration-500"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollY - 200) / 300)),
                transform: `translateY(${Math.max(0, 50 - (scrollY - 200) * 0.1)}px)`
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                {/* Large Slogans */}
                <div className="lg:col-span-7 space-y-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-sans font-extrabold text-white leading-snug tracking-tight uppercase">
                    WE CREATE DIGITAL SYSTEMS THAT CONVEY RAW AESTHETICS, EXPRESS UNIQUE INDIVIDUALITY, AND LEAVE A POWERFUL, UNFORGETTABLE IMPRESSION.
                  </h2>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-2xl font-serif italic">
                    We engineer digital frameworks that communicate raw aesthetic value, outline architectural individuality, and evoke unforgettable conceptual impressions.
                  </p>
                </div>

                {/* Side column description */}
                <div className="lg:col-span-3 space-y-3 font-sans text-[10px] sm:text-xs leading-relaxed text-zinc-500">
                  <p className="uppercase">
                    WE EMPOWER VISIONARY BRANDS TO FIND A RECOGNIZABLE IDENTITY IN THE DIGITAL REALM. OUR PRACTICE IS A MATURED BALANCE OF RAW UTILITY AND BOLD VISUAL STATEMENT.
                  </p>
                  <p className="text-[10px] font-mono uppercase text-zinc-600">
                    Architectural balance between custom code and visual poetry.
                  </p>
                </div>

                {/* Clickable Works Link Column */}
                <div className="lg:col-span-2 flex justify-start lg:justify-end">
                  <a 
                    href="#work" 
                    className="font-mono text-[10px] text-white hover:text-zinc-400 flex items-center gap-2 border-b border-white pb-1 group tracking-wider uppercase font-bold"
                  >
                    Our Works <span className="inline-block group-hover:translate-y-1 transition-transform duration-300">↓</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* -------------------------------------------------------------
            SELECTED WORK (Featured Projects from API)
           ------------------------------------------------------------- */}
        <section id="work" className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-900 pb-6">
            <div className="space-y-2">
              <span className="eyebrow-spaced text-[10px] font-mono text-zinc-500">EXHIBITION 01</span>
              <h3 className="text-2xl md:text-3xl font-bold font-serif text-white">SELECTED WORK</h3>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-2 md:mt-0 max-w-xs">
              Speculative, self-initiated and commissioned cultural artifacts.
            </p>
          </div>

          {/* marker observed to trigger popup */}
          <div ref={workMarkerRef} style={{ position: 'relative', width: 1, height: 1 }} />

          {/* CINEMATIC SHOWREEL SECTION WITH SCROLL-DRIVEN FADE-IN AND AUTO-PLAYBACK */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full relative border border-neutral-900 bg-black p-0 overflow-hidden"
          >
            {/* Main Widescreen Video Box */}
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <video
                ref={videoRef}
                src="/SHADOW_BUREAU_—_SECOND_CINE.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/reel:scale-[1.02]"
              />
              
              {/* Overlay styling elements */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
              
              {/* Scanlines layer for aesthetic fidelity */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

              {/* Central Premium Hover Indicator */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/reel:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="border border-white/20 bg-black/80 px-4 py-2 font-mono text-[9px] tracking-widest text-white uppercase backdrop-blur-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  SHADOW_BUREAU // INTERACTIVE_PLAYBACK
                </div>
              </div>

              {/* Scroll-triggered centered popup (fades + scales into view) - controlled by IntersectionObserver */}
              <motion.div
                initial={false}
                animate={{
                  opacity: popupProgress,
                  scale: 0.9 + 0.25 * popupProgress,
                  y: (1 - popupProgress) * 28
                }}
                transition={{ type: 'tween', duration: 0.12 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
              >
                <div className="pointer-events-auto bg-black/85 rounded-sm p-2 max-w-[88%] max-h-[76%] w-[min(1100px,92%)] shadow-2xl">
                  <video
                    src="/SHADOW_BUREAU_—_SECOND_CINE.mp4"
                    muted
                    autoPlay
                    loop
                    playsInline
                    controls={false}
                    className="w-full h-auto object-contain rounded-sm"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 font-mono text-xs">
              No published featured projects found on server. Open Admin CMS to seed items.
            </div>
          ) : (
            <div className="space-y-16" id="selected-projects-grid">
              {featuredProjects.map((proj, idx) => (
                <div key={proj.id} className="relative overflow-hidden w-full">
                  {/* Majestic Solid White Slide Reveal Curtain */}
                  <motion.div
                    initial={{ scaleX: 1 }}
                    whileInView={{ scaleX: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{ originX: 1 }}
                    className="absolute inset-0 bg-white z-20 pointer-events-none"
                  />

                  <motion.article
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    onClick={() => setActiveProject(proj)}
                    className={`group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-neutral-900/60 pb-16 transition-all duration-300 ${
                      idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                    }`}
                  >
                  {/* Left Column: Metadata & Description */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">
                          {proj.projectType.replace('_', ' ')}
                        </span>
                        <span className="text-zinc-600">//</span>
                        <span className="font-mono text-[9px] text-zinc-400">
                          {proj.year}
                        </span>
                      </div>
                      <h4 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-white group-hover:text-zinc-300 transition-colors uppercase">
                        {proj.title}
                      </h4>
                    </div>

                    <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-sm">
                      {proj.description || "Digital visualization of experimental environments and speculative architectures."}
                    </p>

                    {/* Accent Indicator */}
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: proj.accentColor || '#FFFFFF' }} />
                    </div>
                  </div>

                  {/* Right Column: Massive high-end image */}
                  <div className="lg:col-span-7">
                    <div className="w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden border border-neutral-900 shadow-2xl relative crosshair-container crosshair-tl crosshair-tr crosshair-bl crosshair-br">
                      <img
                        src={getCoverUrl(proj)}
                        alt={proj.title}
                        className="w-full h-full object-cover filter brightness-[0.9] group-hover:scale-102 group-hover:brightness-100 transition-all duration-[1200ms]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-neutral-950/10 group-hover:bg-transparent transition-all duration-700" />
                    </div>
                  </div>
                  </motion.article>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* -------------------------------------------------------------
            CASE STUDY DETAILED SLIDER (PROJECT EXPERIENCE)
           ------------------------------------------------------------- */}
        {activeProject && (
          <section className="bg-[#080808]/90 backdrop-blur-md border border-neutral-900 rounded-none p-6 md:p-12 space-y-8 shadow-2xl relative scroll-mt-24 crosshair-container crosshair-tl crosshair-tr crosshair-bl crosshair-br" id="project-experience-slider">
            {/* Close button */}
            <button
              onClick={() => setActiveProject(null)}
              className="absolute top-6 right-6 p-2 bg-neutral-900 hover:bg-neutral-800 text-zinc-400 hover:text-white rounded-none border border-neutral-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="eyebrow-spaced text-[10px] font-mono text-zinc-500">EXHIBITION 02 // CASE NARRATIVE</span>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Media showcase left side */}
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-none overflow-hidden aspect-[4/3] bg-neutral-900 border border-neutral-900 shadow-inner">
                  <img
                    src={getCoverUrl(activeProject)}
                    alt={activeProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary images grid */}
                {activeProject.media.length > 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    {activeProject.media.filter(m => !m.isCover).map((media, idx) => (
                      <div key={media.id || idx} className="rounded-none overflow-hidden aspect-[3/2] bg-neutral-900 border border-neutral-900">
                        <img src={media.url} alt={media.altText || ''} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="font-mono text-[9px] text-zinc-500 flex justify-between">
                  <span>METADATA ACCENT: {activeProject.accentColor || '#FFFFFF'}</span>
                  <span>LOCATION: {activeProject.location || 'N/A'}</span>
                </div>
              </div>

              {/* Narratives right side */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <h4 className="text-3xl font-serif font-bold text-white mb-2">{activeProject.title}</h4>
                  <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-400 border-b border-neutral-900 pb-4">
                    <span>YEAR: {activeProject.year}</span>
                    <span>CLIENT: {activeProject.client || 'N/A'}</span>
                    <span>TYPE: {activeProject.projectType.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs md:text-sm">
                  {/* Objective */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">01 // OBJECTIVE</span>
                    <p className="md:col-span-3 text-zinc-300 leading-relaxed font-sans font-medium">
                      {activeProject.objective || 'No objective narrative registered.'}
                    </p>
                  </div>

                  {/* Approach */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t border-neutral-900/60 pt-4">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">02 // APPROACH</span>
                    <p className="md:col-span-3 text-zinc-300 leading-relaxed font-sans font-medium">
                      {activeProject.approach || 'No approach narrative registered.'}
                    </p>
                  </div>

                  {/* Execution */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t border-neutral-900/60 pt-4">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">03 // EXECUTION</span>
                    <p className="md:col-span-3 text-zinc-300 leading-relaxed font-sans font-medium">
                      {activeProject.execution || 'No execution narrative registered.'}
                    </p>
                  </div>

                  {/* Results */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t border-neutral-900/60 pt-4">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">04 // RESULTS</span>
                    <p className="md:col-span-3 text-zinc-300 leading-relaxed font-sans font-medium">
                      {activeProject.results || 'No results statistics registered.'}
                    </p>
                  </div>
                </div>

                {/* Capabilities deployed */}
                {activeProject.capabilities.length > 0 && (
                  <div className="pt-4 border-t border-neutral-900">
                    <span className="font-mono text-[10px] text-zinc-500 block mb-2 uppercase">DEPLOYED SERVICES</span>
                    <div className="flex flex-wrap gap-2">
                      {activeProject.capabilities.map(cap => (
                        <span key={cap.id} className="text-[10px] font-mono text-zinc-300 bg-neutral-900 px-3 py-1 rounded border border-neutral-800">
                          {cap.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}



        {/* -------------------------------------------------------------
            ABOUT & MANIFESTO SECTION
           ------------------------------------------------------------- */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-b border-neutral-950 py-16">
          {/* Manifesto Column (Experimental display typesetting) */}
          <div className="lg:col-span-7 space-y-8" id="studio">
            <span className="eyebrow-spaced text-[10px] font-mono text-zinc-500">EXHIBITION 04 // MANIFESTO</span>
            
            <div className="space-y-6 font-serif text-xl md:text-2xl italic font-light tracking-wide text-zinc-200 leading-relaxed border-l-2 border-neutral-850 pl-6">
              {manifesto.map((line, idx) => (
                <p key={idx} className="hover:text-white transition-colors duration-300">
                  “ {line} ”
                </p>
              ))}
            </div>

            {studioInfo && (
              <p className="text-xs font-mono text-zinc-500 max-w-lg leading-relaxed">
                ESTABLISHED IN {studioInfo.founded} // PHYSICAL PRESENCE IN {studioInfo.location}. <br />
                ENCRYPTED TRANSFERS: {studioInfo.contactEmail}
              </p>
            )}
          </div>

          {/* About & Biographies Column */}
          <div className="lg:col-span-5 space-y-8">
            <span className="eyebrow-spaced text-[10px] font-mono text-zinc-500">EXHIBITION 05 // SYSTEM TEAM</span>
            
            {studioInfo && (
              <p className="text-sm text-zinc-400 leading-relaxed font-sans font-medium">
                {studioInfo.description}
              </p>
            )}
          </div>
        </section>



        {/* -------------------------------------------------------------
            FROM THE BUREAU FEED (Social posts & links)
           ------------------------------------------------------------- */}
        <section id="bureau-feed" className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-900 pb-6">
            <div className="space-y-2">
              <span className="eyebrow-spaced text-[10px] font-mono text-zinc-500">EXHIBITION 07</span>
              <h3 className="text-2xl md:text-3xl font-bold font-serif text-white">FROM THE BUREAU</h3>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-2 md:mt-0">
              Dispatches, publications, and external systems connectivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Social Posts retrieved from API */}
            {socialPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col md:flex-row gap-6 bg-neutral-950/10 border border-neutral-900 rounded-none p-6 hover:border-neutral-700 transition-all crosshair-container crosshair-tl crosshair-tr crosshair-bl crosshair-br"
              >
                {post.imageUrl && (
                  <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-none overflow-hidden relative shadow-md border border-neutral-900">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-750" />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500 tracking-wider">
                      <span>[{post.platform.toUpperCase()}]</span>
                      <span>{post.date}</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-white">{post.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{post.content}</p>
                  </div>
                  <a
                    href={post.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors mt-2"
                  >
                    EXAMINE TRANSMISSION <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* -------------------------------------------------------------
            CONTACT SECTION STYLED IN MINIMALIST PREMIUM DESIGN
           ------------------------------------------------------------- */}
        <section id="contact" className="space-y-8 py-24 px-6 sm:px-12 border-t border-neutral-950 text-center flex flex-col items-center justify-center w-full">
          <div className="max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center text-center">
            <span className="eyebrow-spaced text-[10px] font-mono text-zinc-500 block tracking-[0.4em] text-center w-full">EXHIBITION 08 // CONNECT</span>
            <h3 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-black tracking-tight text-white leading-tight uppercase text-center w-full flex flex-col items-center justify-center gap-2">
              <span className="block">HAVE SOMETHING WORTH MAKING?</span>
              <a 
                href="mailto:shadowbureau.co@gmail.com" 
                className="relative z-50 text-zinc-400 hover:text-white transition-colors duration-300 select-all cursor-pointer underline decoration-neutral-800 hover:decoration-white decoration-1 underline-offset-4 block text-center text-lg sm:text-2xl md:text-4xl lg:text-5xl break-all"
              >
                shadowbureau.co@gmail.com
              </a>
            </h3>

            {/* Premium Instagram Portal */}
            <div className="pt-4">
              <a 
                href="https://www.instagram.com/shadowbureau.co?igsi=MTlkcG52MTVpejltaw=="
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-50 inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-900 bg-neutral-950/45 hover:bg-white hover:text-black hover:border-white text-zinc-400 font-mono text-[11px] tracking-widest uppercase transition-all duration-300 cursor-pointer rounded-none"
              >
                <Instagram className="w-4 h-4" />
                <span>INSTAGRAM // SHADOWBUREAU.CO</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* -------------------------------------------------------------
          FOOTER WITH MASSIVE SIGNATURE LOGO FROM THE VIDEO
         ------------------------------------------------------------- */}
      <footer className="border-t border-neutral-950 bg-[#030303] pt-24 pb-12 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Top minimal copyright & coordinates */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[10px] text-zinc-500 text-center md:text-left">
            <div className="space-y-2">
              <span className="text-zinc-500">
                © 2026 SHADOW BUREAU CO. ALL CODES SECURED.
              </span>
            </div>
          </div>

          {/* Massive Display Signature Text from Grid9 Video bottom (1:02) */}
          <div className="pt-8 border-t border-neutral-950 overflow-hidden">
            <motion.h2 
              initial={{ opacity: 0.1, scale: 0.92, y: 50, filter: "brightness(0.3) blur(2px)" }}
              whileInView={{ opacity: 0.85, scale: 1, y: 0, filter: "brightness(1.2) blur(0px)" }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="text-[14vw] font-sans font-black tracking-tighter leading-none text-zinc-900 select-none uppercase hover:text-white transition-colors duration-500"
            >
              Shadow Bureau
            </motion.h2>
          </div>

        </div>
      </footer>


      {/* -------------------------------------------------------------
          ADMIN LOGIN / CMS PANEL MODAL
         ------------------------------------------------------------- */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0b0b] border border-neutral-850 rounded-none w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative crosshair-container crosshair-tl crosshair-tr crosshair-bl crosshair-br">
            
            {/* Header */}
            <div className="border-b border-neutral-900 px-6 py-4 flex justify-between items-center bg-neutral-950">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-neutral-800 flex-shrink-0">
                  <img 
                    src="/assets/Gosavi.png" 
                    alt="Logo" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-mono text-xs text-white uppercase tracking-widest">
                  Shadow Bureau Security Console & CMS
                </h3>
              </div>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer rounded-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Switch */}
            {!adminAuthenticated ? (
              // Login Panel
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto space-y-6">
                <div className="w-12 h-12 rounded-none bg-neutral-900 border border-neutral-800 flex items-center justify-center text-zinc-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-bold text-white uppercase">AUTHENTICATE SYSTEM KEYS</h4>
                  <p className="text-[10px] font-mono text-zinc-500 max-w-xs">
                    Please provide the system secret security passcode to enable read/write state manipulations.
                  </p>
                </div>
                <form onSubmit={handleAdminLogin} className="w-full space-y-3">
                  <input
                    type="password"
                    placeholder="Enter passkey: 'shadow'"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-[#121212] border border-neutral-800 text-center text-white font-mono text-xs p-3 rounded-none focus:outline-none focus:border-white transition-all"
                  />
                  {adminError && (
                    <div className="text-[10px] font-mono text-red-500 font-bold">{adminError}</div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-white text-black font-bold font-mono text-[10px] uppercase py-2.5 rounded-none hover:bg-zinc-200 cursor-pointer"
                  >
                    VERIFY COORDINATES
                  </button>
                </form>
              </div>
            ) : (
              // Full CMS UI
              <div className="flex-1 flex flex-col min-h-0">
                {/* Tabs selection */}
                <div className="flex gap-4 border-b border-neutral-900 bg-neutral-950 px-6 py-2.5 text-xs font-mono">
                  <button
                    onClick={() => { setAdminTab('PROJECTS'); setEditingProject(null); }}
                    className={`py-1.5 px-3 rounded-none cursor-pointer ${adminTab === 'PROJECTS' ? 'bg-neutral-900 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Manage Projects
                  </button>
                  <button
                    onClick={() => { setAdminTab('CONTACTS'); setEditingProject(null); }}
                    className={`py-1.5 px-3 rounded cursor-pointer ${adminTab === 'CONTACTS' ? 'bg-neutral-900 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Intake Proposals Inbox
                  </button>
                </div>

                <div className="flex-1 flex overflow-hidden min-h-0">
                  {/* Left list panel */}
                  <div className="w-1/3 border-r border-neutral-900 overflow-y-auto p-4 bg-neutral-950/40 divide-y divide-neutral-900/60">
                    {adminTab === 'PROJECTS' ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2">
                          <span className="font-mono text-[9px] text-zinc-500">PROJECT REGISTRY</span>
                          <button
                            onClick={handleInitNewProject}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-[9px] py-1 px-2.5 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" /> ADD PROJECT
                          </button>
                        </div>
                        {adminProjects.map(p => (
                          <div
                            key={p.id}
                            onClick={() => setEditingProject(p)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${editingProject?.id === p.id ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-950 border-neutral-900 hover:bg-neutral-900/50'}`}
                          >
                            <div className="flex justify-between items-baseline">
                              <h5 className="font-serif text-xs font-bold text-white truncate max-w-[130px]">{p.title}</h5>
                              <span className="font-mono text-[8px] text-zinc-500">{p.year}</span>
                            </div>
                            <div className="flex justify-between items-center text-[8px] font-mono">
                              <span className="text-zinc-400 uppercase">{p.projectType}</span>
                              <span className={`px-1.5 py-0.5 rounded font-bold ${p.status === 'PUBLISHED' ? 'bg-emerald-950/80 text-emerald-400' : 'bg-zinc-900 text-zinc-500'}`}>
                                {p.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="font-mono text-[9px] text-zinc-500 block pb-2">SUBMISSIONS</span>
                        {adminContacts.map(c => (
                          <div
                            key={c.id}
                            onClick={() => setEditingProject(c as any)}
                            className="p-3 rounded-xl border bg-neutral-950 border-neutral-900 hover:bg-neutral-900/50 cursor-pointer space-y-1.5"
                          >
                            <div className="flex justify-between items-baseline">
                              <h5 className="font-mono text-xs font-bold text-white truncate max-w-[140px]">{c.name}</h5>
                              <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] font-mono ${c.status === 'NEW' ? 'bg-red-950/80 text-red-400' : c.status === 'REVIEWED' ? 'bg-cyan-950/80 text-cyan-400' : 'bg-zinc-900 text-zinc-500'}`}>
                                {c.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500">
                              <span>BUDGET: {c.budget}</span>
                              <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right editing console */}
                  <div className="flex-1 overflow-y-auto p-6 bg-[#0c0c0c] min-h-0">
                    {editingProject ? (
                      adminTab === 'PROJECTS' ? (
                        // EDIT PROJECT FORM
                        <div className="space-y-5">
                          <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                            <h4 className="font-serif text-sm font-bold text-white uppercase">
                              {editingProject.id ? `EDIT CONTEXT: ${editingProject.title}` : 'INITIALIZE BRAND RECORD'}
                            </h4>
                            {editingProject.id && (
                              <button
                                onClick={() => handleDeleteProject(editingProject.id!)}
                                className="text-red-500 hover:text-red-400 font-mono text-[9px] flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> PURGE RECORD
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                            <div className="space-y-1.5">
                              <label className="text-zinc-500 uppercase text-[9px]">Title</label>
                              <input
                                type="text"
                                value={editingProject.title || ''}
                                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                                className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-zinc-500 uppercase text-[9px]">Year</label>
                              <input
                                type="number"
                                value={editingProject.year || 2026}
                                onChange={(e) => setEditingProject({ ...editingProject, year: parseInt(e.target.value) || 2026 })}
                                className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                            <div className="space-y-1.5">
                              <label className="text-zinc-500 uppercase text-[9px]">Type</label>
                              <select
                                value={editingProject.projectType || 'CLIENT'}
                                onChange={(e) => setEditingProject({ ...editingProject, projectType: e.target.value as any })}
                                className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none cursor-pointer"
                              >
                                <option value="CLIENT">CLIENT</option>
                                <option value="SPEC">SPEC</option>
                                <option value="SELF_INITIATED">SELF_INITIATED</option>
                                <option value="COLLABORATION">COLLABORATION</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-zinc-500 uppercase text-[9px]">Accent Color Hex</label>
                              <input
                                type="text"
                                value={editingProject.accentColor || '#FFFFFF'}
                                onChange={(e) => setEditingProject({ ...editingProject, accentColor: e.target.value })}
                                className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                            <div className="space-y-1.5">
                              <label className="text-zinc-500 uppercase text-[9px]">Client Name</label>
                              <input
                                type="text"
                                value={editingProject.client || ''}
                                onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                                className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-zinc-500 uppercase text-[9px]">Location</label>
                              <input
                                type="text"
                                value={editingProject.location || ''}
                                onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                                className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                            <div className="space-y-1.5">
                              <label className="text-zinc-500 uppercase text-[9px]">Status</label>
                              <select
                                value={editingProject.status || 'DRAFT'}
                                onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })}
                                className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none cursor-pointer"
                              >
                                <option value="DRAFT">DRAFT</option>
                                <option value="PUBLISHED">PUBLISHED</option>
                                <option value="ARCHIVED">ARCHIVED</option>
                              </select>
                            </div>
                            <div className="space-y-1.5 flex items-center pt-4">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={editingProject.featured || false}
                                  onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                                  className="w-4 h-4 text-white bg-neutral-950 border border-neutral-900 rounded focus:ring-0"
                                />
                                <span className="text-zinc-400 text-xs uppercase font-mono">Feature on Homepage</span>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs font-mono">
                            <label className="text-zinc-500 uppercase text-[9px] block">Short Tagline Description</label>
                            <input
                              type="text"
                              value={editingProject.description || ''}
                              onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                              className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-3 font-mono text-xs pt-2">
                            <span className="text-zinc-500 text-[9px] block uppercase border-b border-neutral-900 pb-1">CASE BRIEF NARRATIVE DEVIATIONS</span>
                            <div className="space-y-1.5">
                              <label className="text-zinc-400 text-[9px]">01 // OBJECTIVE</label>
                              <textarea
                                rows={2}
                                value={editingProject.objective || ''}
                                onChange={(e) => setEditingProject({ ...editingProject, objective: e.target.value })}
                                className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-zinc-400 text-[9px]">02 // APPROACH</label>
                              <textarea
                                rows={2}
                                value={editingProject.approach || ''}
                                onChange={(e) => setEditingProject({ ...editingProject, approach: e.target.value })}
                                className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-zinc-400 text-[9px]">03 // EXECUTION</label>
                              <textarea
                                rows={2}
                                value={editingProject.execution || ''}
                                onChange={(e) => setEditingProject({ ...editingProject, execution: e.target.value })}
                                className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-zinc-400 text-[9px]">04 // RESULTS</label>
                              <textarea
                                rows={2}
                                value={editingProject.results || ''}
                                onChange={(e) => setEditingProject({ ...editingProject, results: e.target.value })}
                                className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Media link */}
                          <div className="space-y-1.5 text-xs font-mono">
                            <span className="text-zinc-500 text-[9px] block uppercase border-b border-neutral-900 pb-1">MEDIA COMPILATION COVER URL</span>
                            <input
                              type="text"
                              value={editingProject.media?.[0]?.url || ''}
                              onChange={(e) => {
                                const currentMedia = [...(editingProject.media || [])];
                                if (currentMedia[0]) {
                                  currentMedia[0].url = e.target.value;
                                } else {
                                  currentMedia[0] = { id: 'm-1', url: e.target.value, type: 'IMAGE', isCover: true, altText: 'cover' };
                                }
                                setEditingProject({ ...editingProject, media: currentMedia });
                              }}
                              className="w-full bg-neutral-950 text-white p-2.5 rounded border border-neutral-900 focus:outline-none"
                              placeholder="Unsplash / external image link"
                            />
                          </div>

                          <button
                            onClick={handleSaveProject}
                            disabled={isCmsActionLoading}
                            className="w-full bg-white text-black font-bold font-mono text-xs uppercase py-3 rounded-lg hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            {isCmsActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'COMMIT SYSTEM TRANSACTION'}
                          </button>
                        </div>
                      ) : (
                        // VIEW CONTACT SUBMISSION DETAILS
                        <div className="space-y-6">
                          <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                            <h4 className="font-serif text-sm font-bold text-white uppercase">
                              OPERATOR PROPOSAL SPEC
                            </h4>
                            <span className="font-mono text-[9px] text-zinc-500">ID: {editingProject.id}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 font-mono text-xs bg-neutral-950 p-4 rounded-xl border border-neutral-900">
                            <div>
                              <span className="text-zinc-500 block uppercase text-[8px] mb-1">PROPOSER NAME</span>
                              <span className="text-white font-serif">{editingProject.name}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block uppercase text-[8px] mb-1">PROPOSER SECURE MAIL</span>
                              <span className="text-white">{editingProject.email}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 font-mono text-xs bg-neutral-950 p-4 rounded-xl border border-neutral-900">
                            <div>
                              <span className="text-zinc-500 block uppercase text-[8px] mb-1">PROPOSAL CLASSIFICATION</span>
                              <span className="text-white uppercase">{editingProject.projectType}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block uppercase text-[8px] mb-1">ESTIMATED BUDGET</span>
                              <span className="text-white">{(editingProject as any).budget}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block uppercase text-[8px] mb-1">RECEIVED TIMESTAMP</span>
                              <span className="text-white">{new Date((editingProject as any).createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 font-mono text-xs bg-neutral-950 p-4 rounded-xl border border-neutral-900">
                            <span className="text-zinc-500 block uppercase text-[8px]">PROPOSAL NARRATIVE OUTLINE</span>
                            <p className="text-zinc-300 leading-relaxed font-sans font-medium whitespace-pre-wrap py-2">
                              {(editingProject as any).description}
                            </p>
                          </div>

                          <div className="flex gap-4">
                            <button
                              onClick={() => handleToggleContactStatus(editingProject.id!, (editingProject as any).status)}
                              className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold font-mono text-[10px] uppercase py-2.5 rounded-lg cursor-pointer text-center"
                            >
                              TOGGLE ACTION STATUS (Currently: {(editingProject as any).status})
                            </button>
                            <button
                              onClick={() => setEditingProject(null)}
                              className="px-6 bg-neutral-900 hover:bg-neutral-800 text-zinc-400 hover:text-white border border-neutral-800 rounded-lg text-[10px] font-mono uppercase"
                            >
                              CLOSE DETAIL
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-600">
                        <FileText className="w-12 h-12 mb-3 text-neutral-700 animate-pulse" />
                        <p className="font-mono text-xs">Security console synchronized. Choose a list item on the left to activate editing controls.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SPECIFICATION & DETAIL SHEET OVERLAY MODAL
         ------------------------------------------------------------- */}
      {previewDoc && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="w-full max-w-2xl bg-[#050505] border border-neutral-900 rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-mono relative crosshair-container crosshair-tl crosshair-tr crosshair-bl crosshair-br"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar / Secure Header */}
            <div className="flex justify-between items-center bg-[#0a0a0a] border-b border-neutral-900 px-6 py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-zinc-400 tracking-wider font-bold">
                    SHADOW_SECURE_VAULT_NODE // v2.4.9
                  </span>
                </div>
                <h4 className="text-xs font-black text-white tracking-widest uppercase">
                  {previewDoc.type === 'DETAILS' ? 'TECHNICAL_DETAILS_REPORT.TXT' : 'SYSTEM_SPECIFICATION_SCHEMATIC.SYS'}
                </h4>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="p-1 bg-neutral-950 hover:bg-neutral-900 text-zinc-500 hover:text-white border border-neutral-900 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-zinc-400 text-[11px] leading-relaxed">
              
              {/* File Metadata Table */}
              <div className="border border-neutral-900 bg-neutral-950/40 p-4 space-y-3">
                <div className="flex justify-between border-b border-neutral-900/60 pb-2">
                  <span className="text-zinc-500 uppercase">PROJECT REF</span>
                  <span className="text-white font-bold">{previewDoc.project.title}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900/60 pb-2">
                  <span className="text-zinc-500 uppercase">CLASSIFICATION</span>
                  <span className="text-emerald-400 font-bold">{previewDoc.project.projectType}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900/60 pb-2">
                  <span className="text-zinc-500">TIMESTAMP LOG</span>
                  <span className="text-zinc-300">{previewDoc.project.year} // CHRONO_OFFSET</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">ENCRYPTION HASH</span>
                  <span className="text-zinc-500 select-all font-mono text-[9px]">
                    SHA256-{previewDoc.project.id.slice(0, 8).toUpperCase()}-9E7B34F1A
                  </span>
                </div>
              </div>

              {previewDoc.type === 'DETAILS' ? (
                /* DETAILS SHEET CONTENT */
                <div className="space-y-6">
                  {/* Objective */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-neutral-900 pb-1 block">
                      01 // SYSTEM_OBJECTIVE
                    </span>
                    <p className="font-sans text-zinc-300 font-medium">
                      {previewDoc.project.objective || "Speculative design visualization framework targeting ultra-dense metropolitan sectors."}
                    </p>
                  </div>

                  {/* Approach */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-neutral-900 pb-1 block">
                      02 // TECHNICAL_APPROACH
                    </span>
                    <p className="font-sans text-zinc-300 font-medium">
                      {previewDoc.project.approach || "Procedural generative models mapped via custom rendering hooks with multi-pass post-processing routines."}
                    </p>
                  </div>

                  {/* Execution */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-neutral-900 pb-1 block">
                      03 // REAL_WORLD_EXECUTION
                    </span>
                    <p className="font-sans text-zinc-300 font-medium">
                      {previewDoc.project.execution || "Deployed as custom microservice clusters on Cloud Run nodes, operating directly with WebGL graphics context layers."}
                    </p>
                  </div>

                  {/* Simulated telemetry matrix */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-neutral-900 pb-1 block">
                      04 // DIAGNOSTIC_TELEMETRY
                    </span>
                    <table className="w-full text-left font-mono text-[10px] border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-900 text-zinc-500 uppercase">
                          <th className="py-2">NODE INDEX</th>
                          <th className="py-2">LATENCY</th>
                          <th className="py-2">MEM_BLOCKS</th>
                          <th className="py-2">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900/60">
                        <tr>
                          <td className="py-2 font-bold text-white">NORTH-ATL-01</td>
                          <td className="py-2">0.002ms</td>
                          <td className="py-2">1,024 MB</td>
                          <td className="py-2 text-emerald-400">NOMINAL</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-white">EUROPE-WEST-04</td>
                          <td className="py-2">0.004ms</td>
                          <td className="py-2">4,096 MB</td>
                          <td className="py-2 text-emerald-400">NOMINAL</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-white">ASIA-EAST-02</td>
                          <td className="py-2">0.007ms</td>
                          <td className="py-2">2,048 MB</td>
                          <td className="py-2 text-emerald-400">NOMINAL</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* SPECIFICATION SHEET CONTENT */
                <div className="space-y-6">
                  {/* Technology Matrix */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-neutral-900 pb-1 block">
                      01 // SYSTEM_CAPABILITY_MATRIX
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-neutral-900 p-3 space-y-1">
                        <span className="text-zinc-500 text-[9px] block">GEOGRAPHIC COORDS</span>
                        <span className="text-white text-xs">{previewDoc.project.location || 'GLOBAL // DISTRIBUTED'}</span>
                      </div>
                      <div className="border border-neutral-900 p-3 space-y-1">
                        <span className="text-zinc-500 text-[9px] block">PRIMARY OPERATOR</span>
                        <span className="text-white text-xs">{previewDoc.project.client || 'INTERNAL ARCHIVE'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deployed Capabilites */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-neutral-900 pb-1 block">
                      02 // DEPLOYED_CAPABILITY_STACK
                    </span>
                    {previewDoc.project.capabilities && previewDoc.project.capabilities.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {previewDoc.project.capabilities.map((cap) => (
                          <div key={cap.id} className="border border-neutral-900 p-2 flex items-center justify-between">
                            <span className="text-white text-[10px] font-bold">{cap.name}</span>
                            <span className="text-[8px] bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded uppercase border border-emerald-900/40">
                              ACTIVE
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-neutral-900 p-4 text-center text-zinc-600 text-[10px]">
                        NO ASSOCIATED SYSTEM CAPABILITIES INSTALLED.
                      </div>
                    )}
                  </div>

                  {/* Spec details results */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-neutral-900 pb-1 block">
                      03 // METRIC_INTEGRATION_LOG
                    </span>
                    <p className="font-sans text-zinc-300 font-medium">
                      {previewDoc.project.results || "Comprehensive architectural simulation results achieved a 100% telemetry alignment validation pass."}
                    </p>
                  </div>

                  {/* Blueprint schematic ASCII visualizer */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-neutral-900 pb-1 block">
                      04 // VECTOR_MATRIX_PREVIEW
                    </span>
                    <pre className="text-[8px] font-mono text-zinc-600 bg-neutral-950 p-3 border border-neutral-900 leading-tight overflow-x-auto">
{`+-------------------------------------------------------------+
|  [SHADOW_SYSTEM_VECT]                                       |
|  X_OFFSET: 0.149219  //  Y_OFFSET: 0.884192                 |
|                                                             |
|   /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\                    |
|   ||||||||||||||||||||||||||||||||||||||                    |
|   \\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/                    |
|                                                             |
|  MATRIX RESOLUTION: NOMINAL [VERIFIED BY CRON TASK]        |
+-------------------------------------------------------------+`}
                    </pre>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="border-t border-neutral-900 bg-[#0a0a0a] px-6 py-4 flex justify-between items-center text-[10px]">
              <span className="text-zinc-600 font-mono uppercase tracking-wider">
                DOCUMENT STATUS: STABLE // COLD_CACHE
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    // Simulating a high-fidelity print/download action
                    window.print();
                  }}
                  className="px-4 py-2 border border-neutral-800 text-zinc-300 hover:text-white hover:border-zinc-300 bg-neutral-950 transition-colors uppercase font-bold cursor-pointer"
                >
                  PRINT / EXPORT ↗
                </button>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-white text-black font-bold border border-white hover:bg-zinc-200 transition-colors uppercase cursor-pointer"
                >
                  CLOSE_SHEET
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

