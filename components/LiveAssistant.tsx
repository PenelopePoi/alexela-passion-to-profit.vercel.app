
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X, Activity, Volume2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

interface LiveAssistantProps {
    className?: string;
}

export const LiveAssistant: React.FC<LiveAssistantProps> = ({ className }) => {
    const [isActive, setIsActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [volume, setVolume] = useState(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const currentSessionRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Use refs for audio tracking to persist across renders and ensure smooth playback
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const stopSession = () => {
        if (currentSessionRef.current) {
            currentSessionRef.current.close();
            currentSessionRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        setIsActive(false);
        setIsConnecting(false);
        setVolume(0);
        nextStartTimeRef.current = 0;
        sourcesRef.current.clear();
    };

    const startSession = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = outputAudioContext;

            const outputNode = outputAudioContext.createGain();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                    systemInstruction: 'You are a helpful, expert brand strategist assistant. Keep your answers concise, professional, and encouraging. You are helping the user build a brand package for their new business.',
                },
                callbacks: {
                    onopen: () => {
                        console.log('Gemini Live Connected');
                        setIsConnecting(false);
                        setIsActive(true);

                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            let sum = 0;
                            for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                            setVolume(Math.sqrt(sum / inputData.length) * 10);

                            const pcmBlob = createBlob(inputData);
                            // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ audio: pcmBlob });
                            });
                        };

                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        
                        if (base64Audio) {
                            // Schedule next chunk for gapless playback
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                            
                            const audioBuffer = await decodeAudioData(
                                decode(base64Audio),
                                outputAudioContext,
                                24000,
                                1
                            );

                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.connect(outputAudioContext.destination);

                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            for (const source of sourcesRef.current.values()) {
                                source.stop();
                                sourcesRef.current.delete(source);
                            }
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onclose: () => {
                        stopSession();
                    },
                    onerror: (e) => {
                        console.error('Gemini Live Error', e);
                        setError("Connection error");
                        stopSession();
                    }
                }
            });

            sessionPromiseRef.current = sessionPromise;
            sessionPromise.then(s => currentSessionRef.current = s);

        } catch (e) {
            setError("Could not access microphone");
            setIsConnecting(false);
        }
    };

    function createBlob(data: Float32Array): Blob {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    }

    function decode(base64: string) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    function encode(bytes: Uint8Array) {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    async function decodeAudioData(
        data: Uint8Array,
        ctx: AudioContext,
        sampleRate: number,
        numChannels: number,
    ): Promise<AudioBuffer> {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
            }
        }
        return buffer;
    }

    if (!isActive && !isConnecting) {
        return (
            <button 
                onClick={startSession}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group ${className} bg-gradient-to-tr from-forest-800 to-forest-600 text-white`}
                title="Start Voice Assistant"
            >
                <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse-slow"></div>
                <Mic size={24} />
                <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-stone-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Chat with AI
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
            <div className="bg-stone-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-6 w-80 flex flex-col items-center gap-4 text-white">
                <div className="flex w-full justify-between items-start">
                    <div className="flex items-center gap-2 text-forest-300 text-sm font-bold uppercase tracking-widest">
                        <Activity size={14} className={isActive ? "animate-pulse" : ""} />
                        Live Assistant
                    </div>
                    <button onClick={stopSession} className="text-stone-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="w-24 h-24 rounded-full bg-forest-900/50 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border border-forest-500/30" style={{ transform: `scale(${1 + volume * 0.5})`, transition: 'transform 0.1s' }}></div>
                    <div className="absolute inset-2 rounded-full border border-forest-400/30" style={{ transform: `scale(${1 + volume * 0.3})`, transition: 'transform 0.1s' }}></div>
                    
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-forest-500 to-forest-300 flex items-center justify-center shadow-lg shadow-forest-500/20 z-10">
                        {isConnecting ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Volume2 size={24} className="text-white" />
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-sm font-medium text-stone-200">
                        {isConnecting ? "Connecting to Gemini..." : "Listening..."}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                        Say "Help me with my slogan" or "Critique my logo"
                    </p>
                </div>

                <button 
                    onClick={stopSession}
                    className="w-full py-2 bg-stone-800 hover:bg-red-900/50 text-stone-300 hover:text-red-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                    <MicOff size={12} /> End Session
                </button>
            </div>
            {error && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-red-500 text-white text-xs p-2 rounded text-center">
                    {error}
                </div>
            )}
        </div>
    );
};
