import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCw, UserCheck, CheckCircle, AlertCircle, Clock, MapPin, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

const CameraMonitor = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const slot = location.state?.slot;

    const videoRef = useRef();
    const canvasRef = useRef();
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Loading AI Models...');
    const [students, setStudents] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [presentStudents, setPresentStudents] = useState(new Set());
    const presentStudentsRef = useRef(new Set());
    const [lastDetected, setLastDetected] = useState(null);

    // Face Recognition matcher
    const [faceMatcher, setFaceMatcher] = useState(null);

    // Sync ref
    useEffect(() => {
        presentStudentsRef.current = presentStudents;
    }, [presentStudents]);

    useEffect(() => {
        if (!slot) {
            navigate('/admin/timetable');
            return;
        }
        loadModels();
        initializeSession();
    }, [slot]);

    const loadModels = async () => {
        try {
            const MODEL_URL = '/models';
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            setIsModelLoaded(true);
            setStatusMessage('Models ready. Fetching class roster...');
            fetchClassRoster();
        } catch (e) {
            console.error('Error loading models:', e);
            setStatusMessage('Error loading AI models. Check /public/models');
        }
    };

    const initializeSession = async () => {
        try {
            const { data } = await api.post('/attendance/session', {
                timetable_id: slot.id,
                course_id: slot.course_id,
                class_id: slot.class_id
            });
            setSessionId(data.id);
            // Fetch already present students
            const { data: attendance } = await api.get(`/attendance/session/${data.id}`);
            setPresentStudents(new Set(attendance.map(a => a.student_id)));
        } catch (err) {
            console.error('Session init error:', err);
        }
    };

    const fetchClassRoster = async () => {
        try {
            const { data } = await api.get(`/attendance/monitor/${slot.class_id}`);
            setStudents(data);

            // Create LabeledFaceDescriptors for matcher
            const labeledDescriptors = data
                .filter(s => s.face_descriptor)
                .map(s => {
                    let descriptorArray = s.face_descriptor;
                    if (typeof descriptorArray === 'string') {
                        try {
                            descriptorArray = JSON.parse(descriptorArray);
                            // Handle potential double-stringified JSON
                            if (typeof descriptorArray === 'string') {
                                descriptorArray = JSON.parse(descriptorArray);
                            }
                        } catch (e) {
                            console.error('Failed to parse face descriptor for student', s.id, e);
                        }
                    }
                    
                    // Bulletproof: if it's an object { "0": 0.1, "1": 0.2 ... } instead of Array
                    if (descriptorArray && typeof descriptorArray === 'object' && !Array.isArray(descriptorArray)) {
                        descriptorArray = Object.values(descriptorArray);
                    }

                    const desc = new Float32Array(descriptorArray);
                    return new faceapi.LabeledFaceDescriptors(String(s.id), [desc]);
                });

            if (labeledDescriptors.length > 0) {
                setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
                setStatusMessage('System Ready. Start camera to monitor.');
            } else {
                setStatusMessage('No students have Face IDs registered for this class.');
            }
        } catch (err) {
            console.error('Roster error:', err);
            setStatusMessage('Error fetching class roster.');
        }
    };

    const startVideo = () => {
        setIsCapturing(true);
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStatusMessage('Monitoring active...');
                }
            })
            .catch((err) => {
                console.error('Camera access error:', err);
                setStatusMessage('Camera error: ' + err.message);
                setIsCapturing(false);
            });
    };

    const stopVideo = () => {
        setIsCapturing(false);
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
        setStatusMessage('Monitoring stopped.');
    };

    useEffect(() => {
        let isRunning = true;

        const detectFaces = async () => {
            if (!isRunning || !isCapturing || !videoRef.current || !faceMatcher || !canvasRef.current) return;
            
            if (videoRef.current.readyState >= 2) {
                try {
                    const detections = await faceapi
                        .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
                        .withFaceLandmarks()
                        .withFaceDescriptors();

                    const displaySize = { width: videoRef.current.clientWidth, height: videoRef.current.clientHeight };
                    if (displaySize.width > 0 && displaySize.height > 0) {
                        faceapi.matchDimensions(canvasRef.current, displaySize);
                        const resizedDetections = faceapi.resizeResults(detections, displaySize);
                        
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                        
                        if (resizedDetections.length > 0) {
                            resizedDetections.forEach((detection) => {
                                const match = faceMatcher.findBestMatch(detection.descriptor);
                                const studentId = match.label;
                                
                                // Draw box
                                const student = students.find(s => s.id === studentId);
                                const boxLabel = match.label === 'unknown' ? 'Unknown' : (student ? student.full_name : match.label);
                                const drawBox = new faceapi.draw.DrawBox(detection.detection.box, { 
                                    label: boxLabel + ` (${Math.round(match.distance * 100)}%)`,
                                    boxColor: match.label === 'unknown' ? 'red' : 'green' 
                                });
                                drawBox.draw(canvasRef.current);

                                if (match.label !== 'unknown' && !presentStudentsRef.current.has(studentId)) {
                                    markAttendance(studentId);
                                }
                            });
                        }
                    }
                } catch (err) {
                    console.error('Detection error:', err);
                }
            }
            
            if (isRunning) {
                setTimeout(detectFaces, 500);
            }
        };

        if (isCapturing && faceMatcher) {
            detectFaces();
        }

        return () => {
            isRunning = false;
        };
    }, [isCapturing, faceMatcher, students]);

    const markAttendance = async (studentId) => {
        const student = students.find(s => s.id === studentId);
        try {
            await api.post('/attendance/mark', {
                session_id: sessionId,
                student_id: studentId,
                method: 'face_recognition',
                status: 'present'
            });
            
            setPresentStudents(prev => new Set([...prev, studentId]));
            setLastDetected(student);
            // Hide notification after 3 seconds
            setTimeout(() => setLastDetected(null), 3000);
        } catch (err) {
            console.error('Marking error:', err);
        }
    };

    return (
        <div className="main-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/admin/timetable')} className="btn-icon-outline" style={{ borderRadius: '50%' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title">Biometric Class Monitor</h1>
                        <p className="page-description" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} /> {slot?.start_time?.substring(0,5)} - {slot?.end_time?.substring(0,5)} | <MapPin size={14} /> {slot?.room}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {!isCapturing ? (
                        <button className="btn btn-primary" onClick={startVideo} disabled={!isModelLoaded || !faceMatcher}>
                            <Camera size={18} /> Start AI Scanner
                        </button>
                    ) : (
                        <button className="btn btn-outline" style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }} onClick={stopVideo}>
                            Stop Scanner
                        </button>
                    )}
                    <button 
                        className="btn btn-primary" 
                        style={{ background: 'var(--success-color)' }}
                        onClick={async () => {
                            stopVideo();
                            try {
                                await api.post('/attendance/finalize', { session_id: sessionId });
                                navigate('/admin/timetable', { state: { message: 'Session finalized and absentees marked!' } });
                            } catch (err) {
                                console.error('Finalize error:', err);
                                navigate('/admin/timetable', { state: { message: 'Attendance saved, but absentee finalization failed.' } });
                            }
                        }}
                    >
                        Finish & Submit
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '0.5rem', background: '#000', position: 'relative', minHeight: '500px', overflow: 'hidden' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <canvas
                        ref={canvasRef}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}
                    />
                    
                    {/* Status Overlay */}
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
                        <span className="badge" style={{ background: isCapturing ? 'var(--success-color)' : 'var(--warning-color)', color: 'white', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                            {isCapturing ? 'LIVE SCANNING' : 'SCANNER IDLE'}
                        </span>
                    </div>

                    {/* Detection Notification */}
                    {lastDetected && (
                        <div className="page-entrance" style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
                            <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.9)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem', borderRadius: '50px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                                <CheckCircle size={24} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{lastDetected.full_name}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>Attendance Marked Successfully</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isCapturing && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                            <Camera size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>{statusMessage}</p>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1rem' }}>Present Students</h3>
                            <span className="badge badge-blue">{presentStudents.size} / {students.length}</span>
                        </div>
                        
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {students.map(s => (
                                <div key={s.id} className="roster-item" style={{ opacity: presentStudents.has(s.id) ? 1 : 0.4 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {s.photo_url ? (
                                            <img src={`http://localhost:5000${s.photo_url}`} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-color-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <UserCheck size={16} />
                                            </div>
                                        )}
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500 }}>{s.full_name}</p>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{presentStudents.has(s.id) ? 'Present' : 'Not Detected'}</p>
                                        </div>
                                    </div>
                                    {presentStudents.has(s.id) && <CheckCircle size={14} style={{ color: 'var(--success-color)' }} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Session Info</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{slot?.course_name}</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Class: {slot?.class_name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CameraMonitor;
