
import React, { useRef, useState, useEffect, useCallback } from 'react';

interface LocationScannerProps {
  onLocationScanned: (code: string) => void;
  lastPackageName: string | null;
}

const LocationScanner: React.FC<LocationScannerProps> = ({ onLocationScanned, lastPackageName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Camera access denied.');
    }
  }, []);

  useEffect(() => {
    startCamera();
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          // @ts-ignore
          const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            setIsScanning(false);
            onLocationScanned(code.data);
          }
        }
      }
    }, 200);

    return () => {
      clearInterval(interval);
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [startCamera, isScanning, onLocationScanned]);

  return (
    <div className="relative h-full w-full flex flex-col bg-black">
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <h2 className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Linking Location</h2>
        <p className="text-white text-sm font-medium truncate">
          {lastPackageName ? `Item: ${lastPackageName}` : 'Scan location for latest item'}
        </p>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-emerald-500 rounded-3xl relative">
            <div className="scanner-line absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981]"></div>
          </div>
        </div>
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p className="text-white bg-black/60 inline-block px-4 py-2 rounded-full text-xs">
            Point at Shelf Barcode / QR Code
          </p>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default LocationScanner;
