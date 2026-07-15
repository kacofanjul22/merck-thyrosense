import { motion, AnimatePresence } from "motion/react";
import { X, Maximize2, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { translations, LanguageCode } from "../translations";

interface Video360PlayerProps {
  contentId: string;
  onClose: () => void;
  language: LanguageCode;
}

// Enlace de Dropbox directo y optimizado para streaming 3D
const videoData: Record<string, { url: string }> = {
  ximena: {
    url: "https://dl.dropboxusercontent.com/scl/fi/hy1muqmxg7t03a1ww7rkf/Thyrosense360-Espa-ol.mp4?rlkey=ra9733pxfiud4yvw42vfbqann&st=mksfy28a&raw=1"
  },
  "cuerpo-humano": {
    url: "https://dl.dropboxusercontent.com/scl/fi/hy1muqmxg7t03a1ww7rkf/Thyrosense360-Espa-ol.mp4?rlkey=ra9733pxfiud4yvw42vfbqann&st=mksfy28a&raw=1"
  },
  tercera: {
    url: "https://dl.dropboxusercontent.com/scl/fi/hy1muqmxg7t03a1ww7rkf/Thyrosense360-Espa-ol.mp4?rlkey=ra9733pxfiud4yvw42vfbqann&st=mksfy28a&raw=1"
  }
};

export function Video360Player({ contentId, onClose, language }: Video360PlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);

  const video = videoData[contentId];
  const t = translations[language];
  const videoTitle =
    contentId === "ximena"
      ? t.contentSelector.ximena.title
      : contentId === "cuerpo-humano"
      ? t.contentSelector.cuerpoHumano.title
      : t.contentSelector.tercera.title;

  // 1. Cargar el motor A-Frame
  useEffect(() => {
    if ((window as any).AFRAME) {
      setScriptLoaded(true);
      setIsReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://aframe.io/releases/1.4.0/aframe.min.js";
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
      setIsReady(true);
    };
    document.head.appendChild(script);
  }, []);

  // 2. Detectar si es celular para mostrar la pantalla de inicio interactivo
  useEffect(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobileDevice) {
      setShowMobileOverlay(true);
      setPlaying(false); 
    } else {
      setPlaying(true); // En PC arranca solo
    }
  }, []);

  // 3. Control de reproducción estándar (para pausar/reproducir con los controles después de iniciar)
  useEffect(() => {
    if (!scriptLoaded || showMobileOverlay) return;
    const videoEl = document.getElementById("video360-element") as HTMLVideoElement | null;
    if (videoEl) {
      if (playing) {
        videoEl.play().catch((err) => console.log("Error al reproducir:", err));
      } else {
        videoEl.pause();
      }
    }
  }, [playing, scriptLoaded, showMobileOverlay]);

  // 4. Sincronizar el silencio (Mute)
  useEffect(() => {
    if (!scriptLoaded) return;
    const videoEl = document.getElementById("video360-element") as HTMLVideoElement | null;
    if (videoEl) {
      videoEl.muted = muted;
    }
  }, [muted, scriptLoaded]);

  // 5. INICIO EN MÓVILES: El truco para saltarse el bloqueo de seguridad
  const handleStartMobile = async () => {
    // Pedir permisos de giroscopio de inmediato en el clic
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        await DeviceOrientationEvent.requestPermission();
      } catch (error) {
        console.error("Error de sensores:", error);
      }
    }

    // REPRODUCCIÓN INMEDIATA (Síncrona): Engaña al navegador del celular para que reproduzca al instante
    const videoEl = document.getElementById("video360-element") as HTMLVideoElement | null;
    if (videoEl) {
      videoEl.muted = false; // Arranca con sonido directo
      videoEl.play()
        .then(() => {
          setShowMobileOverlay(false);
          setMuted(false);
          setPlaying(true);
        })
        .catch((err) => {
          console.error("Fallo la reproducción síncrona:", err);
          // Si falla con sonido por políticas extremas, intentamos reproducir en silencio
          videoEl.muted = true;
          videoEl.play().then(() => {
            setShowMobileOverlay(false);
            setMuted(true);
            setPlaying(true);
          });
        });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative w-full h-full">
        {/* Renderizado de A-Frame */}
        {scriptLoaded ? (
          <div
            className="w-full h-full absolute inset-0"
            dangerouslySetInnerHTML={{
              __html: `
                <a-scene embedded vr-mode-ui="enabled: false" style="width: 100%; height: 100%;">
                  <a-assets>
                    <video id="video360-element" src="${video.url}" 
                           loop crossorigin="anonymous" preload="auto" playsinline webkit-playsinline muted>
                    </video>
                  </a-assets>
                  <a-videosphere src="#video360-element" rotation="0 -90 0"></a-videosphere>
                  <a-camera look-controls="magicWindowTrackingEnabled: true; touchEnabled: true;"></a-camera>
                </a-scene>
              `
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
            Cargando reproductor 360°...
          </div>
        )}

        {/* Pantalla de bienvenida móvil (Para activar el Giroscopio) */}
        {showMobileOverlay && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 px-6 text-center backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md space-y-6"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold tracking-wider uppercase animate-pulse">
                Experiencia 360°
              </span>
              <h2 className="text-white text-2xl sm:text-3xl font-bold font-sans">
                {videoTitle}
              </h2>
              <p className="text-white/60 text-sm sm:text-base">
                Para disfrutar de la inmersión total, activa los sensores de movimiento de tu dispositivo.
              </p>
              <button
                onClick={handleStartMobile}
                className="w-full sm:w-auto px-8 py-4 bg-violet-600 text-white font-bold rounded-full shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition-all active:scale-95 text-base sm:text-lg"
              >
                Comenzar Experiencia
              </button>
            </motion.div>
          </div>
        )}

        {/* Controles del Reproductor */}
        <AnimatePresence>
          {showControls && !showMobileOverlay && (
            <>
              {/* Barra superior */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 z-[55]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse" />
                    <h2 className="text-white text-sm sm:text-base md:text-xl truncate max-w-[150px] sm:max-w-none">{videoTitle}</h2>
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-violet-600 text-white text-xs sm:text-sm">360°</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors border border-white/20"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Barra inferior */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-[55]"
              >
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (isReady) {
                        setPlaying(!playing);
                      }
                    }}
                    disabled={!isReady}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {playing ? (
                      <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-1" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMuted(!muted)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors border border-white/20"
                  >
                    {muted ? (
                      <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (document.fullscreenElement) {
                        document.exitFullscreen();
                      } else {
                        document.documentElement.requestFullscreen();
                      }
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors border border-white/20"
                  >
                    <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.button>
                </div>

                <div className="mt-3 sm:mt-4 text-center px-4">
                  <p className="text-white/60 text-xs sm:text-sm">
                    {t.videoPlayer.helpText}
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Punto de mira central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[51]">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="w-8 h-8 border-2 border-white rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
