import React, { useEffect, useState } from 'react';

export default function Video360() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Cargamos el motor 3D de forma segura para móviles y PC
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const iniciarExperiencia = async () => {
    // Pedir permiso de giroscopio en celulares (es obligatorio para iOS/Safari)
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') {
          alert('Permiso de movimiento denegado. Puedes mover el video usando tu dedo.');
        }
      } catch (error) {
        console.error('Error al pedir permisos:', error);
      }
    }

    // Reproducir el video de Dropbox
    const video = document.getElementById('video360-element');
    if (video) {
      video.play().catch(err => console.log("Error de reproducción:", err));
      setIsPlaying(true);
    }
  };

  if (!scriptLoaded) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', padding: '50px', backgroundColor: '#000', borderRadius: '12px' }}>
        Cargando reproductor interactivo 360°...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '500px', position: 'relative', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* Botón flotante inicial: obligatorio para que el navegador móvil permita el giroscopio */}
      {!isPlaying && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          zIndex: 99, backgroundColor: 'rgba(0,0,0,0.85)', padding: '20px', textAlign: 'center'
        }}>
          <p style={{ color: '#fff', marginBottom: '15px', fontFamily: 'sans-serif', fontSize: '16px' }}>
            Para activar el movimiento con el giroscopio de tu celular, presiona el botón:
          </p>
          <button 
            onClick={iniciarExperiencia}
            style={{
              padding: '14px 28px', fontSize: '16px', fontWeight: 'bold',
              backgroundColor: '#00c3a5', color: '#fff', border: 'none', 
              borderRadius: '30px', cursor: 'pointer', boxShadow: '0px 4px 15px rgba(0,195,165,0.4)'
            }}
          >
            Activar Giroscopio 360°
          </button>
        </div>
      )}

      {/* Visor 3D que proyecta el video de tu Dropbox */}
      <div 
        style={{ width: '100%', height: '100%' }}
        dangerouslySetInnerHTML={{
          __html: `
            <a-scene embedded vr-mode-ui="enabled: false" style="width: 100%; height: 100%;">
              <a-assets>
                <video id="video360-element" src="https://www.dropbox.com/scl/fi/hy1muqmxg7t03a1ww7rkf/Thyrosense360-Espa-ol.mp4?rlkey=ra9733pxfiud4yvw42vfbqann&st=4c3g6ygl&raw=1" 
                       loop crossorigin="anonymous" playsinline webkit-playsinline muted>
                </video>
              </a-assets>
              <a-videosphere src="#video360-element" rotation="0 -90 0"></a-videosphere>
              <a-camera look-controls="magicWindowTrackingEnabled: true; touchEnabled: true;"></a-camera>
            </a-scene>
          `
        }}
      />
    </div>
  );
}
