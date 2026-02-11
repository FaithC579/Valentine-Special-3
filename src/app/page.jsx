'use client';

import { useState, useRef, useEffect, memo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, PartyPopper, Quote, Play, ChevronLeft, ChevronRight, Mail, Send, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// --- Background Music Component (Controlled) ---
const BackgroundMusic = memo(({ onAudioRef }) => {
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
      preload="metadata"
      playsInline
      className="hidden"
    />
  );
});

// --- REALISTIC 3D FLOWER PETALS FROM GLB MODEL ---
const ThreeDFlowerPetals = memo(() => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const petalsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting for 3D model
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, 5);
    scene.add(directionalLight2);

    const petals = [];

    // Load the GLB rose model
    const loader = new GLTFLoader();
    loader.load(
      '/models/rose_flower_realistic_high-poly (1).glb',
      (gltf) => {
        console.log('✅ Rose model loaded successfully!');
        
        const roseModel = gltf.scene;
        
        // Find all mesh objects in the model
        const meshes = [];
        roseModel.traverse((child) => {
          if (child.isMesh) {
            meshes.push(child);
            console.log('Found mesh:', child.name);
          }
        });
        
        console.log(`Found ${meshes.length} meshes in the rose model`);
        
        // Create falling petals from the model
        const petalCount = 40;
        
        for (let i = 0; i < petalCount; i++) {
          let petalMesh;
          
          if (meshes.length > 0) {
            // Pick a random mesh from the model
            const sourceMesh = meshes[Math.floor(Math.random() * meshes.length)];
            petalMesh = sourceMesh.clone();
            
            // Clone and configure material
            if (sourceMesh.material) {
              petalMesh.material = sourceMesh.material.clone();
              petalMesh.material.transparent = true;
              petalMesh.material.opacity = 0.9;
              petalMesh.material.side = THREE.DoubleSide;
            }
          } else {
            // Use whole model as fallback
            petalMesh = roseModel.clone();
          }
          
          // Random scale for variation
          const scale = 3.0 + Math.random() * 1.5;
          petalMesh.scale.set(scale, scale, scale);

          // Random initial position
          petalMesh.position.x = (Math.random() - 0.5) * 60;
          petalMesh.position.y = Math.random() * 50 + 10;
          petalMesh.position.z = (Math.random() - 0.5) * 20;

          // Random rotation
          petalMesh.rotation.x = Math.random() * Math.PI * 2;
          petalMesh.rotation.y = Math.random() * Math.PI * 2;
          petalMesh.rotation.z = Math.random() * Math.PI * 2;

          // Physics properties for falling animation
          petalMesh.userData = {
            velocityY: -0.02 - Math.random() * 0.03,
            velocityX: (Math.random() - 0.5) * 0.02,
            velocityZ: (Math.random() - 0.5) * 0.02,
            rotationSpeedX: (Math.random() - 0.5) * 0.02,
            rotationSpeedY: (Math.random() - 0.5) * 0.02,
            rotationSpeedZ: (Math.random() - 0.5) * 0.01,
            swayAmplitude: Math.random() * 0.5 + 0.3,
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayOffset: Math.random() * Math.PI * 2,
            interactionForce: { x: 0, y: 0 },
          };

          scene.add(petalMesh);
          petals.push(petalMesh);
        }
        
        petalsRef.current = petals;
        console.log(`Created ${petals.length} falling petals`);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(1);
        console.log(`Loading rose model: ${percent}%`);
      },
      (error) => {
        console.error('❌ Error loading rose model:', error);
        console.log('Creating fallback petals...');
        
        // Fallback: create simple curved petals if model fails
        createFallbackPetals();
      }
    );
    
    // Fallback function - creates simple but beautiful petals
    const createFallbackPetals = () => {
      const petalCount = 40;
      
      for (let i = 0; i < petalCount; i++) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.bezierCurveTo(-0.4, 0.3, -0.8, 0.8, -0.9, 1.4);
        shape.bezierCurveTo(-0.7, 1.8, -0.3, 2.0, 0, 1.9);
        shape.bezierCurveTo(0.3, 2.0, 0.7, 1.8, 0.9, 1.4);
        shape.bezierCurveTo(0.8, 0.8, 0.4, 0.3, 0, 0);
        
        const geometry = new THREE.ShapeGeometry(shape, 32);
        const positions = geometry.attributes.position.array;
        
        // Add curvature
        for (let j = 0; j < positions.length; j += 3) {
          const x = positions[j];
          const y = positions[j + 1];
          const distFromCenter = Math.abs(x);
          const curveFactor = distFromCenter * 0.3;
          const heightFactor = (y / 2.0) * 0.4;
          positions[j + 2] = curveFactor * heightFactor * Math.sin(distFromCenter * 2);
        }
        
        geometry.computeVertexNormals();
        
        const pinkShades = [0xffc0cb, 0xffb6c1, 0xff69b4, 0xffa6c9, 0xffb7d5];
        const color = pinkShades[Math.floor(Math.random() * pinkShades.length)];
        
        const material = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.8,
          metalness: 0.0,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        
        const petal = new THREE.Mesh(geometry, material);
        
        petal.position.x = (Math.random() - 0.5) * 60;
        petal.position.y = Math.random() * 50 + 10;
        petal.position.z = (Math.random() - 0.5) * 20;
        petal.rotation.x = Math.random() * Math.PI;
        petal.rotation.y = Math.random() * Math.PI;
        petal.rotation.z = Math.random() * Math.PI;
        
        petal.userData = {
          velocityY: -0.02 - Math.random() * 0.03,
          velocityX: (Math.random() - 0.5) * 0.02,
          velocityZ: (Math.random() - 0.5) * 0.02,
          rotationSpeedX: (Math.random() - 0.5) * 0.02,
          rotationSpeedY: (Math.random() - 0.5) * 0.02,
          rotationSpeedZ: (Math.random() - 0.5) * 0.01,
          swayAmplitude: Math.random() * 0.5 + 0.3,
          swaySpeed: Math.random() * 0.02 + 0.01,
          swayOffset: Math.random() * Math.PI * 2,
          interactionForce: { x: 0, y: 0 },
        };
        
        scene.add(petal);
        petals.push(petal);
      }
      
      petalsRef.current = petals;
    };

    // Mouse/Touch interaction
    const handleMouseMove = (event) => {
      mouseRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };

      // Apply force to nearby petals
      petalsRef.current.forEach((petal) => {
        const mouseWorldX = mouseRef.current.x * 30;
        const mouseWorldY = mouseRef.current.y * 30;
        
        const dx = petal.position.x - mouseWorldX;
        const dy = petal.position.y - mouseWorldY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
          const force = (10 - distance) / 10;
          petal.userData.interactionForce.x = (dx / distance) * force * 0.5;
          petal.userData.interactionForce.y = (dy / distance) * force * 0.5;
        }
      });
    };

    const handleTouch = (event) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouch);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      petalsRef.current.forEach((petal) => {
        const userData = petal.userData;
        const time = Date.now() * 0.001;

        // Apply gravity and movement
        petal.position.y += userData.velocityY;
        
        // Swaying motion (like real petals falling)
        petal.position.x += Math.sin(time * userData.swaySpeed + userData.swayOffset) * userData.swayAmplitude * 0.02;
        petal.position.x += userData.velocityX;
        petal.position.z += Math.cos(time * userData.swaySpeed + userData.swayOffset) * userData.swayAmplitude * 0.01;

        // Apply interaction force
        petal.position.x += userData.interactionForce.x;
        petal.position.y += userData.interactionForce.y;
        
        // Dampen interaction force
        userData.interactionForce.x *= 0.95;
        userData.interactionForce.y *= 0.95;

        // Rotation
        petal.rotation.x += userData.rotationSpeedX;
        petal.rotation.y += userData.rotationSpeedY;
        petal.rotation.z += userData.rotationSpeedZ;

        // Reset when out of view
        if (petal.position.y < -30) {
          petal.position.y = Math.random() * 20 + 30;
          petal.position.x = (Math.random() - 0.5) * 60;
          petal.position.z = (Math.random() - 0.5) * 20;
          userData.interactionForce = { x: 0, y: 0 };
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

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      petalsRef.current.forEach((petal) => {
        if (petal.geometry) petal.geometry.dispose();
        if (petal.material) petal.material.dispose();
        scene.remove(petal);
      });

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ touchAction: 'none' }}
    />
  );
});

