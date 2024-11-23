import { X, Search, CheckSquare } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState, useRef, useEffect } from "react";

const ChatHeader = ({ onSearch, toggleToDoList, showTodo }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const searchInputRef = useRef(null);

  // Focus on the search input when search mode is activated
  useEffect(() => {
    if (searchActive) {
      searchInputRef.current?.focus();
    }
  }, [searchActive]);

  const handleSearchToggle = () => {
    setSearchActive((prev) => !prev);
    if (!searchActive) {
      setSearchText(""); // Clear text if switching from inactive to active
      onSearch(""); // Reset search results
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    onSearch(value); // Trigger search in the parent component
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 w-full">
          {/* Conditional Rendering for Search Bar */}
          {searchActive ? (
            <input
              type="text"
              placeholder="Search messages..."
              value={searchText}
              onChange={handleSearchChange}
              ref={searchInputRef}
              className="input input-sm w-full max-w-md p-2 border border-base-300 rounded-md shadow-sm text-sm"
            />
          ) : (
            <>
              {/* Avatar */}
              <div className="avatar">
                <div className="size-10 rounded-full relative">
                  <img
                    src={selectedUser.profilePic || "/avatar.png"}
                    alt={selectedUser.fullName}
                  />
                </div>
              </div>

              {/* User Info */}
              <div>
                <h3 className="font-medium">{selectedUser.fullName}</h3>
                <p className="text-sm text-base-content/70">
                  {onlineUsers.includes(selectedUser._id)
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1">
          {/* To-Do List Button */}
          <button
            onClick={toggleToDoList}
            className="btn btn-ghost btn-sm"
            aria-label="To-Do List"
          >
            <CheckSquare size={20} />
          </button>

          {/* Search Icon */}
          <button
            onClick={handleSearchToggle}
            className="btn btn-ghost btn-sm"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Close Button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-sm"
            aria-label="Close"
          >
            <X size={23} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
