import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Flashlight, RefreshCw, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';
import { CheckInResponse } from '../types/index.js';
import { CheckInResultModal } from './CheckInResultModal.js';

export const QRScanner: React.FC = () => {
  const [scannerStarted, setScannerStarted] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<CheckInResponse | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<string>('Apunta la cámara al código QR del pase');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningBlockedRef = useRef<boolean>(false);

  // Initialize and list cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          const deviceList = devices.map((d) => ({ id: d.id, label: d.label || `Cámara ${d.id}` }));
          setCameras(deviceList);

          // Prefer back/environment camera for door scanning
          const backCam = deviceList.find((d) =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('trasera') ||
            d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : deviceList[0].id);
        } else {
          setStatusMessage('No se encontraron cámaras disponibles en este dispositivo');
        }
      })
      .catch((err) => {
        console.warn('Error al obtener cámaras:', err);
        setStatusMessage('Permiso de cámara denegado o no disponible. Puedes usar el ingreso manual.');
      });

    return () => {
      stopScanner();
    };
  }, []);

  // Start scanner when camera is selected
  useEffect(() => {
    if (selectedCameraId) {
      startScanner(selectedCameraId);
    }
  }, [selectedCameraId]);

  const startScanner = async (cameraId: string) => {
    try {
      if (scannerRef.current) {
        await stopScanner();
      }

      const scanner = new Html5Qrcode('qr-reader-viewport', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scanner.start(
        cameraId,
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Frame scan error (normal when no QR in view)
        }
      );

      setScannerStarted(true);
      setStatusMessage('Escaneando en tiempo real...');

      // Check if torch/flashlight is supported
      try {
        const capabilities = scanner.getRunningTrackCapabilities();
        if (capabilities && (capabilities as any).torch) {
          setHasTorch(true);
        }
      } catch (e) {
        setHasTorch(false);
      }
    } catch (err: any) {
      console.error('Error al iniciar el scanner:', err);
      setScannerStarted(false);
      setStatusMessage('No se pudo acceder a la cámara seleccionada.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error al detener scanner:', e);
      }
    }
    setScannerStarted(false);
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn } as any],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn('Error toggling flashlight:', err);
    }
  };

  const handleScanSuccess = async (rawCode: string) => {
    if (isScanningBlockedRef.current || isProcessing) return;

    // Extract ticket code if attendee scanned full URL (e.g. /ticket/ALLSTAR-XXXXXX)
    let code = rawCode.trim();
    if (code.includes('/ticket/')) {
      const parts = code.split('/ticket/');
      code = parts[parts.length - 1];
    }
    code = code.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();

    isScanningBlockedRef.current = true;
    setIsProcessing(true);
    setStatusMessage(`Validando código ${code}...`);

    try {
      const response = await api.checkInTicket(code);
      setScanResult(response);
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.message || 'Error al conectar con el servidor',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanSuccess(manualCode.trim());
    setManualCode('');
  };

  const handleCloseModal = () => {
    setScanResult(null);
    setStatusMessage('Listo para el siguiente asistente');
    // Debounce re-scanning by 1 second to avoid immediately rescanning the same QR
    setTimeout(() => {
      isScanningBlockedRef.current = false;
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Scanner Card */}
      <div className="w-full bg-allstar-navy-800 rounded-3xl border border-allstar-gold/30 shadow-gold overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-allstar-navy-900 border-b border-allstar-gold/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-white text-sm uppercase tracking-wider">
              Control de Acceso • Scanner
            </h2>
          </div>

          {/* Flashlight toggle */}
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-xl border transition-all ${
                torchOn
                  ? 'bg-amber-400 text-black border-amber-300'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Linterna / Flash"
            >
              <Flashlight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Camera Viewport Area */}
        <div className="relative bg-black w-full aspect-square flex items-center justify-center overflow-hidden">
          {/* HTML5-QRCode Target DOM Element */}
          <div id="qr-reader-viewport" className="w-full h-full" />

          {/* Laser Scanline Guide Animation */}
          {scannerStarted && !isProcessing && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-64 h-64 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Animated Laser line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] scanner-laser" />
              </div>
            </div>
          )}

          {/* Processing Spinner Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
              <span className="font-bold text-sm tracking-wider uppercase text-emerald-300">
                Verificando en Base de Datos...
              </span>
            </div>
          )}
        </div>

        {/* Camera Selector Dropdown */}
        {cameras.length > 1 && (
          <div className="p-3 bg-allstar-navy-900 border-t border-white/5 flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Cámara:</span>
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-allstar-gold"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Live Status Footer */}
        <div className="p-4 bg-allstar-navy-900/90 border-t border-allstar-gold/20 text-center">
          <p className="text-xs text-slate-300 font-medium">{statusMessage}</p>
        </div>
      </div>

      {/* Manual Input Fallback */}
      <div className="w-full mt-5 bg-allstar-navy-800/80 rounded-2xl p-4 border border-white/10">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 uppercase mb-2">
          <KeyRound className="w-3.5 h-3.5 text-allstar-gold" />
          <span>Ingreso Manual de Código</span>
        </div>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="Ej: ALLSTAR-849382"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-allstar-gold uppercase"
          />
          <button
            type="submit"
            disabled={!manualCode.trim() || isProcessing}
            className="px-4 py-2 bg-allstar-gold hover:bg-amber-500 text-black font-bold text-xs rounded-xl uppercase tracking-wider disabled:opacity-50 transition-all"
          >
            Validar
          </button>
        </form>
      </div>

      {/* Modal Result for Check-in */}
      <CheckInResultModal result={scanResult} onClose={handleCloseModal} />
    </div>
  );
};