// --- SIMPLE FLOATING HEARTS (complementary to petals) ---
const FloatingHearts = memo(() => {
  const hearts = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 5,
    size: 16 + Math.random() * 12,
    opacity: 0.1 + Math.random() * 0.15,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute will-change-transform"
          style={{
            left: `${heart.x}%`,
            bottom: "-50px",
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: "-120vh",
            opacity: [0, heart.opacity, heart.opacity, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Heart
            size={heart.size}
            className="text-pink-400 fill-pink-400/20"
            strokeWidth={1.5}
          />
        </motion.div>
      ))}
    </div>
  );
});

// --- ENVELOPE WITH NEW COLORS ---
const EnvelopeOpening = memo(({ onOpen, audioRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const handleOpen = async () => {
    if (isOpen) return;
    setIsOpen(true);

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

    setTimeout(() => onOpen(), 2000);
    setTimeout(() => setIsHidden(true), 3500);
  };

  if (isHidden) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-white via-pink-50 to-amber-50"
      initial={{ opacity: 1 }}
      animate={isOpen ? { opacity: 0, pointerEvents: "none" } : { opacity: 1 }}
      transition={{ duration: 1.5, delay: 2 }}
    >
      <div className="relative w-[320px] h-60 md:w-100 md:h-75" style={{ perspective: "1000px" }}>
        
        <div className="relative w-full h-full cursor-pointer" onClick={handleOpen}>
          
          <div className="absolute inset-0 bg-linear-to-br from-amber-700 to-amber-800 rounded-md shadow-2xl" style={{ zIndex: 1 }} />
          
          <motion.div
            className="absolute left-8 right-8 bg-linear-to-br from-white to-pink-50 rounded-lg shadow-xl border-2 border-pink-300 overflow-hidden will-change-transform"
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
              <Heart className="text-pink-500 fill-pink-500 mb-3 md:mb-4" size={40} />
              <p className="text-amber-900 font-serif text-sm md:text-lg text-center font-medium">
                A special message
              </p>
              <p className="text-amber-700 font-serif text-xs md:text-base text-center mt-1">
                for you...
              </p>
            </div>
          </motion.div>

          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              clipPath: "polygon(0 0, 0 100%, 50% 50%)",
              background: "linear-gradient(135deg, #92400e 0%, #78350f 100%)",
              zIndex: 10
            }} 
          />
          
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              clipPath: "polygon(100% 0, 50% 50%, 100% 100%)",
              background: "linear-gradient(225deg, #92400e 0%, #78350f 100%)",
              zIndex: 10
            }} 
          />

          <motion.div
            className="absolute top-0 left-0 right-0 origin-top pointer-events-none will-change-transform"
            style={{ 
              height: "50%",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "linear-gradient(180deg, #b45309 0%, #92400e 100%)",
              zIndex: 20,
              transformStyle: "preserve-3d",
            }}
            animate={isOpen ? { 
              rotateX: -180,
              transition: { duration: 0.8, ease: "easeInOut" }
            } : { 
              rotateX: 0 
            }}
          />

          {!isOpen && (
            <>
              <div 
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{ 
                  height: "50%",
                  clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                  background: "linear-gradient(0deg, #451a03 0%, #78350f 100%)",
                  zIndex: 15
                }} 
              />

              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-linear-to-br from-pink-200 to-pink-400 border-4 border-pink-300 shadow-lg flex items-center justify-center"
                style={{ zIndex: 25 }}
              >
                <Heart className="text-white fill-white" size={20} />
              </div>

              <motion.div 
                className="absolute -bottom-20 left-0 right-0 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <button 
                  className="bg-white/95 backdrop-blur-md px-8 py-3 rounded-full shadow-2xl text-amber-800 font-bold flex items-center gap-2 mx-auto hover:bg-white transition-all border-2 border-pink-300"
                >
                  <Mail size={20} />
                  <span className="text-base md:text-lg">Tap to Open</span>
                  <Sparkles size={16} className="text-pink-400" />
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// --- HERO SECTION ---
const HeroSection = memo(() => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full bg-pink-300/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 md:w-80 md:h-80 rounded-full bg-amber-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-6 md:mb-8"
        >
          <Heart 
            size={60}
            className="text-pink-500 fill-pink-500 md:w-20 md:h-20" 
            strokeWidth={1}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="text-amber-700 text-sm md:text-lg lg:text-xl tracking-[0.2em] md:tracking-[0.3em] uppercase mb-3 md:mb-4 block font-handwritten">
            A Special Question
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-4 md:mb-6 px-4 font-romantic-heading text-romantic-glow ">
            <span className="bg-linear-to-r from-pink-500 via-pink-400 to-pink-600 bg-clip-text text-transparent">
              Will You Be
            </span>
            <br />
            <span className="text-amber-900">My Valentine?</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg sm:text-xl md:text-2xl text-amber-800 max-w-2xl mx-auto leading-relaxed px-4"
        >
          Every moment with you feels like a dream I never want to wake from. 
          Let me ask you something special...
        </motion.p>
      </div>
    </section>
  );
});

