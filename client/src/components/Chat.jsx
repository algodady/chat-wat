import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { FaPaperPlane, FaSmile } from "react-icons/fa"; // Importing send and emoji icons
import EmojiPicker from "emoji-picker-react"; // Importing the new emoji picker

const socket = io("http://localhost:5000"); // Replace with your server address

function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(""); // State to store the user's name
  const [setChatUser] = useState(""); // State to store the chat user's name
  const [isUsernameSet, setIsUsernameSet] = useState(false); // Check if the username is set
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false); // To toggle emoji picker visibility

  // UseRef to focus the input after emoji selection
  const messageInputRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      setUserId(socket.id);
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      setChatUser(message.username); // Set the name of the user whose message we received
    });

    return () => {
      socket.off("message");
    };
  }, [setChatUser]);

  const handleSetUsername = () => {
    if (username.trim()) {
      socket.emit("setUsername", username); // Send the username to the server
      setIsUsernameSet(true); // Mark that the username has been set
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      const message = { text: messageInput, timestamp: new Date(), userId, username };
      socket.emit("message", message);
      setMessageInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && messageInput.trim() !== "") {
      sendMessage();
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessageInput((prevMessage) => prevMessage + emoji.emoji); // Add the emoji to the input field
    setIsEmojiPickerVisible(false); // Hide the emoji picker after selecting an emoji

    // Focus on the message input after emoji is selected
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const handleEmojiPickerToggle = () => {
    setIsEmojiPickerVisible(!isEmojiPickerVisible); // Toggle the emoji picker visibility
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 rounded-lg w-full h-full p-6 shadow-lg">
        <div className="flex flex-col h-full">
          {!isUsernameSet ? (
            <div className="flex flex-col items-center justify-center h-full">
              <input
                type="text"
                className="w-2/3 px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                onClick={handleSetUsername}
              >
                Set Username
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 overflow-y-auto bg-gray-700 rounded-md space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.userId === userId ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`p-4 rounded-lg max-w-xl ${msg.userId === userId ? "bg-blue-500 text-white" : "bg-gray-600 text-white"}`}
                    >
                      <strong>{msg.userId === userId ? "You" : msg.username}</strong>: {msg.text}
                    </div>
                    <span className="text-gray-400 text-xs mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-600 mt-4">
                <div className="flex items-center space-x-2">
                  {/* Emoji Button */}
                  <button
                    className="px-2 py-2 text-yellow-400"
                    onClick={handleEmojiPickerToggle} // Toggle emoji picker
                  >
                    <FaSmile size={24} />
                  </button>

                  {/* Emoji Picker */}
                  {isEmojiPickerVisible && (
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}

                  {/* Input Box */}
                  <input
                    ref={messageInputRef} // Reference to focus this input field
                    type="text"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-l-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown} // Listen for Enter key press
                  />

                  {/* Send Button */}
                  <button
                    className="px-4 py-2 text-white rounded-r-md hover:bg-blue-700 focus:outline-none"
                    onClick={sendMessage} // Send message on button click
                  >
                    <FaPaperPlane size={24} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
