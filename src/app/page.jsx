'use client';

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, PartyPopper, Quote, Play, ChevronLeft, ChevronRight, Mail, Send } from "lucide-react";
import confetti from "canvas-confetti";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// --- Background Music Component (Controlled) ---
const BackgroundMusic = ({ onAudioRef }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (onAudioRef && audioRef.current) {
      onAudioRef(audioRef.current);
    }
  }, [onAudioRef]);

  return (
    <audio
      ref={audioRef}
      src="/JVKE - her (official lyric video).mp3"
      loop
      preload="auto"
      playsInline
      className="hidden"
    />
  );
};

// --- FLOATING HEARTS AND 3D FLOWERS BACKGROUND ---
const FloatingHeartsAndFlowers = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const flowersRef = useRef([]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting for flowers
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffc0cb, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff69b4, 0.6, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Load flower bouquet model
    const loader = new GLTFLoader();
    loader.load(
      '/bouquet.glb',
      (gltf) => {
        const bouquetTemplate = gltf.scene;
        
        // Create multiple floating bouquets - INCREASED SCALE
        const bouquetPositions = [
          { x: -8, y: 6, z: -10, scale: 1.6, speed: 0.3 },   // doubled from 0.8
          { x: 8, y: -4, z: -12, scale: 1.2, speed: 0.25 },  // doubled from 0.6
          { x: -6, y: -6, z: -8, scale: 1.4, speed: 0.35 },  // doubled from 0.7
          { x: 7, y: 8, z: -15, scale: 1.8, speed: 0.28 },   // doubled from 0.9
          { x: 0, y: -8, z: -10, scale: 1.0, speed: 0.32 },  // doubled from 0.5
        ];

        bouquetPositions.forEach((pos, index) => {
          const bouquet = bouquetTemplate.clone();
          bouquet.position.set(pos.x, pos.y, pos.z);
          bouquet.scale.setScalar(pos.scale);
          
          // Random rotation
          bouquet.rotation.x = Math.random() * Math.PI;
          bouquet.rotation.y = Math.random() * Math.PI;
          bouquet.rotation.z = Math.random() * Math.PI;
          
          // Store speed and animation data
          bouquet.userData = {
            speed: pos.speed,
            rotationSpeed: 0.001 + Math.random() * 0.002,
            floatOffset: Math.random() * Math.PI * 2,
            originalY: pos.y
          };
          
          scene.add(bouquet);
          flowersRef.current.push(bouquet);
        });
      },
      undefined,
      (error) => {
        console.error('Error loading bouquet model:', error);
      }
    );

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Animate flowers
      flowersRef.current.forEach((bouquet) => {
        if (bouquet.userData) {
          // Gentle floating motion
          bouquet.position.y = bouquet.userData.originalY + Math.sin(time * bouquet.userData.speed + bouquet.userData.floatOffset) * 1.5;
          
          // Gentle rotation
          bouquet.rotation.y += bouquet.userData.rotationSpeed;
          bouquet.rotation.x += bouquet.userData.rotationSpeed * 0.5;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // SVG hearts that float
  const hearts = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 6,
    size: 12 + Math.random() * 20,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  return (
    <>
      {/* 3D Flowers Canvas */}
      <div 
        ref={mountRef} 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.6 }}
      />
      
      {/* 2D Floating Hearts */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute"
            style={{
              left: `${heart.x}%`,
              bottom: "-50px",
            }}
            initial={{ y: 0, opacity: 0, rotate: 0 }}
            animate={{
              y: "-120vh",
              opacity: [0, heart.opacity, heart.opacity, 0],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Heart
              size={heart.size}
              className="text-pink-500 fill-pink-500/30"
              strokeWidth={1.5}
            />
          </motion.div>
        ))}
      </div>
    </>
  );
};

// --- THE ENVELOPE OPENING COMPONENT ---
const EnvelopeOpening = ({ onOpen, audioRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const handleOpen = async () => {
    if (isOpen) return;
    setIsOpen(true);

    // Play Music with Fade In
    if (audioRef) {
      try {
        audioRef.volume = 0;
        await audioRef.play();
        const fadeInterval = setInterval(() => {
          if (audioRef.volume < 0.25) {
            audioRef.volume = Math.min(0.25, audioRef.volume + 0.025);
          } else {
            clearInterval(fadeInterval);
          }
        }, 100);
      } catch (e) {
        console.error("Audio playback failed", e);
      }
    }

    // Trigger "Content Visible" after animation
    setTimeout(() => {
      onOpen();
    }, 2000);

    // Hide envelope completely after transition
    setTimeout(() => {
      setIsHidden(true);
    }, 3500);
  };

  if (isHidden) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-rose-100 via-pink-100 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      initial={{ opacity: 1 }}
      animate={isOpen ? { opacity: 0, pointerEvents: "none" } : { opacity: 1 }}
      transition={{ duration: 1.5, delay: 2 }}
    >
      <div className="relative w-[320px] h-60 md:w-100 md:h-75" style={{ perspective: "1000px" }}>
        
        {/* Envelope Container */}
        <div className="relative w-full h-full cursor-pointer" onClick={handleOpen}>
          
          {/* Envelope Back (Base) - The back wall of envelope */}
          <div className="absolute inset-0 bg-linear-to-br from-rose-400 to-rose-500 rounded-md shadow-2xl" style={{ zIndex: 1 }} />
          
          {/* The Letter Card Inside - Starts INSIDE the envelope, partially visible */}
          <motion.div
            className="absolute left-8 right-8 bg-linear-to-br from-white to-rose-50 rounded-lg shadow-xl border-2 border-rose-200 overflow-hidden"
            style={{
              height: "70%",
            }}
            initial={{ 
              bottom: "10%",
              zIndex: 8,
              rotateX: 0,
            }}
            animate={isOpen ? { 
              bottom: "95%",
              zIndex: 100,
              rotateX: -5,
              y: -30,
              transition: { 
                duration: 1.4, 
                ease: [0.43, 0.13, 0.23, 0.96],
                delay: 0.4
              }
            } : {}}
          >
            <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="text-pink-500 fill-pink-500 mb-3 md:mb-4" size={40} />
              </motion.div>
              <p className="text-gray-800 font-serif text-sm md:text-lg text-center font-medium">
                A special message
              </p>
              <p className="text-gray-600 font-serif text-xs md:text-base text-center mt-1">
                for you...
              </p>
              <div className="mt-3 md:mt-4 flex gap-1">
                <Heart className="text-rose-400 fill-rose-400" size={10} />
                <Heart className="text-rose-400 fill-rose-400" size={10} />
                <Heart className="text-rose-400 fill-rose-400" size={10} />
              </div>
            </div>
          </motion.div>

          {/* Left Side Flap */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              clipPath: "polygon(0 0, 0 100%, 50% 50%)",
              background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
              zIndex: 10
            }} 
          />
          
          {/* Right Side Flap */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              clipPath: "polygon(100% 0, 50% 50%, 100% 100%)",
              background: "linear-gradient(225deg, #f43f5e 0%, #e11d48 100%)",
              zIndex: 10
            }} 
          />

          {/* Top Flap (The one that opens) */}
          <motion.div
            className="absolute top-0 left-0 right-0 origin-top pointer-events-none"
            style={{ 
              height: "50%",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "linear-gradient(180deg, #fb7185 0%, #f43f5e 100%)",
              zIndex: 20,
              transformStyle: "preserve-3d",
              boxShadow: isOpen ? "0 8px 32px rgba(244, 63, 94, 0.4)" : "none",
            }}
            animate={isOpen ? { 
              rotateX: -180,
              transition: { duration: 0.8, ease: "easeInOut" }
            } : { 
              rotateX: 0 
            }}
          />

          {/* Bottom decorative triangle */}
          {!isOpen && (
            <div 
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{ 
                height: "50%",
                clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                background: "linear-gradient(0deg, #be123c 0%, #e11d48 100%)",
                zIndex: 15
              }} 
            />
          )}

          {/* Decorative seal */}
          {!isOpen && (
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-linear-to-br from-amber-200 to-amber-400 border-4 border-amber-300 shadow-lg flex items-center justify-center"
              style={{ zIndex: 25 }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="text-rose-600 fill-rose-600" size={20} />
            </motion.div>
          )}
        </div>

        {/* "Click to Open" Hint */}
        {!isOpen && (
          <motion.div 
            className="absolute -bottom-20 left-0 right-0 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.button 
              animate={{ 
                scale: [1, 1.05, 1],
                y: [0, -3, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-8 py-3 rounded-full shadow-2xl text-rose-500 dark:text-rose-400 font-bold flex items-center gap-2 mx-auto hover:bg-white dark:hover:bg-gray-800 hover:shadow-rose-500/20 hover:shadow-2xl transition-all border-2 border-rose-200 dark:border-rose-800"
            >
              <Mail size={20} className="animate-pulse" />
              <span className="text-base md:text-lg">Tap to Open</span>
              <Sparkles size={16} className="text-amber-400" />
            </motion.button>
          </motion.div>
        )}

        {/* Floating hearts around envelope */}
        {!isOpen && (
          <>
            <motion.div
              className="absolute -top-8 -left-8"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            >
              <Heart className="text-pink-400 fill-pink-400/50" size={24} />
            </motion.div>
            <motion.div
              className="absolute -top-8 -right-8"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, -10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <Heart className="text-rose-400 fill-rose-400/50" size={20} />
            </motion.div>
            <motion.div
              className="absolute -bottom-4 left-4"
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 15, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <Heart className="text-red-400 fill-red-400/50" size={18} />
            </motion.div>
            <motion.div
              className="absolute -bottom-4 right-4"
              animate={{ 
                y: [0, -12, 0],
                rotate: [0, -15, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            >
              <Heart className="text-pink-500 fill-pink-500/50" size={22} />
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// --- HERO SECTION ---
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full bg-pink-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 md:w-80 md:h-80 rounded-full bg-rose-400/10 blur-[100px] animate-pulse" style={{ animationDelay: "-1.5s" }} />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center mb-6 md:mb-8"
        >
          <div className="relative">
            <Heart 
              size={60}
              className="text-pink-500 fill-pink-500 animate-pulse md:w-20 md:h-20" 
              strokeWidth={1}
            />
            <Sparkles 
              size={18}
              className="absolute -top-2 -right-2 text-rose-400 animate-pulse md:w-6 md:h-6" 
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <span className="text-rose-400 text-sm md:text-lg lg:text-xl tracking-[0.2em] md:tracking-[0.3em] uppercase mb-3 md:mb-4 block">
            A Special Question
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-4 md:mb-6 px-4">
            <span className="bg-linear-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent">
              Will You Be
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">My Valentine?</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4"
        >
          Every moment with you feels like a dream I never want to wake from. 
          Let me ask you something special...
        </motion.p>
      </div>
    </section>
  );
};

// --- LOVE LETTER ---
const TypewriterLoveLetter = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const letterParagraphs = [
    "My Dearest,",
    "From the moment you walked into my life, everything changed. The world became brighter, colors more vivid, and every day an adventure worth waking up for.",
    "You have this incredible way of making me feel like I'm exactly where I'm meant to be. Your laugh is the soundtrack to my happiest memories, and your smile is the light that guides me through my darkest days.",
    "I never knew love could feel this real, this powerful, this right. With you, I've discovered parts of myself I never knew existed. You inspire me to be better, to dream bigger, to love deeper.",
    "Every moment spent with you is a treasure I hold close to my heart. You are my best friend, my confidant, my greatest adventure, and the love of my life.",
    "Forever yours,\nDavid ❤️"
  ];

  useEffect(() => {
    if (!isInView) return;

    const fullText = letterParagraphs.join("\n\n");
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.substring(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [isInView]);

  return (
    <section ref={ref} className="relative py-24 md:py-40 px-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 md:w-175 md:h-175 rounded-full bg-rose-500/5 blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl bg-linear-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent mb-3 md:mb-4 font-bold px-4">
            A Letter From My Heart
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg px-4">
            Words I've been waiting to share with you
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -top-3 -left-3 w-10 h-10 md:-top-4 md:-left-4 md:w-16 md:h-16 border-t-2 border-l-2 border-pink-500/50 rounded-tl-2xl z-20 pointer-events-none" />
          <div className="absolute -top-3 -right-3 w-10 h-10 md:-top-4 md:-right-4 md:w-16 md:h-16 border-t-2 border-r-2 border-pink-500/50 rounded-tr-2xl z-20 pointer-events-none" />
          <div className="absolute -bottom-3 -left-3 w-10 h-10 md:-bottom-4 md:-left-4 md:w-16 md:h-16 border-b-2 border-l-2 border-pink-500/50 rounded-bl-2xl z-20 pointer-events-none" />
          <div className="absolute -bottom-3 -right-3 w-10 h-10 md:-bottom-4 md:-right-4 md:w-16 md:h-16 border-b-2 border-r-2 border-pink-500/50 rounded-br-2xl z-20 pointer-events-none" />

          <div className="relative backdrop-blur-sm bg-linear-to-br from-amber-50/80 to-rose-50/80 dark:from-gray-800/80 dark:to-gray-900/80 border border-amber-200/30 dark:border-gray-700/30 rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl">
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')]" />
            
            <div className="relative">
              <pre className="font-serif text-base md:text-lg lg:text-xl text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {displayedText}
                {!isComplete && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-0.5 h-5 md:h-6 bg-pink-500 ml-1"
                  />
                )}
              </pre>
            </div>

            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-4 right-4 md:top-8 md:right-8"
            >
              <Heart size={24} className="text-pink-500/30 fill-pink-500/20 md:w-8 md:h-8" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- HEARTBEAT ---
const HeartbeatMoment = ({ audioRef }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [isHeartbeating, setIsHeartbeating] = useState(false);

  useEffect(() => {
    if (isInView && !isHeartbeating) {
      setIsHeartbeating(true);
      
      if (audioRef) {
        const originalVolume = audioRef.volume;
        audioRef.volume = 0.05;
        
        setTimeout(() => {
          if (audioRef) {
            audioRef.volume = originalVolume;
          }
        }, 4000);
      }
    }
  }, [isInView, isHeartbeating, audioRef]);

  return (
    <section ref={ref} className="relative py-24 md:py-40 px-4 overflow-hidden">
      <AnimatePresence>
        {isHeartbeating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, times: [0, 0.5, 1], repeat: 3 }}
            className="fixed inset-0 bg-pink-500/20 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-0">
        <motion.div
          animate={isHeartbeating ? {
            scale: [1, 1.2, 1, 1.2, 1],
            opacity: [0.05, 0.15, 0.05, 0.15, 0.05]
          } : {}}
          transition={{ duration: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 md:w-200 md:h-200 rounded-full bg-pink-500/5 blur-[200px]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          animate={isHeartbeating ? {
            scale: [1, 1.1, 1, 1.1, 1],
          } : {}}
          transition={{ duration: 4 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={isHeartbeating ? {
              scale: [1, 1.3, 1, 1.3, 1],
            } : {}}
            transition={{ duration: 4 }}
            className="mb-8 md:mb-12"
          >
            <Heart 
              size={120}
              className="text-pink-500 fill-pink-500 md:w-40 md:h-40"
              strokeWidth={1}
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 px-4"
          >
            This is how my heart beats
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-xl sm:text-2xl md:text-3xl bg-linear-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent font-bold px-4"
          >
            Every time I think of you
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

// --- VIDEO MEMORY ---
const VideoMemorySection = ({ audioRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    if (audioRef) {
      audioRef.pause();
    }
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    if (audioRef) {
      audioRef.play().catch(() => {});
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (audioRef) {
      audioRef.play().catch(() => {});
    }
  };

  return (
    <section ref={sectionRef} className="relative py-24 md:py-40 px-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 md:w-175 md:h-175 rounded-full bg-rose-500/5 blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-full md:max-w-2xl lg:max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl bg-linear-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent mb-3 md:mb-4 font-bold px-4">
            A Special Memory
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg px-4">
            Captured moments of you being absolutely perfect
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -top-2 -left-2 w-8 h-8 md:-top-4 md:-left-4 md:w-12 md:h-12 border-t-2 border-l-2 border-pink-500/50 rounded-tl-lg z-20" />
          <div className="absolute -top-2 -right-2 w-8 h-8 md:-top-4 md:-right-4 md:w-12 md:h-12 border-t-2 border-r-2 border-pink-500/50 rounded-tr-lg z-20" />
          <div className="absolute -bottom-2 -left-2 w-8 h-8 md:-bottom-4 md:-left-4 md:w-12 md:h-12 border-b-2 border-l-2 border-pink-500/50 rounded-bl-lg z-20" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 md:-bottom-4 md:-right-4 md:w-12 md:h-12 border-b-2 border-r-2 border-pink-500/50 rounded-br-lg z-20" />

          <div className="relative backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-gray-200/20 dark:border-gray-700/20 rounded-2xl md:rounded-3xl p-2 md:p-4 overflow-hidden">
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-gray-900">
              <video
                ref={videoRef}
                className="w-full h-auto object-contain"
                onClick={handlePlayClick}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnd}
                playsInline
              >
                <source src="Video 1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm cursor-pointer"
                    onClick={handlePlayClick}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-linear-to-r from-pink-500 via-rose-500 to-red-500 flex items-center justify-center shadow-2xl shadow-pink-500/50"
                    >
                      <Play size={32} className="text-white fill-white ml-1 md:w-12 md:h-12 md:ml-2" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- SLIDESHOW ---
const MemorySlideshowSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const slides = [
    { image: "/Memory 1.jpeg", caption: "Beautiful you 💕", kenBurns: "zoom-in" },
    { image: "/Memory 2.jpeg", caption: "My sunshine ☀️", kenBurns: "pan-right" },
    { image: "/Memory 3.jpeg", caption: "Forever grateful 🌸", kenBurns: "zoom-out" },
    { image: "/Memory 4.jpeg", caption: "Perfect moments ✨", kenBurns: "pan-left" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const kenBurnsVariants = {
    "zoom-in": {
      scale: [1, 1.15],
      transition: { duration: 7, ease: "easeInOut" }
    },
    "zoom-out": {
      scale: [1.15, 1],
      transition: { duration: 7, ease: "easeInOut" }
    },
    "pan-right": {
      x: ["0%", "-5%"],
      scale: [1, 1.1],
      transition: { duration: 7, ease: "easeInOut" }
    },
    "pan-left": {
      x: ["0%", "5%"],
      scale: [1, 1.1],
      transition: { duration: 7, ease: "easeInOut" }
    }
  };

  return (
    <section ref={sectionRef} className="relative py-24 md:py-40 px-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 md:w-175 md:h-175 rounded-full bg-pink-500/5 blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl bg-linear-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent mb-3 md:mb-4 font-bold px-4">
            Our Beautiful Memories
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg px-4">
            Every moment with you is a treasure
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-gray-200/20 dark:border-gray-700/20 rounded-2xl md:rounded-3xl p-3 md:p-6 overflow-hidden">
            <div className="relative aspect-4/3 md:aspect-16/10 rounded-xl md:rounded-2xl overflow-hidden bg-gray-900">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0"
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={kenBurnsVariants[slides[currentSlide].kenBurns]}
                  >
                    <img
                      src={slides[currentSlide].image}
                      alt={slides[currentSlide].caption}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/30" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="text-white text-xl md:text-3xl font-bold text-center drop-shadow-2xl tracking-wide"
                    >
                      {slides[currentSlide].caption}
                    </motion.p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button
                onClick={prevSlide}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- LOVE MESSAGE ---
const LoveMessageSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const reasons = [
    "Your smile lights up my entire world",
    "Every day with you is an adventure",
    "You make me want to be a better person",
    "Your laugh is my favorite sound",
  ];

  return (
    <section ref={ref} className="relative py-24 md:py-48 px-4 mt-16 md:mt-32">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 md:w-150 md:h-150 rounded-full bg-pink-500/5 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-gray-200/20 dark:border-gray-700/20 rounded-2xl md:rounded-3xl p-6 md:p-12 mb-12 md:mb-16 text-center"
        >
          <Quote size={36} className="text-rose-400/50 mx-auto mb-4 md:mb-6 md:w-12 md:h-12" />
          <blockquote className="text-xl sm:text-2xl md:text-4xl text-gray-900 dark:text-white leading-relaxed mb-4 md:mb-6">
            "You are the finest, loveliest, and most beautiful person 
            I have ever known and even that is an understatement."
          </blockquote>
          <cite className="text-gray-600 dark:text-gray-300 text-base md:text-lg">— David Oseni</cite>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl bg-linear-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-3 md:mb-4 font-bold px-4">
            Why I Love You
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-gray-200/20 dark:border-gray-700/20 rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center gap-3 md:gap-4 group hover:border-pink-500/50 transition-all duration-300"
            >
              <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart size={18} className="text-pink-500 fill-pink-500/50 md:w-5 md:h-5" />
              </div>
              <p className="text-base md:text-lg text-gray-900 dark:text-white">{reason}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- QUESTION SECTION WITH VALENTINE PLAN ---
const ValentineQuestion = () => {
  const [step, setStep] = useState('question'); // 'question', 'plan', 'sending', 'sent'
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [valentinePlan, setValentinePlan] = useState('');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleYesClick = () => {
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ["#c44569", "#e17055", "#d4a373", "#ffd6e0", "#fff"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Move to plan input
    setTimeout(() => {
      setStep('plan');
    }, 1000);
  };

  const handleNoHover = () => {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 100;
    setNoButtonPosition({ x, y });
  };

  const handleSendPlan = () => {
    if (!valentinePlan.trim()) return;
    
    setStep('sending');
    
    // After animation completes
    setTimeout(() => {
      setStep('sent');
    }, 3000);
  };

  return (
    <section ref={ref} className="relative py-16 md:py-32 px-4 min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 md:w-200 md:h-200 rounded-full bg-pink-500/5 blur-[200px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1: Initial Question */}
          {step === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-gray-200/20 dark:border-gray-700/20 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center"
            >
              <h2 className="text-2xl sm:text-3xl md:text-5xl text-gray-900 dark:text-white mb-3 md:mb-4 font-bold px-2">
                So, what do you say?
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative min-h-25 sm:min-h-20 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleYesClick}
                  className="relative group px-8 sm:px-12 py-3 sm:py-4 rounded-full bg-linear-to-r from-pink-500 via-rose-500 to-red-500 text-white font-bold text-lg sm:text-xl shadow-lg hover:shadow-pink-500/50 transition-all duration-300 w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Yes! <Heart size={18} className="fill-current sm:w-5 sm:h-5" />
                  </span>
                </motion.button>

                <motion.button
                  animate={noButtonPosition}
                  onMouseEnter={handleNoHover}
                  onTouchStart={handleNoHover}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="px-8 sm:px-12 py-3 sm:py-4 rounded-full border border-gray-400/30 text-gray-600 dark:text-gray-300 font-bold text-lg sm:text-xl hover:border-pink-500/50 transition-colors w-full sm:w-auto"
                >
                  No...
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Valentine Plan Input */}
          {step === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-gray-200/20 dark:border-gray-700/20 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center"
            >
              <PartyPopper size={48} className="text-rose-400 md:w-16 md:h-16 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl md:text-5xl bg-linear-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent font-bold mb-4 md:mb-6">
                YES!!!
              </h2>
              <p className="text-lg sm:text-xl text-gray-900 dark:text-white mb-6 md:mb-8 px-4">
                What would you like to do on Valentine's Day? 💕
              </p>
              
              <textarea
                value={valentinePlan}
                onChange={(e) => setValentinePlan(e.target.value)}
                placeholder="Tell me your dream Valentine's Day plan..."
                className="w-full h-32 md:h-40 px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border-2 border-pink-200 dark:border-pink-800 focus:border-pink-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none font-serif text-base md:text-lg"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendPlan}
                disabled={!valentinePlan.trim()}
                className="mt-6 px-8 md:px-12 py-3 md:py-4 rounded-full bg-linear-to-r from-pink-500 via-rose-500 to-red-500 text-white font-bold text-lg md:text-xl shadow-lg hover:shadow-pink-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                <Send size={20} />
                Send My Plan
              </motion.button>
            </motion.div>
          )}

          {/* STEP 3: Sending Animation (Envelope) */}
          {step === 'sending' && (
            <motion.div
              key="sending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-100"
            >
              <div className="relative w-[320px] h-60 md:w-100 md:h-75" style={{ perspective: "1000px" }}>
                
                {/* Letter going into envelope */}
                <motion.div
                  className="absolute left-8 right-8 bg-linear-to-br from-white to-rose-50 rounded-lg shadow-xl border-2 border-rose-200 overflow-hidden"
                  style={{
                    height: "70%",
                    zIndex: 100,
                  }}
                  initial={{ 
                    bottom: "95%",
                    rotateX: -5,
                    y: -30,
                  }}
                  animate={{ 
                    bottom: "10%",
                    rotateX: 0,
                    y: 0,
                    transition: { 
                      duration: 1.2, 
                      ease: [0.43, 0.13, 0.23, 0.96],
                    }
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
                    <Heart className="text-pink-500 fill-pink-500 mb-2" size={32} />
                    <p className="text-gray-800 font-serif text-xs md:text-sm text-center line-clamp-4">
                      {valentinePlan}
                    </p>
                  </div>
                </motion.div>

                {/* Envelope */}
                <div className="absolute inset-0 bg-linear-to-br from-rose-400 to-rose-500 rounded-md shadow-2xl" style={{ zIndex: 1 }} />
                
                <div 
                  className="absolute inset-0"
                  style={{ 
                    clipPath: "polygon(0 0, 0 100%, 50% 50%)",
                    background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
                    zIndex: 10
                  }} 
                />
                
                <div 
                  className="absolute inset-0"
                  style={{ 
                    clipPath: "polygon(100% 0, 50% 50%, 100% 100%)",
                    background: "linear-gradient(225deg, #f43f5e 0%, #e11d48 100%)",
                    zIndex: 10
                  }} 
                />

                {/* Top Flap - Closes */}
                <motion.div
                  className="absolute top-0 left-0 right-0 origin-top"
                  style={{ 
                    height: "50%",
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background: "linear-gradient(180deg, #fb7185 0%, #f43f5e 100%)",
                    zIndex: 20,
                    transformStyle: "preserve-3d",
                  }}
                  initial={{ rotateX: -180 }}
                  animate={{ 
                    rotateX: 0,
                    transition: { duration: 0.8, ease: "easeInOut", delay: 1.3 }
                  }}
                />

                <motion.div 
                  className="absolute bottom-0 left-0 right-0"
                  style={{ 
                    height: "50%",
                    clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                    background: "linear-gradient(0deg, #be123c 0%, #e11d48 100%)",
                    zIndex: 15
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    transition: { delay: 1.3 }
                  }}
                />

                {/* Sending text */}
                <motion.p
                  className="absolute -bottom-16 left-0 right-0 text-center text-rose-500 dark:text-rose-400 font-bold text-xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Sending your message...
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Sent Confirmation */}
          {step === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-gray-200/20 dark:border-gray-700/20 rounded-2xl md:rounded-3xl p-6 md:p-16 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Sparkles size={60} className="text-amber-400 md:w-20 md:h-20 mx-auto mb-6" />
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl md:text-6xl bg-linear-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent font-bold mb-4 md:mb-6">
                Message Sent!
              </h2>
              <p className="text-xl sm:text-2xl text-gray-900 dark:text-white mb-4 px-4">
                I can't wait for our Valentine's Day! 💌
              </p>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 px-4">
                Get ready for the best Valentine's Day ever!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// --- APP ---
export default function App() {
  const [backgroundAudio, setBackgroundAudio] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-rose-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-serif relative overflow-x-hidden">
      
      <BackgroundMusic onAudioRef={setBackgroundAudio} />
      
      {/* The Envelope - Entry Point */}
      <EnvelopeOpening 
        audioRef={backgroundAudio} 
        onOpen={() => setHasStarted(true)} 
      />

      {/* Main Content - Fades in when envelope opens */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={hasStarted ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className={hasStarted ? "block" : "hidden"}
      >
        <FloatingHeartsAndFlowers />
        <HeroSection />
        <TypewriterLoveLetter />
        <HeartbeatMoment audioRef={backgroundAudio} />
        <VideoMemorySection audioRef={backgroundAudio} />
        <MemorySlideshowSection />
        <LoveMessageSection />
        <ValentineQuestion />
        
        <footer className="relative py-12 md:py-16 px-4 text-center">
          <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
            Valentine's Day 2026
          </p>
        </footer>
      </motion.div>
    </div>
  );
}