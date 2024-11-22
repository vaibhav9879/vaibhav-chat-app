import React, { useEffect, useState } from "react";

const TextToSpeech = ({ text }) => {
  const [utterance, setUtterance] = useState(null);

  useEffect(() => {
    const synth = window.speechSynthesis;

    // Create the utterance object
    const u = new SpeechSynthesisUtterance(text);

    // Get available voices
    const voices = synth.getVoices();

    // Find a female voice (you can customize this by name or gender)
    const femaleVoice = voices.find((voice) =>
      voice.name.toLowerCase().includes("female")
    );

    // If no female voice is found, use the default one
    u.voice = femaleVoice || voices[0]; // Default to first available voice if no female voice is found

    // Set voice settings
    u.pitch = 1; // Default pitch
    u.rate = 1; // Default rate
    u.volume = 1; // Default volume

    setUtterance(u);

    // Start speaking when the text is set
    synth.speak(u);

    // Clean up when the component is unmounted or when a new message is played
    return () => {
      synth.cancel(); // Stop speech when changing messages or unmounting
    };
  }, [text]); // Only re-run when the text changes

  return null; // No UI in this component
};

export default TextToSpeech;
