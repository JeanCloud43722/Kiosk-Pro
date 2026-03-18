
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { performOCR } from '../services/ocrService';
import { Package, OCRResult } from '../types';

interface ScannerProps {
  onPackageScanned: (pkg: Package) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onPackageScanned }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('Ready to Scan');
  const [tempResult, setTempResult] = useState<OCRResult | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
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
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [startCamera]);

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;

    setIsScanning(true);
    setStatusMsg('Extracting Text...');
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];

    try {
      const result = await performOCR(base64);
      setTempResult(result);
    } catch (err) {
      setStatusMsg('OCR Failed. Try Again.');
      setIsScanning(false);
    }
  };

  const confirmPackage = () => {
    if (!tempResult) return;
    const newPackage: Package = {
      id: crypto.randomUUID(),
      name: tempResult.name,
      trackingId: tempResult.trackingId,
      receivedAt: new Date().toISOString(),
      pickedUp: false,
      locationCode: null
    };
    onPackageScanned(newPackage);
    setTempResult(null);
    setIsScanning(false);
    setStatusMsg('Saved!');
    setTimeout(() => setStatusMsg('Ready to Scan'), 2000);
  };

  const cancelScan = () => {
    setTempResult(null);
    setIsScanning(false);
    setStatusMsg('Ready to Scan');
  };

  return (
    <div className="relative h-full w-full flex flex-col bg-black">
      {error ? (
        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-700 rounded-lg text-white font-bold">Retry</button>
        </div>
      ) : (
        <>
          <div className="relative flex-1 overflow-hidden">
            <video ref={videoRef} playsInline className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                <div className="w-full max-w-xs h-40 border-2 border-emerald-500/50 rounded-xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-emerald-500"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-emerald-500"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-emerald-500"></div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-emerald-500"></div>
                </div>
            </div>

            {tempResult && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 z-20">
                <h3 className="text-emerald-400 font-bold mb-4 uppercase tracking-widest">Confirm Package</h3>
                <div className="bg-slate-800 w-full p-6 rounded-2xl shadow-2xl border border-slate-700 mb-8">
                  <div className="mb-4">
                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Recipient</label>
                    <p className="text-xl text-white font-bold">{tempResult.name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Tracking ID</label>
                    <p className="text-lg text-slate-300 font-mono">{tempResult.trackingId}</p>
                  </div>
                </div>
                <div className="flex w-full gap-4">
                  <button onClick={cancelScan} className="flex-1 py-4 rounded-xl bg-slate-700 text-white font-bold active:scale-95 transition-all">Retake</button>
                  <button onClick={confirmPackage} className="flex-1 py-4 rounded-xl bg-emerald-600 text-white font-bold active:scale-95 transition-all shadow-lg shadow-emerald-500/20">Confirm</button>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-0 right-0 flex justify-center">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                statusMsg.includes('Failed') ? 'bg-red-500' : 
                statusMsg.includes('Saved') ? 'bg-emerald-500' : 'bg-slate-900/80'
              } text-white shadow-lg transition-colors`}>
                {statusMsg}
              </span>
            </div>
          </div>

          <div className="p-6 bg-slate-900 flex flex-col items-center gap-4 safe-bottom">
            <p className="text-xs text-slate-400 text-center px-4">Focus on name and barcode</p>
            <button
              onClick={captureAndScan}
              disabled={isScanning}
              className={`w-20 h-20 rounded-full border-4 ${isScanning ? 'border-slate-600 bg-slate-800' : 'border-emerald-500 bg-emerald-600'} flex items-center justify-center active:scale-95 transition-all shadow-xl`}
            >
              {isScanning ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="w-10 h-10 text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,17.5C14.33,17.5 16.3,15.89 16.86,13.75H18.91C18.3,17 15.42,19.5 12,19.5C8.58,19.5 5.7,17 5.09,13.75H7.14C7.7,15.89 9.67,17.5 12,17.5M12,4.5C15.42,4.5 18.3,7 18.91,10.25H16.86C16.3,8.11 14.33,6.5 12,6.5C9.67,6.5 7.7,8.11 7.14,10.25H5.09C5.7,7 8.58,4.5 12,4.5M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2Z" /></svg>
                </div>
              )}
            </button>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Scanner;
