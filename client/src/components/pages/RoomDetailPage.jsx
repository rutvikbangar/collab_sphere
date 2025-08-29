import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Whiteboard from "../whiteboard/Whiteboard.jsx";
import { FaArrowLeft, FaPaperPlane, FaFileAlt, FaComments } from 'react-icons/fa';
import io from "socket.io-client";
import toast from "react-hot-toast";
import { uploadFile } from "../../api-service/api"; // Import the HTTP upload function

const socket = io('http://localhost:3000');

function RoomDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("chat"); // chat | files
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);

    if (!roomId || !user?._id) return;

    socket.emit('join-room', roomId);

    // Load chat history
    socket.on('load-chat-history', (history) => {
      setMessages(history);
    });

    socket.on('receive-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Load files
    socket.on('load-files', (filesData) => {
      setFiles(filesData);
    });

    // Listen for real-time file updates
    socket.on('file-uploaded', (newFile) => {
      setFiles((prev) => {
        const exists = prev.some(f => f._id === newFile._id);
        if (!exists) {
          // Show notification for files uploaded by others
          const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;
          if (newFile.uploadedBy._id !== currentUserId) {
            toast.success(`${newFile.uploadedBy.name} uploaded ${newFile.fileName}`);
          }
          return [...prev, newFile];
        }
        return prev;
      });
    });


    return () => {
      socket.off('load-chat-history');
      socket.off('receive-message');
      socket.off('load-files');
      socket.off('file-uploaded');
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
    socket.emit('leave-room', roomId);
    navigate(-1);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      event.target.value = null;
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      event.target.value = null;
      return;
    }

    setIsUploading(true);

    try {
      // Use HTTP upload API
      const response = await uploadFile(roomId, file);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      event.target.value = null;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDownload = async (e, file) => {
    e.preventDefault();
    
    try {
      // Ensure the filename has .pdf extension
      let downloadFilename = file.fileName;
      if (!downloadFilename.toLowerCase().endsWith('.pdf')) {
        downloadFilename = `${downloadFilename}.pdf`;
      }
            
      const response = await fetch(file.url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create a new blob with PDF mime type to ensure proper file type
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      
      // Create object URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Create temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${downloadFilename}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file. Opening in new tab...');
      
      // Fallback: Open URL directly in new tab
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="w-full h-16 bg-gray-800 flex items-center justify-between px-6 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Room: {roomId}</h2>
        <div className="flex items-center gap-4">
          <button 
            className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm transition-colors" 
            onClick={handleLeaveRoom}
          >
            Leave Room
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Whiteboard Section */}
        <div className="w-[75%] h-full overflow-hidden">
          <Whiteboard roomId={roomId} />
        </div>

        {/* Right Panel with Tabs */}
        <div className="w-[25%] h-full bg-gray-800 border-l border-gray-700 flex flex-col shadow-lg">
          <div className="flex border-b border-gray-600 bg-gray-850">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all duration-200 relative ${
                activeTab === "chat"
                  ? "bg-gray-700 text-white shadow-sm"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-750 hover:text-white"
              }`}
            >
              <FaComments className="text-base" />
              Chat
              {activeTab === "chat" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all duration-200 relative ${
                activeTab === "files"
                  ? "bg-gray-700 text-white shadow-sm"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-750 hover:text-white"
              }`}
            >
              <FaFileAlt className="text-base" />
              Files
              {files.length > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {files.length}
                </span>
              )}
              {activeTab === "files" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === "chat" ? (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                        <FaComments className="text-2xl text-gray-400" />
                      </div>
                      <div className="text-gray-400">
                        <p className="font-medium">No messages yet</p>
                        <p className="text-sm text-gray-500 mt-1">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isCurrentUser = msg.sender?._id === currentUser?._id;
                      return (
                        <div
                          key={msg._id || index}
                          className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} group`}
                        >
                          <div className={`flex items-start gap-3 max-w-[90%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 shadow-sm ${
                              isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-200'
                            }`}>
                              {msg.sender?.name ? msg.sender.name.charAt(0).toUpperCase() : 'U'}
                            </div>

                            {/* Message Content */}
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className={`text-xs ${isCurrentUser ? 'text-right' : 'text-left'} text-gray-400 font-medium`}>
                                {msg.sender?.name || 'Unknown User'}
                              </div>
                              <div className={`px-4 py-2.5 rounded-xl break-words shadow-sm transition-all duration-200 ${
                                isCurrentUser
                                  ? 'bg-blue-500 text-white rounded-br-sm'
                                  : 'bg-gray-700 text-gray-100 rounded-bl-sm border border-gray-600'
                              }`}>
                                <p className="text-sm leading-relaxed">{msg.message}</p>
                              </div>
                              <div className={`text-xs text-gray-500 opacity-75 group-hover:opacity-100 transition-opacity ${
                                isCurrentUser ? 'text-right' : 'text-left'
                              }`}>
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
                <div className="p-4 border-t border-gray-700 bg-gray-800">
                  <form onSubmit={handleSendMessage}>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-650 border border-gray-600 transition-all duration-200"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                      >
                        <FaPaperPlane className="text-sm" />
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <>
                {/* Files Content */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                        <FaFileAlt className="text-2xl text-gray-400" />
                      </div>
                      <div className="text-gray-400">
                        <p className="font-medium">No files uploaded yet</p>
                        <p className="text-sm text-gray-500 mt-1">Upload PDFs to share with the team</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {files.map((file) => (
                        <div
                          key={file._id}
                          className="bg-gray-700 p-4 rounded-xl flex justify-between items-center hover:bg-gray-650 transition-all duration-200 border border-gray-600 group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FaFileAlt className="text-gray-300" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-gray-100 font-medium text-sm">
                                {file.fileName}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                By {file.uploadedBy?.name || 'Unknown'} • {new Date(file.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDownload(e, file)}
                            className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200 flex-shrink-0 ml-3 px-3 py-1"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Section */}
                <div className="p-4 border-t border-gray-700 bg-gray-800">
                  <label 
                    htmlFor="file-upload"
                    className={`flex items-center justify-center gap-3 p-3 
                    ${isUploading 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                    } 
                    text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group`}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-medium">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                          />
                        </svg>
                        <span className="font-medium">Upload PDF</span>
                      </>
                    )}
                    <input
                        ref={fileInputRef}
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        accept="application/pdf"
                    />
                  </label>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    PDF files only • Max 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetailPage;