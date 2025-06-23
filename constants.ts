
export const APP_TITLE = "VisionFlow Analyzer - محلل التدفق المروري";
export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

// Analysis parameters
export const FRAME_ANALYSIS_INTERVAL_MS = 3000; // Interval for capturing frames from live camera or stepping through video
export const VIDEO_FRAMES_TO_CAPTURE = 10; // Number of frames to extract from an uploaded video
export const CAMERA_MAX_FRAMES_TO_ANALYZE = 30; // Max frames for a single live analysis session before auto-stop (or user stop)

// UI Text (Arabic)
export const UI_TEXT = {
  APP_TITLE: "VisionFlow Analyzer - محلل التدفق المروري",
  aboutAppTitle: "حول التطبيق",
  appDescription: "أداة تحليل متقدمة لتدفق حركة المرور باستخدام الذكاء الاصطناعي (Gemini API) لفهم وتحسين أنماط حركة المرور من خلال تحليل الفيديو أو البث المباشر للكاميرا.",
  keyFeaturesTitle: "الميزات الرئيسية",
  featuresList: [
    "تحليل إطارات الفيديو أو بث الكاميرا المباشر.",
    "اكتشاف وعد المركبات المختلفة (سيارات، حافلات، شاحنات، دراجات نارية، أخرى).",
    "رسم مربعات تحديد حول كل مركبة مكتشفة مع تحديد نوعها.",
    "تقدير مستوى الازدحام (خفيف، متوسط، كثيف، مزدحم).",
    "وصف نصي للمشهد المروري العام في كل إطار.",
    "كشف الأنشطة غير العادية (مثل مركبة متوقفة، مشاة في الطريق) مع وصف ومربع تحديد.",
    "ملخصات إحصائية شاملة (إجمالي المركبات، متوسط المركبات، لحظات الذروة).",
    "مخططات بيانية لتوزيع أنواع المركبات ونسب مستويات الازدحام.",
    "مخطط خطي لعرض اتجاهات حركة المرور (عدد المركبات) بمرور الوقت.",
    "عرض صور مصغرة للحظات الذروة المرورية.",
    "سجل مفصل لجميع الأنشطة غير العادية المكتشفة مع صور مصغرة.",
    "نصائح مخصصة من Gemini لتحسين تدفق حركة المرور وتقليل الازدحام.",
    "أبرز نتائج التحليل مقدمة من Gemini لفهم أعمق للبيانات.",
    "تصدير تقرير التحليل إلى ملفات PDF و Excel."
  ],
  howToUseTitle: "كيفية الاستخدام",
  usageInstructions: [
    "اختر مصدر الفيديو: قم بتحميل مقطع فيديو أو فعّل استخدام الكاميرا.",
    "ابدأ التحليل: اضغط على زر 'بدء التحليل'.",
    "تابع النتائج: ستظهر النتائج والتحليلات بشكل مباشر أثناء المعالجة وبعد اكتمالها.",
    "استكشف التقارير: يمكنك عرض الملخصات، المخططات، النصائح، وتصدير البيانات.",
    "أوقف أو أعد ضبط التحليل حسب الحاجة باستخدام أزرار التحكم."
  ],
  uploadVideo: "تحميل مقطع فيديو",
  useCamera: "استخدام الكاميرا",
  stopCamera: "إيقاف الكاميرا",
  startAnalysis: "بدء التحليل",
  pauseAnalysis: "إيقاف مؤقت",
  resumeAnalysis: "استئناف التحليل",
  stopAnalysis: "إيقاف التحليل",
  analyzing: "جاري التحليل...",
  analysisPaused: "التحليل متوقف مؤقتاً",
  analysisComplete: "اكتمل التحليل",
  analysisError: "خطأ في التحليل",
  dropVideo: "اسحب وأفلت ملف الفيديو هنا، أو انقر للاختيار",
  selectVideoFile: "اختر ملف فيديو",
  videoPreview: "معاينة الفيديو",
  cameraPreview: "معاينة الكاميرا",
  noMediaSelected: "لم يتم تحديد فيديو أو تفعيل الكاميرا",
  results: "نتائج التحليل",
  currentFrameAnalysis: "تحليل الإطار الحالي",
  overallSummary: "الملخص العام",
  totalVehicles: "إجمالي المركبات",
  vehicleTypes: "أنواع المركبات",
  congestionLevel: "مستوى الازدحام",
  description: "الوصف",
  framesAnalyzed: "الإطارات المحللة",
  avgVehiclesPerFrame: "متوسط المركبات لكل إطار",
  peakCongestion: "لحظات الذروة",
  timestamp: "التوقيت",
  vehicleTypeDistribution: "توزيع أنواع المركبات",
  light: "خفيف",
  moderate: "متوسط",
  heavy: "كثيف",
  congested: "مزدحم",
  unknown: "غير معروف",
  processingFrame: (current: number, total: number) => `جاري معالجة الإطار ${current} من ${total}`,
  apiKeyMissing: "مفتاح Gemini API غير موجود. يرجى التأكد من إعداده بشكل صحيح في متغيرات البيئة.",
  errorAccessingCamera: "حدث خطأ أثناء الوصول إلى الكاميرا أو تشغيلها.",
  errorLoadingVideo: "حدث خطأ أثناء تحميل الفيديو.",
  clearResults: "مسح النتائج والوسائط",
  unusualActivityDetected: "نشاط غير عادي تم اكتشافه:",
  noUnusualActivity: "لم يتم الكشف عن أي نشاط غير عادي.",
  trafficAdviceTitle: "نصائح لتحسين تدفق حركة المرور:",
  generatingAdvice: "جاري إنشاء النصائح...",
  errorFetchingAdvice: "حدث خطأ أثناء جلب نصائح حركة المرور.",
  unusualActivitiesSummary: "ملخص الأنشطة غير العادية",
  totalUnusualFrames: "إجمالي الإطارات بأنشطة غير عادية:",
  commonUnusualTypes: "الأنواع الشائعة للأنشطة غير العادية:",
  vehicleInstances: "المركبات المكتشفة (في الإطار الحالي):",
  noVehicleInstances: "لم يتم اكتشاف أي مركبات فردية في هذا الإطار.",
  exportPDF: "تصدير PDF",
  exportExcel: "تصدير Excel",
  reportGenerated: "تم إنشاء التقرير في:",
  trafficAnalysisReport: "تقرير تحليل تدفق حركة المرور",
  trafficTrendsChartTitle: "اتجاهات حركة المرور (عدد المركبات عبر الزمن)",
  vehicles: "مركبات",
  peakFrameThumbnail: "صورة مصغرة لإطار الذروة",
  congestionLevelDistributionChartTitle: "توزيع مستويات الازدحام",
  mostFrequentTag: "(الأكثر شيوعًا)",
  detailedUnusualActivityLogTitle: "سجل الأنشطة غير العادية المفصل",
  noUnusualActivitiesRecorded: "لم يتم تسجيل أي أنشطة غير عادية خلال هذا التحليل.",
  unusualActivityThumbnail: "صورة مصغرة لنشاط غير عادي",
  analysisHighlightsTitle: "أبرز نتائج التحليل (AI)",
  generatingHighlights: "جاري إنشاء أبرز النتائج...",
  errorFetchingHighlights: "حدث خطأ أثناء جلب أبرز النتائج.",
  noAdviceOrHighlights: "لم يتم إنشاء نصائح أو ملاحظات بعد أو حدث خطأ.",
  proceedToAppButton: "ابدأ استخدام محلل التدفق المروري",
  copyrightText: "حقوق الملكية : محمد شعبان",
  githubLinkText: "m0shaban @ GitHub",
};

export const VEHICLE_TYPE_COLORS: { [key: string]: string } = {
  car: '#3B82F6', // blue-500
  bus: '#10B981', // emerald-500
  truck: '#F59E0B', // amber-500
  motorcycle: '#8B5CF6', // violet-500
  other: '#6B7280', // gray-500
  unknown: '#9CA3AF', // gray-400
};

export const CONGESTION_LEVEL_COLORS: { [key: string]: string } = {
  light: '#4ADE80', // green-400 (Tailwind green-400)
  moderate: '#FACC15', // yellow-400 (Tailwind yellow-400)
  heavy: '#FB923C', // orange-400 (Tailwind orange-400)
  congested: '#F87171', // red-400 (Tailwind red-400)
  unknown: '#9CA3AF', // gray-400 (Tailwind gray-400)
};

export const UNUSUAL_ACTIVITY_BOX_COLOR = '#FACC15'; // yellow-400 for bounding box
export const UNUSUAL_ACTIVITY_TEXT_COLOR = 'text-yellow-700';
