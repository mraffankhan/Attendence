import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCw, UserCheck } from 'lucide-react';

const CameraMonitor = () => {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [detectedFaces, setDetectedFaces] = useState([]);
    const [statusMessage, setStatusMessage] = useState('Loading models...');

    // Demo registered faces
    const [labeledFaceDescriptors, setLabeledFaceDescriptors] = useState([]);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models'; // Models must be placed in public/models
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setIsModelLoaded(true);
                setStatusMessage('AI Models Loaded. Ready to start camera.');
            } catch (e) {
                console.error('Error loading models:', e);
                setStatusMessage('Error loading AI models. Please check if models exist in /public/models');
            }
        };
        loadModels();
    }, []);

    const startVideo = () => {
        setIsCapturing(true);
        setStatusMessage('Starting camera...');
        navigator.mediaDevices
            .getUserMedia({ video: { width: 720, height: 560 } })
            .then((stream) => {
                let video = videoRef.current;
                video.srcObject = stream;
                video.play();
                setStatusMessage('Camera Active. Monitoring...');
            })
            .catch((err) => {
                console.error('error:', err);
                setStatusMessage('Camera error: ' + err.message);
                setIsCapturing(false);
            });
    };

    const stopVideo = () => {
        setIsCapturing(false);
        let video = videoRef.current;
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach((track) => track.stop());
        }
        setStatusMessage('Camera stopped.');
        setDetectedFaces([]);
    };

    const handleVideoOnPlay = () => {
        if (!isModelLoaded) return;

        // In a real scenario, this would compare against labeled descriptors loaded from db.
        setInterval(async () => {
            if (videoRef.current && isCapturing) {
                const detections = await faceapi
                    .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                setDetectedFaces(detections);

                if (detections.length > 0) {
                    // Here we would match faces and mark attendance via Supabase.
                    // For now, we just indicate faces found.
                }
            }
        }, 1000); // scan every second
    };

    return (
        <div className="main-content">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Class Monitor</h1>
                    <p className="page-description">AI Camera Attendance Monitoring</p>
                </div>
                <div>
                    {!isCapturing ? (
                        <button className="btn btn-primary" onClick={startVideo} disabled={!isModelLoaded}>
                            <Camera size={18} />
                            Start Monitoring
                        </button>
                    ) : (
                        <button className="btn" style={{ backgroundColor: 'var(--error-color)', color: 'white' }} onClick={stopVideo}>
                            Stop
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-6">
                <div className="card" style={{ flex: 1 }}>
                    <div className="flex justify-between items-center mb-4">
                        <h3>Live Feed</h3>
                        <span className={`text-sm ${isCapturing ? 'text-success' : 'text-secondary'}`} style={{ color: isCapturing ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                            {statusMessage}
                        </span>
                    </div>

                    <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: 'black', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            onPlay={handleVideoOnPlay}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </div>

                <div className="card" style={{ width: '300px' }}>
                    <h3>Detected Students</h3>
                    <p className="page-description mt-2 mb-4">
                        {detectedFaces.length} face(s) currently detected.
                    </p>

                    <div className="flex flex-col gap-3 mt-4">
                        {detectedFaces.map((face, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 glass-panel" style={{ background: 'var(--surface-color-light)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserCheck size={16} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500 }}>Unknown Student {index + 1}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--success-color)' }}>Present</div>
                                </div>
                            </div>
                        ))}

                        {detectedFaces.length === 0 && (
                            <div className="text-secondary text-center py-4">
                                No students detected
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CameraMonitor;
