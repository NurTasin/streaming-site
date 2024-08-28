import Ffmpeg, { ffprobe } from "fluent-ffmpeg";
import path from 'path';
import fs from "fs";
import { Resolution } from "./resolutions";
import { db } from "../db";

Ffmpeg.setFfprobePath("ffprobe");
Ffmpeg.setFfmpegPath("ffmpeg");

export function getFfprobeData(filePath: string | undefined) {
    if (!filePath) return;
    return new Promise((resolve, reject) => {
        ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata);
            }
        });
    });
}

export const Logger = new class {
    log = (msg: String | string) => {
        console.log(`[LOG]`, msg)
    }
    error = (msg: String | string) => {
        console.log(`[ERROR]`, msg)
    }
    warning = (msg: String | string) => {
        console.log(`[WARNING]`, msg)
    }
};



export function HLSify(input_file: string, output_dir: string, height: number, bitrate: string) {
    return new Promise((resolve, reject) => {
        try {
            fs.mkdirSync(path.join(output_dir, path.parse(input_file).name, `${height}p`), { recursive: true });
        } catch (err) {
            console.log(err)
        }
        const fileId = path.parse(input_file).name;
        Ffmpeg(input_file)
            .size(`?x${height}`)
            .outputOptions([
                '-vcodec h264_nvenc', `-b:v ${bitrate}`,
                '-acodec aac', '-b:a 128k',
                '-start_number 0',
                '-hls_time 4',
                '-hls_list_size 0',
                '-f hls',
                `-hls_playlist_type vod`,
                `-hls_segment_filename ${path.join(output_dir, path.parse(input_file).name, `${height}p`, "%03d.ts")}`
            ])
            .on('progress', async function (prog) {
                await db.video.update({
                    where: {
                        id: fileId,
                    },
                    data: {
                        transcode_state: `${height}p, ${Math.round(prog.percent || 0)}`
                    }
                })
            })
            .on("end", resolve)
            .on("error", reject)
            .output(path.join(output_dir, path.parse(input_file).name, `${height}p`, "index.m3u8"))
            .run();
    })
}

export function generateMasterM3U8(id: string, applicableRes: Resolution[]) {
    let masterPlaylist = '#EXTM3U\n';

    applicableRes.forEach((resolution) => {
        masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(resolution.bitrate.slice(0, -1)) * 1000},RESOLUTION=${resolution.width}x${resolution.height}\n`;
        masterPlaylist += `${resolution.suffix}/index.m3u8\n`;
    });

    return masterPlaylist;
}
