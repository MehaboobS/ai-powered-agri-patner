import React, { useState, useRef, useEffect, useCallback } from "react";
import { DEFAULT_LOCATION } from "./constants";
import * as api from "./services/api";
import { getBcp47, cancelSpeech } from "./utils/speech";

import Sidebar from "./components/layout/Sidebar";
import FarmerRegistrationModal from "./components/common/FarmerRegistrationModal";
import Toast from "./components/common/Toast";

import DiagnosticsPage from "./pages/DiagnosticsPage";
import WeatherPage from "./pages/WeatherPage";
import MandiPage from "./pages/MandiPage";
import FertilizerPage from "./pages/FertilizerPage";
import AdminPage from "./pages/AdminPage";
import SchemesPage from "./pages/SchemesPage";

// Global In-Memory Store to cache predefined City, State locations across renders
let globalLocationsCache = null;

export default function App() {
  // Navigation State: 'admin' | 'diagnostics' | 'weather' | 'mandi' | 'fertilizer' | 'schemes'
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
  const [locations, setLocations] = useState(() => globalLocationsCache || []);

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

  // Government Schemes & Subsidies State
  const [schemesList, setSchemesList] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [, setSchemesError] = useState(null);
  const [schemeLandArea, setSchemeLandArea] = useState(2.0);
  const [schemeAreaUnit, setSchemeAreaUnit] = useState("Acres");
  const [schemeCrop, setSchemeCrop] = useState("Tomato");
  const [schemeState, setSchemeState] = useState("Karnataka");
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [savedSchemeIds, setSavedSchemeIds] = useState([]);
  const [speakingSchemeCode, setSpeakingSchemeCode] = useState(null);
  const [schemeToast, setSchemeToast] = useState(null);

  // Diagnostics State
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
  const [diagnosis, setDiagnosis] = useState(null);

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

  const recognitionRef = useRef(null);

  // Saved Fertilizer Plans State
  const [savedPlans, setSavedPlans] = useState([]);

  // Fetch saved plans from PostgreSQL
  const fetchSavedPlans = useCallback(async () => {
    try {
      const data = await api.fetchSavedFertilizerPlans();
      setSavedPlans(data);
    } catch (e) {
      console.warn("Could not load saved plans from PostgreSQL:", e);
    }
  }, []);

  // Admin Registry Fetcher
  const fetchAdminFarmers = useCallback(async () => {
    setAdminLoading(true);
    try {
      const farmers = await api.fetchAdminFarmers();
      setAdminFarmers(farmers);
    } catch (err) {
      console.error("Failed to fetch farmer registry:", err);
    } finally {
      setAdminLoading(false);
    }
  }, []);

  // Government Schemes Fetcher
  const fetchSchemesList = useCallback(async () => {
    setSchemesLoading(true);
    setSchemesError(null);
    try {
      const data = await api.fetchSchemesList();
      setSchemesList(data);
    } catch (err) {
      setSchemesError(err.message || "Failed to load government schemes.");
    } finally {
      setSchemesLoading(false);
    }
  }, []);

  // Eligibility Evaluation Handler
  const handleCheckEligibility = useCallback(async (overrideParams = {}) => {
    setEligibilityLoading(true);
    setSchemesError(null);
    try {
      const land = overrideParams.land_area !== undefined ? overrideParams.land_area : Number(schemeLandArea) || 1.0;
      const unit = overrideParams.area_unit || schemeAreaUnit;
      const crop = overrideParams.crop_name !== undefined ? overrideParams.crop_name : schemeCrop;
      const st = overrideParams.state || schemeState || registeredFarmer?.state || farmerLocation.state || "Karnataka";

      const data = await api.checkSchemeEligibility({
        land_area: land,
        area_unit: unit,
        crop_name: crop,
        state: st
      });
      setEligibilityResult(data);
      if (schemesList.length === 0 && data.results) {
        setSchemesList(data.results.map((r) => r.scheme));
      }
    } catch (err) {
      setSchemesError(err.message || "Failed to evaluate scheme eligibility.");
    } finally {
      setEligibilityLoading(false);
    }
  }, [schemeLandArea, schemeAreaUnit, schemeCrop, schemeState, registeredFarmer, farmerLocation.state, schemesList.length]);

  // Weather Advisory Fetcher
  const fetchWeatherAdvisory = useCallback(async (lat, lon, targetLang = language) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await api.fetchWeatherAdvisory(lat, lon, targetLang);
      setWeather(data);
    } catch (err) {
      setWeatherError(err.message || "Failed to load weather data.");
    } finally {
      setWeatherLoading(false);
    }
  }, [language]);

  // Mandi Rates Fetcher with Nearest Distance Selection
  const searchMandiRates = useCallback(async (
    queryText = "",
    targetLang = language,
    lat = farmerLocation.latitude,
    lon = farmerLocation.longitude,
    cityName = farmerLocation.city,
    stateName = farmerLocation.state
  ) => {
    setMandiLoading(true);
    setMandiError(null);
    cancelSpeech();
    setIsSpeaking(false);

    try {
      const data = await api.fetchMandiRates({
        query: queryText || undefined,
        language: targetLang,
        city: cityName,
        state: stateName,
        latitude: lat,
        longitude: lon
      });
      setMandiData(data);
    } catch (err) {
      setMandiError(err.message || "Failed to fetch Mandi rates.");
    } finally {
      setMandiLoading(false);
    }
  }, [language, farmerLocation]);

  // Route Synchronization Helper
  const navigateTab = useCallback((tabName) => {
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
  }, [isAdminAuthenticated, fetchAdminFarmers, schemesList.length, fetchSchemesList, eligibilityResult, handleCheckEligibility]);

  // Dynamic Real-time Schemes Evaluator: Automatically re-fetches & updates schemes as soon as any farm value changes
  useEffect(() => {
    if (activeTab === "schemes") {
      const timer = setTimeout(() => {
        handleCheckEligibility();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [schemeLandArea, schemeAreaUnit, schemeCrop, schemeState, activeTab, handleCheckEligibility]);

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
        fetchWeatherAdvisory(lat, lon, language);
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
    fetchWeatherAdvisory(loc.latitude, loc.longitude, language);
    searchMandiRates(mandiQuery || "Tomato, Onion, Chilli", language, loc.latitude, loc.longitude, loc.city, loc.state);
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
    } catch {
      setIsRecording(false);
      setMandiError("Failed to initialize microphone.");
    }
  };

  // Text-to-Speech (TTS Audio Button for Mandi)
  const handleSpeakMandiReport = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    if (isSpeaking) {
      cancelSpeech();
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
      await api.adminLogin(adminUsername, adminPassword);
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

  // Scheme Bookmark Handler
  const handleSaveScheme = async (scheme) => {
    const farmerId = registeredFarmer?.id || "guest-farmer";
    try {
      const res = await api.saveScheme({
        farmer_id: farmerId,
        scheme_id: scheme.id
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
      cancelSpeech();
      setSpeakingSchemeCode(null);
      return;
    }

    cancelSpeech();
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

  // Initial Seed & Fetch on Mount
  useEffect(() => {
    let ignore = false;
    async function initSeed() {
      if (!globalLocationsCache) {
        try {
          const data = await api.fetchLocations();
          if (ignore) return;
          globalLocationsCache = data;
          setLocations(data);
          if (data && data.length > 0) {
            setFarmerLocation(data[0]);
            await fetchWeatherAdvisory(data[0].latitude, data[0].longitude, language);
            await searchMandiRates("Tomato, Onion, Chilli", language, data[0].latitude, data[0].longitude);
          }
        } catch {
          if (ignore) return;
          await fetchWeatherAdvisory(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, language);
          await searchMandiRates("Tomato, Onion, Chilli", language, DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
        }
      } else {
        await fetchWeatherAdvisory(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, language);
        await searchMandiRates("Tomato, Onion, Chilli", language, DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
      }

      if (ignore) return;
      // Preload admin farmers registry & government schemes
      fetchAdminFarmers();
      fetchSchemesList();
      handleCheckEligibility({ land_area: 2.0, area_unit: "Acres", crop_name: "Tomato", state: DEFAULT_LOCATION.state || "Karnataka" });
    }

    initSeed();

    return () => {
      ignore = true;
      cancelSpeech();
    };
  }, [fetchAdminFarmers, fetchSchemesList, fetchWeatherAdvisory, handleCheckEligibility, language, searchMandiRates]);

  return (
    <div className="dashboard-shell">
      {/* --- Sidebar Navigation --- */}
      <Sidebar
        activeTab={activeTab}
        navigateTab={navigateTab}
        registeredFarmer={registeredFarmer}
        onOpenRegisterModal={() => setShowRegisterModal(true)}
        isAdminAuthenticated={isAdminAuthenticated}
        diagnosis={diagnosis}
        weather={weather}
      />

      {/* --- Main Content Area --- */}
      <main className={`app-main-content ${activeTab === "admin" && !isAdminAuthenticated ? "admin-auth-mode" : ""}`}>
        {/* Registration Success Notification Banner */}
        <Toast
          message={regSuccessToast}
          type="success"
          onClose={() => setRegSuccessToast(null)}
        />

        {/* VIEW 1: CROP DIAGNOSTICS */}
        {activeTab === "diagnostics" && (
          <DiagnosticsPage
            onOpenRegisterModal={() => setShowRegisterModal(true)}
            language={language}
            setLanguage={setLanguage}
            diagnosis={diagnosis}
            setDiagnosis={setDiagnosis}
            weather={weather}
            farmerLocation={farmerLocation}
            navigateTab={navigateTab}
            searchMandiRates={searchMandiRates}
            setMandiQuery={setMandiQuery}
          />
        )}

        {/* VIEW 2: WEATHER MONITORING & SPRAY ADVISORY */}
        {activeTab === "weather" && (
          <WeatherPage
            locations={locations}
            farmerLocation={farmerLocation}
            onSelectLocation={handleSelectLocation}
            onUseGps={handleUseGps}
            onOpenRegisterModal={() => setShowRegisterModal(true)}
            weather={weather}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
          />
        )}

        {/* VIEW 3: NEAREST MANDI RATES & VOICE MARKET RESEARCH */}
        {activeTab === "mandi" && (
          <MandiPage
            locations={locations}
            farmerLocation={farmerLocation}
            onSelectLocation={handleSelectLocation}
            onUseGps={handleUseGps}
            language={language}
            setLanguage={setLanguage}
            onOpenRegisterModal={() => setShowRegisterModal(true)}
            mandiData={mandiData}
            mandiLoading={mandiLoading}
            mandiError={mandiError}
            mandiQuery={mandiQuery}
            setMandiQuery={setMandiQuery}
            searchMandiRates={searchMandiRates}
            isRecording={isRecording}
            handleToggleVoiceInput={handleToggleVoiceInput}
            isSpeaking={isSpeaking}
            handleSpeakMandiReport={handleSpeakMandiReport}
          />
        )}

        {/* VIEW 4: FERTILIZER & NPK DOSAGE CALCULATOR */}
        {activeTab === "fertilizer" && (
          <FertilizerPage
            onOpenRegisterModal={() => setShowRegisterModal(true)}
            savedPlans={savedPlans}
            fetchSavedPlans={fetchSavedPlans}
          />
        )}

        {/* VIEW 5: ADMIN DASHBOARD */}
        {activeTab === "admin" && (
          <AdminPage
            isAdminAuthenticated={isAdminAuthenticated}
            adminUsername={adminUsername}
            setAdminUsername={setAdminUsername}
            adminPassword={adminPassword}
            setAdminPassword={setAdminPassword}
            adminLoginLoading={adminLoginLoading}
            adminLoginError={adminLoginError}
            showAdminPassword={showAdminPassword}
            setShowAdminPassword={setShowAdminPassword}
            handleAdminLogin={handleAdminLogin}
            handleAdminLogout={handleAdminLogout}
            adminFarmers={adminFarmers}
            adminLoading={adminLoading}
            fetchAdminFarmers={fetchAdminFarmers}
            onOpenRegisterModal={() => setShowRegisterModal(true)}
          />
        )}

        {/* VIEW 6: GOVERNMENT SCHEMES & SUBSIDY ELIGIBILITY FINDER */}
        {activeTab === "schemes" && (
          <SchemesPage
            schemesList={schemesList}
            schemesLoading={schemesLoading}
            schemeLandArea={schemeLandArea}
            setSchemeLandArea={setSchemeLandArea}
            schemeAreaUnit={schemeAreaUnit}
            setSchemeAreaUnit={setSchemeAreaUnit}
            schemeCrop={schemeCrop}
            setSchemeCrop={setSchemeCrop}
            schemeState={schemeState}
            setSchemeState={setSchemeState}
            eligibilityResult={eligibilityResult}
            eligibilityLoading={eligibilityLoading}
            handleCheckEligibility={handleCheckEligibility}
            fetchSchemesList={fetchSchemesList}
            onOpenRegisterModal={() => setShowRegisterModal(true)}
            savedSchemeIds={savedSchemeIds}
            handleSaveScheme={handleSaveScheme}
            speakingSchemeCode={speakingSchemeCode}
            handleSpeakScheme={handleSpeakScheme}
            schemeToast={schemeToast}
            setSchemeToast={setSchemeToast}
            language={language}
          />
        )}
      </main>

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
