import express, { Request, Response } from "express"
import multer from 'multer';
import path from 'path';
import mime from 'mime-types';
import fs from 'fs';
import { nanoid } from "nanoid";
import { Worker } from "worker_threads";
import { db } from "../../db";

const transcodeWorker = new Worker('./dist/transcode/worker.js');

transcodeWorker.on('message', (msg) => {
    console.log(`Main Thread received: ${msg}`);
});

transcodeWorker.on('error', (error) => {
    console.error(`transcodeWorker encountered an error: ${error}`);
});

transcodeWorker.on('exit', (code) => {
    console.log(`transcodeWorker exited with code ${code}`);
});

function addToTranscodeQueue(videoId: string) {
    transcodeWorker.postMessage(videoId);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = './public/uploads';
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const customFileName = nanoid(16);
        const fileExtension = mime.extension(file.mimetype);
        cb(null, `${customFileName}.${fileExtension}`);
    }
});

const upload = multer({ storage });

const router = express.Router();


router.post("/upload", upload.single('video'),async  (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const {title, description} = req.body;
    // Access the filename from req.file and send it back to the client
    const fileId = path.parse(req.file.filename).name;
    await db.video.create({
        data:{
            id: fileId,
            title: title,
            description: description || "",
            org_file_size: req.file.size,
            org_file_dest: req.file.path,
            processed: false,
            transcoded_file_dest: `/cdn/${fileId}`,
            transcode_state: "QUEUED"
        }
    })
    addToTranscodeQueue(req.file?.path)
    res.send({
        message: 'File uploaded successfully!',
        fileId,
        hlsUrl: `${req.headers.host}/cdn/${fileId}/master.m3u8`,
        embeddUrl: `${req.headers.host}/stream/iframe.html?id=${fileId}`,
        embedCode: `<iframe src="${req.headers.host}/stream/iframe.html?id=${fileId}" style="border: none;height: 100%; width: 100%"></iframe>`
    });
});

router.get("/details/:id", async (req:Request, res: Response)=>{
    const id = req.params.id;
    const data = await db.video.findFirst({
        where:{
            id
        },
        select:{
            id: true,
            title: true,
            description: true,
            uploaded_at: true,
            transcode_state: true,
        }
    });
    return res.status(200).json(data);
})

router.get("/trStatus/:id", async (req:Request,res: Response)=>{
    const id = req.params.id;
    const status = await db.video.findFirst({
        where:{
            id
        },
        select: {
            transcode_state: true
        }
    });
    if(!status){
        return res.status(404).json({
            status: "NOTFOUND"
        })
    }
    if(status?.transcode_state === "FINISHED" || status?.transcode_state === "QUEUED"){
        return res.status(200).json({
            status: status.transcode_state
        })
    }else{
        res.status(200).json({
            status: "TRANSCODING",
            progress:{
                quality: status?.transcode_state.split(",")[0],
                progress: status?.transcode_state.split(",")[1]
            }
        })
    }
})

export default router;