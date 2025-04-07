import { useState, useEffect, useRef } from "react";
import { Upload, Download, Trash2, Loader2, X, Maximize2, InfoIcon, ChevronDown, ChevronUp, BarChart2, Search, ThumbsUp, CheckCircle2, Stars, Flame, Brain, Activity, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Types for sentiment analysis
interface SentimentAnalysis {
  score: number;
  summary: string;
  keyIndicators: string[];
  attributes: {
    commitment: { value: number, emoji: string, label: string };
    confidence: { value: number, emoji: string, label: string };
    adaptability: { value: number, emoji: string, label: string };
    enthusiasm: { value: number, emoji: string, label: string };
  };
  analyzed: boolean;
  analyzing: boolean;
}

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [videoMetadata, setVideoMetadata] = useState<{ duration: number, size: string }[]>([]);
  const [sentimentAnalyses, setSentimentAnalyses] = useState<SentimentAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<{ url: string, name: string } | null>(null);
  const [showSentimentGuide, setShowSentimentGuide] = useState(false);
  const [useDarkTheme, setUseDarkTheme] = useState(false);
  const [countdowns, setCountdowns] = useState<{ [key: number]: number }>({});
  const { toast } = useToast();

  // Ref for animation
  const animationRef = useRef<HTMLDivElement>(null);

  // Effect to handle countdown timers for analysis animations
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    
    Object.keys(countdowns).forEach((indexStr) => {
      const index = parseInt(indexStr);
      if (countdowns[index] > 0) {
        const interval = setInterval(() => {
          setCountdowns(prev => ({
            ...prev,
            [index]: prev[index] - 1
          }));
        }, 1000);
        
        intervals.push(interval);
      } else if (countdowns[index] === 0) {
        // When countdown completes, mark analysis as analyzed
        setSentimentAnalyses(prevAnalyses => {
          const newAnalyses = [...prevAnalyses];
          if (newAnalyses[index]) {
            newAnalyses[index] = {
              ...newAnalyses[index],
              analyzed: true,
              analyzing: false
            };
          }
          return newAnalyses;
        });
      }
    });
    
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [countdowns]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      videoUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [videoUrls]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validTypes = [
      'text/csv',
      'application/json',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4'
    ];

    const validFiles = files.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload CSV, JSON, Excel, or MP4 files only.",
        variant: "destructive"
      });
      return;
    }

    // Process video files
    const videoFiles = validFiles.filter(file => file.type === 'video/mp4');
    if (videoFiles.length > 0) {
      setIsLoading(true);
      let processedCount = 0;
      
      videoFiles.forEach(file => {
        const videoUrl = URL.createObjectURL(file);
        const video = document.createElement('video');
        
        video.onloadedmetadata = () => {
          const newIndex = uploadedVideos.length;
          
          setUploadedVideos(prevVideos => [...prevVideos, file]);
          setVideoUrls(prevUrls => [...prevUrls, videoUrl]);
          setVideoMetadata(prevMetadata => [
            ...prevMetadata, 
            { 
              duration: video.duration,
              size: formatFileSize(file.size)
            }
          ]);
          
          // Add sentiment analysis for the video
          const analysis = analyzeSentiment(file);
          setSentimentAnalyses(prevAnalyses => [...prevAnalyses, analysis]);
          
          // Start the 8-second countdown for this video
          setCountdowns(prev => ({
            ...prev,
            [newIndex]: 8
          }));
          
          processedCount++;
          if (processedCount === videoFiles.length) {
            setIsLoading(false);
          }
        };
        
        video.onerror = () => {
          toast({
            title: "Video Error",
            description: `Could not load video: ${file.name}`,
            variant: "destructive"
          });
          URL.revokeObjectURL(videoUrl);
          
          processedCount++;
          if (processedCount === videoFiles.length) {
            setIsLoading(false);
          }
        };
        
        video.src = videoUrl;
      });
    }

    // Process data files (CSV, JSON, Excel)
    const dataFiles = validFiles.filter(file => file.type !== 'video/mp4');
    if (dataFiles.length > 0) {
      // Here we would handle data file processing
      console.log('Data files to process:', dataFiles);
    }

    toast({
      title: "Files received",
      description: `Successfully received ${validFiles.length} file(s) for processing.`
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Clean up object URLs when component unmounts
  const handleRemoveVideo = (index: number) => {
    URL.revokeObjectURL(videoUrls[index]);
    
    setUploadedVideos(prevVideos => {
      const newVideos = [...prevVideos];
      newVideos.splice(index, 1);
      return newVideos;
    });
    
    setVideoUrls(prevUrls => {
      const newUrls = [...prevUrls];
      newUrls.splice(index, 1);
      return newUrls;
    });
    
    setVideoMetadata(prevMetadata => {
      const newMetadata = [...prevMetadata];
      newMetadata.splice(index, 1);
      return newMetadata;
    });
    
    setSentimentAnalyses(prevAnalyses => {
      const newAnalyses = [...prevAnalyses];
      newAnalyses.splice(index, 1);
      return newAnalyses;
    });
  };

  // Mock sentiment analysis function - in a real app, this would call an API
  const analyzeSentiment = (file: File): SentimentAnalysis => {
    // This is a mock function that returns a predefined sentiment analysis
    // In a real application, you would send the video to a backend for analysis
    return {
      score: 2,
      summary: "The sentiment throughout this interview is generally positive and enthusiastic. Chris shows consistent excitement about joining REI, clearly aligns himself with the company's mission, and frequently expresses interest and passion in customer engagement and outdoor activities. He confidently discusses transferring skills from his educational background into customer service, emphasizing patience, compassion, and adaptability. The candidate's responses reflect genuine enthusiasm, sincerity, and eagerness to contribute meaningfully to the company.",
      keyIndicators: [
        "Enthusiasm and Positivity: Frequent positive descriptors such as \"love,\" \"passion,\" \"interest,\" and \"growth.\"",
        "Motivation & Commitment: Expressed clear reasons for career transition, emphasizing alignment of personal interests with company values.",
        "Confidence & Preparedness: Demonstrates thorough research about REI, responding positively to challenging and hypothetical questions.",
        "Openness & Adaptability: Welcomes potential challenges openly, indicating adaptability and teamwork."
      ],
      attributes: {
        commitment: { value: 100, emoji: "🔥", label: "Strong" },
        confidence: { value: 85, emoji: "✅", label: "High" },
        adaptability: { value: 80, emoji: "👍", label: "Very Good" },
        enthusiasm: { value: 100, emoji: "😊", label: "Excellent" }
      },
      analyzed: false,
      analyzing: true
    };
  };

  const getSentimentEmoji = (score: number): string => {
    switch(score) {
      case -3: return "😡";
      case -2: return "😞";
      case -1: return "🙁";
      case 0: return "😐";
      case 1: return "🙂";
      case 2: return "😊";
      case 3: return "😄";
      default: return "😐";
    }
  };

  const getSentimentLabel = (score: number): string => {
    switch(score) {
      case -3: return "Highly Negative";
      case -2: return "Negative";
      case -1: return "Slightly Negative";
      case 0: return "Neutral";
      case 1: return "Slightly Positive";
      case 2: return "Positive";
      case 3: return "Highly Positive";
      default: return "Neutral";
    }
  };

  // Refined SentimentBar component with animations
  const SentimentBar = ({ 
    attribute, 
    value, 
    emoji, 
    label, 
    dark = false,
    delay = 0
  }: { 
    attribute: string; 
    value: number; 
    emoji: string; 
    label: string; 
    dark?: boolean;
    delay?: number;
  }) => {
    const [animated, setAnimated] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setAnimated(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }, [delay]);
    
    const dots = Array.from({ length: 20 }, (_, i) => 
      i < Math.floor(value / 5) ? true : false
    );
    
    const getGradient = (value: number) => {
      if (dark) {
        // Dark theme gradients
        if (value >= 90) return 'from-blue-400 via-indigo-400 to-violet-400';
        if (value >= 80) return 'from-blue-400 to-indigo-500';
        if (value >= 70) return 'from-blue-500 to-blue-400';
        if (value >= 60) return 'from-blue-600 to-blue-500';
        return 'from-blue-700 to-blue-600';
      } else {
        // Light theme gradients
        if (value >= 90) return 'from-blue-500 via-indigo-500 to-violet-500';
        if (value >= 80) return 'from-blue-500 to-indigo-600';
        if (value >= 70) return 'from-blue-600 to-blue-500';
        if (value >= 60) return 'from-blue-700 to-blue-600';
        return 'from-blue-800 to-blue-700';
      }
    };
    
    return (
      <div className="w-full mb-5 transform transition-all duration-500" style={{ opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(10px)' }}>
        <div className="flex justify-between items-center mb-2">
          <div className={`text-base font-medium ${dark ? 'text-gray-200' : 'text-gray-700'}`}>
            {attribute}
          </div>
          <div className={`flex items-center px-3 py-1 rounded-full ${
            dark 
              ? 'bg-gray-800 text-white border border-gray-700' 
              : 'bg-blue-50 text-blue-800 border border-blue-100'
          }`}>
            <span className="text-xl mr-2">{emoji}</span>
            <span className="font-medium">{label}</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex-grow overflow-hidden rounded-full shadow-inner" ref={barRef}>
            <div className={`flex w-full ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {dots.map((filled, i) => (
                <div 
                  key={i}
                  style={{ 
                    transition: `all 1s ${delay + 100 + (i * 25)}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                    transform: animated ? 'scaleY(1)' : 'scaleY(0)',
                    opacity: animated ? 1 : 0
                  }}
                  className={`h-7 w-full mx-px rounded-sm ${
                    filled 
                      ? `bg-gradient-to-r ${getGradient(value)}` 
                      : dark ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
                ></div>
              ))}
            </div>
          </div>
          <div className={`ml-3 min-w-[70px] text-right font-mono font-bold text-lg ${
            dark ? 'text-gray-200' : 'text-blue-600'
          }`}>
            {animated ? (
              <span className="inline-block" style={{ 
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animationDelay: `${delay + 500}ms`,
                animation: 'countUp 1s forwards',
              }}>
                {value}%
              </span>
            ) : '0%'}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced circular progress component
  const ProgressCircle = ({ countdown }: { countdown: number }) => {
    const percentage = ((8 - countdown) / 8) * 100;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative w-28 h-28 mx-auto">
        {/* Glowing background */}
        <div className="absolute inset-0 rounded-full bg-blue-500 opacity-10 animate-pulse blur-xl"></div>
        
        <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 100 100">
          {/* Decorative circles */}
          <circle
            className="text-blue-100 stroke-current opacity-20"
            strokeWidth="1"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
          />
          <circle
            className="text-blue-200 stroke-current opacity-20"
            strokeWidth="1"
            cx="50"
            cy="50"
            r="35"
            fill="transparent"
          />
          
          {/* Base track */}
          <circle
            className="text-gray-200 stroke-current"
            strokeWidth="8"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
          />
          
          {/* Progress indicator with gradient */}
          <defs>
            <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <circle
            className="progress-ring__circle"
            stroke="url(#circleGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
          
          {/* Center container */}
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="white"
            className="drop-shadow-sm"
          />
          
          {/* Countdown text */}
          <text
            x="50"
            y="50"
            fontSize="24"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#3B82F6"
            className="font-bold"
          >
            {countdown}
          </text>
          
          {/* Small decorative elements */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((degree, i) => (
            <circle
              key={i}
              cx={50 + 45 * Math.cos(degree * Math.PI / 180)}
              cy={50 + 45 * Math.sin(degree * Math.PI / 180)}
              r="2"
              fill={i % 2 === 0 ? "#93C5FD" : "#3B82F6"}
              className="drop-shadow-sm"
            />
          ))}
        </svg>
      </div>
    );
  };

  // Enhanced stepper dots with animations
  const AnimatedStepDots = ({ currentStep, totalSteps = 5 }: { currentStep: number, totalSteps?: number }) => {
    return (
      <div className="flex justify-center space-x-3 my-4">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div 
              className={`h-3 w-3 rounded-full transition-all duration-500 ${
                i < currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/50 scale-100' 
                  : i === currentStep 
                    ? 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-md shadow-blue-500/30 scale-125 animate-pulse' 
                    : 'bg-gray-300 scale-75'
              }`}
            />
            {i < currentStep && (
              <div className="h-1 w-1 bg-blue-400 rounded-full mt-1 animate-ping"></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-6">Upload Data Sources & Videos</h2>
      
      {/* Collapsible Sentiment Score Reference Card */}
      <div className="mb-6 border border-blue-100 rounded-lg overflow-hidden">
        <button 
          className="w-full p-4 bg-blue-50 flex items-center justify-between text-left"
          onClick={() => setShowSentimentGuide(!showSentimentGuide)}
        >
          <div className="flex items-center">
            <InfoIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-md font-semibold text-blue-700">Sentiment Score Reference</h3>
          </div>
          {showSentimentGuide ? (
            <ChevronUp className="h-5 w-5 text-blue-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-blue-500" />
          )}
        </button>
        
        {showSentimentGuide && (
          <div className="p-4 bg-blue-50">
            <p className="text-sm text-blue-700 mb-2">Use this scale to understand sentiment analysis in uploaded content:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center p-2 bg-white rounded border border-blue-100">
                <span className="text-2xl mr-2">😡</span>
                <div>
                  <div className="font-medium">-3</div>
                  <div className="text-xs text-gray-500">Highly Negative</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-white rounded border border-blue-100">
                <span className="text-2xl mr-2">😞</span>
                <div>
                  <div className="font-medium">-2</div>
                  <div className="text-xs text-gray-500">Negative</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-white rounded border border-blue-100">
                <span className="text-2xl mr-2">🙁</span>
                <div>
                  <div className="font-medium">-1</div>
                  <div className="text-xs text-gray-500">Slightly Negative</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-white rounded border border-blue-100">
                <span className="text-2xl mr-2">😐</span>
                <div>
                  <div className="font-medium">0</div>
                  <div className="text-xs text-gray-500">Neutral</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-white rounded border border-blue-100">
                <span className="text-2xl mr-2">🙂</span>
                <div>
                  <div className="font-medium">+1</div>
                  <div className="text-xs text-gray-500">Slightly Positive</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-white rounded border border-blue-100">
                <span className="text-2xl mr-2">😊</span>
                <div>
                  <div className="font-medium">+2</div>
                  <div className="text-xs text-gray-500">Positive</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-white rounded border border-blue-100">
                <span className="text-2xl mr-2">😄</span>
                <div>
                  <div className="font-medium">+3</div>
                  <div className="text-xs text-gray-500">Highly Positive</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : isLoading 
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="py-4">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-sm text-gray-600">
              Processing your files...
            </p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your files here, or
            </p>
            <div className="mt-4">
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept=".csv,.json,.xlsx,.xls,.mp4"
                onChange={handleFileInput}
              />
              <Button 
                variant="outline" 
                type="button"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Select Files
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: CSV, JSON, Excel, MP4
            </p>
          </>
        )}
      </div>

      {videoUrls.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-4">Uploaded Videos</h3>
          <div className="grid grid-cols-1 gap-6">
            {videoUrls.map((url, index) => (
              <div key={index} className="border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium truncate">{uploadedVideos[index].name}</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                  {/* Video Player Section */}
                  <div>
                    <div className="relative">
                      <video 
                        controls 
                        className="w-full rounded-md bg-black" 
                        src={url}
                        playsInline
                      >
                        Your browser does not support the video tag.
                      </video>
                      <button 
                        className="absolute top-2 right-2 p-1 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-80 transition-colors"
                        onClick={() => setPreviewVideo({ url, name: uploadedVideos[index].name })}
                        title="View fullscreen"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex flex-col">
                        {videoMetadata[index] && (
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span>Duration: {formatDuration(videoMetadata[index].duration)}</span>
                            <span>Size: {videoMetadata[index].size}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = uploadedVideos[index].name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRemoveVideo(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Analyzing Section */}
                  {sentimentAnalyses[index] && sentimentAnalyses[index].analyzing && countdowns[index] > 0 && (
                    <div className={`rounded-lg overflow-hidden border ${useDarkTheme ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'}`}>
                      <div className={`flex items-center justify-between p-4 border-b ${useDarkTheme ? 'border-gray-700' : 'border-blue-100 bg-white bg-opacity-50'}`}>
                        <div className="flex items-center">
                          <div className="relative mr-2">
                            <Activity className={`h-5 w-5 ${useDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} />
                            <div className="absolute inset-0 bg-blue-500 blur-sm opacity-30 animate-pulse"></div>
                          </div>
                          <h4 className={`text-lg font-semibold ${useDarkTheme ? 'text-gray-100' : 'text-blue-800'}`}>Sentiment Analysis</h4>
                        </div>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${useDarkTheme ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
                          Processing...
                        </div>
                      </div>
                      
                      <div ref={animationRef} className={`p-8 ${useDarkTheme ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} flex flex-col items-center justify-center`}>
                        <ProgressCircle countdown={countdowns[index]} />
                        
                        <div className="mt-6 text-center">
                          <p className={`font-medium text-lg ${useDarkTheme ? 'text-gray-200' : 'text-blue-700'} mb-2`}>
                            Analyzing Content Sentiment
                          </p>
                          <p className={`text-sm ${useDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                            Our AI is identifying emotional patterns and key indicators
                          </p>
                        </div>
                        
                        <div className="w-full max-w-md mt-8">
                          <div className="space-y-6">
                            <div className="relative">
                              <div className={`text-xs uppercase font-semibold mb-2 flex items-center ${useDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                                <div className="relative">
                                  <Brain className="h-3.5 w-3.5 mr-1.5" />
                                  <div className="absolute inset-0 bg-blue-500 blur-sm opacity-20 animate-pulse"></div>
                                </div>
                                <span>Processing Speech Patterns</span>
                              </div>
                              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${Math.min(100, (((8-countdowns[index])/8) * 100) * 1.5)}%` }}
                                >
                                  <div className="absolute right-0 top-0 h-full w-4 bg-white opacity-30 blur-sm animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <div className={`text-xs uppercase font-semibold mb-2 flex items-center ${useDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                                <div className="relative">
                                  <Activity className="h-3.5 w-3.5 mr-1.5" />
                                  <div className="absolute inset-0 bg-green-500 blur-sm opacity-20 animate-pulse"></div>
                                </div>
                                <span>Emotional Assessment</span>
                              </div>
                              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${Math.min(100, (((8-countdowns[index])/8) * 100) * 1.2)}%` }}
                                >
                                  <div className="absolute right-0 top-0 h-full w-4 bg-white opacity-30 blur-sm animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <div className={`text-xs uppercase font-semibold mb-2 flex items-center ${useDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                                <div className="relative">
                                  <Stars className="h-3.5 w-3.5 mr-1.5" />
                                  <div className="absolute inset-0 bg-purple-500 blur-sm opacity-20 animate-pulse"></div>
                                </div>
                                <span>Sentiment Scoring</span>
                              </div>
                              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${Math.min(100, ((8-countdowns[index])/8) * 100)}%` }}
                                >
                                  <div className="absolute right-0 top-0 h-full w-4 bg-white opacity-30 blur-sm animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <AnimatedStepDots currentStep={Math.min(4, Math.floor(((8-countdowns[index])/8) * 5))} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Results Section */}
                  {sentimentAnalyses[index] && sentimentAnalyses[index].analyzed && (
                    <div className={`rounded-lg overflow-hidden border shadow-sm ${
                      useDarkTheme 
                        ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700' 
                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
                    }`}>
                      <div className={`flex items-center justify-between p-4 ${
                        useDarkTheme 
                          ? 'border-b border-gray-700 bg-gray-800' 
                          : 'border-b border-blue-100 bg-white bg-opacity-50'
                      }`}>
                        <div className="flex items-center">
                          <div className="relative mr-2">
                            <BarChart2 className={`h-5 w-5 ${useDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} />
                            <div className="absolute inset-0 bg-blue-500 blur-sm opacity-30"></div>
                          </div>
                          <div className="flex flex-col">
                            <h4 className={`text-lg font-semibold ${useDarkTheme ? 'text-gray-100' : 'text-blue-800'}`}>
                              Sentiment Analysis
                            </h4>
                            <div className="flex items-center">
                              <Sparkles className={`h-3 w-3 ${useDarkTheme ? 'text-blue-300' : 'text-blue-500'} mr-1`} />
                              <span className={`text-xs ${useDarkTheme ? 'text-blue-300' : 'text-blue-600'}`}>
                                AI-powered sentiment detection
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUseDarkTheme(!useDarkTheme)}
                            className={useDarkTheme 
                              ? 'text-blue-300 hover:text-blue-100 hover:bg-blue-900/30' 
                              : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                            }
                          >
                            {useDarkTheme ? "Light Mode" : "Dark Mode"}
                          </Button>
                        </div>
                      </div>
                      
                      <div className={`p-5 ${useDarkTheme ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
                        {/* Score Card */}
                        <div className={`relative mb-6 rounded-xl overflow-hidden ${
                          useDarkTheme ? 'bg-gray-800' : 'bg-white'
                        } border ${useDarkTheme ? 'border-gray-700' : 'border-blue-100'} shadow-sm`}>
                          {/* Decorative gradient background */}
                          <div className="absolute inset-0 opacity-5">
                            <div className={`absolute inset-0 ${
                              sentimentAnalyses[index].score > 0 
                                ? 'bg-gradient-to-r from-green-400 to-blue-500'
                                : sentimentAnalyses[index].score < 0
                                  ? 'bg-gradient-to-r from-red-400 to-orange-500'
                                  : 'bg-gradient-to-r from-gray-400 to-blue-300'
                            }`}></div>
                          </div>
                          
                          <div className="relative p-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="text-4xl mr-4">{getSentimentEmoji(sentimentAnalyses[index].score)}</div>
                              <div>
                                <div className={`text-sm ${useDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>Overall Sentiment</div>
                                <div className={`text-2xl font-bold ${
                                  useDarkTheme 
                                    ? sentimentAnalyses[index].score > 0 ? 'text-blue-300' : sentimentAnalyses[index].score < 0 ? 'text-red-300' : 'text-gray-300'
                                    : sentimentAnalyses[index].score > 0 ? 'text-blue-600' : sentimentAnalyses[index].score < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {sentimentAnalyses[index].score >= 0 ? '+' : ''}{sentimentAnalyses[index].score} 
                                  <span className={`font-normal ml-1 ${useDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                    ({getSentimentLabel(sentimentAnalyses[index].score)})
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`text-sm font-medium py-1 px-3 rounded-full ${
                              useDarkTheme
                                ? sentimentAnalyses[index].score > 0 ? 'bg-blue-900/50 text-blue-300 border border-blue-800' : 'bg-red-900/50 text-red-300 border border-red-800'
                                : sentimentAnalyses[index].score > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {sentimentAnalyses[index].score > 0 ? 'Positive Analysis' : sentimentAnalyses[index].score < 0 ? 'Negative Analysis' : 'Neutral Analysis'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Sentiment Breakdown with Bars */}
                        <div className={`mb-6 rounded-xl overflow-hidden ${
                          useDarkTheme ? 'bg-gray-800' : 'bg-white'
                        } border ${useDarkTheme ? 'border-gray-700' : 'border-blue-100'} shadow-sm`}>
                          <div className={`p-4 border-b ${useDarkTheme ? 'border-gray-700' : 'border-blue-50'}`}>
                            <div className="flex items-center mb-1">
                              <div className="relative mr-2">
                                <Search className={`h-5 w-5 ${useDarkTheme ? 'text-gray-300' : 'text-blue-600'}`} />
                                <div className="absolute inset-0 bg-blue-500 blur-sm opacity-10"></div>
                              </div>
                              <h5 className={`font-medium ${useDarkTheme ? 'text-white' : 'text-blue-800'}`}>
                                Sentiment Analysis Breakdown
                              </h5>
                            </div>
                            <p className={`text-xs ${useDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                              Detailed assessment of key sentiment attributes
                            </p>
                          </div>
                          
                          <div className="p-5">
                            <SentimentBar 
                              attribute="Commitment" 
                              value={sentimentAnalyses[index].attributes.commitment.value} 
                              emoji={sentimentAnalyses[index].attributes.commitment.emoji}
                              label={sentimentAnalyses[index].attributes.commitment.label}
                              dark={useDarkTheme}
                              delay={100}
                            />
                            
                            <SentimentBar 
                              attribute="Confidence" 
                              value={sentimentAnalyses[index].attributes.confidence.value} 
                              emoji={sentimentAnalyses[index].attributes.confidence.emoji}
                              label={sentimentAnalyses[index].attributes.confidence.label}
                              dark={useDarkTheme}
                              delay={200}
                            />
                            
                            <SentimentBar 
                              attribute="Adaptability" 
                              value={sentimentAnalyses[index].attributes.adaptability.value} 
                              emoji={sentimentAnalyses[index].attributes.adaptability.emoji}
                              label={sentimentAnalyses[index].attributes.adaptability.label}
                              dark={useDarkTheme}
                              delay={300}
                            />
                            
                            <SentimentBar 
                              attribute="Enthusiasm" 
                              value={sentimentAnalyses[index].attributes.enthusiasm.value} 
                              emoji={sentimentAnalyses[index].attributes.enthusiasm.emoji}
                              label={sentimentAnalyses[index].attributes.enthusiasm.label}
                              dark={useDarkTheme}
                              delay={400}
                            />
                            
                            <SentimentBar 
                              attribute="Overall Sentiment" 
                              value={90} 
                              emoji={getSentimentEmoji(sentimentAnalyses[index].score)}
                              label={`${getSentimentLabel(sentimentAnalyses[index].score)} (${sentimentAnalyses[index].score >= 0 ? '+' : ''}${sentimentAnalyses[index].score})`}
                              dark={useDarkTheme}
                              delay={500}
                            />
                          </div>
                        </div>
                        
                        {/* Analysis Summary Card */}
                        <div className={`mb-6 rounded-xl overflow-hidden ${
                          useDarkTheme ? 'bg-gray-800' : 'bg-white'
                        } border ${useDarkTheme ? 'border-gray-700' : 'border-blue-100'} shadow-sm`}>
                          <div className={`p-4 border-b ${useDarkTheme ? 'border-gray-700' : 'border-blue-50'}`}>
                            <h5 className={`font-medium ${useDarkTheme ? 'text-white' : 'text-blue-800'} flex items-center`}>
                              <Stars className="h-4 w-4 mr-2" />
                              Sentiment Analysis Summary
                            </h5>
                          </div>
                          <div className="p-4">
                            <p className={`text-sm ${useDarkTheme ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                              {sentimentAnalyses[index].summary}
                            </p>
                          </div>
                        </div>
                        
                        {/* Key Indicators Card */}
                        <div className={`rounded-xl overflow-hidden ${
                          useDarkTheme ? 'bg-gray-800' : 'bg-white'
                        } border ${useDarkTheme ? 'border-gray-700' : 'border-blue-100'} shadow-sm`}>
                          <div className={`p-4 border-b ${useDarkTheme ? 'border-gray-700' : 'border-blue-50'}`}>
                            <h5 className={`font-medium ${useDarkTheme ? 'text-white' : 'text-blue-800'} flex items-center`}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Key Sentiment Indicators
                            </h5>
                          </div>
                          <div className="p-4">
                            <ul className={`text-sm ${useDarkTheme ? 'text-gray-300' : 'text-gray-700'} space-y-3`}>
                              {sentimentAnalyses[index].keyIndicators.map((indicator, i) => (
                                <li key={i} className="flex items-start">
                                  <div className={`mt-1 mr-2 h-2 w-2 rounded-full ${
                                    useDarkTheme ? 'bg-blue-400' : 'bg-blue-500'
                                  }`}></div>
                                  <span className="leading-relaxed">{indicator}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-full">
            <div className="absolute top-2 right-2 z-10">
              <button
                className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
                onClick={() => setPreviewVideo(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                src={previewVideo.url}
                controls
                autoPlay
                className="w-full"
                style={{ maxHeight: "calc(100vh - 120px)" }}
              >
                Your browser does not support the video tag.
              </video>
              <div className="p-3 bg-gray-900 text-white">
                <h3 className="font-medium truncate">{previewVideo.name}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes countUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `
      }} />
    </div>
  );
};

export default FileUpload;