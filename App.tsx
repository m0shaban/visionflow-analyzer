
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AnalysisStatus, ProcessedFrameData, OverallTrafficSummary, PeakCongestionMoment } from './types';
import { UI_TEXT, FRAME_ANALYSIS_INTERVAL_MS, VIDEO_FRAMES_TO_CAPTURE, CAMERA_MAX_FRAMES_TO_ANALYZE } from './constants';
import { analyzeFrameWithGemini, getTrafficAdviceFromGemini, getAnalysisHighlightsFromGemini } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import MetricsDisplay from './components/MetricsDisplay';
import WelcomePage from './components/WelcomePage'; // New import

// Helper Icons (can be moved to a shared Icons.tsx file if they grow)
const VideoCameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path d="M3 4a2 2 0 00-2 2v8a2 2 0 002 2h11a2 2 0 002-2V8.303l3.536 2.652A1 1 0 0021 10V6a1 1 0 00-1.464-.874L16 7.697V6a2 2 0 00-2-2H3z" />
  </svg>
);
const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM3 5a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm10 2a.5.5 0 01.5.5v1.28l1.24-.93a.5.5 0 01.76.42v5.46a.5.5 0 01-.76.42l-1.24-.93V12.5a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-4a.5.5 0 01.5-.5h4zM10 8a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" clipRule="evenodd" />
    <path d="M7 8a2.5 2.5 0 100 5A2.5 2.5 0 007 8zm3 2.5a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
);
const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
        <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5zm7 0a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
    </svg>
);
const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
        <path d="M5 3.5A1.5 1.5 0 016.5 2h7A1.5 1.5 0 0115 3.5v7a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 10.5v-7z" />
    </svg>
);
const ClearIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0L12 14.25m2.25-2.25L14.25 9.75M6 20.25h12A2.25 2.25 0 0020.25 18V7.5H3.75v10.5A2.25 2.25 0 006 20.25zM18 3.75H6A2.25 2.25 0 003.75 6v1.5h16.5V6A2.25 2.25 0 0018 3.75z" />
  </svg>
);


