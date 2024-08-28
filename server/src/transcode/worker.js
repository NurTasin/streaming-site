const { parentPort } = require('worker_threads');
const {transcode}  = require('./src/transcode/index');
console.log("[Worker] Initialized");

if (parentPort) {
    const queue = [];
    let processing = false;

    async function processQueue() {
        if (queue.length === 0 || processing) return;

        processing = true;
        const videoId = queue.shift();

        try {
            await transcode(videoId);
        } catch (error) {
            parentPort?.postMessage(`Error transcoding ${videoId}: ${error.message}`);
        } finally {
            processing = false;
            processQueue();
        }
    }

    parentPort.on('message', (videoId) => {
        queue.push(videoId);
        processQueue();
    });
} else {
    console.error('[Worker] No parent port found. This script is not running in a worker thread.');
}