// --- VIDEO SECTION ---
const VideoMemorySection = memo(({ audioRef }) => {
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
    if (audioRef) audioRef.pause();
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    if (audioRef) audioRef.play().catch(() => {});
  };

  return (
    <section ref={sectionRef} className="relative py-24 md:py-40 px-4">
      <div className="relative z-10 max-w-full md:max-w-2xl lg:max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl bg-linear-to-r from-pink-500 via-pink-400 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4 font-bold px-4">
            My Georgous Queen
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative backdrop-blur-sm bg-white/90 border-2 border-pink-200 rounded-2xl md:rounded-3xl p-2 md:p-4 overflow-hidden shadow-xl"
        >
          <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-gray-900">
            <video
              ref={videoRef}
              className="w-full h-auto object-contain"
              onClick={handlePlayClick}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnded={handleVideoPause}
              playsInline
              preload="metadata"
            >
              <source src="Clients Video.mp4" type="video/mp4" />
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
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-linear-to-r from-pink-500 via-pink-400 to-pink-600 flex items-center justify-center shadow-2xl">
                    <Play size={32} className="text-white fill-white ml-1 md:w-12 md:h-12 md:ml-2" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

// --- REDESIGNED MOBILE-FRIENDLY SLIDESHOW WITH SWIPE GESTURES ---
const MemorySlideshowSection = memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const slides = [
    { image: "/Client 1.jpeg", caption: "Beautiful you 💕" },
    { image: "/Client 2.jpeg", caption: "My sunshine ☀️" },
  ];

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section ref={sectionRef} className="relative py-16 md:py-40 px-4">
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl bg-linear-to-r from-pink-500 via-pink-400 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4 font-bold px-4">
            Our Beautiful Memories
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative backdrop-blur-sm bg-white/95 border-2 border-pink-200 rounded-3xl p-4 md:p-6 overflow-hidden shadow-2xl"
        >
          <div 
            className="relative rounded-2xl overflow-hidden bg-linear-to-br from-gray-900 to-gray-800 select-none"
            style={{ 
              height: 'calc(100vh - 280px)', 
              minHeight: '500px',
              maxHeight: '700px'
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].caption}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  draggable="false"
                />
                
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white text-2xl md:text-4xl font-bold text-center drop-shadow-2xl"
                  >
                    {slides[currentSlide].caption}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={prevSlide}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/90 backdrop-blur-md border-2 border-pink-300 flex items-center justify-center text-amber-900 hover:bg-white hover:scale-110 active:scale-95 transition-all z-10 shadow-xl"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} className="md:w-8 md:h-8" strokeWidth={2.5} />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/90 backdrop-blur-md border-2 border-pink-300 flex items-center justify-center text-amber-900 hover:bg-white hover:scale-110 active:scale-95 transition-all z-10 shadow-xl"
              aria-label="Next image"
            >
              <ChevronRight size={28} className="md:w-8 md:h-8" strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex justify-center gap-2 md:gap-3 mt-6 md:mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-10 h-3 md:w-12 md:h-3 bg-linear-to-r from-pink-500 to-pink-600'
                    : 'w-3 h-3 bg-pink-300 hover:bg-pink-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="text-center mt-4 md:mt-6">
            <p className="text-amber-700 text-sm md:text-base font-medium">
              {currentSlide + 1} / {slides.length}
            </p>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-amber-600/70 text-xs md:text-sm mt-4 md:hidden"
        >
          👆 Swipe left or right to browse
        </motion.p>
      </div>
    </section>
  );
});

