import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { transcribeAudio } from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
    onTranscriptionComplete: (text: string) => void;
}

export function AudioRecorder({ onTranscriptionComplete }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                setIsProcessing(true);
                try {
                    // Check file size (approximate)
                    if (blob.size > 25 * 1024 * 1024) {
                        throw new Error("Recording is too long (max 25MB)");
                    }

                    const result = await transcribeAudio(blob);
                    if (result && result.text) {
                        onTranscriptionComplete(result.text);
                        toast({ title: "Transcription complete" });
                    } else {
                        throw new Error("No transcription text returned");
                    }
                } catch (error) {
                    console.error("Transcription failed:", error);
                    toast({
                        title: "Transcription failed",
                        description: error instanceof Error ? error.message : "Please check your microphone and API key.",
                        variant: "destructive"
                    });
                } finally {
                    setIsProcessing(false);
                    // Stop all tracks to release microphone
                    stream.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setElapsed(0);
            timerRef.current = window.setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Microphone access denied:", error);
            toast({ title: "Microphone access denied", variant: "destructive" });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center gap-2">
            {isProcessing ? (
                <Button disabled variant="outline" className="gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                </Button>
            ) : isRecording ? (
                <Button onClick={stopRecording} variant="destructive" className="gap-2 animate-pulse">
                    <Square className="h-4 w-4 fill-current" />
                    Stop ({formatTime(elapsed)})
                </Button>
            ) : (
                <Button onClick={startRecording} variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                    <Mic className="h-4 w-4 text-primary" />
                    Record Sermon
                </Button>
            )}
        </div>
    );
}
