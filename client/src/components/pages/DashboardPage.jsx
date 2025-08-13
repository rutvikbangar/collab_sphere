import { useEffect, useState } from "react";
import { getAllUserRooms, createRoom, addUserToRoom } from "../../api-service/api.js";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus, FaUsers, FaCalendar, FaClock, FaShare, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import Modal from "./modal/Modal.jsx";

function DashboardPage() {
    const [rooms, setRooms] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [popup, setPopup] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [pageLoading, setPageLoading] = useState(true);
    const [sharePopup, setSharePopup] = useState({ isOpen: false, roomId: null, roomName: "" });
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
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
        if (!roomName.trim()) {
            toast.error("Please enter a room name");
            return;
        }
        
        setIsCreating(true);
        const response = await createRoom(roomName);
        if (response) {
            await fetchRooms();
            toast.success("Room created successfully!");
            setRoomName("");
            setIsCreating(false);
            setPopup(false);
        } else {
            setPopup(false);
            setIsCreating(false);
        }
    };

    const handleOpenSharePopup = (roomId, roomName) => {
        setSharePopup({ isOpen: true, roomId, roomName });
    };

    const handleCloseSharePopup = () => {
        setSharePopup({ isOpen: false, roomId: null, roomName: "" });
        setInviteEmail("");
    };

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) {
            toast.error("Please enter an email address");
            return;
        }
        if (!sharePopup.roomId) return;

        setIsInviting(true);
        try {
            const response = await addUserToRoom(sharePopup.roomId, inviteEmail);
            if (response) {
                toast.success(`Invitation sent to ${inviteEmail}`);
                await fetchRooms();
                handleCloseSharePopup();
            }
        } catch {
            toast.error("Failed to send invitation");
        } finally {
            setIsInviting(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg text-gray-600">Loading your rooms...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Collaborative Spaces</h1>
                    <p className="text-gray-600">Create and manage your whiteboard rooms</p>
                </div>
                <button
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md"
                    onClick={() => setPopup(true)}
                >
                    <FaPlus className="text-sm" />
                    Create New Room
                </button>
            </div>

            {/* Create Room Popup */}
            {popup && (
                <Modal>
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <FaPlus className="text-blue-500" />
                            Create New Room
                        </h2>
                        <form onSubmit={handleCreateRoom}>
                            <input
                                type="text"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="Enter room name"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isCreating}
                                autoFocus
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPopup(false);
                                        setRoomName("");
                                    }}
                                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    disabled={isCreating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    disabled={isCreating || !roomName.trim()}
                                >
                                    {isCreating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus className="text-sm" />
                                            Create Room
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

            {/* Share Room Popup */}
            {sharePopup.isOpen && (
                <Modal>
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <FaUserPlus className="text-green-500" />
                            Invite to Room
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">Adding member to: {sharePopup.roomName}</p>
                        <form onSubmit={handleInviteSubmit}>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Enter user's email address"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
                                disabled={isInviting}
                                autoFocus
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseSharePopup}
                                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    disabled={isInviting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                                    disabled={isInviting || !inviteEmail.trim()}
                                >
                                    {isInviting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <FaShare className="text-sm" />
                                            Send Invite
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

            {/* Rooms Grid */}
            {rooms.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaUsers className="text-4xl text-gray-400" />
                        </div>
                        <p className="text-gray-700 text-xl mb-2">No rooms found</p>
                        <p className="text-gray-500">Create your first room to start collaborating!</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {rooms.map((room) => (
                        <div
                            key={room._id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-gray-300 transition-all duration-300 group"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {room.roomName}
                                    </h2>
                                    <span className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                                        <FaUsers className="text-xs" />
                                        {room.members.length} {room.members.length === 1 ? 'member' : 'members'}
                                    </span>
                                </div>
                                
                                <div className="space-y-3 text-sm text-gray-600 mb-6">
                                    <p className="flex items-center gap-2">
                                        <FaCalendar className="text-gray-400" />
                                        <span>Created: {format(new Date(room.createdAt), 'MMM dd, yyyy')}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <FaClock className="text-gray-400" />
                                        <span>Updated: {format(new Date(room.updatedAt), 'MMM dd, yyyy')}</span>
                                    </p>
                                </div>


                                <div className="flex gap-3">
                                    <button
                                        onClick={() => navigate(`/room/${room._id}`)}
                                        className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                        <FaSignInAlt className="text-sm" />
                                        Join Room
                                    </button>
                                    <button
                                        onClick={() => handleOpenSharePopup(room._id, room.roomName)}
                                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                                    >
                                        <FaUserPlus className="text-sm" />
                                        Add Member
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
