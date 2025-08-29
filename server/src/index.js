import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {server} from './app.js'

dotenv.config({
    path:'./.env'
})

connectDB().then(()=>{
    const port = process.env.PORT || 8000;
    server.listen(port,()=>{
        console.log(`⚙️ Server is running at port : ${port}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})