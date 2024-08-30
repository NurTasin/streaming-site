import express, { Request } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mustacheExpress from "mustache-express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 8000

// Middlewares
app.use(cors({
    origin: (origin, callback) => {
        return callback(null, true); // Allows all origins
    },
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.engine("html", mustacheExpress());
app.set("view engine", "html");
app.set('views', path.join(__dirname,"../public/www"));

import UserRouterV1 from "./routes/v1/user-routes";
import VideoRouterV1 from "./routes/v1/video-routes";
import streamRouteV1 from "./routes/v1/stream-route";

app.use("/api/v1/user", UserRouterV1);
app.use("/api/v1/video", VideoRouterV1);
app.use("/stream", streamRouteV1);
app.use("/cdn", express.static("./public/transcoded"));
app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`);
})