// --- LOVE MESSAGE WITH TILTED PICTURE FRAME ---
const LoveMessageSection = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const reasons = [
    "Your smile lights up my entire world",
    "Every day with you is an adventure",
    "You make me want to be a better person",
    "Your laugh is my favorite sound",
    "You make me feel safe being exactly who I am",
    "With you, even silence feels comfortable",
    "You understand me in ways I don’t always know how to explain",
    "Loving you feels natural, like it’s what my heart was made for",
  ];

  return (
    <section ref={ref} className="relative py-24 md:py-48 px-4 mt-16 md:mt-32">
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* POLAROID-STYLE TILTED PICTURE FRAME - Positioned to overlap comment */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute left-4 md:left-8 lg:-left-37 top-0 md:-top-16 lg:-top-30 z-20 w-32 sm:w-40 md:w-56 lg:w-64 -rotate-[8deg] lg:rotate-20"
        >
          {/* Polaroid shadow */}
          <div className="absolute inset-0 bg-black/30 blur-xl md:blur-2xl rounded-sm transform translate-y-4 md:translate-y-6 translate-x-1 md:translate-x-2" />
          
          {/* Polaroid frame */}
          <div className="relative bg-white p-2 md:p-4 lg:p-5 rounded-sm shadow-2xl transform hover:rotate-0 hover:scale-105 transition-all duration-500">
            {/* Photo */}
            <div className="relative overflow-hidden bg-gray-100">
              <img
                src="/Client 3.jpeg"
                alt="Beautiful you"
                className="w-full h-auto object-cover"
                style={{ 
                  aspectRatio: '3/4'
                }}
              />
            </div>
            
            {/* Handwritten caption at bottom of polaroid */}
            <div className="mt-2 md:mt-4 lg:mt-6 pb-1 md:pb-2">
              <p className="text-center text-gray-700 text-xs sm:text-sm md:text-lg lg:text-xl font-handwritten italic flex items-center justify-center gap-1 md:gap-2">
                Beautiful you
                <Heart size={14} className="text-pink-500 fill-pink-500 inline md:w-4.5 md:h-4.5" />
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-sm bg-white/90 border-2 border-pink-200 rounded-2xl md:rounded-3xl p-6 md:p-12 mb-12 md:mb-16 text-center shadow-xl pt-40 sm:pt-44 md:pt-16"
        >
          <Quote size={36} className="text-pink-400/70 mx-auto mb-4 md:mb-6 md:w-12 md:h-12" />
          <blockquote className="text-xl sm:text-2xl md:text-4xl text-amber-900 leading-relaxed mb-4 md:mb-6">
            "Fey Fey, You're the most beautiful person I know, inside and out, and honestly,
            even saying that still doesn't feel like enough. You are the waking thought to my heart. My Joy personified"
          </blockquote>
          <cite className="text-amber-700 text-base md:text-lg">— Daramfon Sunday</cite>
        </motion.div>

        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl bg-linear-to-r from-pink-500 via-pink-400 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4 font-bold px-4">
            Why I Love You
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="backdrop-blur-sm bg-white/90 border-2 border-pink-200 rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center gap-3 md:gap-4 shadow-lg"
            >
              <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-300/50 flex items-center justify-center">
                <Heart size={18} className="text-pink-600 fill-pink-600/50 md:w-5 md:h-5" />
              </div>
              <p className="text-base md:text-lg text-amber-900">{reason}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// --- LOVE LETTER ---
const TypewriterLoveLetter = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const letterParagraphs = [
    "My Dearest,",
    "I don't think you realize how much you've changed my life. Loving you has softened parts of me I didn't even know were guarded. Somehow, just knowing you're here makes everything feel a little less heavy.",
    "You make me feel safe in a way I've never felt before. When you laugh, it settles something inside me. When you smile, it reminds me that no matter how hard the day gets, I'll be okay. You feel like home to me.",
    "I didn't know love could feel this deep and still feel this calm. With you, I don't have to pretend or explain myself you see me, and you stay. That alone means more to me than I can put into words.",
    "Every moment with you matters to me. I choose you, not out of habit, but because my heart knows where it belongs with you.",
    "Forever yours,\nDaramfon ❤️"
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
    }, 20);

    return () => clearInterval(typeInterval);
  }, [isInView]);

  return (
    <section ref={ref} className="relative py-24 md:py-40 px-4">
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl bg-linear-to-r from-pink-500 via-pink-400 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4 font-bold px-4">
            A Letter From My Heart
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="relative backdrop-blur-sm bg-white/90 border-2 border-pink-200 rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl"
        >
          <pre className="font-letter text-base md:text-lg lg:text-xl text-amber-900 leading-relaxed whitespace-pre-wrap">
            {displayedText}
            {!isComplete && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-0.5 h-5 md:h-6 bg-pink-500 ml-1"
              />
            )}
          </pre>
        </motion.div>
      </div>
    </section>
  );
});

