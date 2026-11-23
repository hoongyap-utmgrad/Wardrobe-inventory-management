import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, Check, X, Image as ImageIcon } from 'lucide-react';
import { SAMPLE_CLOTHING_IMAGES } from '../data/defaultData';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel?: () => void;
  defaultCategory?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel,
  defaultCategory = 'Tops',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'camera' | 'upload' | 'preset'>('camera');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access denied or unavailable. You can upload a photo or pick a sample.');
      setCameraActive(false);
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth || 400;
        canvas.height = video.videoHeight || 400;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (presetDataUrl: string) => {
    setCapturedImage(presetDataUrl);
    stopCamera();
  };

  const confirmSelection = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    if (mode === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 max-w-md mx-auto relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-base text-slate-100">Capture Garment Photo</h3>
        </div>
        {onCancel && (
          <button
            onClick={() => {
              stopCamera();
              onCancel();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main View Area */}
      {capturedImage ? (
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            <img
              src={capturedImage}
              alt="Captured garment"
              className="w-full h-full object-contain bg-slate-900"
            />
            <span className="absolute top-2 right-2 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow">
              <Check className="w-3.5 h-3.5" /> Photo Ready
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={retake}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" /> Retake
            </button>
            <button
              onClick={confirmSelection}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Check className="w-4 h-4" /> Use Photo
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('camera');
                startCamera();
              }}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                mode === 'camera'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Camera
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('upload');
                stopCamera();
              }}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                mode === 'upload'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload File
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('preset');
                stopCamera();
              }}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                mode === 'preset'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Samples
            </button>
          </div>

          {/* Camera Stream Area */}
          {mode === 'camera' && (
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Camera overlay crosshairs */}
                  <div className="absolute inset-8 border-2 border-white/20 border-dashed rounded-2xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded backdrop-blur">
                      Center garment here
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={takePhoto}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-4 border-indigo-500/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <Camera className="w-5 h-5" />
                    </div>
                  </button>
                </>
              ) : (
                <div className="p-6 text-center text-slate-400 space-y-3">
                  <Camera className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs text-slate-300">
                    {cameraError || 'Starting video camera...'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 rounded-lg border border-slate-700 transition-colors"
                  >
                    Retry Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {/* File Upload Mode */}
          {mode === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square w-full rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 flex flex-col items-center justify-center p-6 cursor-pointer transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-medium text-sm text-slate-200 text-center">
                Click to browse photo file
              </p>
              <p className="text-xs text-slate-500 mt-1 text-center">
                Supports JPG, PNG, WEBP (Max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Preset Sample Gallery */}
          {mode === 'preset' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Choose a high-quality sample template:</p>
              <div className="grid grid-cols-3 gap-2 max-h-[260px] overflow-y-auto p-1">
                {Object.entries(SAMPLE_CLOTHING_IMAGES).map(([key, imgUrl]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectPreset(imgUrl)}
                    className="aspect-square rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 p-2 flex flex-col items-center justify-center transition-all hover:scale-105"
                  >
                    <img src={imgUrl} alt={key} className="w-12 h-12 object-contain mb-1" />
                    <span className="text-[10px] text-slate-400 capitalize truncate max-w-full">
                      {key.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas for taking snapshot */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
