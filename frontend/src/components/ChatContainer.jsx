import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import TextToSpeech from "./TextToSpeech"; // Import the TextToSpeech component
import { Mic, MicOff, Volume2, VolumeOff } from "lucide-react"; // MicOff icon for the stop state

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [playingMessage, setPlayingMessage] = useState(null); // Track which message is currently playing

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Function to handle playing text-to-speech for a specific message
  const handlePlayTextToSpeech = (text) => {
    if (playingMessage === text) {
      setPlayingMessage(null); // If the same message is clicked, stop it
    } else {
      setPlayingMessage(text); // Set the message to be played
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-8 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div
              className={`max-w-[80%] rounded-xl p-3 shadow-sm ${
                message.senderId === authUser._id
                  ? "bg-primary text-primary-content"
                  : "bg-base-200"
              }`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && (
                <>
                  <p className="text-sm">{message.text}</p>
                  {/* Show the speaker button */}
                  <button
                    className="mt-2"
                    onClick={() => handlePlayTextToSpeech(message.text)}
                  >
                    {playingMessage === message.text ? (
                      <VolumeOff size={18} className="text-red-500" /> // Active (playing) - red color
                    ) : (
                      <Volume2 size={18} className="text-base-500" /> // Inactive (paused) - darker base color
                    )}
                  </button>
                </>
              )}
              <p
                className={`text-[10px] mt-1.5 ${
                  message.senderId === authUser._id
                    ? "text-primary-content/70"
                    : "text-base-content/70"
                }`}
              >
                {formatMessageTime(message.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
      {/* Show Text-to-Speech component when a message is being played */}
      {playingMessage && <TextToSpeech text={playingMessage} />}
    </div>
  );
};

export default ChatContainer;
