export const playTTS = (text: string, rate: number = 1) => {
  // Dừng bất kỳ âm thanh web speech nào đang phát
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  try {
    // Dùng endpoint Google Translate API (client=gtx) bypass CORS/Rate Limit
    // Đây là cách lấy raw audio xịn nhất, không bị robot
    const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=en-US&q=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    audio.playbackRate = rate;
    
    audio.play().catch((err) => {
      console.warn("Audio TTS failed, fallback to native:", err);
      fallbackTTS(text, rate);
    });
  } catch (error) {
    fallbackTTS(text, rate);
  }
};

const fallbackTTS = (text: string, rate: number) => {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const betterVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium'))
    );
    if (betterVoice) u.voice = betterVoice;
  }
  window.speechSynthesis.speak(u);
};
