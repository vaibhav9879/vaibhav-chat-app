import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Mic, MicOff } from "lucide-react";
import toast from "react-hot-toast";

// Speech recognition setup
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();
mic.continuous = true; // Allow continuous recognition
mic.interimResults = true; // Show results as the speech is being recognized
mic.lang = "en-US"; // Set language

const MessageInput = () => {
  const [text, setText] = useState(""); // State to store the transcribed text
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [isListening, setIsListening] = useState(false); // State for listening status
  const fileInputRef = useRef(null); // Reference to file input
  const { sendMessage } = useChatStore(); // Chat store to send messages

  // Handle image change for preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove image preview
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form after sending
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle start/stop listening for voice input
  useEffect(() => {
    if (isListening) {
      mic.start(); // Start recognition when listening is active
      mic.onend = () => {
        console.log("Mic stopped automatically, restarting...");
        mic.start(); // Restart the recognition if it ends
      };
    } else {
      mic.stop(); // Stop recognition when listening is inactive
      mic.onend = () => {
        console.log("Stopped listening");
      };
    }

    mic.onstart = () => {
      console.log("Speech recognition started");
    };

    mic.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join(""); // Join interim results into full transcript
      setText(transcript); // Update text state with transcribed text
    };

    mic.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  }, [isListening]);

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "btn-primary" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md h-11 mt-0.5"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Microphone button */}
          <button
            type="button"
            className="btn btn-circle"
            onClick={() => setIsListening((prevState) => !prevState)} // Toggle listening on/off
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary h-10 min-h-0"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
