import express from "express"
import cors from "cors"
import { errorHandler } from "./middlewares/errorhandler.js";
import http from 'http';
import { Server } from 'socket.io';
import { Stroke } from "./models/strokes.model.js";
import { Message } from "./models/message.model.js";
import { File } from "./models/files.model.js";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import roomRoutes from "./routes/roomRoutes.js"
import strokesRoutes from "./routes/strokes.routes.js"
import fileRoutes from "./routes/filesRoutes.js";

app.use("/api/v1/user",userRoutes);
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/room",roomRoutes);
app.use("/api/v1/strokes",strokesRoutes);
app.use("/api/v1/files", fileRoutes);


app.use(errorHandler);

// socket io


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // allow all origins for now
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {

  socket.on('join-room', async (roomId) => {
    socket.join(roomId);
    
    try {
      const existingStrokes = await Stroke.find({ roomId });
      socket.emit('initial-strokes', existingStrokes);
      const chatHistory = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name'); // Get sender's name from User model
      socket.emit('load-chat-history', chatHistory);

      // fetch files
      // const files = await File.find({roomId});
      // socket.emit('load-files',files);

    } catch (error) {
      console.error('Failed to fetch strokes:', error);
    }
   
  });
    socket.on("leave-room", roomId => {
        socket.leave(roomId);
    });

    socket.on('draw-line', async ({ roomId, line }) => {
    try {
      const newStroke = new Stroke({
        roomId,
        ...line
      });
      await newStroke.save();
      
      socket.to(roomId).emit('receive-line', line);
    } catch (error) {
      console.error('Failed to save stroke:', error);
    }
  });

  // messages

    socket.on('send-message', async ({ roomId, message, senderId }) => {
    try {
      const newMessage = new Message({
        roomId,
        message,
        sender: senderId
      });
      await newMessage.save();

      // Populate sender info before broadcasting to the room
      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name');

      io.to(roomId).emit('receive-message', populatedMessage);
    } catch (error) {
      console.error('Failed to save or broadcast message:', error);
    }
  });

  // files
  //socket.on('upload-file');
  

  socket.on('disconnect', () => {
  });
});


export {server}