// --- QUESTION SECTION WITH EMAIL FUNCTIONALITY AND LOADING ANIMATIONS ---
const ValentineQuestion = memo(() => {
  const [step, setStep] = useState('question');
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [valentinePlan, setValentinePlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Email sending function
  const sendEmail = async (subject, message) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject,
          message: message,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Failed to send email:', data);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

  const handleYesClick = async () => {
    setIsLoading(true);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ec4899", "#f9a8d4", "#fbbf24"],
    });
    
    // Send email notification that she said YES!
    const success = await sendEmail(
      '💕 She Said YES! - Valentine\'s Day 2026',
      `🎉 AMAZING NEWS! 🎉\n\nShe clicked YES to be your Valentine!\n\nTime: ${new Date().toLocaleString()}\n\nGet ready to plan the perfect Valentine's Day! 💖`
    );
    
    setIsLoading(false);
    
    if (success) {
      setTimeout(() => setStep('plan'), 500);
    } else {
      // Still proceed even if email fails
      setTimeout(() => setStep('plan'), 500);
    }
  };

  const handleNoHover = () => {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 100;
    setNoButtonPosition({ x, y });
  };

  const handleSendPlan = async () => {
    if (!valentinePlan.trim()) return;
    
    setIsLoading(true);
    setStep('sending');
    
    // Send email with Valentine's Day plan
    const success = await sendEmail(
      '💌 Valentine\'s Day Plans Received!',
      `💝 Her Dream Valentine's Day Plan:\n\n${valentinePlan}\n\n---\nReceived: ${new Date().toLocaleString()}\n\nTime to make it happen! 🌹✨`
    );
    
    setIsLoading(false);
    
    if (success) {
      setTimeout(() => setStep('sent'), 500);
    } else {
      // Still proceed even if email fails
      setTimeout(() => setStep('sent'), 500);
    }
  };

  return (
    <section ref={ref} className="relative py-16 md:py-32 px-4 min-h-screen flex items-center justify-center">
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="backdrop-blur-sm bg-white/95 border-2 border-pink-200 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center shadow-2xl"
            >
              <h2 className="text-2xl sm:text-3xl md:text-5xl text-amber-900 mb-3 md:mb-4 font-bold px-2">
                So, what do you say?
              </h2>
              <p className="text-lg text-pink-600 font-semibold">Fey Fey, will you be my Valentine? 🌹</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative min-h-25 sm:min-h-20 mt-8">
                <button
                  onClick={handleYesClick}
                  disabled={isLoading}
                  className="px-8 sm:px-12 py-3 sm:py-4 rounded-full bg-linear-to-r from-pink-500 via-pink-400 to-pink-600 text-white font-bold text-lg sm:text-xl shadow-lg hover:shadow-pink-400/50 transition-all w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      Yes! <Heart size={18} className="fill-current" />
                    </>
                  )}
                </button>

                <motion.button
                  animate={noButtonPosition}
                  onMouseEnter={handleNoHover}
                  onTouchStart={handleNoHover}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  disabled={isLoading}
                  className="px-8 sm:px-12 py-3 sm:py-4 rounded-full border-2 border-amber-700 text-amber-700 font-bold text-lg sm:text-xl w-full sm:w-auto disabled:opacity-50"
                >
                  No...
                </motion.button>
              </div>
              
              {isLoading && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-pink-500 text-sm mt-4"
                >
                  Sending notification... 💌
                </motion.p>
              )}
            </motion.div>
          )}

          {step === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
              className="backdrop-blur-sm bg-white/95 border-2 border-pink-200 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center shadow-2xl"
            >
              <PartyPopper size={48} className="text-pink-500 md:w-16 md:h-16 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl md:text-5xl bg-linear-to-r from-pink-500 via-pink-400 to-pink-600 bg-clip-text text-transparent font-bold mb-4 md:mb-6">
                YES!!!
              </h2>
              <p className="text-lg sm:text-xl text-amber-900 mb-6 md:mb-8 px-4">
                What would you like to do on Valentine's Day? 💕
              </p>
              
              <textarea
                value={valentinePlan}
                onChange={(e) => setValentinePlan(e.target.value)}
                placeholder="Tell me your dream Valentine's Day plan..."
                disabled={isLoading}
                className="w-full h-32 md:h-40 px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white border-2 border-pink-300 focus:border-pink-500 focus:outline-none text-amber-900 placeholder-amber-600/50 resize-none font-serif text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <button
                onClick={handleSendPlan}
                disabled={!valentinePlan.trim() || isLoading}
                className="mt-6 px-8 md:px-12 py-3 md:py-4 rounded-full bg-linear-to-r from-pink-500 via-pink-400 to-pink-600 text-white font-bold text-lg md:text-xl shadow-lg hover:shadow-pink-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Send My Plan</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {step === 'sending' && (
            <motion.div
              key="sending"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="backdrop-blur-sm bg-white/95 border-2 border-pink-200 rounded-2xl md:rounded-3xl p-6 md:p-16 text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-6"
              >
                <Sparkles size={60} className="text-pink-400 md:w-20 md:h-20 mx-auto" />
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl md:text-5xl bg-linear-to-r from-pink-500 via-pink-400 to-pink-600 bg-clip-text text-transparent font-bold mb-4 md:mb-6">
                Sending Your Plan...
              </h2>
              <p className="text-lg sm:text-xl text-amber-900 mb-4 px-4">
                Delivering your message with love 💌
              </p>
              
              <div className="flex justify-center gap-2 mt-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-3 h-3 rounded-full bg-pink-400"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-3 h-3 rounded-full bg-pink-400"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-3 h-3 rounded-full bg-pink-400"
                />
              </div>
            </motion.div>
          )}

          {step === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="backdrop-blur-sm bg-white/95 border-2 border-pink-200 rounded-2xl md:rounded-3xl p-6 md:p-16 text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1
                }}
              >
                <Sparkles size={60} className="text-pink-400 md:w-20 md:h-20 mx-auto mb-6" />
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl md:text-6xl bg-linear-to-r from-pink-500 via-pink-400 to-pink-600 bg-clip-text text-transparent font-bold mb-4 md:mb-6">
                Message Sent!
              </h2>
              <p className="text-xl sm:text-2xl text-amber-900 mb-4 px-4">
                I can't wait for our Valentine's Day! 💌
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
});

// --- MAIN APP ---
export default function App() {
  const [backgroundAudio, setBackgroundAudio] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-pink-50 to-amber-50 font-serif relative overflow-x-hidden">
      
      <BackgroundMusic onAudioRef={setBackgroundAudio} />
      
      <EnvelopeOpening 
        audioRef={backgroundAudio} 
        onOpen={() => setHasStarted(true)} 
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={hasStarted ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className={hasStarted ? "block" : "hidden"}
      >
        <ThreeDFlowerPetals />
        <FloatingHearts />
        <HeroSection />
        <VideoMemorySection audioRef={backgroundAudio} />
        <MemorySlideshowSection />
        <LoveMessageSection />
        <TypewriterLoveLetter />
        <ValentineQuestion />
        
        <footer className="relative py-12 md:py-16 px-4 text-center">
          <p className="text-xs md:text-sm text-amber-700 mt-3 md:mt-4">
            Valentine's Day 2026
          </p>
        </footer>
      </motion.div>
    </div>
  );
}