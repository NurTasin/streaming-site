"use client";
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { transcode } from 'buffer';
import Link from 'next/link';
import React, { useState } from 'react';
import { RingLoader } from 'react-spinners';

function VideoUploadForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [allowedSites, setAllowedSites] = useState<string[]>([]);
    const [useProtection, setUseProtection] = useState<boolean>(false);
    const [password, setPassword] = useState<string | null>(null);
    const [video, setVideo] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [transcodeText, setTranscodeText] = useState("Queued");
    const [videoId, setVideoId] = useState<string>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('protect', useProtection ? "true" : "false");
        if (password) {
            formData.append("pass", password);
        }
        formData.append('video', video as File);
        formData.append('allowedSites', JSON.stringify(allowedSites));
        console.log(formData);
        try {
            const response = await axios.post('http://localhost:8000/api/v1/video/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(progress);
                },
            });

            console.log(response.data.fileId);
            setVideoId(response.data.fileId);
            const interval = setInterval(async () => {
                const proResponse = await axios.get(`http://localhost:8000/api/v1/video/trStatus/${response.data.fileId}`);
                const progress = proResponse.data;
                if (progress.status === "FINISHED") {
                    clearInterval(interval);
                    setTimeout(() => { setUploadProgress(-1) }, 2000);
                } else if (progress.status === "QUEUED") {
                    setTranscodeText("Queued")
                } else if (progress.status === "TRANSCODING") {
                    setTranscodeText(`${progress.progress.quality} |${progress.progress.progress}% `)
                } else {
                    setTranscodeText("Undefined Behaviour");
                }
            }, 1000)
            console.log('Upload successful:', response.data);
        } catch (error) {
            console.error('Error uploading the video:', error);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white opacity-80 filter backdrop-blur-lg rounded-lg shadow-lg">
            {uploadProgress === 100 && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-5 rounded shadow-lg">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Transcoding <RingLoader size={20} />
                        </h1>
                        <p className='text-lg text-center'>{transcodeText}</p>
                    </div>
                </div>
            )}
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Upload a Video</h1>
            <form onSubmit={handleSubmit}>
                {/* Title Input */}
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
                    <input
                        type="text"
                        id="title"
                        className="w-full bg-gray-100 px-3 py-2 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* Description Textarea */}
                <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea
                        id="description"
                        className="w-full px-3 py-2 border bg-gray-100 border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        required
                    ></textarea>
                </div>
                {/* Allowed Sites Textarea */}
                <div className="mb-4">
                    <label htmlFor="allowedSites" className="block text-gray-700 font-medium mb-2">Allowed Sites</label>
                    <textarea
                        id="allowedSites"
                        className="w-full px-3 py-2 border bg-gray-100 border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                            const val = e.target.value.trim()
                            if (val.length > 0) {
                                setAllowedSites(val.split(","))
                            }
                        }}
                        rows={2}
                        required
                    ></textarea>
                </div>

                {/* Use Protection Checkbox */}
                <div className="mb-4 gap-x-2">
                    <Checkbox id='protectVideo' className='mr-1' onCheckedChange={e => setUseProtection(e as boolean)} />
                    <label htmlFor="protectVideo" className="text-gray-700 font-medium">Protect Video</label>
                </div>
                {/* Password Input */}
                {
                    useProtection && (
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
                            <input
                                type="password"
                                id="password"
                                className="w-full bg-gray-100 px-3 py-2 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    )
                }
                {/* Video File Input */}
                <div className="mb-4">
                    <label htmlFor="video" className="block text-gray-700 font-medium mb-2">Select Video</label>
                    <input
                        type="file"
                        id="video"
                        accept="video/*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => e.target.files && setVideo(e.target.files[0])}
                        required
                    />
                </div>
                {uploadProgress > 0 && (
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Upload Progress</label>
                        <div className="w-full bg-gray-200 rounded-full">
                            <div
                                className="bg-blue-500 text-xs leading-none py-1 text-center text-white rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                            >
                                {uploadProgress}%
                            </div>
                        </div>
                    </div>
                )}
                {uploadProgress < 0 && (
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Transcode Progress</label>
                        <div className="w-full bg-gray-200 rounded-full gap-y-4">
                            <div
                                className="bg-blue-500 text-xs leading-none py-1 text-center text-white rounded-full"
                                style={{ width: `100%` }}
                            >
                                Transcode Completed
                            </div>
                            <div>
                                Video Link: <Link href={`/watch/${videoId}`}>{`http://localhost:3000/watch/${videoId}`}</Link>
                            </div>
                        </div>
                    </div>
                )}
                {/* Submit Button */}
                <div className="text-right">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}

export default VideoUploadForm;