const App: React.FC = () => {
  const [showWelcomePage, setShowWelcomePage] = useState<boolean>(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(AnalysisStatus.Idle);
  const [processedFrames, setProcessedFrames] = useState<ProcessedFrameData[]>([]);
  const [overallSummary, setOverallSummary] = useState<OverallTrafficSummary | null>(null);
  const [currentError, setCurrentError] = useState<string>('');
  const [progress, setProgress] = useState<{ current: number, total: number } | null>(null);
  
  const [trafficAdvice, setTrafficAdvice] = useState<string | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState<boolean>(false);
  const [analysisHighlights, setAnalysisHighlights] = useState<string | null>(null);
  const [isHighlightsLoading, setIsHighlightsLoading] = useState<boolean>(false);

  const analysisIntervalRef = useRef<number | null>(null);
  const currentFrameIndexRef = useRef<number>(0);
  const videoTargetFramesCountRef = useRef<number>(VIDEO_FRAMES_TO_CAPTURE);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setCurrentError(UI_TEXT.apiKeyMissing);
      // Don't set status to Error here if welcome page is shown first,
      // as error message is on main app page.
    }
  }, []);

  const cleanupMediaStream = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const resetAnalysisState = () => {
    setProcessedFrames([]);
    setOverallSummary(null);
    setCurrentError('');
    setProgress(null);
    setTrafficAdvice(null);
    setIsAdviceLoading(false);
    setAnalysisHighlights(null);
    setIsHighlightsLoading(false);
    currentFrameIndexRef.current = 0;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      stopAnalysis(false);
      cleanupMediaStream();
      setIsCameraActive(false);
      
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      resetAnalysisState();
      setAnalysisStatus(AnalysisStatus.Idle);
      event.target.value = ''; // Allow re-selecting the same file
    }
  };

  const toggleCamera = async () => {
    stopAnalysis(false); // Stop any ongoing analysis
    if (isCameraActive) {
      cleanupMediaStream();
      setIsCameraActive(false);
      setVideoSrc(null); // Clear video file source
      resetAnalysisState();
      setAnalysisStatus(AnalysisStatus.Idle);
    } else {
      setCurrentError(''); // Clear previous errors
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          setVideoFile(null); // Clear video file
          setVideoSrc(null);  // Clear video file source
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true; // Mute camera preview
          
          videoRef.current.play()
            .then(() => {
              setIsCameraActive(true); // Set active only on successful play
              resetAnalysisState();
              setAnalysisStatus(AnalysisStatus.Idle);
            })
            .catch(e => {
              console.error("Error playing camera stream:", e);
              setCurrentError(`${UI_TEXT.errorAccessingCamera} - Playback failed: ${(e as Error).message}`);
              cleanupMediaStream(); // Stop tracks
              if(videoRef.current) videoRef.current.srcObject = null; // Clear srcObject
              setIsCameraActive(false); // Ensure isCameraActive is false
              setAnalysisStatus(AnalysisStatus.Error); 
            });
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCurrentError(`${UI_TEXT.errorAccessingCamera} - Initialisation failed: ${(err as Error).message}`);
        setIsCameraActive(false);
        setAnalysisStatus(AnalysisStatus.Error); 
      }
    }
  };

  const captureFrame = useCallback((): string | null => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState >= videoRef.current.HAVE_CURRENT_DATA && videoRef.current.videoWidth > 0) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    }
    return null;
  }, []);

  const fetchTrafficAdvice = useCallback(async (summary: OverallTrafficSummary) => {
    setIsAdviceLoading(true);
    setTrafficAdvice(null);
    try {
      const advice = await getTrafficAdviceFromGemini(summary);
      setTrafficAdvice(advice);
    } catch (error) {
      console.error(UI_TEXT.errorFetchingAdvice, error);
      setTrafficAdvice(UI_TEXT.errorFetchingAdvice + ` ${(error as Error).message}`);
    } finally {
      setIsAdviceLoading(false);
    }
  }, []);
  
  const fetchAnalysisHighlights = useCallback(async (summary: OverallTrafficSummary) => {
    setIsHighlightsLoading(true);
    setAnalysisHighlights(null);
    try {
      const highlights = await getAnalysisHighlightsFromGemini(summary);
      setAnalysisHighlights(highlights);
    } catch (error) {
      console.error(UI_TEXT.errorFetchingHighlights, error);
      setAnalysisHighlights(UI_TEXT.errorFetchingHighlights + ` ${(error as Error).message}`);
    } finally {
      setIsHighlightsLoading(false);
    }
  }, []);

  const finalizeAndSummarizeAnalysis = useCallback(() => {
    setAnalysisStatus(AnalysisStatus.Success);
    setProgress(null);
    if (analysisIntervalRef.current) {
      clearTimeout(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    setProcessedFrames(currentProcessedFrames => {
        if (currentProcessedFrames.length === 0) {
            setOverallSummary(null);
            return currentProcessedFrames; 
        }

        let totalVehiclesSum = 0;
        const typeCounts: { [key: string]: number } = {};
        const congestionCounts: { [key: string]: number } = {};
        let unusualActivitiesCount = 0;
        const unusualActivityTypeCounts: { [key: string]: number } = {};
        
        currentProcessedFrames.forEach(frame => {
          totalVehiclesSum += frame.total_vehicles;
          frame.vehicle_type_counts.forEach(vt => {
              typeCounts[vt.type] = (typeCounts[vt.type] || 0) + vt.count;
          });
          congestionCounts[frame.congestion_level] = (congestionCounts[frame.congestion_level] || 0) + 1;
          if (frame.unusual_activity?.detected) {
            unusualActivitiesCount++;
            const activityType = frame.unusual_activity.activity_type || 'Unknown';
            unusualActivityTypeCounts[activityType] = (unusualActivityTypeCounts[activityType] || 0) + 1;
          }
        });

        const peakCongestionMoments: PeakCongestionMoment[] = [...currentProcessedFrames]
          .sort((a,b) => b.total_vehicles - a.total_vehicles)
          .slice(0,5)
          .map(f => ({
            timestamp: f.timestamp, 
            total_vehicles: f.total_vehicles, 
            congestion_level: f.congestion_level,
            frameImageBase64: f.frameImageBase64
          }));

        const summary: OverallTrafficSummary = {
          totalFramesAnalyzed: currentProcessedFrames.length,
          totalVehiclesDetectedAcrossFrames: totalVehiclesSum,
          averageVehiclesPerFrame: currentProcessedFrames.length > 0 ? totalVehiclesSum / currentProcessedFrames.length : 0,
          peakCongestionMoments: peakCongestionMoments,
          vehicleTypeDistribution: Object.entries(typeCounts).map(([type, count]) => ({ type, count })),
          commonCongestionLevels: Object.entries(congestionCounts).map(([level, count]) => ({ level, count })).sort((a,b) => b.count - a.count),
          detectedUnusualActivitiesCount: unusualActivitiesCount,
          mostCommonUnusualActivityTypes: Object.entries(unusualActivityTypeCounts)
            .map(([type, count]) => ({ type, count }))
            .sort((a,b) => b.count - a.count)
            .slice(0, 5),
        };
        setOverallSummary(summary);
        fetchTrafficAdvice(summary);
        fetchAnalysisHighlights(summary); 
        return currentProcessedFrames;
    });
  }, [fetchTrafficAdvice, fetchAnalysisHighlights]);

  const processSingleFrameAndContinue = useCallback(async () => {
    if (analysisStatus !== AnalysisStatus.Processing && analysisStatus !== AnalysisStatus.Paused) return;
    if (analysisStatus === AnalysisStatus.Paused) return; 

    const base64ImageData = captureFrame();
    if (!base64ImageData) {
      if (currentFrameIndexRef.current >= videoTargetFramesCountRef.current -1 && analysisStatus === AnalysisStatus.Processing) {
        finalizeAndSummarizeAnalysis();
      } else if (analysisStatus === AnalysisStatus.Processing) {
         analysisIntervalRef.current = window.setTimeout(processSingleFrameAndContinue, FRAME_ANALYSIS_INTERVAL_MS);
      }
      return;
    }

    try {
      const analysisResult = await analyzeFrameWithGemini(base64ImageData);
      const newFrameData: ProcessedFrameData = {
        ...analysisResult,
        timestamp: videoRef.current?.currentTime ?? currentFrameIndexRef.current * (FRAME_ANALYSIS_INTERVAL_MS / 1000),
        frameImageBase64: base64ImageData,
      };
      setProcessedFrames(prev => [...prev, newFrameData]);
      currentFrameIndexRef.current++;

      if (currentFrameIndexRef.current < videoTargetFramesCountRef.current && analysisStatus === AnalysisStatus.Processing) {
        setProgress({ current: currentFrameIndexRef.current +1, total: videoTargetFramesCountRef.current });
        if (videoFile && videoRef.current) {
            const video = videoRef.current;
            const nextTime = (currentFrameIndexRef.current / videoTargetFramesCountRef.current) * video.duration;
             if (video.currentTime < nextTime && nextTime < video.duration && !video.seeking) {
                 video.currentTime = nextTime; 
            } else if (!video.seeking && currentFrameIndexRef.current < videoTargetFramesCountRef.current) {
                 analysisIntervalRef.current = window.setTimeout(processSingleFrameAndContinue, FRAME_ANALYSIS_INTERVAL_MS);
            } else if (currentFrameIndexRef.current >= videoTargetFramesCountRef.current) {
                 finalizeAndSummarizeAnalysis();
            }
        } else if (isCameraActive) {
            analysisIntervalRef.current = window.setTimeout(processSingleFrameAndContinue, FRAME_ANALYSIS_INTERVAL_MS);
        }
      } else if (analysisStatus === AnalysisStatus.Processing) { 
        finalizeAndSummarizeAnalysis();
      }
    } catch (error) {
      console.error("Error processing frame:", error);
      setCurrentError((error as Error).message || UI_TEXT.analysisError);
      setAnalysisStatus(AnalysisStatus.Error);
      if (analysisIntervalRef.current) clearTimeout(analysisIntervalRef.current);
    }
  }, [analysisStatus, captureFrame, finalizeAndSummarizeAnalysis, videoFile, isCameraActive]);


  const startAnalysis = () => {
    if (!videoSrc && !isCameraActive) {
      setCurrentError(UI_TEXT.noMediaSelected); return;
    }
    if (!process.env.API_KEY) {
      setCurrentError(UI_TEXT.apiKeyMissing); setAnalysisStatus(AnalysisStatus.Error); return;
    }

    resetAnalysisState();
    setCurrentError(''); 
    setAnalysisStatus(AnalysisStatus.Processing);

    if (videoFile && videoRef.current) {
        videoTargetFramesCountRef.current = VIDEO_FRAMES_TO_CAPTURE;
        videoRef.current.currentTime = 0; 
        if(videoRef.current.paused) videoRef.current.play().catch(e=>console.error("Error playing video:", e));
        
        const attemptProcess = () => {
          if (videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_ENOUGH_DATA) {
            videoRef.current.currentTime = 0.01; 
          } else if (videoRef.current && videoRef.current.error) {
            setCurrentError(UI_TEXT.errorLoadingVideo + ` - Code: ${videoRef.current.error.code}`);
            setAnalysisStatus(AnalysisStatus.Error);
          } else {
            analysisIntervalRef.current = window.setTimeout(processSingleFrameAndContinue, FRAME_ANALYSIS_INTERVAL_MS / 2);
          }
        };
        
        if (videoRef.current.readyState >= videoRef.current.HAVE_ENOUGH_DATA) {
            attemptProcess();
        } else {
            const onCanPlay = () => {
                attemptProcess();
                videoRef.current?.removeEventListener('canplaythrough', onCanPlay);
                videoRef.current?.removeEventListener('error', onVideoError);
            };
            const onVideoError = () => {
                setCurrentError(UI_TEXT.errorLoadingVideo);
                setAnalysisStatus(AnalysisStatus.Error);
                videoRef.current?.removeEventListener('canplaythrough', onCanPlay);
                videoRef.current?.removeEventListener('error', onVideoError);
            };
            videoRef.current.addEventListener('canplaythrough', onCanPlay, { once: true });
            videoRef.current.addEventListener('error', onVideoError, { once: true });
        }

    } else if (isCameraActive) {
        if (!videoRef.current || videoRef.current.readyState < videoRef.current.HAVE_CURRENT_DATA) {
             setCurrentError("الكاميرا ليست جاهزة أو تم إيقافها. حاول تفعيل الكاميرا مرة أخرى.");
             setAnalysisStatus(AnalysisStatus.Error);
             return;
        }
        videoTargetFramesCountRef.current = CAMERA_MAX_FRAMES_TO_ANALYZE;
        processSingleFrameAndContinue(); 
    }
    setProgress({ current: 1, total: videoTargetFramesCountRef.current });
  };

  const pauseAnalysis = () => {
    setAnalysisStatus(AnalysisStatus.Paused);
    if (analysisIntervalRef.current) clearTimeout(analysisIntervalRef.current);
    if (videoRef.current && videoFile) videoRef.current.pause();
  };

  const resumeAnalysis = () => {
    if (!videoSrc && !isCameraActive) return;
    setAnalysisStatus(AnalysisStatus.Processing); 
    if (videoRef.current && videoFile && videoRef.current.paused) {
      videoRef.current.play().catch(e=>console.error("Error resuming video:",e));
    }
    if (isCameraActive || (videoFile && videoRef.current && !videoRef.current.seeking)) {
         processSingleFrameAndContinue();
    }
  };
  
  const stopAnalysis = (shouldFinalize = true) => {
    const newStatus = (shouldFinalize && processedFrames.length > 0) ? AnalysisStatus.Success : AnalysisStatus.Idle;
    setAnalysisStatus(newStatus); 

    if (analysisIntervalRef.current) {
      clearTimeout(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (videoRef.current && videoFile) {
        videoRef.current.pause();
    }

    if (shouldFinalize && processedFrames.length > 0) {
        finalizeAndSummarizeAnalysis();
    } else if (!shouldFinalize) { 
        setProgress(null);
    }
  };

  const clearResultsAndMedia = () => {
    stopAnalysis(false);
    cleanupMediaStream();
    setIsCameraActive(false);
    setVideoFile(null);
    setVideoSrc(null);
    if (videoRef.current) {
      videoRef.current.src = ""; 
      videoRef.current.srcObject = null; 
      videoRef.current.load(); 
    }
    resetAnalysisState();
    setAnalysisStatus(AnalysisStatus.Idle);
  }
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoFile && videoElement && analysisStatus === AnalysisStatus.Processing) {
      const handleSeeked = () => {
        if (analysisStatus === AnalysisStatus.Processing && currentFrameIndexRef.current < videoTargetFramesCountRef.current) {
          if (analysisIntervalRef.current) clearTimeout(analysisIntervalRef.current); 
          processSingleFrameAndContinue();
        }
      };
      videoElement.addEventListener('seeked', handleSeeked);
      return () => {
        videoElement.removeEventListener('seeked', handleSeeked);
      };
    }
  }, [videoFile, analysisStatus, processSingleFrameAndContinue]);


  const handleProceedFromWelcome = () => {
    setShowWelcomePage(false);
    // Check for API key after proceeding, to show error on main page
    if (!process.env.API_KEY) {
        setCurrentError(UI_TEXT.apiKeyMissing);
        setAnalysisStatus(AnalysisStatus.Error);
    }
  };

  if (showWelcomePage) {
    return <WelcomePage onProceed={handleProceedFromWelcome} />;
  }

  const lastAnalyzedFrameData = processedFrames.length > 0 ? processedFrames[processedFrames.length - 1] : null;
  const isMediaSelected = !!videoSrc || isCameraActive;


  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8" dir="rtl">
      <header className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-700">{UI_TEXT.APP_TITLE}</h1>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* Introductory section removed, now in WelcomePage */}
        <section className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2 border-slate-200">إعدادات الإدخال والتحكم</h2>
          {currentError && <ErrorMessage message={currentError} onClear={() => setCurrentError('')} />}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6 items-start">
            <div>
              <label htmlFor="videoUpload" className="block text-sm font-medium text-slate-700 mb-2">{UI_TEXT.uploadVideo}</label>
              <input
                type="file"
                id="videoUpload"
                accept="video/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 rtl:file:ml-4 rtl:file:mr-0 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50 cursor-pointer"
                disabled={analysisStatus === AnalysisStatus.Processing || analysisStatus === AnalysisStatus.Paused}
              />
            </div>
            <div className="flex flex-col items-start space-y-2">
                 <label className="block text-sm font-medium text-slate-700 ">{UI_TEXT.useCamera}</label>
                 <button
                    onClick={toggleCamera}
                    disabled={analysisStatus === AnalysisStatus.Processing || analysisStatus === AnalysisStatus.Paused}
                    className={`flex items-center px-4 py-2 rounded-md font-medium text-sm transition-all duration-150 ease-in-out shadow hover:shadow-md
                                ${isCameraActive 
                                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                                    : 'bg-teal-500 hover:bg-teal-600 text-white'}
                                disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none`}
                >
                    <CameraIcon className="ml-2 rtl:mr-2 rtl:ml-0" />
                    {isCameraActive ? UI_TEXT.stopCamera : UI_TEXT.useCamera}
                </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-center border-t pt-6 border-slate-200">
            {analysisStatus === AnalysisStatus.Idle || analysisStatus === AnalysisStatus.Error || analysisStatus === AnalysisStatus.Success ? (
              <button
                onClick={startAnalysis}
                disabled={!isMediaSelected || analysisStatus === AnalysisStatus.Error || (isCameraActive && !videoRef.current?.srcObject)}
                className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 active:bg-sky-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center"
              >
                <PlayIcon className="ml-2 rtl:mr-2 rtl:ml-0" /> {UI_TEXT.startAnalysis}
              </button>
            ) : analysisStatus === AnalysisStatus.Processing ? (
              <button
                onClick={pauseAnalysis}
                className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 active:bg-amber-700 transition-colors flex items-center"
              >
                <PauseIcon className="ml-2 rtl:mr-2 rtl:ml-0" /> {UI_TEXT.pauseAnalysis}
              </button>
            ) : ( // Paused
              <button
                onClick={resumeAnalysis}
                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 active:bg-green-700 transition-colors flex items-center"
              >
                <PlayIcon className="ml-2 rtl:mr-2 rtl:ml-0" /> {UI_TEXT.resumeAnalysis}
              </button>
            )}
            {(analysisStatus === AnalysisStatus.Processing || analysisStatus === AnalysisStatus.Paused) && (
                 <button
                    onClick={() => stopAnalysis(true)}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 active:bg-red-800 transition-colors flex items-center"
                >
                    <StopIcon className="ml-2 rtl:mr-2 rtl:ml-0" /> {UI_TEXT.stopAnalysis}
                </button>
            )}
             <button
                onClick={clearResultsAndMedia}
                className="px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 active:bg-slate-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                disabled={analysisStatus === AnalysisStatus.Processing}
            >
                <ClearIcon className="ml-2 rtl:mr-2 rtl:ml-0" /> {UI_TEXT.clearResults}
            </button>
          </div>
          {analysisStatus === AnalysisStatus.Processing && progress && (
            <div className="mt-6 text-center">
                <LoadingSpinner text={UI_TEXT.processingFrame(progress.current, progress.total)} className="inline-block" size="sm"/>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2 overflow-hidden">
                    <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                </div>
            </div>
          )}
           {analysisStatus === AnalysisStatus.Paused && <p className="text-center mt-4 text-amber-600 font-medium">{UI_TEXT.analysisPaused}</p>}
        </section>

        <section className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2 border-slate-200">
            {videoSrc ? UI_TEXT.videoPreview : isCameraActive ? UI_TEXT.cameraPreview : UI_TEXT.noMediaSelected}
          </h2>
          <div className="aspect-video bg-slate-800 rounded-md overflow-hidden flex items-center justify-center shadow-inner">
            { (isMediaSelected) ? (
                <video ref={videoRef} src={videoSrc ?? undefined} controls={!!videoSrc && !isCameraActive} className="w-full h-full object-contain" playsInline muted={isCameraActive || (!!videoSrc && analysisStatus === AnalysisStatus.Processing)} />
            ) : (
                <div className="text-center text-slate-400">
                    <VideoCameraIcon className="w-24 h-24 mx-auto"/>
                    <p>{UI_TEXT.noMediaSelected}</p>
                </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </section>
        
        {(analysisStatus === AnalysisStatus.Success || (analysisStatus !== AnalysisStatus.Processing && processedFrames.length > 0)) && (
          <section id="results-section">
            <MetricsDisplay 
                summary={overallSummary} 
                lastAnalyzedFrame={lastAnalyzedFrameData}
                processedFrames={processedFrames}
                trafficAdvice={trafficAdvice}
                isAdviceLoading={isAdviceLoading}
                analysisHighlights={analysisHighlights}
                isHighlightsLoading={isHighlightsLoading}
            />
          </section>
        )}
         {analysisStatus === AnalysisStatus.Processing && processedFrames.length > 0 && lastAnalyzedFrameData && (
             <section className="opacity-75">
                <MetricsDisplay 
                    summary={null}
                    lastAnalyzedFrame={lastAnalyzedFrameData}
                    processedFrames={processedFrames}
                    trafficAdvice={null}
                    isAdviceLoading={false}
                    analysisHighlights={null}
                    isHighlightsLoading={false}
                />
             </section>
         )}
      </main>

      <footer className="text-center mt-12 py-6 border-t border-slate-300">
        <p className="text-sm text-slate-600">
          {UI_TEXT.APP_TITLE} &copy; {new Date().getFullYear()}
        </p>
         <p className="text-sm text-slate-500 mt-1">
          {UI_TEXT.copyrightText}
        </p>
        <a 
          href="https://github.com/m0shaban" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm text-sky-600 hover:text-sky-700 underline"
        >
          {UI_TEXT.githubLinkText}
        </a>
      </footer>
    </div>
  );
};

export default App;

if (typeof process === 'undefined') {
  // @ts-ignore
  globalThis.process = { env: {} };
}
