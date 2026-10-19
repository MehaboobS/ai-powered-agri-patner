import { LANGUAGES } from "../constants";

/**
 * Resolves BCP-47 language tag for speech synthesis / recognition
 */
export function getBcp47(langName) {
  const found = LANGUAGES.find((l) => l.code.toLowerCase() === (langName || "").toLowerCase());
  return found ? found.bcp47 : "en-IN";
}

/**
 * Cancels any active speech synthesis
 */
export function cancelSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Synthesizes text to speech using Web Speech API
 */
export function speakText({ text, bcp47 = "en-IN", rate = 0.95, onStart, onEnd, onError }) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (onError) onError(new Error("Speech synthesis not supported"));
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = bcp47;
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const langVoice = voices.find((v) => v.lang.includes(bcp47) || v.lang.startsWith(bcp47.slice(0, 2)));
  if (langVoice) utterance.voice = langVoice;

  if (onStart) utterance.onstart = onStart;
  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = (e) => {
    if (onError) onError(e);
  };

  window.speechSynthesis.speak(utterance);
}
