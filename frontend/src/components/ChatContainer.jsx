import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import TextToSpeech from "./TextToSpeech";
import { Volume2, VolumeOff, Clipboard, ClipboardCheck } from "lucide-react";
import ToDoList from "./ToDoList";

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
  const [copiedMessageId, setCopiedMessageId] = useState(null); // Track which message has been copied
  const [searchTerm, setSearchTerm] = useState(""); // Search term state

  const sendSoundRef = useRef(null); // Reference for send message sound
  const receiveSoundRef = useRef(null); // Reference for receive message sound

  const [showTodo, setShowTodo] = useState(false); // State to toggle the To-Do List

  // Function to toggle To-Do list visibility
  const toggleToDoList = () => {
    setShowTodo((prev) => !prev);
  };

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
      // Play sound effect when a new message arrives (not triggered on initial load)
      if (messages.length) {
        const latestMessage = messages[messages.length - 1];
        if (latestMessage.senderId === authUser._id) {
          sendSoundRef.current?.play();
        } else {
          receiveSoundRef.current?.play();
        }
      }
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, authUser._id]);

  // Filter messages based on the search term
  const filteredMessages = messages.filter((message) =>
    message.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle playing text-to-speech for a specific message
  const handlePlayTextToSpeech = (text) => {
    if (playingMessage === text) {
      setPlayingMessage(null); // If the same message is clicked, stop it
    } else {
      setPlayingMessage(text); // Set the message to be played
    }
  };

  // Function to copy message text to the clipboard
  const handleCopyMessage = (messageId, text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedMessageId(messageId); // Set the copied message ID
        setTimeout(() => setCopiedMessageId(null), 3000); // Reset after 3 seconds
      },
      (err) => {
        console.error("Failed to copy text: ", err);
      }
    );
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
      {/* Show Chat Header */}
      <ChatHeader
        onSearch={setSearchTerm}
        toggleToDoList={toggleToDoList}
        showTodo={showTodo}
      />

      {/* Show message section only when the To-Do list is hidden */}
      {!showTodo && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.map((message) => (
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
                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        onClick={() => handlePlayTextToSpeech(message.text)}
                      >
                        {playingMessage === message.text ? (
                          <VolumeOff size={15} className="text-red-500" />
                        ) : (
                          <Volume2 size={15} className="text-base-500" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleCopyMessage(message._id, message.text)
                        }
                      >
                        {copiedMessageId === message._id ? (
                          <ClipboardCheck size={15} className="text-base-500" />
                        ) : (
                          <Clipboard size={15} className="text-base-500" />
                        )}
                      </button>
                    </div>
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
      )}

      {/* Conditionally render the ToDoList */}
      {showTodo && (
        <div className="flex-1 bg-base-100 p-4">
          <ToDoList />
        </div>
      )}

      {/* Always show the MessageInput */}
      <MessageInput />

      {playingMessage && <TextToSpeech text={playingMessage} />}
      <audio ref={sendSoundRef} src="/sounds/send.mp3" preload="auto" />
      <audio ref={receiveSoundRef} src="/sounds/receive.mp3" preload="auto" />
    </div>
  );
};

export default ChatContainer;
