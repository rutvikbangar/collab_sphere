import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Whiteboard from "../whiteboard/whiteboard.jsx";
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import io from "socket.io-client";

const socket = io('http://localhost:3000');

function RoomDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get user info from localStorage to use as the sender
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);

    if (!roomId || !user?._id) return;

    // Join the room
    socket.emit('join-room', roomId);

    // loads history
    socket.on('load-chat-history', (history) => {
      setMessages(history);
    });

    socket.on('receive-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up
    return () => {
      socket.off('load-chat-history');
      socket.off('receive-message');
    };
  }, [roomId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser) {
      socket.emit('send-message', {
        roomId,
        message: newMessage,
        senderId: currentUser._id
      });
      setNewMessage('');
    }
  };

    const handleLeaveRoom = () => {
    socket.emit('leave-room',roomId);
    navigate(-1);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="w-full h-16 bg-gray-800 flex items-center justify-between px-6 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Room: {roomId}</h2>
        <div className="flex items-center gap-4">
          <button className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm" onClick={handleLeaveRoom}>
            Leave Room
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Whiteboard Section */}
        <div className="w-[75%] h-full overflow-hidden">
          <Whiteboard roomId={roomId} />
        </div>

        {/* Chat Section */}
        <div className="w-[25%] h-full bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Chat Header */}
          <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
            <h3 className="text-sm font-semibold">Room Chat</h3>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-4">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isCurrentUser = msg.senderId === currentUser?._id;
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[85%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                        isCurrentUser ? 'bg-blue-500' : 'bg-gray-600'
                      }`}>
                        {msg.sender?.name ? msg.sender?.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      
                      {/* Message Content */}
                      <div className="flex flex-col gap-1">
                        <div className={`text-xs ${isCurrentUser ? 'text-right' : 'text-left'} text-gray-400`}>
                          {msg.sender?.name || 'Unknown User'}
                        </div>
                        <div className={`px-3 py-2 rounded-lg break-words ${
                          isCurrentUser 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 text-gray-100'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <div className={`text-xs text-gray-500 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoomDetailPage;