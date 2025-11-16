"use client";

import { useEffect, useRef, useState } from "react";
import type { PlaylistItem, TriggerType } from "@/lib/generated/prisma";

interface TriggerDetectorProps {
  playlistItems: PlaylistItem[];
  currentIndex: number;
  onTrigger: (index: number) => void;
  enabled: boolean;
}

export default function TriggerDetector({
  playlistItems,
  currentIndex,
  onTrigger,
  enabled,
}: TriggerDetectorProps) {
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previousFrame, setPreviousFrame] = useState<ImageData | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Find the next video that should be triggered
  const getNextTriggerableIndex = () => {
    for (let i = currentIndex + 1; i < playlistItems.length; i++) {
      if (playlistItems[i].triggerType !== "NONE") {
        return i;
      }
    }
    // Loop back to start
    for (let i = 0; i <= currentIndex; i++) {
      if (playlistItems[i].triggerType !== "NONE") {
        return i;
      }
    }
    return -1;
  };

  // Keyboard trigger
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      console.log("Key pressed:", event.key);

      // Find any video with a matching keyboard trigger
      for (let i = 0; i < playlistItems.length; i++) {
        const item = playlistItems[i];
        if (item.triggerType === "KEYBOARD" && item.triggerConfig) {
          const config = item.triggerConfig as { key?: string };
          console.log(`Checking item ${i}: triggerType=${item.triggerType}, key=${config.key}`);
          if (config.key && event.key === config.key) {
            console.log(`Match found! Triggering video at index ${i}`);
            onTrigger(i);
            return;
          }
        }
      }
      console.log("No matching keyboard trigger found");
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [enabled, playlistItems, onTrigger]);

  // Click trigger
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      console.log("Click detected at:", event.clientX, event.clientY);

      // Find any video with a matching click trigger
      for (let i = 0; i < playlistItems.length; i++) {
        const item = playlistItems[i];
        if (item.triggerType === "CLICK") {
          const config = item.triggerConfig as { x?: number; y?: number } | null;

          // If no specific coordinates, trigger on any click
          if (!config || (config.x === undefined && config.y === undefined)) {
            console.log(`Match found! Triggering video at index ${i} (any click)`);
            onTrigger(i);
            return;
          }

          // Check if click is within tolerance of target coordinates
          const tolerance = 50; // pixels
          if (config.x !== undefined && config.y !== undefined) {
            const distance = Math.sqrt(
              Math.pow(event.clientX - config.x, 2) + Math.pow(event.clientY - config.y, 2)
            );
            if (distance <= tolerance) {
              console.log(`Match found! Triggering video at index ${i} (coordinates match)`);
              onTrigger(i);
              return;
            }
          }
        }
      }
      console.log("No matching click trigger found");
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [enabled, playlistItems, onTrigger]);

  // Webcam motion detection
  useEffect(() => {
    if (!enabled) return;

    // Find the first video with a webcam trigger
    let webcamItemIndex = -1;
    let webcamItem = null;
    for (let i = 0; i < playlistItems.length; i++) {
      if (playlistItems[i].triggerType === "WEBCAM") {
        webcamItemIndex = i;
        webcamItem = playlistItems[i];
        break;
      }
    }

    if (!webcamItem || webcamItemIndex === -1) return;

    const config = webcamItem.triggerConfig as { sensitivity?: number } | null;
    const sensitivity = config?.sensitivity || 50;

    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // Create hidden video element
        const video = document.createElement("video");
        video.srcObject = stream;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        webcamRef.current = video;

        // Create canvas for motion detection
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 240;
        canvasRef.current = canvas;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        video.onloadedmetadata = () => {
          const detectMotion = () => {
            if (!ctx || !webcamRef.current || !canvasRef.current) return;

            ctx.drawImage(webcamRef.current, 0, 0, canvas.width, canvas.height);
            const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

            if (previousFrame) {
              let diff = 0;
              for (let i = 0; i < currentFrame.data.length; i += 4) {
                diff += Math.abs(currentFrame.data[i] - previousFrame.data[i]);
              }

              const avgDiff = diff / (currentFrame.data.length / 4);
              const threshold = (100 - sensitivity) * 2; // Invert sensitivity

              if (avgDiff > threshold) {
                console.log("Motion detected!", avgDiff, "threshold:", threshold);
                onTrigger(webcamItemIndex);
                // Stop after triggering
                return;
              }
            }

            setPreviousFrame(currentFrame);
            animationFrameRef.current = requestAnimationFrame(detectMotion);
          };

          detectMotion();
        };
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, playlistItems, onTrigger, previousFrame]);

  // Microphone sound detection
  useEffect(() => {
    if (!enabled) return;

    // Find the first video with a microphone trigger
    let micItemIndex = -1;
    let micItem = null;
    for (let i = 0; i < playlistItems.length; i++) {
      if (playlistItems[i].triggerType === "MICROPHONE") {
        micItemIndex = i;
        micItem = playlistItems[i];
        break;
      }
    }

    if (!micItem || micItemIndex === -1) return;

    const config = micItem.triggerConfig as { threshold?: number } | null;
    const threshold = config?.threshold || 50;

    let stream: MediaStream | null = null;

    const startMicrophone = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          const volumeThreshold = (threshold / 100) * 255;

          if (average > volumeThreshold) {
            console.log("Sound detected!", average, "threshold:", volumeThreshold);
            onTrigger(micItemIndex);
            // Stop after triggering
            return;
          }

          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    startMicrophone();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, playlistItems, onTrigger]);

  return null; // This component doesn't render anything
}
