import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  ShieldAlert,
  Sprout,
  FlaskConical,
  RotateCcw,
  Sparkles,
  Info,
  X,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  MapPin,
  Navigation,
  Compass,
  LayoutDashboard,
  Sun,
  Clock,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Store,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Search,
  Calculator,
  Bookmark,
  Check,
  Layers,
  CircleDollarSign,
  History,
  Calendar,
  User,
  Users,
  UserPlus,
  Phone,
  Shield,
  Filter,
  Globe,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  Landmark,
  BadgePercent,
  ExternalLink,
  FileCheck,
  Award,
  FileText
} from "lucide-react";

// Base API URL: In production/Docker Nginx this defaults to "" (relative /api), or uses VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : (import.meta.env.PROD ? "" : "http://localhost:8000");

// Global In-Memory Store to cache predefined City, State locations across renders
let globalLocationsCache = null;

const CROPS = [
  "Select Crop (or Auto-detect)",
  "Tomato",
  "Rice / Paddy",
  "Wheat",
  "Cotton",
  "Potato",
  "Maize",
  "Soybean",
  "Chilli",
  "Groundnut"
];

const INDIAN_STATES = [
  "All-India",
  "Karnataka",
  "Maharashtra",
  "Andhra Pradesh",
  "Telangana",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Punjab",
  "Haryana",
  "Madhya Pradesh",
  "Gujarat",
  "Rajasthan",
  "Bihar",
  "West Bengal",
  "Odisha",
  "Kerala"
];

const SCHEME_CATEGORIES = [
  "ALL",
  "Direct Income Support",
  "Irrigation & Water Conservation",
  "Crop Insurance & Risk Coverage",
  "Farm Mechanization & Machinery",
  "Credit & Financial Liquidity",
  "Solar Energy & Irrigation",
  "Organic & Natural Farming",
  "Soil Diagnostics & Yield Optimization"
];


// Top 10 Indian Regional Languages with Native Scripts, Audio Prompts, and Localized Labels
export const TOP_10_LANGUAGES = [
  {
    code: "English",
    native: "English",
    label: "English",
    icon: "🌾",
    region: "All India",
    bcp47: "en-IN",
    langPrompt: "Please choose your preferred language from the list below.",
    namePrompt: "Please enter your full name in this field.",
    phonePrompt: "Please enter your 10-digit mobile phone number.",
    labels: {
      title: "Farmer Registration",
      subtitle: "Join Bharath Krishi Digital Platform. Registered farmers get free access to AI diagnostics, nearest mandi market rates, and fertilizer dosage planning.",
      langHeader: "1. Select Your Preferred Language",
      nameHeader: "2. Farmer Full Name",
      phoneHeader: "3. Mobile Phone Number (10 Digits)",
      namePlaceholder: "Enter your full name (e.g. Ramesh Patel)",
      phonePlaceholder: "Enter 10-digit mobile number",
      submit: "Complete Registration & Enter Platform",
      submitting: "Registering Farmer in Database...",
      errorName: "Please enter your full name",
      errorPhone: "Please enter a valid 10-digit mobile number"
    }
  },
  {
    code: "Hindi",
    native: "हिन्दी",
    label: "Hindi",
    icon: "🇮🇳",
    region: "उत्तर भारत (North India)",
    bcp47: "hi-IN",
    langPrompt: "कृपया नीचे दी गई सूची में से अपनी पसंदीदा भाषा चुनें।",
    namePrompt: "कृपया इस खाने में अपना पूरा नाम दर्ज करें।",
    phonePrompt: "कृपया अपना दस अंकों का मोबाइल नंबर यहाँ दर्ज करें।",
    labels: {
      title: "किसान पंजीकरण",
      subtitle: "भारत कृषि डिजिटल प्लेटफॉर्म से जुड़ें। पंजीकृत किसानों को एआई फसल रोग जांच, मंडी भाव और खाद गणना मुफ्त मिलती है।",
      langHeader: "1. अपनी पसंदीदा भाषा चुनें",
      nameHeader: "2. किसान का पूरा नाम",
      phoneHeader: "3. मोबाइल नंबर (10 अंक)",
      namePlaceholder: "अपना पूरा नाम लिखें (उदा. रमेश पटेल)",
      phonePlaceholder: "10 अंकों का मोबाइल नंबर दर्ज करें",
      submit: "किसान पंजीकरण पूरा करें और आगे बढ़ें",
      submitting: "डेटाबेस में पंजीकरण हो रहा है...",
      errorName: "कृपया अपना पूरा नाम लिखें",
      errorPhone: "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें"
    }
  },
  {
    code: "Kannada",
    native: "ಕನ್ನಡ",
    label: "Kannada",
    icon: "🌾",
    region: "ಕರ್ನಾಟಕ (Karnataka)",
    bcp47: "kn-IN",
    langPrompt: "ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಪಟ್ಟಿಯಿಂದ ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    namePrompt: "ದಯವಿಟ್ಟು ಈ ಬಾಕ್ಸ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
    phonePrompt: "ದಯವಿಟ್ಟು ನಿಮ್ಮ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
    labels: {
      title: "ರೈತರ ನೋಂದಣಿ",
      subtitle: "ಭಾರತ್ ಕೃಷಿ ಡಿಜಿಟಲ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗೆ ಸೇರಿ. ನೋಂದಾಯಿತ ರೈತರಿಗೆ ಎಐ ಬೆಳೆ ರೋಗ ಪರೀಕ್ಷೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ದರಗಳು ಉಚಿತವಾಗಿ ಲಭ್ಯ.",
      langHeader: "1. ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      nameHeader: "2. ರೈತರ ಪೂರ್ಣ ಹೆಸರು",
      phoneHeader: "3. ಮೊಬೈಲ್ ದೂರವಾಣಿ ಸಂಖ್ಯೆ (10 ಅಂಕಿಗಳು)",
      namePlaceholder: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ಬರೆಯಿರಿ (ಉದಾ: ರಮೇಶ್ ಪಟೇಲ್)",
      phonePlaceholder: "10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      submit: "ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ ಮುಂದುವರಿಯಿರಿ",
      submitting: "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...",
      errorName: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
      errorPhone: "ದಯವಿಟ್ಟು ಸರಿಯಾದ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ"
    }
  },
  {
    code: "Telugu",
    native: "తెలుగు",
    label: "Telugu",
    icon: "🌿",
    region: "ఆంధ్రప్రదేశ్ / తెలంగాణ",
    bcp47: "te-IN",
    langPrompt: "దయచేసి క్రింది జాబితా నుండి మీ భాషను ఎంచుకోండి.",
    namePrompt: "దయచేసి ఈ పెట్టెలో మీ పూర్తి పేరును నమోదు చేయండి.",
    phonePrompt: "దయచేసి మీ 10 అంకెల మొబైల్ ఫోన్ నంబర్‌ను నమోదు చేయండి.",
    labels: {
      title: "రైతు నమోదు",
      subtitle: "భారత్ కృషి డిಜಿటల్ ప్లాట్‌ఫారమ్‌లో నమోదు చేసుకోండి. రైతులకు ఉచిత AI పంట రోగ నిర్ధారణ మరియు మార్కెట్ ధరలు.",
      langHeader: "1. మీ భాషను ఎంచుకోండి",
      nameHeader: "2. రైతు పూర్తి పేరు",
      phoneHeader: "3. మొబైల్ ఫోన్ నంబర్ (10 అంకెలు)",
      namePlaceholder: "మీ పూర్తి పేరును నమోదు చేయండి (ఉదా: రమేష్ పటేల్)",
      phonePlaceholder: "10 అంకెల మొబైల్ నంబర్",
      submit: "నమోదు పూర్తి చేసి ప్రవేశించండి",
      submitting: "డేటాబేస్‌లో నమోదు చేయబడుతోంది...",
      errorName: "దయచేసి మీ పూర్తి పేరు నమోదు చేయండి",
      errorPhone: "దయచేసి 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి"
    }
  },
  {
    code: "Tamil",
    native: "தமிழ்",
    label: "Tamil",
    icon: "🌴",
    region: "தமிழ்நாடு (Tamil Nadu)",
    bcp47: "ta-IN",
    langPrompt: "கீழே உள்ள பட்டியலில் இருந்து உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்.",
    namePrompt: "தயவுசெய்து இந்த கட்டத்தில் உங்கள் முழு பெயரை உள்ளிடவும்.",
    phonePrompt: "தயவுசெய்து உங்கள் 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.",
    labels: {
      title: "விவசாயி பதிவு",
      subtitle: "பாரத் கிருஷி டிஜிட்டல் தளத்தில் இணையுங்கள். பதிவுசெய்த விவசாயிகளுக்கு இலவச AI நோய் கண்டறிதல் மற்றும் மண்டி விலைகள்.",
      langHeader: "1. உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
      nameHeader: "2. விவசாயியின் முழு பெயர்",
      phoneHeader: "3. கைபேசி எண் (10 இலக்கங்கள்)",
      namePlaceholder: "உங்கள் முழு பெயரை உள்ளிடவும் (எ.கா: ரமேஷ் படேல்)",
      phonePlaceholder: "10 இலக்க மொபைல் எண்",
      submit: "பதிவை முடித்து நுழையுங்கள்",
      submitting: "தரவுத்தளத்தில் பதிவு செய்யப்படுகிறது...",
      errorName: "தயவுசெய்து உங்கள் முழு பெயரை உள்ளிடவும்",
      errorPhone: "தயவுசெய்து சரியான 10 இலக்க எண்ணை உள்ளிடவும்"
    }
  },
  {
    code: "Marathi",
    native: "मराठी",
    label: "Marathi",
    icon: "🌻",
    region: "महाराष्ट्र (Maharashtra)",
    bcp47: "mr-IN",
    langPrompt: "कृपया खालील यादीतून तुमची पसंतीची भाषा निवडा.",
    namePrompt: "कृपया या रकान्यात आपले पूर्ण नाव प्रविष्ट करा.",
    phonePrompt: "कृपया आपला 10 अंकी मोबाईल क्रमांक प्रविष्ट करा.",
    labels: {
      title: "शेतकरी नोंदणी",
      subtitle: "भारत कृषी डिजिटल प्लॅटफॉर्मवर सामील व्हा. नोंदणीकृत शेतकऱ्यांसाठी मोफत एआय रोग निदान व बाजारभाव सुविधा.",
      langHeader: "1. तुमची भाषा निवडा",
      nameHeader: "2. शेतकऱ्याचे पूर्ण नाव",
      phoneHeader: "3. मोबाईल क्रमांक (10 अंक)",
      namePlaceholder: "आपले पूर्ण नाव प्रविष्ट करा (उदा. रमेश पटेल)",
      phonePlaceholder: "10 अंकी मोबाईल क्रमांक",
      submit: "शेतकरी नोंदणी पूर्ण करा",
      submitting: "डेटाबेसमध्ये नोंदणी होत आहे...",
      errorName: "कृपया आपले पूर्ण नाव प्रविष्ट करा",
      errorPhone: "कृपया 10 अंकी वैध मोबाईल क्रमांक प्रविष्ट करा"
    }
  },
  {
    code: "Bengali",
    native: "বাংলা",
    label: "Bengali",
    icon: "🌾",
    region: "পশ্চিমবঙ্গ (West Bengal)",
    bcp47: "bn-IN",
    langPrompt: "অনুগ্রহ করে নীচের তালিকা থেকে আপনার ভাষা নির্বাচন করুন।",
    namePrompt: "অনুগ্রহ করে এখানে আপনার পুরো নাম লিখুন।",
    phonePrompt: "অনুগ্রহ করে আপনার ১০ অঙ্কের মোবাইল নম্বরটি লিখুন।",
    labels: {
      title: "কৃষক নিবন্ধন",
      subtitle: "ভারত কৃষি ডিজিটাল প্ল্যাটফর্মে যোগ দিন। নিবন্ধিত কৃষকদের জন্য বিনামূল্যে এআই রোগ নির্ণয় ও মান্ডি দর।",
      langHeader: "১. আপনার ভাষা চয়ন করুন",
      nameHeader: "২. কৃষকের সম্পূর্ণ নাম",
      phoneHeader: "৩. মোবাইল ফোন নম্বর (১০ সংখ্যা)",
      namePlaceholder: "আপনার পুরো নাম লিখুন (যেমন: রমেশ প্যাটেল)",
      phonePlaceholder: "১০ অঙ্কের মোবাইল নম্বর",
      submit: "নিবন্ধন সম্পন্ন করে এগিয়ে যান",
      submitting: "ডাটাবেসে নিবন্ধন করা হচ্ছে...",
      errorName: "অনুগ্রহ করে আপনার পুরো নাম লিখুন",
      errorPhone: "অনুগ্রহ করে সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন"
    }
  },
  {
    code: "Gujarati",
    native: "ગુજરાતી",
    label: "Gujarati",
    icon: "🚜",
    region: "ગુજરાત (Gujarat)",
    bcp47: "gu-IN",
    langPrompt: "કૃપા કરીને નીચેની યાદીમાંથી તમારી ભાષા પસંદ કરો.",
    namePrompt: "કૃપા કરીને આ બોક્સમાં તમારું પૂરું નામ લખો.",
    phonePrompt: "કૃપા કરીને તમારો 10 અંકનો મોબાઈલ નંબર દાખલ કરો.",
    labels: {
      title: "ખેડૂત નોંધણી",
      subtitle: "ભારત કૃષિ ડિજિટલ પ્લેટફોર્મ સાથે જોડાઓ. નોંધાયેલા ખેડૂતો માટે મફત AI રોગ નિદાન અને મંડી ભાવો.",
      langHeader: "1. તમારી ભાષા પસંદ કરો",
      nameHeader: "2. ખેડૂતનું પૂરું નામ",
      phoneHeader: "3. મોબાઈલ નંબર (10 અંક)",
      namePlaceholder: "તમારું પૂરું નામ લખો (દા.ત. રમેશ પટેલ)",
      phonePlaceholder: "10 અંકનો મોબાઈલ નંબર",
      submit: "ખેડૂત નોંધણી પૂર્ણ કરો",
      submitting: "ડેટાબેઝમાં નોંધણી થઈ રહી છે...",
      errorName: "કૃપા કરીને તમારું પૂરું નામ લખો",
      errorPhone: "કૃપા કરીને માન્ય 10 અંકનો મોબાઈલ નંબર લખો"
    }
  },
  {
    code: "Malayalam",
    native: "മലയാളം",
    label: "Malayalam",
    icon: "🥥",
    region: "കേരളം (Kerala)",
    bcp47: "ml-IN",
    langPrompt: "ദയവായി താഴെയുള്ള ലിസ്റ്റിൽ നിന്ന് നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക.",
    namePrompt: "ദയവായി നിങ്ങളുടെ മുഴുവൻ പേര് ഇവിടെ രേഖപ്പെടുത്തുക.",
    phonePrompt: "ദയവായി നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ രേഖപ്പെടുത്തുക.",
    labels: {
      title: "കർഷക രജിസ്ട്രേഷൻ",
      subtitle: "ഭാരത് കൃഷി ഡിജിറ്റൽ പ്ലാറ്റ്‌ഫോമിൽ ചേരുക. രജിസ്റ്റർ ചെയ്ത കർഷകർക്ക് സൗജന്യ AI വിള രോഗ നിർണ്ണയവും വിപണി വിവരങ്ങളും.",
      langHeader: "1. നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
      nameHeader: "2. കർഷകന്റെ മുഴുവൻ പേര്",
      phoneHeader: "3. മൊബൈൽ ഫോൺ നമ്പർ (10 അക്കങ്ങൾ)",
      namePlaceholder: "നിങ്ങളുടെ മുഴുവൻ പേര് നൽകുക (ഉദാ: രമേഷ് പട്ടേൽ)",
      phonePlaceholder: "10 അക്ക മൊബൈൽ നമ്പർ",
      submit: "രജിസ്ട്രേഷൻ പൂർത്തിയാക്കി പ്രവേശിക്കുക",
      submitting: "ഡാറ്റാബേസിൽ രജിസ്റ്റർ ചെയ്യുന്നു...",
      errorName: "ദയവായി നിങ്ങളുടെ മുഴുവൻ പേര് നൽകുക",
      errorPhone: "ദയവായി കൃത്യമായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക"
    }
  },
  {
    code: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    label: "Punjabi",
    icon: "🌾",
    region: "ਪੰਜਾਬ (Punjab)",
    bcp47: "pa-IN",
    langPrompt: "ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਦਿੱਤੀ ਸੂਚੀ ਵਿੱਚੋਂ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ।",
    namePrompt: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਇੱਥੇ ਦਰਜ ਕਰੋ।",
    phonePrompt: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ 10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।",
    labels: {
      title: "ਕਿਸਾਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ",
      subtitle: "ਭਾਰਤ ਕ੍ਰਿਸ਼ੀ ਡਿਜੀਟਲ ਪਲੇਟਫਾਰਮ ਨਾਲ ਜੁੜੋ। ਰਜਿਸਟਰਡ ਕਿਸਾਨਾਂ ਲਈ ਮੁਫ਼ਤ AI ਫਸਲ ਰੋਗ ਜਾਂਚ ਅਤੇ ਮੰਡੀ ਭਾਅ।",
      langHeader: "1. ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ",
      nameHeader: "2. ਕਿਸਾਨ ਦਾ ਪੂਰਾ ਨਾਮ",
      phoneHeader: "3. ਮੋਬਾਈਲ ਨੰਬਰ (10 ਅੰਕ)",
      namePlaceholder: "ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ (ਜਿਵੇਂ: ਰਮੇਸ਼ ਪਟੇਲ)",
      phonePlaceholder: "10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ",
      submit: "ਕਿਸਾਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਮੁਕੰਮਲ ਕਰੋ",
      submitting: "ਡੇਟਾਬੇਸ ਵਿੱਚ ਰਜਿਸਟਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
      errorName: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਲਿਖੋ",
      errorPhone: "ਕਿਰਪਾ ਕਰਕੇ 10 ਅੰਕਾਂ ਦਾ ਸਹੀ ਮੋਬਾਈਲ ਨੰਬਰ ਦਿਓ"
    }
  }
];

// Reusable list of languages for application selects
const LANGUAGES = TOP_10_LANGUAGES.map((l) => ({
  code: l.code,
  label: `${l.native} (${l.label})`,
  bcp47: l.bcp47
}));

const POPULAR_CROPS = [
  "Tomato", "Onion", "Chilli", "Potato", "Cotton", "Wheat", "Rice", "Soybean", "Maize"
];

const FERT_CROPS = [
  "Tomato", "Rice / Paddy", "Wheat", "Cotton", "Maize", "Potato", "Chilli", "Soybean", "Groundnut"
];

const FERT_UNITS = ["Acres", "Guntas", "Bighas", "Hectares"];

const FERT_STAGES = [
  "Full Season / Recommended POP",
  "Basal / Sowing",
  "Vegetative / Tillering",
  "Flowering / Pre-Bloom",
  "Fruiting / Grain Filling"
];

const FERTILIZER_PROFILES = {
  "Tomato": {
    pureN: 50, pureP: 32, pureK: 40,
    fym: 8.0, vermicompost: 1000, neemCake: 150,
    biofertilizers: ["Azotobacter (2 kg/acre)", "PSB (2 kg/acre)", "Trichoderma viride"],
    benefits: "Enriches soil microbial diversity, prevents bacterial wilt, and improves fruit firmness and brix sweetness.",
    schedules: [
      { stage: "Basal / Field Preparation", timing: "At bed preparation", urea: 25, dap: 100, mop: 30, method: "Incorporate DAP + FYM + Neem cake into ridges." },
      { stage: "Vegetative / Early Growth", timing: "20–25 DAT", urea: 40, dap: 0, mop: 30, method: "Side-dress Urea & MOP 10 cm from stem; irrigate immediately." },
      { stage: "Flowering & Fruit Development", timing: "45–55 DAT", urea: 35, dap: 0, mop: 40, method: "Potassium-rich split for fruit enlargement & disease defense." }
    ],
    tips: [
      "Never broadcast Urea on wet leaf canopy to avoid leaf scorch.",
      "Maintain calcium levels via gypsum to prevent blossom end rot (BER).",
      "In drip irrigation, fertigate in 3-day intervals for 35% higher nutrient uptake."
    ]
  },
  "Rice / Paddy": {
    pureN: 40, pureP: 20, pureK: 20,
    fym: 5.0, vermicompost: 800, neemCake: 100,
    biofertilizers: ["Azospirillum (2 kg/acre)", "Blue Green Algae (BGA)", "Phosphobacteria"],
    benefits: "Builds humus layer in puddled soils and accelerates tillering.",
    schedules: [
      { stage: "Basal (Last Puddling)", timing: "Before transplanting", urea: 33, dap: 100, mop: 50, method: "Incorporate into mud during final leveling." },
      { stage: "Active Tillering", timing: "20–25 DAT", urea: 33, dap: 0, mop: 0, method: "Broadcast Urea with dry sand in 2–3 cm standing water." },
      { stage: "Panicle Initiation (PI)", timing: "40–45 DAT", urea: 34, dap: 0, mop: 50, method: "Top-dressing for grain filling and preventing empty spikelets." }
    ],
    tips: [
      "Drain standing water 24 hours prior to Urea broadcast, then re-flood after 48 hours.",
      "Apply Zinc Sulphate (10 kg/acre) separately from DAP."
    ]
  },
  "Wheat": {
    pureN: 48, pureP: 24, pureK: 16,
    fym: 5.0, vermicompost: 750, neemCake: 80,
    biofertilizers: ["Azotobacter", "Phosphate Solubilizing Bacteria (PSB)"],
    benefits: "Improves soil water-retention in loamy wheat fields.",
    schedules: [
      { stage: "Basal Sowing", timing: "At seed drilling", urea: 33, dap: 100, mop: 100, method: "Drill 5 cm below seed depth using ferti-seed drill." },
      { stage: "Crown Root Initiation (CRI)", timing: "21–25 DAS (1st Irrigation)", urea: 33, dap: 0, mop: 0, method: "Broadcast before or after first irrigation." },
      { stage: "Jointing / Boot Stage", timing: "45–50 DAS (2nd Irrigation)", urea: 34, dap: 0, mop: 0, method: "Final nitrogen dose to boost protein and earhead size." }
    ],
    tips: [
      "Never delay first irrigation at CRI stage; root crown formation determines ear count."
    ]
  },
  "Cotton": {
    pureN: 48, pureP: 24, pureK: 24,
    fym: 6.0, vermicompost: 1000, neemCake: 150,
    biofertilizers: ["Azospirillum", "Potash Mobilizing Bacteria (KMB)"],
    benefits: "Improves deep tap root growth and reduces shedding of squares.",
    schedules: [
      { stage: "Basal Placement", timing: "At sowing / dibbling", urea: 20, dap: 100, mop: 25, method: "Band placement 7–10 cm from seed row." },
      { stage: "Square Formation", timing: "35–40 DAS", urea: 40, dap: 0, mop: 35, method: "Side-dress along with weeding and earthing up." },
      { stage: "Peak Boll Development", timing: "60–75 DAS", urea: 40, dap: 0, mop: 40, method: "Potash application to maximize boll weight and lint staple." }
    ],
    tips: [
      "Foliar spray of 1% Magnesium Sulphate at boll formation prevents leaf reddening."
    ]
  },
  "Maize": {
    pureN: 48, pureP: 24, pureK: 16,
    fym: 5.0, vermicompost: 800, neemCake: 100,
    biofertilizers: ["Azotobacter", "VAM (Mycorrhiza)"],
    benefits: "Increases phosphorus uptake and prevents lodging in windy conditions.",
    schedules: [
      { stage: "Basal", timing: "At sowing", urea: 25, dap: 100, mop: 100, method: "Band placement in furrows 5 cm below seed." },
      { stage: "Knee-High Stage", timing: "30–35 DAS", urea: 40, dap: 0, mop: 0, method: "Top-dress alongside earthing up." },
      { stage: "Tasseling & Silking", timing: "50–55 DAS", urea: 35, dap: 0, mop: 0, method: "Top-dress during moist soil to maximize cob fill." }
    ],
    tips: [
      "Avoid dry soil conditions during tasseling; cob size drops if moisture is scarce."
    ]
  },
  "Potato": {
    pureN: 60, pureP: 40, pureK: 48,
    fym: 10.0, vermicompost: 1200, neemCake: 200,
    biofertilizers: ["Azotobacter", "Phosphobacteria"],
    benefits: "Creates loose, porous soil structure allowing uniform tuber expansion.",
    schedules: [
      { stage: "Basal", timing: "At tuber planting", urea: 50, dap: 100, mop: 50, method: "Place in bands along ridges beside tubers." },
      { stage: "Earthing-Up / Tuber Initiation", timing: "30–35 DAP", urea: 50, dap: 0, mop: 50, method: "Side-dress before earthing up ridges." }
    ],
    tips: [
      "SOP (Sulphate of Potash) is preferred over MOP for crisp dry-matter tuber quality."
    ]
  },
  "Chilli": {
    pureN: 48, pureP: 24, pureK: 24,
    fym: 8.0, vermicompost: 1000, neemCake: 150,
    biofertilizers: ["Azospirillum", "PSB"],
    benefits: "Prevents damping-off and boosts capsanthin color and pungency.",
    schedules: [
      { stage: "Basal", timing: "Field prep", urea: 30, dap: 100, mop: 40, method: "Mix basal dose into planting ridges." },
      { stage: "First Flush Flowering", timing: "30–35 DAT", urea: 35, dap: 0, mop: 30, method: "Top-dress to support prolific branching." },
      { stage: "Fruiting Cycle", timing: "60–70 DAT", urea: 35, dap: 0, mop: 30, method: "Replenish after each harvest picking." }
    ],
    tips: [
      "Avoid excess nitrogen during late flowering to prevent flower drop."
    ]
  },
  "Soybean": {
    pureN: 12, pureP: 24, pureK: 16,
    fym: 4.0, vermicompost: 600, neemCake: 80,
    biofertilizers: ["Bradyrhizobium japonicum", "PSB"],
    benefits: "Root nodules fix up to 60 kg of natural atmospheric nitrogen.",
    schedules: [
      { stage: "Basal Sowing", timing: "At sowing", urea: 100, dap: 100, mop: 100, method: "Apply starter dose; nodules supply rest." }
    ],
    tips: [
      "Treat seeds with Rhizobium culture and dry in shade 30 mins before sowing."
    ]
  },
  "Groundnut": {
    pureN: 10, pureP: 20, pureK: 16,
    fym: 5.0, vermicompost: 600, neemCake: 100,
    biofertilizers: ["Rhizobium", "Phosphobacteria"],
    benefits: "Enhances root nodulation and increases oil synthesis in kernels.",
    schedules: [
      { stage: "Basal Sowing", timing: "At sowing", urea: 100, dap: 100, mop: 100, method: "Apply complete starter NPK." },
      { stage: "Pegging Stage (Gypsum)", timing: "40–45 DAS", urea: 0, dap: 0, mop: 0, method: "Broadcast Gypsum (200 kg/acre) close to base without disturbing pegs." }
    ],
    tips: [
      "Gypsum at 40-45 DAS provides essential Calcium to prevent empty 'pop' pods."
    ]
  }
};

// Fallback initial benchmark location
const DEFAULT_LOCATION = {
  id: "kar-kolar",
  city: "Kolar",
  state: "Karnataka",
  display_name: "Kolar, Karnataka",
  latitude: 13.13,
  longitude: 78.13,
  major_crops: ["Tomato", "Vegetables", "Mango"]
};

// ================= LOCATION COMBOBOX COMPONENT =================
// Search by City or State, filter case-insensitively, allow ONLY 5 dropdown values at a time!
function LocationCombobox({
  locations,
  currentLocation,
  onSelectLocation,
  onUseGps,
  placeholder = "Search City, State..."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(currentLocation?.display_name || "Kolar, Karnataka");
  const containerRef = useRef(null);

  // Sync displayed text when currentLocation updates from GPS or external selection
  useEffect(() => {
    if (currentLocation?.display_name) {
      setQuery(currentLocation.display_name);
    }
  }, [currentLocation]);

  // Click-outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter case-insensitively and strictly cap at 5 items at a time
  const filtered = useMemo(() => {
    if (!locations || locations.length === 0) return [];
    const q = (query || "").trim().toLowerCase();

    if (!q) {
      return locations.slice(0, 5); // Default top 5
    }

    const matches = locations.filter((loc) => {
      const cityLower = (loc.city || "").toLowerCase();
      const stateLower = (loc.state || "").toLowerCase();
      const displayLower = (loc.display_name || "").toLowerCase();
      return (
        displayLower.includes(q) ||
        cityLower.includes(q) ||
        stateLower.includes(q)
      );
    });

    // STRICT REQUIREMENT: Allow ONLY 5 dropdown values at a time!
    return matches.slice(0, 5);
  }, [locations, query]);

  return (
    <div className="location-combobox-container" ref={containerRef}>
      <button
        type="button"
        className="btn-gps"
        onClick={onUseGps}
        title="Detect GPS location for nearest market and weather"
      >
        <Navigation size={12} /> My Farm GPS
      </button>

      <div className="location-input-wrapper">
        <MapPin size={14} color="#15803d" style={{ flexShrink: 0 }} />
        <input
          type="text"
          className="location-search-input"
          placeholder={placeholder}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
        />
        {query && (
          <button
            type="button"
            className="btn-clear-location"
            onClick={() => {
              setQuery("");
              setIsOpen(true);
            }}
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="location-dropdown-menu">
          {filtered.length > 0 ? (
            filtered.map((loc) => (
              <div
                key={loc.id}
                className={`location-dropdown-item ${currentLocation?.id === loc.id ? "selected" : ""}`}
                onClick={() => {
                  setQuery(loc.display_name);
                  setIsOpen(false);
                  onSelectLocation(loc);
                }}
              >
                <div className="location-item-main">
                  <span className="location-item-title">{loc.display_name}</span>
                  <span className="location-item-badge">{loc.state}</span>
                </div>
                {loc.major_crops && loc.major_crops.length > 0 && (
                  <span className="location-item-crops">
                    Key crops: {loc.major_crops.join(", ")}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="location-dropdown-empty">
              No matching City or State found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ================= FARMER REGISTRATION MODAL WITH 3 AUDIO SPEAKERS & TOP 10 LANGUAGES =================
function FarmerRegistrationModal({
  isOpen,
  canClose,
  onClose,
  onSuccess,
  currentLocation
}) {
  const [selectedLangCode, setSelectedLangCode] = useState("Kannada");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isListeningName, setIsListeningName] = useState(false);
  const [nameMicError, setNameMicError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [autoGps, setAutoGps] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("detecting");
  const nameRecognitionRef = useRef(null);

  const activeLocale = useMemo(() => {
    return TOP_10_LANGUAGES.find((l) => l.code === selectedLangCode) || TOP_10_LANGUAGES[0];
  }, [selectedLangCode]);

  // Automatic Geographic Location Detection on Mount
  useEffect(() => {
    if (isOpen) {
      if (navigator.geolocation) {
        setGpsStatus("detecting");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = parseFloat(pos.coords.latitude.toFixed(4));
            const lon = parseFloat(pos.coords.longitude.toFixed(4));
            setAutoGps({
              latitude: lat,
              longitude: lon,
              city: currentLocation?.city || "Local District",
              state: currentLocation?.state || "Karnataka",
              display: `${currentLocation?.city || "Farm GPS"} (${lat}°N, ${lon}°E)`
            });
            setGpsStatus("ready");
          },
          () => {
            setAutoGps({
              latitude: currentLocation?.latitude || 13.13,
              longitude: currentLocation?.longitude || 78.13,
              city: currentLocation?.city || "Kolar",
              state: currentLocation?.state || "Karnataka",
              display: `${currentLocation?.city || "Kolar"}, ${currentLocation?.state || "Karnataka"}`
            });
            setGpsStatus("ready");
          },
          { timeout: 7000, enableHighAccuracy: true }
        );
      } else {
        setAutoGps({
          latitude: currentLocation?.latitude || 13.13,
          longitude: currentLocation?.longitude || 78.13,
          city: currentLocation?.city || "Kolar",
          state: currentLocation?.state || "Karnataka",
          display: `${currentLocation?.city || "Kolar"}, ${currentLocation?.state || "Karnataka"}`
        });
        setGpsStatus("ready");
      }
    }
    return () => {
      if (nameRecognitionRef.current) {
        nameRecognitionRef.current.abort();
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [isOpen, currentLocation]);

  // Audio Speaker Assistant using Web Speech API (Only speaks when user clicks speaker)
  const handlePlaySpeaker = (fieldKey, text, bcp47Code) => {
    if (!window.speechSynthesis) {
      alert("Audio speech synthesis is not supported in this browser.");
      return;
    }

    if (activeSpeaker === fieldKey) {
      window.speechSynthesis.cancel();
      setActiveSpeaker(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp47Code || "en-IN";
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith((bcp47Code || "").slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setActiveSpeaker(fieldKey);
    utterance.onend = () => setActiveSpeaker(null);
    utterance.onerror = () => setActiveSpeaker(null);

    window.speechSynthesis.speak(utterance);
  };

  // Language selection: DO NOT auto-speak on card click, only change language selection
  const handleSelectLanguage = (langObj) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setActiveSpeaker(null);
    }
    setSelectedLangCode(langObj.code);
    setError(null);
  };

  // Speech Recognition (Voice Mic) for Farmer Name
  const handleToggleNameVoice = () => {
    if (isListeningName) {
      if (nameRecognitionRef.current) nameRecognitionRef.current.stop();
      setIsListeningName(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNameMicError("Microphone speech recognition is not supported in this browser. Please type name.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      nameRecognitionRef.current = recognition;
      recognition.lang = activeLocale.bcp47 || "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListeningName(true);
        setNameMicError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setName(transcript);
        }
        setIsListeningName(false);
      };

      recognition.onerror = (event) => {
        setIsListeningName(false);
        if (event.error !== "no-speech") {
          setNameMicError(`Mic error: ${event.error}. Please type name directly.`);
        }
      };

      recognition.onend = () => {
        setIsListeningName(false);
      };

      recognition.start();
    } catch (err) {
      setIsListeningName(false);
      setNameMicError("Failed to initialize microphone.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your full name (or click Speak Name).");
      return;
    }

    // Phone number is OPTIONAL!
    let cleanPhone = null;
    if (phone && phone.trim()) {
      cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        setError("Please enter a valid 10-digit mobile number, or leave it blank.");
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/farmers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone_number: cleanPhone,
          language: activeLocale.code,
          state: autoGps?.state || currentLocation?.state || "Karnataka",
          city: autoGps?.city || currentLocation?.city || "Kolar",
          latitude: autoGps?.latitude ?? currentLocation?.latitude ?? 13.13,
          longitude: autoGps?.longitude ?? currentLocation?.longitude ?? 78.13
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Registration failed. Please try again.");
      }

      const farmerData = await res.json();
      localStorage.setItem("bharath_krishi_farmer", JSON.stringify(farmerData));
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      onSuccess(farmerData);
    } catch (err) {
      setError(err.message || "Failed to register. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="farmer-reg-overlay">
      <div className="farmer-reg-modal">
        {/* Banner Header - Kept in English Only */}
        <div className="farmer-reg-banner">
          <div className="reg-badge">
            <Sprout size={14} /> Bharat Krishi • Farmer Registration
          </div>
          <h2 className="farmer-reg-title">Farmer Registration</h2>
          <p className="farmer-reg-subtitle">
            Join Bharath Krishi Digital Platform. Registered farmers receive free access to AI crop diagnostics, nearest mandi rates, and fertilizer dosage planning.
          </p>

          {canClose && (
            <button
              type="button"
              className="btn-close-reg-modal"
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                onClose();
              }}
              title="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Modal Form Body - Kept in English Only */}
        <form onSubmit={handleSubmit} className="farmer-reg-body">
          {error && (
            <div className="alert-error" style={{ marginBottom: "0.25rem" }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Automatic Geographic Location Tag */}
          <div className="reg-location-badge">
            <MapPin size={16} color="#15803d" style={{ flexShrink: 0 }} />
            <div>
              <strong>Geographic Location: </strong>
              <span>
                {autoGps ? autoGps.display : "Detecting farm GPS location automatically..."}
              </span>
              <span style={{ fontSize: "0.72rem", color: "#15803d", marginLeft: "0.5rem" }}>
                (Automatically registered to your profile)
              </span>
            </div>
          </div>

          {/* 1. Language Selection with Speaker 1 */}
          <div>
            <div className="reg-section-header">
              <div className="reg-section-title">
                <Globe size={18} color="#15803d" />
                <span>1. Select Preferred Regional Language</span>
              </div>
              <button
                type="button"
                className={`btn-field-speaker ${activeSpeaker === "lang" ? "speaking" : ""}`}
                onClick={() => handlePlaySpeaker("lang", activeLocale.langPrompt, activeLocale.bcp47)}
                title="Click to hear language instructions in your selected language"
              >
                {activeSpeaker === "lang" ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{activeSpeaker === "lang" ? "Speaking..." : `🔊 Listen Help (${activeLocale.native})`}</span>
              </button>
            </div>

            <div className="reg-lang-grid">
              {TOP_10_LANGUAGES.map((lang) => {
                const isSelected = selectedLangCode === lang.code;
                return (
                  <div
                    key={lang.code}
                    className={`reg-lang-card ${isSelected ? "active" : ""}`}
                    onClick={() => handleSelectLanguage(lang)}
                  >
                    <span className="reg-lang-icon">{lang.icon}</span>
                    <span className="reg-lang-native">{lang.native}</span>
                    <span className="reg-lang-label">{lang.label}</span>
                    <span className="reg-lang-region">{lang.region}</span>
                    {isSelected && (
                      <div className="reg-lang-check">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Full Name Input with Speaker 2 AND Voice Mic for Name */}
          <div className="reg-input-group">
            <div className="reg-section-header">
              <div className="reg-section-title">
                <User size={18} color="#15803d" />
                <span>2. Farmer Full Name</span>
              </div>
              <button
                type="button"
                className={`btn-field-speaker ${activeSpeaker === "name" ? "speaking" : ""}`}
                onClick={() => handlePlaySpeaker("name", activeLocale.namePrompt, activeLocale.bcp47)}
                title="Click to hear full name instructions in your selected language"
              >
                {activeSpeaker === "name" ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{activeSpeaker === "name" ? "Speaking..." : `🔊 Listen Help (${activeLocale.native})`}</span>
              </button>
            </div>

            {nameMicError && (
              <div style={{ fontSize: "0.78rem", color: "#dc2626", marginBottom: "0.25rem" }}>
                {nameMicError}
              </div>
            )}

            <div className="reg-input-container">
              <User size={18} className="reg-input-icon" />
              <input
                type="text"
                className="reg-input-field"
                placeholder="Enter full name or click mic to speak..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              {/* Voice Microphone Input for Farmer Name */}
              <button
                type="button"
                className={`btn-name-mic ${isListeningName ? "listening" : ""}`}
                onClick={handleToggleNameVoice}
                title="Click to speak your name in your selected language"
              >
                {isListeningName ? <MicOff size={15} color="#dc2626" /> : <Mic size={15} color="#15803d" />}
                <span>{isListeningName ? "Listening..." : "Speak Name (Mic)"}</span>
              </button>
            </div>
          </div>

          {/* 3. Phone Number Input with Speaker 3 (OPTIONAL) */}
          <div className="reg-input-group">
            <div className="reg-section-header">
              <div className="reg-section-title">
                <Phone size={18} color="#15803d" />
                <span>3. Mobile Phone Number (Optional)</span>
              </div>
              <button
                type="button"
                className={`btn-field-speaker ${activeSpeaker === "phone" ? "speaking" : ""}`}
                onClick={() => handlePlaySpeaker("phone", activeLocale.phonePrompt, activeLocale.bcp47)}
                title="Click to hear mobile number instructions in your selected language"
              >
                {activeSpeaker === "phone" ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{activeSpeaker === "phone" ? "Speaking..." : `🔊 Listen Help (${activeLocale.native})`}</span>
              </button>
            </div>

            <div className="reg-input-container">
              <span className="reg-input-prefix">🇮🇳 +91</span>
              <input
                type="tel"
                maxLength={10}
                className="reg-input-field"
                placeholder="Enter 10-digit mobile number (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="reg-field-hint">
              Optional — phone number is used for free SMS market advisories and mandi price updates.
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn-reg-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="spinning" />
                <span>Registering Farmer in Database...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                <span>Complete Registration & Enter Platform</span>
              </>
            )}
          </button>

          <div className="reg-trust-notice">
            <Shield size={14} color="#15803d" />
            <span>PostgreSQL Agri Registry • Simple & Free for Smallholder Farmers • No Password Needed</span>
          </div>
        </form>
      </div>
    </div>
  );
}

// ================= MAIN APP COMPONENT =================
export default function App() {
  // Navigation State: 'admin' | 'diagnostics' | 'weather' | 'mandi' | 'fertilizer'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      if (
        window.location.pathname === "/admin" ||
        window.location.hash === "#admin" ||
        window.location.hash === "#/admin"
      ) {
        return "admin";
      }
    }
    return "diagnostics";
  });

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem("bharath_admin_auth") === "true";
    } catch {
      return false;
    }
  });
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // In-Memory Global Locations State
  const [locations, setLocations] = useState(globalLocationsCache || []);

  // Farm Location State (Shared across Weather and Mandi for nearest calculations)
  const [farmerLocation, setFarmerLocation] = useState(DEFAULT_LOCATION);

  // Registered Farmer State (One-time Registration, No recurring login needed)
  const [registeredFarmer, setRegisteredFarmer] = useState(() => {
    try {
      const saved = localStorage.getItem("bharath_krishi_farmer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regSuccessToast, setRegSuccessToast] = useState(null);

  // Admin Dashboard State
  const [adminFarmers, setAdminFarmers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminLangFilter, setAdminLangFilter] = useState("ALL");

  // Government Schemes & Subsidies State
  const [schemesList, setSchemesList] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [schemesError, setSchemesError] = useState(null);
  const [schemeLandArea, setSchemeLandArea] = useState(2.0);
  const [schemeAreaUnit, setSchemeAreaUnit] = useState("Acres");
  const [schemeCrop, setSchemeCrop] = useState("Tomato");
  const [schemeState, setSchemeState] = useState("Karnataka");
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState("ALL");
  const [schemeSearch, setSchemeSearch] = useState("");
  const [savedSchemeIds, setSavedSchemeIds] = useState([]);
  const [activeSchemeDetail, setActiveSchemeDetail] = useState(null);
  const [speakingSchemeCode, setSpeakingSchemeCode] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [schemeToast, setSchemeToast] = useState(null);

  // Government Schemes Fetcher
  const fetchSchemesList = async () => {
    setSchemesLoading(true);
    setSchemesError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/schemes/list`);
      if (!res.ok) throw new Error("Failed to load government schemes directory.");
      const data = await res.json();
      setSchemesList(data);
    } catch (err) {
      setSchemesError(err.message || "Failed to load government schemes.");
    } finally {
      setSchemesLoading(false);
    }
  };

  // Eligibility Evaluation Handler
  const handleCheckEligibility = async (overrideParams = {}) => {
    setEligibilityLoading(true);
    setSchemesError(null);
    try {
      const land = overrideParams.land_area !== undefined ? overrideParams.land_area : Number(schemeLandArea) || 1.0;
      const unit = overrideParams.area_unit || schemeAreaUnit;
      const crop = overrideParams.crop_name !== undefined ? overrideParams.crop_name : schemeCrop;
      const st = overrideParams.state || schemeState || (registeredFarmer?.state) || (farmerLocation.state) || "Karnataka";

      const res = await fetch(`${API_BASE_URL}/api/schemes/check-eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          land_area: land,
          area_unit: unit,
          crop_name: crop === "All Crops" ? null : crop,
          state: st
        })
      });

      if (!res.ok) throw new Error("Could not evaluate scheme eligibility.");
      const data = await res.json();
      setEligibilityResult(data);
      if (schemesList.length === 0 && data.results) {
        setSchemesList(data.results.map((r) => r.scheme));
      }
    } catch (err) {
      setSchemesError(err.message || "Failed to evaluate scheme eligibility.");
    } finally {
      setEligibilityLoading(false);
    }
  };

  // Scheme Bookmark Handler
  const handleSaveScheme = async (scheme) => {
    const farmerId = registeredFarmer?.id || "guest-farmer";
    try {
      const res = await fetch(`${API_BASE_URL}/api/schemes/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_id: farmerId,
          scheme_id: scheme.id
        })
      });
      if (res.ok) {
        setSavedSchemeIds((prev) => [...new Set([...prev, scheme.id])]);
        setSchemeToast(`⭐ "${scheme.short_name}" saved to your farm profile!`);
        setTimeout(() => setSchemeToast(null), 5000);
      }
    } catch {
      setSavedSchemeIds((prev) => [...new Set([...prev, scheme.id])]);
      setSchemeToast(`⭐ "${scheme.short_name}" bookmarked!`);
      setTimeout(() => setSchemeToast(null), 5000);
    }
  };

  // Multi-lingual Audio Speaker for Schemes
  const handleSpeakScheme = (scheme) => {
    if (!window.speechSynthesis) return;

    if (speakingSchemeCode === scheme.code) {
      window.speechSynthesis.cancel();
      setSpeakingSchemeCode(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingSchemeCode(scheme.code);

    const speechText = `${scheme.name}. Benefits: ${scheme.benefit_summary}. Implementing Agency: ${scheme.implementing_agency}.`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const langVoice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("hi-IN"));
    if (langVoice) utterance.voice = langVoice;

    utterance.onend = () => setSpeakingSchemeCode(null);
    utterance.onerror = () => setSpeakingSchemeCode(null);
    window.speechSynthesis.speak(utterance);
  };

  // Route Synchronization Helper
  const navigateTab = (tabName) => {
    setActiveTab(tabName);
    if (tabName === "admin") {
      if (window.location.pathname !== "/admin") {
        window.history.pushState(null, "", "/admin");
      }
      if (isAdminAuthenticated) {
        fetchAdminFarmers();
      }
    } else {
      if (window.location.pathname === "/admin") {
        window.history.pushState(null, "", "/");
      }
    }
    if (tabName === "schemes") {
      if (schemesList.length === 0) fetchSchemesList();
      if (!eligibilityResult) handleCheckEligibility();
    }
  };

  // Dynamic Real-time Schemes Evaluator: Automatically re-fetches & updates schemes as soon as any farm value changes
  useEffect(() => {
    if (activeTab === "schemes") {
      const timer = setTimeout(() => {
        handleCheckEligibility();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [schemeLandArea, schemeAreaUnit, schemeCrop, schemeState, activeTab]);

  // Browser Back/Forward navigation listener
  useEffect(() => {
    const handlePopState = () => {
      if (
        window.location.pathname === "/admin" ||
        window.location.hash === "#admin" ||
        window.location.hash === "#/admin"
      ) {
        setActiveTab("admin");
      } else {
        setActiveTab("diagnostics");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Admin Login Handler against Database Seed Values (Mehaboob / Mehaboob@123)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword) {
      setAdminLoginError("Please enter both Username and Password.");
      return;
    }
    setAdminLoginLoading(true);
    setAdminLoginError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid admin credentials.");
      }
      sessionStorage.setItem("bharath_admin_auth", "true");
      setIsAdminAuthenticated(true);
      setAdminPassword("");
      fetchAdminFarmers();
    } catch (err) {
      setAdminLoginError(err.message || "Admin authentication failed.");
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("bharath_admin_auth");
    setIsAdminAuthenticated(false);
    setAdminLoginError(null);
  };

  // Diagnostic State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropType, setCropType] = useState("");
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem("bharath_krishi_farmer");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language) return parsed.language;
      }
    } catch {}
    return "English";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Weather & Spray Advisory State
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Mandi & Market Intelligence State
  const [mandiData, setMandiData] = useState(null);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [mandiError, setMandiError] = useState(null);
  const [mandiQuery, setMandiQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Fertilizer & NPK Calculator State
  const [fertCrop, setFertCrop] = useState("Tomato");
  const [fertArea, setFertArea] = useState(1.0);
  const [fertUnit, setFertUnit] = useState("Acres");
  const [fertStage, setFertStage] = useState("Full Season / Recommended POP");
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);

  // Fetch saved plans from PostgreSQL
  const fetchSavedPlans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/fertilizer/saved`);
      if (res.ok) {
        const data = await res.json();
        setSavedPlans(data);
      }
    } catch (e) {
      console.warn("Could not load saved plans from PostgreSQL:", e);
    }
  };

  // Instantaneous, edge-like client-side NPK calculation (0ms delay)
  const fertCalculation = useMemo(() => {
    const profile = FERTILIZER_PROFILES[fertCrop] || FERTILIZER_PROFILES["Tomato"];
    const areaMultiplier = fertUnit === "Guntas" ? 0.025 : fertUnit === "Bighas" ? 0.625 : fertUnit === "Hectares" ? 2.471 : 1.0;
    const numArea = parseFloat(fertArea) || 0.1;
    const acres = Math.max(0.01, parseFloat((numArea * areaMultiplier).toFixed(3)));

    let stageFactor = 1.0;
    if (fertStage.includes("Basal")) stageFactor = 0.40;
    else if (fertStage.includes("Vegetative") || fertStage.includes("Tillering")) stageFactor = 0.35;
    else if (fertStage.includes("Flowering") || fertStage.includes("Pre-Bloom")) stageFactor = 0.25;
    else if (fertStage.includes("Fruiting") || fertStage.includes("Grain")) stageFactor = 0.25;

    const pureN = parseFloat((profile.pureN * acres * stageFactor).toFixed(1));
    const pureP = parseFloat((profile.pureP * acres * stageFactor).toFixed(1));
    const pureK = parseFloat((profile.pureK * acres * stageFactor).toFixed(1));

    const dapKg = parseFloat((pureP / 0.46).toFixed(1));
    const dapBags = parseFloat((dapKg / 50.0).toFixed(1));
    const nFromDap = parseFloat((dapKg * 0.18).toFixed(1));

    const remN = Math.max(0, pureN - nFromDap);
    const ureaKg = parseFloat((remN / 0.46).toFixed(1));
    const ureaBags = parseFloat((ureaKg / 45.0).toFixed(1));

    const mopKg = parseFloat((pureK / 0.60).toFixed(1));
    const mopBags = parseFloat((mopKg / 50.0).toFixed(1));

    const ureaCost = Math.round(ureaBags * 266.5);
    const dapCost = Math.round(dapBags * 1350.0);
    const mopCost = Math.round(mopBags * 1700.0);
    const totalCost = ureaCost + dapCost + mopCost;

    const fymTons = parseFloat((profile.fym * acres).toFixed(1));
    const vermicompostKg = Math.round(profile.vermicompost * acres);
    const neemCakeKg = Math.round(profile.neemCake * acres);

    return {
      acres,
      pureN,
      pureP,
      pureK,
      ureaKg,
      ureaBags,
      ureaCost,
      dapKg,
      dapBags,
      dapCost,
      mopKg,
      mopBags,
      mopCost,
      totalCost,
      fymTons,
      vermicompostKg,
      neemCakeKg,
      biofertilizers: profile.biofertilizers,
      benefits: profile.benefits,
      schedules: profile.schedules,
      tips: profile.tips
    };
  }, [fertCrop, fertArea, fertUnit, fertStage]);

  const handleSavePlan = async () => {
    setIsSavingPlan(true);
    setSaveSuccessMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/fertilizer/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_name: fertCrop,
          land_area: parseFloat(fertArea) || 1.0,
          area_unit: fertUnit,
          growth_stage: fertStage,
          nitrogen_kg: fertCalculation.pureN,
          phosphorus_kg: fertCalculation.pureP,
          potassium_kg: fertCalculation.pureK,
          urea_bags: fertCalculation.ureaBags,
          dap_bags: fertCalculation.dapBags,
          mop_bags: fertCalculation.mopBags,
          fym_tons: fertCalculation.fymTons,
          vermicompost_kg: fertCalculation.vermicompostKg,
          estimated_cost: fertCalculation.totalCost
        })
      });
      if (res.ok) {
        const saved = await res.json();
        setSaveSuccessMsg(`Plan saved to PostgreSQL (ID: ${saved.id.slice(0, 8)})!`);
        fetchSavedPlans();
      }
    } catch (e) {
      console.error("Save plan error:", e);
    } finally {
      setIsSavingPlan(false);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Helper to get BCP-47 language tag
  const getBcp47 = (langName) => {
    const found = LANGUAGES.find((l) => l.code.toLowerCase() === (langName || "").toLowerCase());
    return found ? found.bcp47 : "en-IN";
  };

  // Weather Advisory Fetcher
  const fetchWeatherAdvisory = async (lat, lon, label) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/weather-advisory?lat=${lat}&lon=${lon}&language=${language}`);
      if (!response.ok) {
        throw new Error("Unable to retrieve weather advisory.");
      }
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setWeatherError(err.message || "Failed to load weather data.");
    } finally {
      setWeatherLoading(false);
    }
  };

  // GPS Location Trigger
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setWeatherError("Geolocation is not supported by your browser.");
      return;
    }
    setWeatherLoading(true);
    setWeatherError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(2));
        const lon = parseFloat(pos.coords.longitude.toFixed(2));
        const gpsLabel = `My Farm GPS (${lat}°N, ${lon}°E)`;
        const newLoc = {
          id: "gps",
          city: "My Farm",
          state: "GPS Detected",
          display_name: gpsLabel,
          latitude: lat,
          longitude: lon
        };
        setFarmerLocation(newLoc);
        fetchWeatherAdvisory(lat, lon, gpsLabel);
        searchMandiRates(mandiQuery || "Tomato, Onion, Chilli", language, lat, lon, newLoc.city, newLoc.state);
      },
      () => {
        setWeatherLoading(false);
        setWeatherError("Location access denied. Please type a City or State in the search box.");
      }
    );
  };

  // City, State Selection Trigger
  const handleSelectLocation = (loc) => {
    setFarmerLocation(loc);
    fetchWeatherAdvisory(loc.latitude, loc.longitude, loc.display_name);
    searchMandiRates(mandiQuery || "Tomato, Onion, Chilli", language, loc.latitude, loc.longitude, loc.city, loc.state);
  };

  // Mandi Rates Fetcher with Nearest Distance Selection
  const searchMandiRates = async (
    queryText = "",
    targetLang = language,
    lat = farmerLocation.latitude,
    lon = farmerLocation.longitude,
    cityName = farmerLocation.city,
    stateName = farmerLocation.state
  ) => {
    setMandiLoading(true);
    setMandiError(null);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/mandi-rates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText || undefined,
          language: targetLang,
          city: cityName,
          state: stateName,
          latitude: lat,
          longitude: lon
        })
      });

      if (!response.ok) {
        throw new Error("Could not retrieve Mandi prices.");
      }

      const data = await response.json();
      setMandiData(data);
    } catch (err) {
      setMandiError(err.message || "Failed to fetch Mandi rates.");
    } finally {
      setMandiLoading(false);
    }
  };

  // Speech Recognition (Voice Mic Input)
  const handleToggleVoiceInput = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMandiError("Voice recognition is not supported in this browser. Please type crop name.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = getBcp47(language);
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setMandiError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMandiQuery(transcript);
        setIsRecording(false);
        // Automatically search nearest Mandi rates using spoken transcript
        searchMandiRates(transcript, language, farmerLocation.latitude, farmerLocation.longitude, farmerLocation.city, farmerLocation.state);
      };

      recognition.onerror = (event) => {
        setIsRecording(false);
        if (event.error !== "no-speech") {
          setMandiError(`Mic input error: ${event.error}. Please check mic permissions.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      setIsRecording(false);
      setMandiError("Failed to initialize microphone.");
    }
  };

  // Text-to-Speech (TTS Audio Button)
  const handleSpeakMandiReport = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!mandiData || !mandiData.spoken_summary) return;

    const utterance = new SpeechSynthesisUtterance(mandiData.spoken_summary);
    const langCode = getBcp47(mandiData.language || language);
    utterance.lang = langCode;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(langCode.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Initial Seed & Fetch on Mount
  useEffect(() => {
    // Load pre-seeded locations into Global In-Memory Store if not already cached
    if (!globalLocationsCache) {
      fetch(`${API_BASE_URL}/api/locations`)
        .then((res) => res.json())
        .then((data) => {
          globalLocationsCache = data;
          setLocations(data);
          if (data && data.length > 0) {
            setFarmerLocation(data[0]);
            fetchWeatherAdvisory(data[0].latitude, data[0].longitude, data[0].display_name);
            searchMandiRates("Tomato, Onion, Chilli", language, data[0].latitude, data[0].longitude);
          }
        })
        .catch(() => {
          // Fallback to default Kolar location
          fetchWeatherAdvisory(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.display_name);
          searchMandiRates("Tomato, Onion, Chilli", language, DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
        });
    } else {
      setLocations(globalLocationsCache);
      fetchWeatherAdvisory(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.display_name);
      searchMandiRates("Tomato, Onion, Chilli", language, DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    }

    // Preload admin farmers registry & government schemes
    fetchAdminFarmers();
    fetchSchemesList();
    handleCheckEligibility({ land_area: 2.0, area_unit: "Acres", crop_name: "Tomato", state: DEFAULT_LOCATION.state || "Karnataka" });

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Admin Registry Fetcher
  const fetchAdminFarmers = async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmers`);
      if (!res.ok) throw new Error("Failed to load registered farmers.");
      const data = await res.json();
      setAdminFarmers(data.farmers || []);
    } catch (err) {
      setAdminError(err.message || "Failed to fetch farmer registry.");
    } finally {
      setAdminLoading(false);
    }
  };

  // Filtered farmers for Admin Dashboard
  const filteredAdminFarmers = useMemo(() => {
    return adminFarmers.filter((f) => {
      const matchesSearch =
        !adminSearch ||
        (f.name && f.name.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (f.phone_number && f.phone_number.includes(adminSearch)) ||
        (f.city && f.city.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (f.state && f.state.toLowerCase().includes(adminSearch.toLowerCase()));

      const matchesLang =
        adminLangFilter === "ALL" ||
        (f.language && f.language.toLowerCase() === adminLangFilter.toLowerCase());

      return matchesSearch && matchesLang;
    });
  }, [adminFarmers, adminSearch, adminLangFilter]);

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadSampleImage = async () => {
    try {
      const response = await fetch("/sample_crop_leaf.jpg");
      const blob = await response.blob();
      const file = new File([blob], "sample_crop_leaf.jpg", { type: "image/jpeg" });
      handleFileChange(file);
      setCropType("Tomato");
    } catch {
      setError("Could not load sample image.");
    }
  };

  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please upload a crop leaf image first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (cropType && cropType !== "Select Crop (or Auto-detect)") {
      formData.append("crop_type", cropType);
    }
    formData.append("language", language);

    try {
      const response = await fetch(`${API_BASE_URL}/api/diagnose`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Diagnosis failed. Please check backend connection.");
      }

      const data = await response.json();
      setDiagnosis(data);
    } catch (err) {
      setError(err.message || `Failed to connect to FastAPI backend at ${API_BASE_URL || "/api"}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-shell">
      {/* --- Sidebar Navigation --- */}
      <aside className="app-sidebar">
        <div>
          {/* Brand header */}
          <div className="sidebar-brand">
            <div className="sidebar-logo-row">
              <div className="sidebar-logo-icon">
                <Sprout size={24} />
              </div>
              <div>
                <div className="sidebar-brand-title">Bharath Krishi</div>
                <span className="sidebar-brand-tag">Digital Public Good</span>
              </div>
            </div>
          </div>

          {/* Registered Farmer Profile Card */}
          {registeredFarmer ? (
            <div className="sidebar-farmer-card">
              <div className="farmer-card-top-row">
                <div className="farmer-avatar-badge">
                  {registeredFarmer.name?.charAt(0)?.toUpperCase() || "🌾"}
                </div>
                <div className="farmer-meta">
                  <div className="farmer-meta-name">{registeredFarmer.name}</div>
                  <div className="farmer-meta-sub">
                    {registeredFarmer.phone_number ? `📞 +91 ${registeredFarmer.phone_number}` : registeredFarmer.language}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-switch-profile"
                  onClick={() => setShowRegisterModal(true)}
                  title="Switch Profile"
                >
                  <RefreshCw size={11} />
                  <span>Switch</span>
                </button>
              </div>
              <button
                type="button"
                className="btn-sidebar-new-user"
                onClick={() => setShowRegisterModal(true)}
                title="Register another farmer or create a new user profile"
              >
                <UserPlus size={13} />
                <span>Register as New User</span>
              </button>
            </div>
          ) : (
            <div style={{ margin: "0 1rem 0.85rem" }}>
              <button
                type="button"
                className="btn-reg-submit"
                style={{ padding: "0.55rem 0.85rem", fontSize: "0.82rem", width: "100%", margin: 0 }}
                onClick={() => setShowRegisterModal(true)}
              >
                <UserPlus size={15} />
                <span>Register as New User</span>
              </button>
            </div>
          )}

          {/* Nav Items */}
          <nav className="sidebar-nav">
            {/* 👑 ADMIN SECTION ON TOP OF SLIDER / SIDEBAR */}
            <button
              type="button"
              className={`nav-item ${activeTab === "admin" ? "active" : ""}`}
              onClick={() => navigateTab("admin")}
              style={{
                borderLeft: activeTab === "admin" ? "3px solid #7c3aed" : "3px solid transparent",
                background: activeTab === "admin" ? "rgba(124, 58, 237, 0.08)" : undefined
              }}
            >
              <Shield size={18} color="#7c3aed" />
              <span style={{ fontWeight: 800 }}>Admin Portal</span>
              <span
                className="nav-item-badge"
                style={{
                  color: isAdminAuthenticated ? "#15803d" : "#7c3aed",
                  background: isAdminAuthenticated ? "#dcfce7" : "#f3e8ff"
                }}
              >
                {isAdminAuthenticated ? "Online" : "Login Req"}
              </span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeTab === "diagnostics" ? "active" : ""}`}
              onClick={() => navigateTab("diagnostics")}
            >
              <Leaf size={18} />
              <span>Crop Diagnostics</span>
              {diagnosis && <span className="nav-item-badge">Scanned</span>}
            </button>

            <button
              type="button"
              className={`nav-item ${activeTab === "weather" ? "active" : ""}`}
              onClick={() => navigateTab("weather")}
            >
              <CloudRain size={18} />
              <span>Weather & Spraying</span>
              {weather && (
                <span className="nav-item-badge" style={{ color: weather.spray_advisory.status === "AVOID" ? "#dc2626" : "#16a34a" }}>
                  {weather.spray_advisory.status}
                </span>
              )}
            </button>

            <button
              type="button"
              className={`nav-item ${activeTab === "mandi" ? "active" : ""}`}
              onClick={() => {
                navigateTab("mandi");
                if (!mandiData) searchMandiRates(mandiQuery || "Tomato, Onion, Chilli", language, farmerLocation.latitude, farmerLocation.longitude, farmerLocation.city, farmerLocation.state);
              }}
            >
              <TrendingUp size={18} />
              <span>Nearest Mandi Rates</span>
              <span className="nav-item-badge" style={{ color: "#15803d" }}>Live GPS</span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeTab === "fertilizer" ? "active" : ""}`}
              onClick={() => {
                navigateTab("fertilizer");
                fetchSavedPlans();
              }}
            >
              <FlaskConical size={18} />
              <span>Fertilizer & NPK Dosage</span>
              <span className="nav-item-badge" style={{ color: "#2563eb" }}>ICAR POP</span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeTab === "schemes" ? "active" : ""}`}
              onClick={() => navigateTab("schemes")}
            >
              <Landmark size={18} />
              <span>Govt Schemes & Subsidies</span>
              <span className="nav-item-badge" style={{ color: "#b45309", background: "#fef3c7" }}>
                ₹ Subsidy
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Widget */}
        <div className="sidebar-footer">
          {/* Quick weather glance */}
          {weather && (
            <div
              className="sidebar-weather-glance"
              onClick={() => setActiveTab("weather")}
              title="Click to view detailed weather & spray advisory"
            >
              <div className="glance-header">
                <span className="glance-title">
                  <CloudRain size={12} /> Spray Status
                </span>
                <span className={`spray-status-badge badge-${weather.spray_advisory.status}`} style={{ fontSize: "0.68rem", padding: "0.15rem 0.4rem" }}>
                  {weather.spray_advisory.status}
                </span>
              </div>
              <div className="glance-details">
                <span style={{ fontWeight: 700, color: "#064e3b" }}>
                  {weather.current_weather.temperature_c.toFixed(1)}°C
                </span>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  {weather.current_weather.weather_condition}
                </span>
              </div>
            </div>
          )}

          {/* System status */}
          <div className="sidebar-status">
            <div className="status-dot" />
            <span>AI Diagnostic & Mandi Engine Online</span>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className={`app-main-content ${activeTab === "admin" && !isAdminAuthenticated ? "admin-auth-mode" : ""}`}>
        {/* Registration Success Notification Banner */}
        {regSuccessToast && (
          <div className="reg-toast-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={18} />
              <span>{regSuccessToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setRegSuccessToast(null)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex" }}
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ================= VIEW 1: CROP DIAGNOSTICS ================= */}
        {activeTab === "diagnostics" && (
          <div>
            {/* Header */}
            <header className="app-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", textAlign: "left", marginBottom: "2rem" }}>
              <div>
                <div className="badge-tag">
                  <Sparkles size={14} /> AI Plant Pathology • Multi-lingual Advisory
                </div>
                <h1 className="app-title" style={{ fontSize: "2rem" }}>AI Crop Health Diagnostics</h1>
                <p className="app-subtitle" style={{ margin: "0" }}>
                  Upload an affected leaf photo for instant disease detection, regenerative bio-controls, and targeted chemical remedies.
                </p>
              </div>
              <button
                type="button"
                className="btn-register-header"
                onClick={() => setShowRegisterModal(true)}
                title="Register a new farmer profile in the registry"
              >
                <UserPlus size={15} />
                <span>Register as New User</span>
              </button>
            </header>

            {/* Main Diagnostics Grid */}
            <div className="main-grid">
              {/* Left Column: Upload & Context */}
              <section className="glass-card">
                <h2 className="card-title">
                  <Leaf size={22} color="#15803d" /> Crop Image & Context
                </h2>

                {error && (
                  <div className="alert-error">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleDiagnose}>
                  {/* Upload Zone */}
                  <div className="form-group">
                    <label className="form-label">Upload Affected Leaf / Plant Photo</label>

                    {!previewUrl ? (
                      <div
                        className={`dropzone ${dragOver ? "dragover" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="dropzone-content">
                          <UploadCloud className="dropzone-icon" />
                          <div className="dropzone-text">
                            <strong>Click to upload</strong> or drag and drop
                            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
                              JPG, PNG, or WEBP (Max 10MB)
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="preview-container">
                        <img src={previewUrl} alt="Crop preview" className="preview-img" />
                        <button
                          type="button"
                          className="btn-remove-img"
                          onClick={clearImage}
                          title="Remove image"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                      onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                    />

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="sample-leaf-btn"
                        onClick={loadSampleImage}
                      >
                        <Sparkles size={14} color="#15803d" /> Load Sample Leaf Image
                      </button>
                    </div>
                  </div>

                  {/* Crop selector */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="crop-select">Crop Type (Optional)</label>
                    <select
                      id="crop-select"
                      className="form-select"
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                    >
                      {CROPS.map((c) => (
                        <option key={c} value={c === "Select Crop (or Auto-detect)" ? "" : c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language Selector */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="lang-select">Advisory Language</label>
                    <select
                      id="lang-select"
                      className="form-select"
                      value={language}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setLanguage(newLang);
                        if (mandiData) searchMandiRates(mandiQuery, newLang, farmerLocation.latitude, farmerLocation.longitude);
                      }}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !selectedFile}
                  >
                    {loading ? (
                      <>
                        <div className="spinner" /> Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} /> Run AI Diagnostic
                      </>
                    )}
                  </button>
                </form>
              </section>

              {/* Right Column: Diagnostic Report */}
              <section className="glass-card">
                <h2 className="card-title">
                  <CheckCircle2 size={22} color="#15803d" /> Diagnostic Report
                </h2>

                {!diagnosis ? (
                  <div className="empty-placeholder">
                    <Sprout className="empty-icon" />
                    <p>Upload a leaf image and click <strong>"Run AI Diagnostic"</strong> to see diagnosis and regenerative treatments.</p>
                  </div>
                ) : (
                  <div>
                    {/* Header result */}
                    <div className="result-header">
                      <div>
                        <h3 className="disease-name">{diagnosis.condition}</h3>
                        <div className="crop-tag">Crop: {diagnosis.crop_detected}</div>
                      </div>
                      <span className={`severity-pill severity-${diagnosis.severity}`}>
                        {diagnosis.severity} Severity
                      </span>
                    </div>

                    {/* Stats overview */}
                    <div className="stats-grid">
                      <div className="stat-box">
                        <div className="stat-label">Health Status</div>
                        <div className="stat-value" style={{ color: diagnosis.is_healthy ? "#16a34a" : "#dc2626" }}>
                          {diagnosis.is_healthy ? "Healthy Plant" : "Infected / Stress"}
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">Confidence</div>
                        <div className="stat-value">
                          {(diagnosis.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Quick Mandi check shortcut */}
                    <div
                      style={{
                        margin: "1rem 0",
                        background: "#f0fdf4",
                        border: "1px solid #86efac",
                        borderRadius: "0.75rem",
                        padding: "0.75rem 1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer"
                      }}
                      onClick={() => {
                        setActiveTab("mandi");
                        setMandiQuery(diagnosis.crop_detected);
                        searchMandiRates(diagnosis.crop_detected, language, farmerLocation.latitude, farmerLocation.longitude);
                      }}
                      title="Check nearest mandi market selling rate for this crop"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <TrendingUp size={18} color="#15803d" />
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#166534" }}>
                          Check Nearest Mandi Rate for {diagnosis.crop_detected}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center" }}>
                        View Nearest Rates <ChevronRight size={14} />
                      </span>
                    </div>

                    {/* Symptoms */}
                    {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
                      <div>
                        <div className="section-title">
                          <ShieldAlert size={16} color="#d97706" /> Observed Symptoms
                        </div>
                        <ul className="symptoms-list">
                          {diagnosis.symptoms.map((symptom, idx) => (
                            <li key={idx}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Remedies */}
                    {diagnosis.remedies && (
                      <div>
                        <div className="section-title">
                          <Sprout size={16} color="#15803d" /> Recommended Treatments
                        </div>

                        {/* Organic / Regenerative */}
                        <div className="remedy-card remedy-organic">
                          <div className="remedy-head">
                            <Sprout size={16} /> Organic & Regenerative Solution
                          </div>
                          <div className="remedy-body">{diagnosis.remedies.organic}</div>
                        </div>

                        {/* Chemical Alternative */}
                        <div className="remedy-card remedy-chemical">
                          <div className="remedy-head">
                            <FlaskConical size={16} /> Chemical Intervention (Targeted)
                          </div>
                          <div className="remedy-body">{diagnosis.remedies.chemical}</div>
                        </div>

                        {/* Preventative Measures */}
                        <div className="remedy-card remedy-preventative">
                          <div className="remedy-head">
                            <RotateCcw size={16} /> Preventative & Cultural Practices
                          </div>
                          <div className="remedy-body">{diagnosis.remedies.preventative}</div>
                        </div>
                      </div>
                    )}

                    {/* Weather spray notice banner linking to weather tab */}
                    {weather && (
                      <div
                        style={{
                          marginTop: "1.25rem",
                          background: weather.spray_advisory.status === "AVOID" ? "#fef2f2" : "#f0fdf4",
                          border: `1px solid ${weather.spray_advisory.status === "AVOID" ? "#fca5a5" : "#bbf7d0"}`,
                          borderRadius: "0.75rem",
                          padding: "0.85rem 1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          cursor: "pointer"
                        }}
                        onClick={() => setActiveTab("weather")}
                        title="Click to view weather advisory"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <CloudRain size={18} color={weather.spray_advisory.status === "AVOID" ? "#dc2626" : "#15803d"} />
                          <div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                              {weather.spray_advisory.headline}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              {weather.spray_advisory.recommended_window}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center" }}>
                          Check Weather <ChevronRight size={14} />
                        </span>
                      </div>
                    )}

                    {/* Advisory notes */}
                    {diagnosis.advisory_notes && (
                      <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#64748b", display: "flex", gap: "0.4rem" }}>
                        <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span>{diagnosis.advisory_notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: WEATHER MONITORING & SPRAY ADVISORY ================= */}
        {activeTab === "weather" && (
          <div className="weather-view-container">
            {/* Header with City, State Combobox */}
            <div className="weather-hero-top">
              <div>
                <div className="badge-tag">
                  <CloudRain size={14} /> Micro-Climate • Open-Meteo Integration
                </div>
                <h1 className="weather-view-title">Farm Weather & Spray Advisory</h1>
                <p className="weather-view-subtitle">
                  Real-time spray viability windows, rain wash-off risks, and wind drift analysis for smallholders.
                </p>
              </div>

              {/* City, State Searchable Combobox & Register Action */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <LocationCombobox
                  locations={locations}
                  currentLocation={farmerLocation}
                  onSelectLocation={handleSelectLocation}
                  onUseGps={handleUseGps}
                  placeholder="Type City, State (e.g. Nashik, MH)..."
                />
                <button
                  type="button"
                  className="btn-register-header"
                  onClick={() => setShowRegisterModal(true)}
                  title="Register a new farmer profile in the registry"
                >
                  <UserPlus size={15} />
                  <span>Register as New User</span>
                </button>
              </div>
            </div>

            {weatherLoading ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
                <div className="spinner" style={{ margin: "0 auto 1rem" }} />
                <p style={{ color: "#64748b", fontWeight: 600 }}>Fetching live satellite and station forecast...</p>
              </div>
            ) : weatherError ? (
              <div className="alert-error">
                <AlertTriangle size={18} />
                <span>{weatherError}</span>
              </div>
            ) : weather ? (
              <>
                {/* Hero Spray Viability Banner */}
                <div className={`spray-card spray-card-${weather.spray_advisory.status}`} style={{ padding: "1.75rem" }}>
                  <div className="spray-card-head" style={{ marginBottom: "0.75rem" }}>
                    <span className={`spray-status-badge badge-${weather.spray_advisory.status}`} style={{ fontSize: "1rem", padding: "0.4rem 1rem" }}>
                      {weather.spray_advisory.headline}
                    </span>
                    <span className="spray-window-time" style={{ fontSize: "0.95rem" }}>
                      <Clock size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                      {weather.spray_advisory.recommended_window}
                    </span>
                  </div>
                  <p style={{ fontSize: "1rem", color: "#334155", lineHeight: 1.6, marginBottom: "1rem" }}>
                    {weather.spray_advisory.advisory_message}
                  </p>
                  <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                    📍 Location: {farmerLocation.display_name} ({weather.location.latitude.toFixed(2)}°N, {weather.location.longitude.toFixed(2)}°E) • Outlook: {weather.forecast_summary}
                  </div>
                </div>

                {/* Big 4 Agro-Weather Metrics */}
                <div className="weather-big-metrics">
                  <div className="big-metric-card">
                    <div className="big-metric-icon" style={{ background: "#ffedd5", color: "#ea580c" }}>
                      <Thermometer size={24} />
                    </div>
                    <div>
                      <div className="big-metric-label">Temperature</div>
                      <div className="big-metric-value">{weather.current_weather.temperature_c.toFixed(1)}°C</div>
                      <div className="big-metric-hint">{weather.current_weather.temperature_c > 32 ? "High evaporation risk" : "Optimal for uptake"}</div>
                    </div>
                  </div>

                  <div className="big-metric-card">
                    <div className="big-metric-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                      <Droplets size={24} />
                    </div>
                    <div>
                      <div className="big-metric-label">Relative Humidity</div>
                      <div className="big-metric-value">{weather.current_weather.humidity_percent}%</div>
                      <div className="big-metric-hint">{weather.current_weather.humidity_percent > 85 ? "High fungal risk" : "Normal droplet drying"}</div>
                    </div>
                  </div>

                  <div className="big-metric-card">
                    <div className="big-metric-icon" style={{ background: "#dcfce7", color: "#15803d" }}>
                      <Wind size={24} />
                    </div>
                    <div>
                      <div className="big-metric-label">Wind Velocity</div>
                      <div className="big-metric-value">{weather.current_weather.wind_speed_kmh.toFixed(1)} km/h</div>
                      <div className="big-metric-hint">{weather.current_weather.wind_speed_kmh > 12 ? "Wind drift warning" : "Minimal chemical drift"}</div>
                    </div>
                  </div>

                  <div className="big-metric-card">
                    <div className="big-metric-icon" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                      <CloudRain size={24} />
                    </div>
                    <div>
                      <div className="big-metric-label">Rain Risk (6h)</div>
                      <div className="big-metric-value">{weather.spray_advisory.rain_risk_next_6h_percent}%</div>
                      <div className="big-metric-hint">{weather.spray_advisory.rain_risk_next_6h_percent >= 40 ? "Wash-off hazard" : "Safe from rain wash-off"}</div>
                    </div>
                  </div>
                </div>

                {/* Diurnal / Hourly Spraying Guide */}
                <div className="glass-card" style={{ marginTop: "1rem" }}>
                  <h3 className="card-title">
                    <Clock size={20} color="#15803d" /> Daily Spray Suitability Timetable
                  </h3>
                  <div className="hourly-guide-grid">
                    <div className="hourly-card" style={{ borderLeft: "4px solid #16a34a" }}>
                      <div className="hourly-time">
                        <Sun size={16} color="#eab308" /> Early Morning (6:00 AM – 9:30 AM)
                      </div>
                      <span className="hourly-badge" style={{ background: "#dcfce7", color: "#166534" }}>
                        ⭐️ Most Recommended
                      </span>
                      <p className="hourly-desc">
                        Minimal wind turbulence, cool ambient temperatures, and open stomatal apertures allow superior systemic pesticide absorption.
                      </p>
                    </div>

                    <div className="hourly-card" style={{ borderLeft: "4px solid #dc2626" }}>
                      <div className="hourly-time">
                        <Sun size={16} color="#ea580c" /> Midday (11:00 AM – 3:30 PM)
                      </div>
                      <span className="hourly-badge" style={{ background: "#fee2e2", color: "#991b1b" }}>
                        ⛔️ Unfavorable
                      </span>
                      <p className="hourly-desc">
                        High thermal radiation causes immediate chemical crystallization or evaporation before leaf absorption. Causes leaf scorch (phytotoxicity).
                      </p>
                    </div>

                    <div className="hourly-card" style={{ borderLeft: "4px solid #ca8a04" }}>
                      <div className="hourly-time">
                        <Sun size={16} color="#ca8a04" /> Late Afternoon (4:30 PM – 6:30 PM)
                      </div>
                      <span className="hourly-badge" style={{ background: "#fef9c3", color: "#854d0e" }}>
                        ✓ Secondary Window
                      </span>
                      <p className="hourly-desc">
                        Temperatures taper off and winds usually calm down. Suitable for contact fungicides and neem oil applications.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agronomic Best Practices Card */}
                <div className="glass-card" style={{ marginTop: "0.5rem" }}>
                  <h3 className="card-title">
                    <ShieldCheck size={20} color="#15803d" /> Spray Stewardship & Farmer Safety
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
                    <div style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.5 }}>
                      <strong>• Nozzle Selection:</strong> Use hollow cone nozzles for contact bio-fungicides and flat fan nozzles for systemic remedies.
                    </div>
                    <div style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.5 }}>
                      <strong>• Water pH:</strong> Ensure clean, neutral pond or borewell water (pH 6.5–7.0) to prevent hydrolytic degradation of active ingredients.
                    </div>
                    <div style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.5 }}>
                      <strong>• Personal Protective Equipment:</strong> Wear a face mask, gloves, and rubber boots when spraying even organic decoctions.
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ================= VIEW 3: NEAREST MANDI RATES & VOICE MARKET RESEARCH ================= */}
        {activeTab === "mandi" && (
          <div className="mandi-view-container">
            {/* View Header with City, State Combobox */}
            <div className="weather-hero-top">
              <div>
                <div className="badge-tag">
                  <Store size={14} /> Live APMC Mandi Auction Rates • Synced with {farmerLocation.city}, {farmerLocation.state}
                </div>
                <h1 className="weather-view-title">Nearest Mandi Rates & Market Insights</h1>
                <p className="weather-view-subtitle">
                  Wholesale prices dynamically calculated for each district's APMC market yard. Speak or type your crops.
                </p>
              </div>

              {/* Controls: City/State Combobox & Language */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                {/* Searchable City, State Combobox (Max 5 items) */}
                <LocationCombobox
                  locations={locations}
                  currentLocation={farmerLocation}
                  onSelectLocation={handleSelectLocation}
                  onUseGps={handleUseGps}
                  placeholder="Type City, State..."
                />

                {/* Language Selector for Speech */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <select
                    className="select-district"
                    value={language}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setLanguage(newLang);
                      searchMandiRates(mandiQuery, newLang, farmerLocation.latitude, farmerLocation.longitude, farmerLocation.city, farmerLocation.state);
                    }}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="btn-register-header"
                  onClick={() => setShowRegisterModal(true)}
                  title="Register a new farmer profile in the registry"
                >
                  <UserPlus size={15} />
                  <span>Register as New User</span>
                </button>
              </div>
            </div>

            {/* Voice & Text Search Box */}
            <div className="mandi-search-card">
              <div className="mandi-input-group">
                {/* Mic Button */}
                <button
                  type="button"
                  className={`btn-mic ${isRecording ? "btn-mic-recording" : ""}`}
                  onClick={handleToggleVoiceInput}
                  title={isRecording ? "Listening... click to stop" : `Click to speak crops in ${language}`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                {/* Text input */}
                <input
                  type="text"
                  className="mandi-input-field"
                  placeholder={`Speak or type crops (e.g., 'Tomato and Chilli rates' in ${language})...`}
                  value={mandiQuery}
                  onChange={(e) => setMandiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchMandiRates(mandiQuery, language, farmerLocation.latitude, farmerLocation.longitude, farmerLocation.city, farmerLocation.state);
                    }
                  }}
                />

                {/* Compact Search Button */}
                <button
                  type="button"
                  className="btn-mandi-search"
                  onClick={() => searchMandiRates(mandiQuery, language, farmerLocation.latitude, farmerLocation.longitude, farmerLocation.city, farmerLocation.state)}
                  disabled={mandiLoading}
                >
                  {mandiLoading ? <div className="spinner" /> : <Search size={15} />} Search
                </button>
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <div className="voice-status-banner">
                  <div className="status-dot" style={{ background: "#ef4444", boxShadow: "0 0 10px #ef4444" }} />
                  <span>Listening in {language}... Speak your list of crops clearly.</span>
                </div>
              )}

              {/* Quick Crop Chips */}
              <div className="quick-crop-chips">
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", alignSelf: "center", marginRight: "0.25rem" }}>
                  Quick Search:
                </span>
                {POPULAR_CROPS.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    className="crop-chip-btn"
                    onClick={() => {
                      setMandiQuery(crop);
                      searchMandiRates(crop, language, farmerLocation.latitude, farmerLocation.longitude, farmerLocation.city, farmerLocation.state);
                    }}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Speech Card (Plays spoken summary orally) */}
            {mandiData && mandiData.spoken_summary && (
              <div className="audio-speech-card">
                <div className="audio-speech-content">
                  <div className="audio-speech-title">
                    <Volume2 size={20} color="#15803d" />
                    <span>Orally Spoken Nearest Market Report ({mandiData.language})</span>
                  </div>
                  <p className="audio-speech-text">
                    "{mandiData.spoken_summary}"
                  </p>
                </div>

                <button
                  type="button"
                  className={`btn-speak ${isSpeaking ? "btn-speak-active" : ""}`}
                  onClick={handleSpeakMandiReport}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX size={18} /> Stop Speaking
                    </>
                  ) : (
                    <>
                      <Volume2 size={18} /> 🔊 Listen to Report
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error banner */}
            {mandiError && (
              <div className="alert-error">
                <AlertTriangle size={18} />
                <span>{mandiError}</span>
              </div>
            )}

            {/* Loading state */}
            {mandiLoading ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
                <div className="spinner" style={{ margin: "0 auto 1rem" }} />
                <p style={{ color: "#64748b", fontWeight: 600 }}>Calculating nearest APMC distances and prices...</p>
              </div>
            ) : mandiData && mandiData.items && mandiData.items.length > 0 ? (
              <div className="mandi-cards-grid">
                {mandiData.items.map((item, idx) => (
                  <div key={idx} className="mandi-card">
                    <div>
                      {/* Card header */}
                      <div className="mandi-card-header">
                        <div>
                          <div className="mandi-crop-name">{item.crop_name}</div>
                          <div className="mandi-market-name">
                            <Store size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }} />
                            {item.market_name} • {item.state}
                          </div>
                          {item.distance_km !== null && item.distance_km !== undefined && (
                            <div>
                              <span className="mandi-distance-badge">
                                <MapPin size={11} /> {item.distance_km} km away (Nearest APMC)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Trend pill */}
                        <span className={`trend-badge trend-${item.trend}`}>
                          {item.trend === "Rising" && <TrendingUp size={13} />}
                          {item.trend === "Falling" && <TrendingDown size={13} />}
                          {item.trend === "Stable" && <Minus size={13} />}
                          {item.trend} {item.trend_percentage ? `(${item.trend_percentage > 0 ? "+" : ""}${item.trend_percentage}%)` : ""}
                        </span>
                      </div>

                      {/* Modal Price Box */}
                      <div className="mandi-price-box" style={{ marginTop: "1rem" }}>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                            Modal / Average Rate
                          </div>
                          <div className="modal-price-val">
                            ₹{item.modal_price.toFixed(1)} <span className="modal-price-unit">{item.unit}</span>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600, textAlign: "right" }}>
                            Price Range
                          </div>
                          <div className="price-range-text">
                            ₹{item.min_price} – ₹{item.max_price} {item.unit}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", textAlign: "right", marginTop: "2px" }}>
                            Arrivals: {item.arrival_volume}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Economic Recommendation */}
                    <div className="mandi-recommendation-box">
                      <strong>💡 Market Advisory:</strong> {item.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            ) : !mandiLoading ? (
              <div className="empty-placeholder glass-card">
                <Store className="empty-icon" />
                <p>No commodities found for your query. Tap the mic and speak crop names or choose from the quick search chips.</p>
              </div>
            ) : null}
          </div>
        )}

        {/* ================= VIEW 4: FERTILIZER & NPK DOSAGE CALCULATOR ================= */}
        {activeTab === "fertilizer" && (
          <div className="fert-container">
            {/* Header */}
            <div className="fert-hero-top">
              <div>
                <div className="badge-tag">
                  <FlaskConical size={14} /> ICAR Package of Practices • Precision Soil Fertility
                </div>
                <h1 className="weather-view-title">Fertilizer & NPK Dosage Calculator</h1>
                <p className="weather-view-subtitle">
                  Calculate exact commercial bag counts (Urea, DAP, MOP), pure elemental N-P-K, and organic alternatives adjusted for your land acreage.
                </p>
              </div>

              {/* Status pill & Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
                <span className="location-item-badge" style={{ padding: "0.4rem 0.8rem", fontSize: "0.82rem" }}>
                  <Layers size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                  Normalized: {fertCalculation.acres} Acres
                </span>
                <button
                  type="button"
                  className="btn-register-header"
                  onClick={() => setShowRegisterModal(true)}
                  title="Register a new farmer profile in the registry"
                >
                  <UserPlus size={15} />
                  <span>Register as New User</span>
                </button>
              </div>
            </div>

            {/* Input Controls Card */}
            <div className="fert-input-card">
              {/* 1. Crop Selection Chips */}
              <div>
                <div className="fert-section-label">
                  <Sprout size={14} /> 1. Select Crop
                </div>
                <div className="fert-crop-chips">
                  {FERT_CROPS.map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      className={`fert-crop-chip ${fertCrop === crop ? "active" : ""}`}
                      onClick={() => setFertCrop(crop)}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Land Area & Unit Controls */}
              <div className="fert-acreage-row">
                <div>
                  <div className="fert-section-label">
                    <Calculator size={14} /> 2. Land Size & Measurement Unit
                  </div>
                  <div className="fert-area-input-group">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1000"
                      className="fert-number-input"
                      value={fertArea}
                      onChange={(e) => setFertArea(e.target.value)}
                    />
                    <div className="fert-unit-pills">
                      {FERT_UNITS.map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          className={`fert-unit-btn ${fertUnit === unit ? "active" : ""}`}
                          onClick={() => setFertUnit(unit)}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Range Slider for Quick Adjustments */}
                <div className="fert-slider-group">
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>
                    <span>Interactive Land Area Slider</span>
                    <span style={{ color: "#15803d" }}>{fertArea} {fertUnit}</span>
                  </div>
                  <input
                    type="range"
                    min={fertUnit === "Guntas" ? 1 : 0.25}
                    max={fertUnit === "Guntas" ? 100 : 25}
                    step={fertUnit === "Guntas" ? 1 : 0.25}
                    value={fertArea}
                    onChange={(e) => setFertArea(parseFloat(e.target.value))}
                    className="fert-slider"
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8" }}>
                    <span>{fertUnit === "Guntas" ? "1 Gunta" : "0.25 Acre"}</span>
                    <span>{fertUnit === "Guntas" ? "100 Guntas (2.5 Acres)" : "25 Acres"}</span>
                  </div>
                </div>
              </div>

              {/* 3. Crop Growth Stage Selector */}
              <div>
                <div className="fert-section-label">
                  <Calendar size={14} /> 3. Current Growth Stage (Split Dose Adjustment)
                </div>
                <div className="fert-stage-chips">
                  {FERT_STAGES.map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      className={`fert-stage-btn ${fertStage === stage ? "active" : ""}`}
                      onClick={() => setFertStage(stage)}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pure Nutrient Requirement Metrics (N-P-K) */}
            <div>
              <div className="fert-section-label">
                <Layers size={14} /> Elemental Nutrient Absorption Demand ({fertCalculation.acres} Acres)
              </div>
              <div className="fert-npk-grid">
                {/* Nitrogen (N) */}
                <div className="nutrient-card card-n">
                  <div className="nutrient-card-header">
                    <span className="nutrient-role">Nitrogen (N) • Vegetative & Leaves</span>
                    <div className="nutrient-badge badge-n">N</div>
                  </div>
                  <div className="nutrient-amount">
                    {fertCalculation.pureN} <span>kg Pure N</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Supplies chlorophyll synthesis and rapid vegetative stem elongation.
                  </div>
                </div>

                {/* Phosphorus (P) */}
                <div className="nutrient-card card-p">
                  <div className="nutrient-card-header">
                    <span className="nutrient-role">Phosphate (P₂O₅) • Root & Bloom</span>
                    <div className="nutrient-badge badge-p">P</div>
                  </div>
                  <div className="nutrient-amount">
                    {fertCalculation.pureP} <span>kg Pure P₂O₅</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Drives deep tap-root branching, early vigor, and flower bud initiation.
                  </div>
                </div>

                {/* Potassium (K) */}
                <div className="nutrient-card card-k">
                  <div className="nutrient-card-header">
                    <span className="nutrient-role">Potash (K₂O) • Yield & Disease Defense</span>
                    <div className="nutrient-badge badge-k">K</div>
                  </div>
                  <div className="nutrient-amount">
                    {fertCalculation.pureK} <span>kg Pure K₂O</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Regulates stomatal transpiration, fruit weight, brix sugar, and skin firmness.
                  </div>
                </div>
              </div>
            </div>

            {/* Commercial Fertilizer Bags Breakdown */}
            <div>
              <div className="fert-section-label">
                <Store size={14} /> Standard Commercial Fertilizer Purchase Requirements (Subsidized MRP)
              </div>
              <div className="fert-bags-grid">
                {/* Urea Bag Card */}
                <div className="fert-bag-card">
                  <div>
                    <div className="bag-card-top">
                      <div>
                        <div className="bag-name">Urea (46% N)</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Primary Nitrogen Source</div>
                      </div>
                      <span className="bag-weight-pill">45 kg Bag</span>
                    </div>

                    <div className="bag-count-display">
                      <span className="bag-count-num">{fertCalculation.ureaBags}</span>
                      <span className="bag-count-label">Bags</span>
                    </div>
                    <div className="bag-subtext">Total Quantity: {fertCalculation.ureaKg} kg</div>
                  </div>

                  <div className="bag-cost-row">
                    <div className="bag-cost-label">Subsidized MRP (₹266.50/bag)</div>
                    <div className="bag-cost-val">₹{fertCalculation.ureaCost.toLocaleString()}</div>
                  </div>
                </div>

                {/* DAP Bag Card */}
                <div className="fert-bag-card">
                  <div>
                    <div className="bag-card-top">
                      <div>
                        <div className="bag-name">DAP (18-46-0)</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Di-Ammonium Phosphate</div>
                      </div>
                      <span className="bag-weight-pill">50 kg Bag</span>
                    </div>

                    <div className="bag-count-display">
                      <span className="bag-count-num">{fertCalculation.dapBags}</span>
                      <span className="bag-count-label">Bags</span>
                    </div>
                    <div className="bag-subtext">Total Quantity: {fertCalculation.dapKg} kg (Supplies both P & starter N)</div>
                  </div>

                  <div className="bag-cost-row">
                    <div className="bag-cost-label">Subsidized MRP (₹1,350/bag)</div>
                    <div className="bag-cost-val">₹{fertCalculation.dapCost.toLocaleString()}</div>
                  </div>
                </div>

                {/* MOP Potash Bag Card */}
                <div className="fert-bag-card">
                  <div>
                    <div className="bag-card-top">
                      <div>
                        <div className="bag-name">MOP (60% K₂O)</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Muriate of Potash</div>
                      </div>
                      <span className="bag-weight-pill">50 kg Bag</span>
                    </div>

                    <div className="bag-count-display">
                      <span className="bag-count-num">{fertCalculation.mopBags}</span>
                      <span className="bag-count-label">Bags</span>
                    </div>
                    <div className="bag-subtext">Total Quantity: {fertCalculation.mopKg} kg</div>
                  </div>

                  <div className="bag-cost-row">
                    <div className="bag-cost-label">Market Price (₹1,700/bag)</div>
                    <div className="bag-cost-val">₹{fertCalculation.mopCost.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Input Investment Banner with Save Plan Action */}
            <div className="fert-cost-summary">
              <div>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                  Estimated Total Commercial Input Investment
                </div>
                <div className="cost-total-display">
                  <span className="cost-total-amount">₹{fertCalculation.totalCost.toLocaleString()}</span>
                  <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>for {fertArea} {fertUnit} ({fertCalculation.acres} Acres)</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#cbd5e1", marginTop: "0.25rem" }}>
                  *Prices calculated using official Govt of India subsidized fertilizer MRPs.
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                {saveSuccessMsg && (
                  <span style={{ fontSize: "0.85rem", color: "#86efac", fontWeight: 700 }}>
                    <Check size={16} style={{ display: "inline", verticalAlign: "middle" }} /> {saveSuccessMsg}
                  </span>
                )}
                <button
                  type="button"
                  className="btn-save-plan"
                  onClick={handleSavePlan}
                  disabled={isSavingPlan}
                >
                  {isSavingPlan ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Bookmark size={18} />}
                  Save Plan to PostgreSQL
                </button>
              </div>
            </div>

            {/* Organic & Bio-Fertilizer Package Card */}
            <div className="organic-package-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Leaf size={20} color="#16a34a" />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#166534" }}>
                    Organic & Biological Soil Health Package
                  </h3>
                </div>
                <span className="location-item-badge" style={{ background: "#dcfce7", color: "#166534" }}>
                  Zero-Residue Bio-Enhancement
                </span>
              </div>

              <p style={{ margin: 0, fontSize: "0.86rem", color: "#334155", lineHeight: 1.5 }}>
                {fertCalculation.benefits}
              </p>

              <div className="organic-items-grid">
                <div className="organic-mini-box">
                  <div className="organic-mini-val">{fertCalculation.fymTons} Tons</div>
                  <div className="organic-mini-label">Well-Decomposed FYM / Compost</div>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Apply 2–3 weeks before sowing</span>
                </div>

                <div className="organic-mini-box">
                  <div className="organic-mini-val">{fertCalculation.vermicompostKg} kg</div>
                  <div className="organic-mini-label">High-Humus Vermicompost</div>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Mix along seedling furrow / dripper lines</span>
                </div>

                <div className="organic-mini-box">
                  <div className="organic-mini-val">{fertCalculation.neemCakeKg} kg</div>
                  <div className="organic-mini-label">De-oiled Neem Cake</div>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Suppresses root nematodes & slows nitrogen leaching</span>
                </div>

                <div className="organic-mini-box">
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#166534", marginBottom: "0.2rem" }}>Bio-Inoculants:</div>
                  <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.75rem", color: "#475569" }}>
                    {fertCalculation.biofertilizers.map((bio, idx) => (
                      <li key={idx}>{bio}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Split Application Schedule Timetable */}
            <div className="fert-schedule-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 className="card-title" style={{ margin: 0 }}>
                    <Calendar size={18} color="#15803d" /> Stage-Wise Fertilizer Split Schedule
                  </h3>
                  <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.25rem" }}>
                    Never apply 100% Nitrogen at sowing. Split applications prevent nitrate leaching into groundwater and increase fertilizer use efficiency by 30%.
                  </div>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Growth Stage</th>
                      <th>Agronomic Timing</th>
                      <th>Urea %</th>
                      <th>DAP %</th>
                      <th>MOP %</th>
                      <th>Method of Application</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fertCalculation.schedules.map((sched, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, color: "#0f172a" }}>{sched.stage}</td>
                        <td style={{ color: "#2563eb", fontWeight: 600 }}>{sched.timing}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: sched.urea > 0 ? "#15803d" : "#94a3b8" }}>
                            {sched.urea}%
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: sched.dap > 0 ? "#2563eb" : "#94a3b8" }}>
                            {sched.dap}%
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: sched.mop > 0 ? "#d97706" : "#94a3b8" }}>
                            {sched.mop}%
                          </span>
                        </td>
                        <td style={{ fontSize: "0.82rem", color: "#475569" }}>{sched.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Saved Plans History in PostgreSQL */}
            {savedPlans && savedPlans.length > 0 && (
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <History size={18} color="#15803d" />
                    <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                      Saved Farm Fertilizer Plans (PostgreSQL Database)
                    </h3>
                  </div>
                  <span className="location-item-badge">
                    {savedPlans.length} Records in DB
                  </span>
                </div>

                <div className="saved-plans-grid">
                  {savedPlans.map((plan) => (
                    <div key={plan.id} className="saved-plan-card">
                      <div className="saved-plan-header">
                        <span className="saved-plan-crop">{plan.crop_name}</span>
                        <span className="saved-plan-date">{plan.created_at}</span>
                      </div>
                      <div className="saved-plan-badges">
                        <span className="saved-plan-badge">{plan.land_area} {plan.area_unit}</span>
                        <span className="saved-plan-badge" style={{ background: "#dcfce7", color: "#166534" }}>₹{plan.estimated_cost.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
                        Urea: <strong>{plan.urea_bags} bags</strong> • DAP: <strong>{plan.dap_bags} bags</strong> • MOP: <strong>{plan.mop_bags} bags</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 5: ADMIN DASHBOARD ================= */}
        {activeTab === "admin" && (
          !isAdminAuthenticated ? (
            <div className="admin-auth-container">
              <div className="admin-auth-card">
                <div className="admin-auth-header">
                  <div className="admin-auth-badge">
                    <Shield size={12} /> SECURE GATEWAY • POSTGRESQL VERIFIED
                  </div>
                  <div className="admin-auth-icon">
                    <Shield size={34} color="#7c3aed" />
                  </div>
                  <h2>Admin Portal Access</h2>
                  <p>
                    Enter your verified administrator credentials to access the central Farmer Registry and database administrative controls.
                  </p>
                </div>

                {adminLoginError && (
                  <div className="admin-auth-error">
                    <AlertCircle size={18} />
                    <span>{adminLoginError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="admin-auth-form">
                  <div className="admin-form-group">
                    <label htmlFor="admin-username">Admin Username</label>
                    <div className="admin-input-wrapper">
                      <User size={18} className="admin-field-icon" />
                      <input
                        id="admin-username"
                        type="text"
                        placeholder="Enter admin username"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="admin-password">Admin Password</label>
                    <div className="admin-input-wrapper">
                      <Lock size={18} className="admin-field-icon" />
                      <input
                        id="admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        placeholder="Enter admin password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn-toggle-password"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-admin-submit"
                    disabled={adminLoginLoading}
                  >
                    {adminLoginLoading ? (
                      <>
                        <RefreshCw size={18} className="spinning" />
                        <span>Verifying Database Credentials...</span>
                      </>
                    ) : (
                      <>
                        <Shield size={18} />
                        <span>Authenticate & Access Dashboard</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="admin-auth-footer">
                  <p>
                    🔒 Verified with PostgreSQL Admin Database • Restricted Administrator Access
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-dashboard-container">
              {/* Header */}
              <div className="admin-header">
                <div className="admin-title-group">
                  <div className="badge-tag">
                    <Shield size={14} /> System Administration • PostgreSQL Registry
                  </div>
                  <h1>👑 Farmer Registry Admin Dashboard</h1>
                  <p>
                    Centralized registry of all smallholder farmers registered on Bharath Krishi Platform. Monitor regional language distribution, contact directories, and active agricultural clusters.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <div className="admin-user-badge">
                    <User size={14} />
                    <span>Logged in: <strong>{adminUsername || "Mehaboob"}</strong> (Superadmin)</span>
                  </div>
                  <button
                    type="button"
                    className="btn-refresh-location"
                    onClick={fetchAdminFarmers}
                    disabled={adminLoading}
                  >
                    <RefreshCw size={16} className={adminLoading ? "spinning" : ""} />
                    <span>{adminLoading ? "Refreshing..." : "Refresh"}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-save-plan"
                    onClick={() => setShowRegisterModal(true)}
                    style={{ padding: "0.5rem 0.9rem", fontSize: "0.85rem" }}
                  >
                    <UserPlus size={16} />
                    <span>Register Farmer</span>
                  </button>
                  <button
                    type="button"
                    className="btn-admin-logout"
                    onClick={handleAdminLogout}
                    title="Sign Out of Admin Portal"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

            {/* Admin Stats Grid */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: "#dcfce7", color: "#15803d" }}>
                  <Users size={24} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-value">{adminFarmers.length}</span>
                  <span className="admin-stat-label">Total Registered Farmers</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                  <Globe size={24} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-value">
                    {new Set(adminFarmers.map((f) => f.language)).size}
                  </span>
                  <span className="admin-stat-label">Regional Languages Active</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                  <MapPin size={24} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-value">
                    {new Set(adminFarmers.map((f) => f.state).filter(Boolean)).size || 1}
                  </span>
                  <span className="admin-stat-label">States / Agronomic Zones</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                  <ShieldCheck size={24} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-value" style={{ fontSize: "1.2rem", color: "#166534" }}>Online</span>
                  <span className="admin-stat-label">PostgreSQL Agri Database</span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="admin-filter-bar">
              <div className="admin-search-wrapper">
                <Search size={18} color="#94a3b8" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search farmers by name, phone (+91...), or city..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
                {adminSearch && (
                  <button
                    type="button"
                    onClick={() => setAdminSearch("")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Language Filter Chips */}
              <div className="admin-lang-chips">
                <button
                  type="button"
                  className={`admin-chip ${adminLangFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setAdminLangFilter("ALL")}
                >
                  All ({adminFarmers.length})
                </button>
                {TOP_10_LANGUAGES.map((lang) => {
                  const count = adminFarmers.filter(
                    (f) => f.language && f.language.toLowerCase() === lang.code.toLowerCase()
                  ).length;
                  if (count === 0 && adminLangFilter !== lang.code) return null;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      className={`admin-chip ${adminLangFilter === lang.code ? "active" : ""}`}
                      onClick={() => setAdminLangFilter(lang.code)}
                    >
                      {lang.native} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Card */}
            <div className="admin-table-card">
              {adminLoading ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                  <RefreshCw size={32} className="spinning" style={{ margin: "0 auto 1rem", color: "#15803d" }} />
                  <div>Loading Registered Farmers from PostgreSQL...</div>
                </div>
              ) : filteredAdminFarmers.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                  <Users size={40} style={{ margin: "0 auto 0.75rem", color: "#94a3b8" }} />
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>No Farmers Found</div>
                  <p style={{ margin: "0.25rem 0 1rem", fontSize: "0.85rem" }}>
                    {adminSearch || adminLangFilter !== "ALL"
                      ? "No farmers match the current search or language filter."
                      : "No farmers registered in the system yet."}
                  </p>
                  {(adminSearch || adminLangFilter !== "ALL") && (
                    <button
                      type="button"
                      className="btn-location-item"
                      onClick={() => {
                        setAdminSearch("");
                        setAdminLangFilter("ALL");
                      }}
                    >
                      Clear Search & Filters
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Farmer Full Name</th>
                        <th>Mobile Contact</th>
                        <th>Chosen Language</th>
                        <th>Location (City, State)</th>
                        <th>Registered Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdminFarmers.map((f, index) => (
                        <tr key={f.id || index}>
                          <td style={{ color: "#94a3b8", fontWeight: 700 }}>{index + 1}</td>
                          <td>
                            <div className="farmer-table-name">
                              <div className="farmer-table-avatar">
                                {f.name?.charAt(0)?.toUpperCase() || "F"}
                              </div>
                              <div>
                                <strong style={{ color: "#0f172a" }}>{f.name}</strong>
                                <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                                  ID: {f.id ? f.id.slice(0, 8) : "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {f.phone_number ? (
                              <span style={{ fontWeight: 700, color: "#15803d" }}>
                                +91 {f.phone_number}
                              </span>
                            ) : (
                              <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.82rem" }}>
                                Not provided (Optional)
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="badge-farmer-lang">
                              <Globe size={12} /> {f.language}
                            </span>
                          </td>
                          <td>
                            <div style={{ color: "#0f172a", fontWeight: 600 }}>
                              {f.city || "—"}, {f.state || "—"}
                            </div>
                            {f.latitude != null && f.longitude != null && (
                              <div style={{ fontSize: "0.72rem", color: "#15803d", display: "flex", alignItems: "center", gap: "0.2rem", marginTop: "0.15rem" }}>
                                <MapPin size={10} /> {Number(f.latitude).toFixed(2)}°N, {Number(f.longitude).toFixed(2)}°E
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                              {f.created_at || "Just now"}
                            </span>
                          </td>
                          <td>
                            <span className="badge-verified-farmer">
                              <CheckCircle2 size={12} /> Registered Farmer
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      )}

        {/* ================= VIEW 6: GOVERNMENT SCHEMES & SUBSIDY ELIGIBILITY FINDER ================= */}
        {activeTab === "schemes" && (
          <div className="schemes-view-container">
            {/* Schemes Header */}
            <div className="schemes-header">
              <div className="schemes-title-group">
                <div className="badge-tag" style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}>
                  <Award size={14} /> Direct Benefit Transfer (DBT) • Ministry of Agriculture & Farmers Welfare
                </div>
                <h1>🏛️ Government Schemes & Subsidy Eligibility Finder</h1>
                <p>
                  Personalized eligibility evaluator for Indian agricultural subsidies, ₹6,000/yr direct income support, 55% micro-irrigation grants, and comprehensive PMFBY crop insurance.
                </p>
              </div>

              <div className="schemes-header-actions">
                <div className="schemes-live-pill">
                  <span className="schemes-live-dot" />
                  <span>{eligibilityLoading ? "⚡ Recalculating Live Schemes..." : "⚡ Real-Time Auto Sync Active"}</span>
                </div>
                <button
                  type="button"
                  className="schemes-refresh-btn"
                  onClick={() => {
                    fetchSchemesList();
                    handleCheckEligibility();
                  }}
                  disabled={schemesLoading || eligibilityLoading}
                  title="Force re-fetch schemes from Central Agricultural Database"
                >
                  <RefreshCw size={15} className={schemesLoading || eligibilityLoading ? "spinning" : ""} />
                  <span>{schemesLoading || eligibilityLoading ? "Syncing..." : "Refresh Directory"}</span>
                </button>
                <button
                  type="button"
                  className="btn-register-header"
                  onClick={() => setShowRegisterModal(true)}
                  title="Register a new farmer profile in the registry"
                >
                  <UserPlus size={15} />
                  <span>Register as New User</span>
                </button>
              </div>
            </div>

            {/* Notification Toast for Saved Schemes */}
            {schemeToast && (
              <div className="reg-toast-banner" style={{ background: "linear-gradient(135deg, #15803d 0%, #166534 100%)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle2 size={18} />
                  <span>{schemeToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSchemeToast(null)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Interactive Farm Profile & Eligibility Calculator Card */}
            <div className="schemes-calc-card">
              <div className="schemes-calc-header">
                <div className="schemes-calc-title">
                  <Calculator size={20} color="#15803d" />
                  <span>Interactive Farm Eligibility Matcher</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  {eligibilityLoading ? (
                    <div className="schemes-tier-badge" style={{ background: "#fef3c7", borderColor: "#fde68a", color: "#b45309" }}>
                      <RefreshCw size={13} className="spinning" />
                      <span>⚡ Recalculating...</span>
                    </div>
                  ) : eligibilityResult ? (
                    <div className="schemes-tier-badge">
                      <CheckCircle2 size={14} />
                      <span>{eligibilityResult.farmer_tier}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="schemes-calc-grid">
                {/* 1. Land Holding Size */}
                <div className="schemes-input-group">
                  <label className="schemes-field-label">
                    <span>Landholding Size</span>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                      ({schemeAreaUnit === "Guntas" ? `${(Number(schemeLandArea) / 40).toFixed(2)} Acres` : `${schemeLandArea} ${schemeAreaUnit}`})
                    </span>
                  </label>
                  <div className="schemes-area-controls">
                    <input
                      type="number"
                      step="0.25"
                      min="0.1"
                      className="schemes-area-input"
                      value={schemeLandArea}
                      onChange={(e) => setSchemeLandArea(e.target.value)}
                    />
                    <select
                      className="schemes-unit-select"
                      value={schemeAreaUnit}
                      onChange={(e) => setSchemeAreaUnit(e.target.value)}
                    >
                      <option value="Acres">Acres</option>
                      <option value="Guntas">Guntas (40=1 Ac)</option>
                      <option value="Hectares">Hectares</option>
                      <option value="Bighas">Bighas</option>
                    </select>
                  </div>
                </div>

                {/* 2. Primary Cultivated Crop */}
                <div className="schemes-input-group">
                  <label className="schemes-field-label">Primary Cultivated Crop</label>
                  <select
                    className="schemes-dropdown"
                    value={schemeCrop}
                    onChange={(e) => setSchemeCrop(e.target.value)}
                  >
                    <option value="All Crops">All Crops (General Agriculture)</option>
                    {CROPS.filter(c => !c.includes("Select")).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* 3. State / Region */}
                <div className="schemes-input-group">
                  <label className="schemes-field-label">State / Union Territory</label>
                  <select
                    className="schemes-dropdown"
                    value={schemeState}
                    onChange={(e) => setSchemeState(e.target.value)}
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Check Action Button */}
                <div className="schemes-input-group" style={{ width: "auto" }}>
                  <label className="schemes-field-label schemes-label-placeholder" aria-hidden="true">&nbsp;</label>
                  <button
                    type="button"
                    className="btn-check-eligibility"
                    onClick={() => handleCheckEligibility()}
                    disabled={eligibilityLoading}
                  >
                    {eligibilityLoading ? (
                      <>
                        <RefreshCw size={16} className="spinning" />
                        <span>Recalculating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Evaluate Eligibility</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 1-Tap Quick Acreage Chips Bar */}
              <div className="schemes-quick-chips-bar">
                <span className="schemes-quick-chips-label">
                  <Sparkles size={13} color="#15803d" /> Quick Land Size:
                </span>
                {[
                  { label: "0.5 Ac", val: 0.5, unit: "Acres" },
                  { label: "1 Ac", val: 1.0, unit: "Acres" },
                  { label: "2 Ac", val: 2.0, unit: "Acres" },
                  { label: "5 Ac", val: 5.0, unit: "Acres" },
                  { label: "10 Ac", val: 10.0, unit: "Acres" },
                  { label: "2 Guntas", val: 2, unit: "Guntas" },
                  { label: "10 Guntas", val: 10, unit: "Guntas" },
                  { label: "1 Hectare", val: 1, unit: "Hectares" },
                  { label: "2 Hectares", val: 2, unit: "Hectares" },
                ].map((chip) => {
                  const isAct = Number(schemeLandArea) === chip.val && schemeAreaUnit === chip.unit;
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      className={`schemes-quick-chip ${isAct ? "active" : ""}`}
                      onClick={() => {
                        setSchemeAreaUnit(chip.unit);
                        setSchemeLandArea(chip.val);
                      }}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metric Summary Cards */}
            {eligibilityResult && (
              <div className="schemes-metrics-strip">
                <div className="schemes-metric-card benefit">
                  <div className="schemes-metric-icon" style={{ background: "#dcfce7", color: "#15803d" }}>
                    <CircleDollarSign size={26} />
                  </div>
                  <div className="schemes-metric-content">
                    <span className="schemes-metric-value" style={{ color: "#15803d" }}>
                      ₹{eligibilityResult.total_estimated_benefit_inr.toLocaleString("en-IN")}
                    </span>
                    <span className="schemes-metric-label">Estimated Potential Financial Benefit</span>
                  </div>
                </div>

                <div className="schemes-metric-card schemes">
                  <div className="schemes-metric-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                    <CheckCircle2 size={26} />
                  </div>
                  <div className="schemes-metric-content">
                    <span className="schemes-metric-value" style={{ color: "#1d4ed8" }}>
                      {eligibilityResult.eligible_schemes_count} of {eligibilityResult.total_schemes_evaluated}
                    </span>
                    <span className="schemes-metric-label">Qualifying Welfare Schemes</span>
                  </div>
                </div>

                <div className="schemes-metric-card subsidy">
                  <div className="schemes-metric-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                    <BadgePercent size={26} />
                  </div>
                  <div className="schemes-metric-content">
                    <span className="schemes-metric-value" style={{ color: "#b45309" }}>
                      Up to 55%
                    </span>
                    <span className="schemes-metric-label">Max Government Capital Subsidy Tier</span>
                  </div>
                </div>

                <div className="schemes-metric-card cash">
                  <div className="schemes-metric-icon" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                    <Landmark size={26} />
                  </div>
                  <div className="schemes-metric-content">
                    <span className="schemes-metric-value" style={{ color: "#6d28d9" }}>
                      ₹6,000 / yr
                    </span>
                    <span className="schemes-metric-label">Direct Cash Benefit (PM-KISAN DBT)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="schemes-filter-bar">
              <div className="schemes-chips-scroll">
                {SCHEME_CATEGORIES.map(cat => {
                  const count = cat === "ALL"
                    ? (schemesList.length || 8)
                    : schemesList.filter(s => s.category === cat).length;
                  const label = cat === "ALL" ? `All Schemes (${count})` : `${cat} (${count})`;
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`scheme-filter-chip ${schemeCategoryFilter === cat ? "active" : ""}`}
                      onClick={() => setSchemeCategoryFilter(cat)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="schemes-search-box">
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search scheme (e.g. Drip, KCC, Solar, Insurance)..."
                  value={schemeSearch}
                  onChange={(e) => setSchemeSearch(e.target.value)}
                />
                {schemeSearch && (
                  <button
                    type="button"
                    onClick={() => setSchemeSearch("")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Schemes Cards Grid */}
            {schemesLoading ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
                <RefreshCw size={36} className="spinning" style={{ margin: "0 auto 1rem", color: "#15803d" }} />
                <div style={{ fontWeight: 700 }}>Connecting to Central Agricultural Database...</div>
              </div>
            ) : (
              <div className="schemes-cards-grid">
                {(eligibilityResult ? eligibilityResult.results : schemesList.map(s => ({ scheme: s, is_eligible: true, match_score: 95, match_reasons: [], estimated_financial_benefit: s.financial_benefit_max, subsidy_text: `${s.subsidy_percentage || 50}% Subsidy` })))
                  .filter(({ scheme }) => {
                    const matchesCategory = schemeCategoryFilter === "ALL" || scheme.category === schemeCategoryFilter;
                    const matchesSearch = !schemeSearch ||
                      scheme.name.toLowerCase().includes(schemeSearch.toLowerCase()) ||
                      scheme.short_name.toLowerCase().includes(schemeSearch.toLowerCase()) ||
                      scheme.benefit_summary.toLowerCase().includes(schemeSearch.toLowerCase());
                    return matchesCategory && matchesSearch;
                  })
                  .map(({ scheme, is_eligible, match_score, match_reasons, estimated_financial_benefit, subsidy_text }) => {
                    const isSaved = savedSchemeIds.includes(scheme.id);
                    const isSpeakingThis = speakingSchemeCode === scheme.code;

                    return (
                      <div key={scheme.id || scheme.code} className={`scheme-card ${is_eligible ? "eligible" : ""}`}>
                        <div>
                          {/* Card Top */}
                          <div className="scheme-card-top">
                            <div className="scheme-badges-row">
                              <span className="badge-scheme-cat">{scheme.category}</span>
                              <span className={`badge-scheme-match ${match_score >= 85 ? "high" : "med"}`}>
                                <Check size={12} /> {match_score}% Match
                              </span>
                            </div>
                            <button
                              type="button"
                              className={`btn-bookmark-scheme ${isSaved ? "saved" : ""}`}
                              onClick={() => handleSaveScheme(scheme)}
                              title={isSaved ? "Saved to your profile" : "Bookmark this scheme"}
                            >
                              <Bookmark size={16} fill={isSaved ? "#eab308" : "none"} />
                            </button>
                          </div>

                          {/* Title & Agency */}
                          <h3 className="scheme-card-title">{scheme.short_name || scheme.name}</h3>
                          <div className="scheme-agency">🏛️ {scheme.implementing_agency}</div>

                          {/* Benefit Callout */}
                          <div className="scheme-benefit-highlight">
                            <div className="scheme-benefit-value-row">
                              <div className="scheme-benefit-amount">
                                <CircleDollarSign size={18} />
                                <span>{estimated_financial_benefit ? `₹${estimated_financial_benefit.toLocaleString("en-IN")}` : "Subsidized Support"}</span>
                              </div>
                              <span className="scheme-subsidy-tag">{subsidy_text}</span>
                            </div>
                            <p className="scheme-benefit-desc">{scheme.benefit_summary}</p>
                          </div>

                          {/* Key Eligibility Summary */}
                          <div className="scheme-checklist-preview">
                            {(scheme.key_eligibility || []).slice(0, 2).map((crit, idx) => (
                              <div key={idx} className="scheme-crit-item">
                                <CheckCircle2 size={14} />
                                <span>{crit}</span>
                              </div>
                            ))}
                          </div>

                          {/* Required Documents preview */}
                          <div className="scheme-docs-chips">
                            {(scheme.required_documents || []).slice(0, 3).map((doc, idx) => (
                              <span key={idx} className="doc-chip">
                                <FileCheck size={11} color="#15803d" />
                                <span>{doc}</span>
                              </span>
                            ))}
                            {(scheme.required_documents || []).length > 3 && (
                              <span className="doc-chip" style={{ background: "#f1f5f9", color: "#64748b" }}>
                                +{(scheme.required_documents.length - 3)} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="scheme-card-footer">
                          <div className="scheme-action-left">
                            <button
                              type="button"
                              className={`btn-scheme-listen ${isSpeakingThis ? "speaking" : ""}`}
                              onClick={() => handleSpeakScheme(scheme)}
                              title="Listen to scheme details in your language"
                            >
                              {isSpeakingThis ? <VolumeX size={15} /> : <Volume2 size={15} />}
                              <span>{isSpeakingThis ? "Stop Audio" : `Listen (${language})`}</span>
                            </button>

                            <button
                              type="button"
                              className="btn-scheme-details"
                              onClick={() => {
                                setActiveSchemeDetail(scheme);
                                setCheckedDocs({});
                              }}
                            >
                              <FileText size={15} />
                              <span>Checklist & Steps</span>
                            </button>
                          </div>

                          <a
                            href={scheme.official_portal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-scheme-apply"
                          >
                            <span>Apply on Portal</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Detailed Scheme Walkthrough & Checklist Modal */}
      {activeSchemeDetail && (
        <div className="scheme-modal-overlay" onClick={() => setActiveSchemeDetail(null)}>
          <div className="scheme-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="scheme-modal-header">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.2)", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    <Award size={12} /> {activeSchemeDetail.category}
                  </div>
                  <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 0.35rem" }}>
                    {activeSchemeDetail.name}
                  </h2>
                  <div style={{ fontSize: "0.82rem", opacity: 0.9 }}>
                    🏛️ {activeSchemeDetail.implementing_agency}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close-reg-modal"
                  onClick={() => setActiveSchemeDetail(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="scheme-modal-body">
              {/* Full Description & Benefit */}
              <div className="scheme-benefit-highlight">
                <div style={{ fontWeight: 800, color: "#15803d", marginBottom: "0.3rem", fontSize: "1.05rem" }}>
                  🎁 Financial Subsidy & Support
                </div>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#166534", lineHeight: 1.5 }}>
                  {activeSchemeDetail.benefit_summary}
                </p>
              </div>

              {/* Step-by-Step Application Procedure */}
              <div>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <Layers size={18} color="#15803d" /> Step-by-Step Application Process
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {(activeSchemeDetail.application_steps || []).map((step, idx) => (
                    <div key={idx} className="scheme-step-item">
                      <div className="scheme-step-num">{idx + 1}</div>
                      <div style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents Interactive Checklist */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <FileCheck size={18} color="#15803d" /> Mandatory Documents Checklist
                  </h4>
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    {Object.values(checkedDocs).filter(Boolean).length} of {(activeSchemeDetail.required_documents || []).length} prepared
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}>
                  {(activeSchemeDetail.required_documents || []).map((doc, idx) => {
                    const isChecked = !!checkedDocs[doc];
                    return (
                      <div
                        key={idx}
                        className={`scheme-doc-interactive-item ${isChecked ? "checked" : ""}`}
                        onClick={() => setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }))}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ accentColor: "#15803d", width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "0.88rem", fontWeight: isChecked ? 700 : 500, color: isChecked ? "#15803d" : "#334155" }}>
                          {doc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Helpline & Action */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid #e2e8f0", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  📞 Toll-Free Helpline: <strong>{activeSchemeDetail.helpline_number}</strong>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="button"
                    className="btn-refresh-location"
                    onClick={() => handleSaveScheme(activeSchemeDetail)}
                  >
                    <Bookmark size={15} />
                    <span>Save to Profile</span>
                  </button>
                  <a
                    href={activeSchemeDetail.official_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-scheme-apply"
                    style={{ padding: "0.65rem 1.25rem", fontSize: "0.85rem" }}
                  >
                    <span>Open Official Portal</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Registration Modal Gate (Mandatory if !registeredFarmer, bypassed on /admin) */}
      <FarmerRegistrationModal
        isOpen={(!registeredFarmer || showRegisterModal) && activeTab !== "admin"}
        canClose={!!registeredFarmer}
        onClose={() => setShowRegisterModal(false)}
        currentLocation={farmerLocation}
        onSuccess={(farmerData) => {
          setRegisteredFarmer(farmerData);
          setShowRegisterModal(false);
          setLanguage(farmerData.language);
          setRegSuccessToast(
            `🌾 Welcome to Bharath Krishi, ${farmerData.name}! Your registration was successful.`
          );
          fetchAdminFarmers();
          setTimeout(() => setRegSuccessToast(null), 6000);
        }}
      />
    </div>
  );
}
