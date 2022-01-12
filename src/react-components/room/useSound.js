import { useEffect, useRef, useCallback } from "react";
import { SourceType } from "../../components/audio-params";
import { useVolumeMeter } from "../misc/useVolumeMeter";

export function useSound({ scene, updateRate = 50, webmSrc, mp3Src, oggSrc, wavSrc }) {
  const audioSystem = scene.systems["hubs-systems"].audioSystem;
  const soundTimeoutRef = useRef();
  const audioElRef = useRef();
  const analyserRef = useRef(THREE.AudioContext.getContext().createAnalyser());
  const { volume, setAudioSource } = useVolumeMeter({ analyser: analyserRef.current, updateRate });

  useEffect(
    () => {
      const audio = document.createElement("audio");

      if (audio.canPlayType("audio/webm")) {
        audio.src = webmSrc;
      } else if (audio.canPlayType("audio/mpeg")) {
        audio.src = mp3Src;
      } else if (audio.canPlayType("audio/ogg")) {
        audio.src = oggSrc;
      } else {
        audio.src = wavSrc;
      }

      const audioCtx = THREE.AudioContext.getContext();
      const source = audioCtx.createMediaElementSource(audio);
      audioSystem.addAudio({ sourceType: SourceType.SFX, node: source });

      setAudioSource(source);
      audioElRef.current = audio;

      return () => {
        audioElRef.current.pause();
        audioElRef.current.currentTime = 0;
        setAudioSource(null);
      };
    },
    [audioSystem, setAudioSource, scene, webmSrc, mp3Src, oggSrc, wavSrc]
  );

  const playSound = useCallback(
    () => {
      const audio = audioElRef.current;

      if (audio) {
        audio.currentTime = 0;
        clearTimeout(soundTimeoutRef.current);
        audio.play();
      }
    },
    [audioElRef]
  );

  return { playSound, soundVolume: volume };
}
