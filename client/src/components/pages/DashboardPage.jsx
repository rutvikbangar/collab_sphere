import { useEffect, useState } from "react";
import { getAllUserRooms, createRoom } from "../../api-service/api.js";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function DashboardPage() {
    const [rooms, setRooms] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [popup, setpopup] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [pageLoading,setPageLoading] = useState(true);
    const navigate = useNavigate();

    const fetchRooms = async () => {
        const res = await getAllUserRooms();
        if (res && res.data) {
            setPageLoading(false);
            setRooms(res.data);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!roomName.trim()) return;
        
        setIsCreating(true);
        const response = await createRoom(roomName);
        if (response) {
            await fetchRooms();
            toast.success("Room created");
            setRoomName("");
            setIsCreating(false);
            setpopup(false);
        } else {
            setpopup(false);
            setIsCreating(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    if(pageLoading){
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <svg 
                        className="animate-spin h-12 w-12 text-indigo-600" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                    >
                        <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                        ></circle>
                        <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span className="text-lg text-gray-600">Loading rooms...</span>
                </div>
            </div>
        );
    }
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Your Rooms</h1>
                <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    onClick={() => setpopup(true)}
                >
                    Create New Room
                </button>
            </div>

            {popup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create New Room</h2>
                        <form onSubmit={handleCreateRoom}>
                            <input
                                type="text"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="Enter room name"
                                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                                disabled={isCreating}
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setpopup(false);
                                        setRoomName("");
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                    disabled={isCreating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                                    disabled={isCreating}
                                >
                                    {isCreating ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Room'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {rooms.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">No rooms found.</p>
                    <p className="text-gray-400 mt-2">Create a new room to get started!</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {rooms.map((room) => (
                        <div
                            key={room._id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {room.roomName}
                                    </h2>
                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {room.members.length} members
                                    </span>
                                </div>
                                
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Created: {format(new Date(room.createdAt), 'MMM dd, yyyy')}
                                    </p>
                                    <p className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Last activity: {format(new Date(room.updatedAt), 'MMM dd, yyyy')}
                                    </p>
                                </div>

                                <div className="mt-6 flex space-x-3">
                                    <button
                                        onClick={() => navigate(`/room/${room._id}`)}
                                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Join Room
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DashboardPage;
