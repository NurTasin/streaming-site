export interface Resolution {
    name: string;
    suffix: string;
    size: string;
    width: number;
    height: number;
    bitrate: string;
}
export default [
    {
        name: "4K (UHD)",
        suffix: "2160p",
        size: "?x2160",
        width: 3840,
        height: 2160,
        bitrate: "16000k"
    },
    {
        name: "2K (QHD)",
        suffix: "1440p",
        size: "?x1440",
        width: 2560,
        height: 1440,
        bitrate: "9000k"
    },
    {
        name: "1080p (FHD)",
        suffix: "1080p",
        size: "?x1080",
        width: 1920,
        height: 1080,
        bitrate: "4800k"
    },
    {
        name: "720p (HD)",
        suffix: "720p",
        size: "?x720",
        width: 1280,
        height: 720,
        bitrate: "2400k"
    },
    {
        name: "480p (SD)",
        suffix: "480p",
        size: "?x480",
        width: 854,
        height: 480,
        bitrate: "1200k"
    },
    {
        name: "360p (SD)",
        suffix: "360p",
        size: "?x360",
        width: 640,
        height: 360,
        bitrate: "800k"
    },
    {
        name: "240p",
        suffix: "240p",
        size: "?x240",
        width: 426,
        height: 240,
        bitrate: "400k"
    },
    {
        name: "144p",
        suffix: "144p",
        size: "?x144",
        width: 256,
        height: 144,
        bitrate: "200k"
    }
];