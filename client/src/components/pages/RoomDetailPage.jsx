import { useParams,useNavigate } from "react-router-dom";
import { useState } from "react";
import Whiteboard from "../whiteboard/whiteboard.jsx";
import { FaArrowLeft } from 'react-icons/fa';

function RoomDetailPage() {
  const { roomId } = useParams();
  const [activeTab, setActiveTab] = useState("chat");
 const navigate = useNavigate(); 
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="w-full h-16 bg-gray-800 flex items-center justify-between px-6 border-b border-gray-700">
        <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                        aria-label="Go back"
                    >
                        <FaArrowLeft />
                    </button>
        <h2 className="text-lg font-semibold">Room: {roomId}</h2>
        <div className="flex items-center gap-4">
          <p className="text-sm">Members: John, Jane</p>
          <button className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm">Leave Room</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[75%] h-full overflow-hidden">
          <Whiteboard />
        </div>

        
        <div className="w-[25%] h-full bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="flex">
            <button
              className={`flex-1 py-2 text-sm ${
                activeTab === "chat" ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("chat")}
            >
              Chat
            </button>
            <button
              className={`flex-1 py-2 text-sm ${
                activeTab === "files" ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("files")}
            >
              Files
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === "chat" && <div>Chat</div>}
            {activeTab === "files" && <div>Files</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetailPage;
