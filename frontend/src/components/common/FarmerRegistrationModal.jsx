import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Sprout,
  X,
  MapPin,
  Globe,
  Volume2,
  VolumeX,
  Check,
  User,
  Phone,
  Mic,
  MicOff,
  RefreshCw,
  CheckCircle2,
  Shield,
  AlertTriangle
} from "lucide-react";
import { TOP_10_LANGUAGES } from "../../constants";
import { registerFarmer } from "../../services/api";

/**
 * Farmer Registration Modal with 3 audio speaker guides and top 10 regional Indian languages
 */
export default function FarmerRegistrationModal({
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
  const [autoGps, setAutoGps] = useState(() => {
    if (currentLocation) {
      return {
        latitude: currentLocation.latitude || 13.13,
        longitude: currentLocation.longitude || 78.13,
        city: currentLocation.city || "Kolar",
        state: currentLocation.state || "Karnataka",
        display: `${currentLocation.city || "Kolar"}, ${currentLocation.state || "Karnataka"}`
      };
    }
    return null;
  });
  const nameRecognitionRef = useRef(null);

  const activeLocale = useMemo(() => {
    return TOP_10_LANGUAGES.find((l) => l.code === selectedLangCode) || TOP_10_LANGUAGES[0];
  }, [selectedLangCode]);

  // Automatic Geographic Location Detection on Mount
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
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
        },
        () => {
          setAutoGps({
            latitude: currentLocation?.latitude || 13.13,
            longitude: currentLocation?.longitude || 78.13,
            city: currentLocation?.city || "Kolar",
            state: currentLocation?.state || "Karnataka",
            display: `${currentLocation?.city || "Kolar"}, ${currentLocation?.state || "Karnataka"}`
          });
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
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
    } catch {
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
      const farmerData = await registerFarmer({
        name: name.trim(),
        phone_number: cleanPhone,
        language: activeLocale.code,
        state: autoGps?.state || currentLocation?.state || "Karnataka",
        city: autoGps?.city || currentLocation?.city || "Kolar",
        latitude: autoGps?.latitude ?? currentLocation?.latitude ?? 13.13,
        longitude: autoGps?.longitude ?? currentLocation?.longitude ?? 78.13
      });

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
