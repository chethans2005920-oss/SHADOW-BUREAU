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

// Digital Marketing Systems & Digital Products Showcase (E-Book, Graphic Design, & Motion Graphics Focus)
// Digital Marketing Systems & Digital Products Showcase
const DIGITAL_SHOWCASE: Project[] = [
  {
    id: "proj-1",
    slug: "minimalist-ebook-framework",
    title: "MINIMALIST E-BOOK & PUBLICATION SYSTEM",
    description: "A 39-page multipurpose editorial e-book and layout framework designed for modern lifestyle and creative brands.",
    year: 2026,
    projectType: "DIGITAL_PRODUCT" as any,
    status: "PUBLISHED",
    featured: true,
    client: "Editorial Creators & Brands",
    location: "Global // Remote",
    objective: "Craft a cohesive, high-end typography and layout system for digital publications, lookbooks, and course materials.",
    approach: "Employed calm taupe and earth-tone aesthetics, serif display typography, and structured grid layouts for maximum readability.",
    execution: "Compiled modular e-book page templates, image grids, and course companion modules optimized for Photoshop and digital distribution.",
    results: "Adopted by 300+ creators, driving a 45% increase in digital product retention and engagement.",
    accentColor: "#A39B90",
    media: [
      {
        id: "m-1",
        url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200",
        type: "IMAGE",
        isCover: true,
        altText: "Minimalist E-Book & Publication Mockup Suite"
      }
    ],
    categories: [{ id: "c-1", name: "Publication Design", slug: "publication-design" }],
    capabilities: [{ id: "cap-1", name: "Editorial Layout", description: "Multi-page E-Book Systems" }]
  },
  {
    id: "proj-2",
    slug: "viral-motion-asset-vault",
    title: "MOTION ASSET VAULT v2.0",
    description: "A plug-and-play digital product vault containing 60+ direct-response video hooks, 3D asset presets, and ad storyboards.",
    year: 2026,
    projectType: "DIGITAL_PRODUCT" as any,
    status: "PUBLISHED",
    featured: true,
    client: "Direct-to-Consumer Brands",
    location: "Global",
    objective: "Eliminate creative fatigue with high-converting motion ad assets engineered for short-form social promotions.",
    approach: "Extracted winning hook pacing from 500+ top-performing paid ads and built reusable, node-based 3D motion layouts.",
    execution: "Built editable motion graphics packages and direct-response promo structures for rapid campaign deployment.",
    results: "Downloaded by 450+ performance marketing teams, generating over 35M paid impressions globally.",
    accentColor: "#3B82F6",
    media: [
      {
        id: "m-2",
        url: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&q=80&w=1200",
        type: "IMAGE",
        isCover: true,
        altText: "Kinetic Typography & Motion Graphics Reel Preview"
      }
    ],
    categories: [{ id: "c-2", name: "Digital Assets", slug: "digital-assets" }],
    capabilities: [{ id: "cap-2", name: "3D Motion Production", description: "High-CTR Creative Hooks" }]
  },
  {
    id: "proj-3",
    slug: "brand-launch-protocol",
    title: "APEX BRAND PROMOTION SYSTEM",
    description: "An end-to-end digital launch pack, luxury design system, and conversion-tested marketing suite for disruptive products.",
    year: 2025,
    projectType: "PRODUCT_SYSTEM" as any,
    status: "PUBLISHED",
    featured: true,
    client: "Next-Gen Hardware & SaaS",
    location: "Global",
    objective: "Equip modern founders with a category-defining digital visual identity and high-converting launch promo kit.",
    approach: "Combined dark-system Apple aesthetics with direct-response positioning to command premium pricing.",
    execution: "Engineered 80+ modular web components, promo launch trailers, and social proof trust architectures.",
    results: "Helped clients secure over $12M in pre-orders and increased average checkout conversion rates by 38%.",
    accentColor: "#FFFFFF",
    media: [
      {
        id: "m-3",
        url: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=1200",
        type: "IMAGE",
        isCover: true,
        altText: "High-End Graphic Design & Brand Guidelines Suite"
      }
    ],
    categories: [{ id: "c-3", name: "Conversion Design", slug: "conversion-design" }],
    capabilities: [{ id: "cap-3", name: "Product Launch Strategy", description: "Market Dominance Systems" }]
  }
];

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
          setTimeout(() => setIntroOutro(true), 600);
          setTimeout(() => setIntroCompleted(true), 1200);
          return 100;
        }
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
      setContactName('');
      setContactEmail('');
      setContactDescription('');
    } catch (err: any) {
      setContactError(err.message || 'Transmission failed. Verify server routes.');
    } finally {
      setContactSubmitting(false);
    }
  };

  // Authenticate Admin Panel
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

  // Save project edits
  const handleSaveProject = async () => {
    if (!editingProject?.title) {
      alert('A project title is strictly required.');
      return;
    }
    setIsCmsActionLoading(true);
    try {
      if (editingProject.id) {
        await api.admin.updateProject(editingProject.id, editingProject as Project);
      } else {
        await api.admin.createProject(editingProject as Omit<Project, 'id' | 'slug'>);
      }
      setEditingProject(null);
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
    const cover = proj.media?.find((m) => m.isCover);
    return cover ? cover.url : (proj.media?.[0]?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200');
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
        className={`fixed inset-0 bg-[#01010a] text-white flex flex-col justify-between p-8 md:p-16 z-[99999] transition-all duration-[1000ms] ease-in-out ${introOutro ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'}`}
        id="loading-screen"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="flex justify-between items-start font-mono text-[9px] text-zinc-500 tracking-[0.3em] uppercase relative z-10">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>SHADOW BUREAU // LINK DETECTED</span>
          </div>
          <span>SYSTEM VER: 9.84.C</span>
        </div>

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
    <div className="min-h-screen bg-black text-zinc-300 selection:bg-zinc-800 selection:text-white flex flex-col relative scanlines geo-grid">
      {/* Absolute Dark Vignette Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-950 via-black to-black pointer-events-none" />

      {/* EDITORIAL HEADER */}
      <header className="sticky top-0 z-50 bg-black/95 border-b border-neutral-900 px-6 md:px-12 py-5 flex justify-between items-center transition-all duration-300 font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
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
          <div className="flex justify-between items-center font-mono text-[10px] text-zinc-500 tracking-widest">
            <span className="text-white font-bold">SHADOW BUREAU // INDEX</span>
            <button 
              onClick={() => setMenuOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer uppercase tracking-[0.3em]"
            >
              [ CLOSE ✕ ]
            </button>
          </div>

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

          <div className="border-t border-neutral-900/60 pt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 font-mono text-[9px] text-zinc-600 tracking-widest uppercase">
            <div>LATENCY: 12MS // ENVIRONMENT_STABLE</div>
            <div>CODENAME: DESCENT // DEVELOPER EDITION</div>
          </div>
        </motion.div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 space-y-24 py-12 relative z-10">

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

        {/* HERO SECTION */}
        <section id="hero" className="relative h-[200vh] w-full bg-[#020202] -mx-6 md:-mx-12 px-6 md:px-12 overflow-visible">
          <div className="sticky top-[100px] left-0 w-full h-[85vh] overflow-hidden flex flex-col justify-between py-10 z-10">
            
            <div 
              className="absolute inset-0 z-0 bg-[#020202] flex items-center justify-center overflow-hidden pointer-events-none select-none"
              style={{ perspective: "1200px" }}
            >
              <div 
                className="absolute w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-[radial-gradient(circle,_rgba(0,140,255,0.4)_0%,_transparent_70%)] filter blur-3xl pointer-events-none"
                style={{
                  transform: `scale(${1 + Math.sin(scrollY * 0.005) * 0.15})`,
                  opacity: Math.min(0.9, 0.45 + (scrollY / 400))
                }}
              />

              <div
                className="relative will-change-transform flex items-center justify-center"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `scale(${1 + (scrollY * 0.0003)}) rotateY(${scrollY * 0.35}deg) rotateX(${scrollY * 0.04}deg)`,
                  transition: "transform 0.06s ease-out"
                }}
              >
                <img 
                  src="/Gosavi.png"
                  alt="Shadow Bureau 3D Logo Background"
                  className="w-[300px] h-[300px] sm:w-[460px] sm:h-[460px] md:w-[620px] md:h-[620px] object-contain filter drop-shadow-[0_0_70px_rgba(0,140,255,0.5)]"
                  style={{
                    opacity: Math.min(0.85, 0.45 + (scrollY / 350))
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-black/40 to-[#020202]/90 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_25%,_#020202_85%)] pointer-events-none" />
            </div>

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
            </div>

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

            <div 
              className="relative z-10 w-full border-t border-neutral-900/60 pt-8 bg-gradient-to-t from-black/60 to-transparent transition-all duration-500"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollY - 200) / 300)),
                transform: `translateY(${Math.max(0, 50 - (scrollY - 200) * 0.1)}px)`
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-7 space-y-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-sans font-extrabold text-white leading-snug tracking-tight uppercase">
                    WE ENGINEER PREDICTABLE REVENUE ENGINES, HIGH-CONVERSION MARKETING SYSTEMS, AND DIGITAL ASSETS BUILT TO SCALE MODERN BRANDS.
                  </h2>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-2xl font-serif italic">
                    We architect scalable acquisition funnels, direct-response ad creative packs, and automated retention systems that convert cold traffic into high-lifetime-value customers.
                  </p>
                </div>

                <div className="lg:col-span-3 space-y-3 font-sans text-[10px] sm:text-xs leading-relaxed text-zinc-500">
                  <p className="uppercase">
                    WE EMPOWER VISIONARY FOUNDERS AND COMMERCE LEADERS TO DOMINATE THEIR MARKETS. OUR SYSTEMS COMBINE DATA-DRIVEN ACQUISITION WITH HIGH-IMPACT CREATIVE DESIGN.
                  </p>
                </div>

                <div className="lg:col-span-2 flex justify-start lg:justify-end">
                  <a 
                    href="#work" 
                    className="font-mono text-[10px] text-white hover:text-zinc-400 flex items-center gap-2 border-b border-white pb-1 group tracking-wider uppercase font-bold"
                  >
                    Explore Products <span className="inline-block group-hover:translate-y-1 transition-transform duration-300">↓</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SELECTED WORK */}
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

          <div ref={workMarkerRef} style={{ position: 'relative', width: 1, height: 1 }} />

          {/* CINEMATIC SHOWREEL VIDEO REVEAL */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full relative border border-neutral-900 bg-black p-0 overflow-hidden group/reel"
          >
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-16" id="selected-projects-grid">
              {DIGITAL_SHOWCASE.map((proj, idx) => (
                <div key={proj.id} className="relative overflow-hidden w-full">
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
                        {proj.description}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: proj.accentColor || '#FFFFFF' }} />
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">EXAMINE BRIEF ↗</span>
                      </div>
                    </div>

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

        {/* CASE STUDY SLIDER MODAL */}
        {activeProject && (
          <section className="bg-black/95 backdrop-blur-md border border-zinc-400/60 rounded-none p-6 md:p-12 space-y-8 shadow-[0_0_60px_rgba(0,80,255,0.3)] relative scroll-mt-24 crosshair-container crosshair-tl crosshair-tr crosshair-bl crosshair-br" id="project-experience-slider">
            <button
              onClick={() => setActiveProject(null)}
              className="absolute top-6 right-6 p-2 bg-black hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-none border border-zinc-500/60 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="eyebrow-spaced text-[10px] font-mono text-zinc-500">EXHIBITION 02 // CASE NARRATIVE</span>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-none overflow-hidden aspect-[4/3] bg-neutral-900 border border-neutral-900 shadow-inner">
                  <img
                    src={getCoverUrl(activeProject)}
                    alt={activeProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {activeProject.media && activeProject.media.length > 1 && (
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">01 // OBJECTIVE</span>
                    <p className="md:col-span-3 text-zinc-300 leading-relaxed font-sans font-medium">
                      {activeProject.objective || 'No objective narrative registered.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t border-neutral-900/60 pt-4">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">02 // APPROACH</span>
                    <p className="md:col-span-3 text-zinc-300 leading-relaxed font-sans font-medium">
                      {activeProject.approach || 'No approach narrative registered.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t border-neutral-900/60 pt-4">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">03 // EXECUTION</span>
                    <p className="md:col-span-3 text-zinc-300 leading-relaxed font-sans font-medium">
                      {activeProject.execution || 'No execution narrative registered.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t border-neutral-900/60 pt-4">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">04 // RESULTS</span>
                    <p className="md:col-span-3 text-zinc-300 leading-relaxed font-sans font-medium">
                      {activeProject.results || 'No results statistics registered.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ABOUT & MANIFESTO */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-b border-neutral-950 py-16">
          <div className="lg:col-span-7 space-y-8" id="studio">
            <span className="eyebrow-spaced text-[10px] font-mono text-zinc-500">EXHIBITION 04 // CREATIVE PROTOCOL</span>
            <div className="space-y-6 font-serif text-xl md:text-2xl italic font-light tracking-wide text-zinc-200 leading-relaxed border-l-2 border-blue-500/60 pl-6">
              <p className="hover:text-white transition-colors duration-300">
                “ ELEVATING BRANDS THROUGH PRECISION GRAPHIC DESIGN, KINETIC MOTION GRAPHICS, AND HIGH-CONVERTING DIGITAL PUBLICATIONS. ”
              </p>
            </div>
            <p className="text-xs font-mono text-zinc-400 max-w-lg leading-relaxed">
              ESTABLISHED FOR CREATIVE DIRECTORS // GLOBAL REMOTE OPERATIONS. <br />
              DIRECT INQUIRIES: shadowbureau.co@gmail.com
            </p>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <span className="eyebrow-spaced text-[10px] font-mono text-zinc-500">EXHIBITION 05 // SYSTEM TEAM</span>
            {studioInfo && (
              <p className="text-sm text-zinc-400 leading-relaxed font-sans font-medium">
                {studioInfo.description}
              </p>
            )}
          </div>
        </section>

        {/* FROM THE BUREAU FEED */}
        <section id="bureau-feed" className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-900 pb-6">
            <div className="space-y-2">
              <span className="eyebrow-spaced text-[10px] font-mono text-zinc-500">EXHIBITION 07</span>
              <h3 className="text-2xl md:text-3xl font-bold font-serif text-white">FROM THE BUREAU</h3>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-2 md:mt-0">
              Growth architectures, performance case studies, and digital products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col md:flex-row gap-6 bg-neutral-950/10 border border-neutral-900 rounded-none p-6 hover:border-neutral-700 transition-all">
              <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-none overflow-hidden relative shadow-md border border-neutral-900">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" 
                  alt="Analytics Growth Dashboard" 
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-750" 
                />
              </div>
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 tracking-wider">
                    <span>[CASE STUDY]</span>
                    <span>AUG 2026</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-white">Scaling Cold Traffic Past 4.2x ROAS</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    A technical breakdown of how we engineered full-funnel ad variations, dynamic landing pages, and automated retargeting loops to scale customer acquisition.
                  </p>
                </div>
                <a href="#contact" className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors mt-2">
                  EXAMINE BREAKDOWN <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 bg-neutral-950/10 border border-neutral-900 rounded-none p-6 hover:border-neutral-700 transition-all">
              <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-none overflow-hidden relative shadow-md border border-neutral-900">
                <img 
                  src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800" 
                  alt="3D Digital Product Assets" 
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-750" 
                />
              </div>
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 tracking-wider">
                    <span>[DIGITAL PRODUCT]</span>
                    <span>JUN 2026</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-white">Viral Motion Ad Framework v2.0</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    Inside our performance creative vault: 50+ conversion-tested video hook templates, 3D asset presets, and modular direct-response ad layouts.
                  </p>
                </div>
                <a href="#contact" className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors mt-2">
                  ACCESS PRODUCT VAULT <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
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

      {/* FOOTER */}
      <footer className="border-t border-neutral-950 bg-[#030303] pt-24 pb-12 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[10px] text-zinc-500 text-center md:text-left">
            <span>© 2026 SHADOW BUREAU CO. ALL CODES SECURED.</span>
          </div>
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

    </div>
  );
}