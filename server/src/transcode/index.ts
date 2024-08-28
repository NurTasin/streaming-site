import { FfprobeData } from "fluent-ffmpeg";
import path from 'path'
import { generateMasterM3U8, getFfprobeData, HLSify, Logger } from "./helpers";
import resolutions from "./resolutions";
import fs from "node:fs"
import { db } from "../db";


export async function transcode(inputFile: string | undefined, outputDir: string = "./public/transcoded/", vCodec: string = "h264", aCodec: string = "aac") {
    if (!inputFile) {
        console.log("No input file provided to transcode");
        return
    }
    const video_data: FfprobeData = await getFfprobeData(inputFile) as FfprobeData;
    console.log(`\
Input file: ${video_data.format.filename}
Resolution: ${video_data.streams[0].width}x${video_data.streams[0].height} (${video_data.streams[0].height}p)
FPS: ${video_data.streams[0].r_frame_rate}
Codec: ${video_data.streams.map(el => el.codec_name).join(' + ')}`);

    const convertable_res = resolutions.filter((el) => el.height <= (video_data.streams[0].height || Infinity));
    console.log(`Will be transcoded to: `, convertable_res.map(el => el.name).join(', '))

    const start_time = Date.now()
    for (const res of convertable_res) {
        console.log(`Transcoding ${path.parse(inputFile).name} to ${res.name}`);
        await HLSify(inputFile, outputDir, res.height, res.bitrate);
    }
    fs.writeFileSync(path.join(outputDir,path.parse(inputFile).name,"master.m3u8"),generateMasterM3U8(path.parse(inputFile).name, convertable_res));
    const end_time = Date.now()
    console.log("\n")
    Logger.log(`Took ${end_time - start_time}ms to transcode.`)
    await db.video.update({
        where:{
            id: path.parse(inputFile).name,
        },
        data:{
            transcode_state: "FINISHED"
        }
    })
    return {
        videoId: path.parse(inputFile).name,
        convertedTo: convertable_res.map(el=>el.suffix)
    }
}