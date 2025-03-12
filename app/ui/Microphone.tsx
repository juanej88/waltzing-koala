'use client';

import { useEffect, useState, useRef } from 'react';
import useSpotifyVolume from '@/app/hooks/useSpotifyVolume';

const Microphone = ({ accessToken }: { accessToken: string }) => {
  const [announcementType, setAnnouncementType] = useState<'quick' | 'long'>('quick');
  const { fadeSpotifyVolume } = useSpotifyVolume(accessToken);
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState<string | null>('null');
  const [outputDevice, setOutputDevice] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const startBroadcast = async (type: 'quick' | 'long') => {
    if (!selectedInput) return;

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedInput ? { exact: selectedInput } : undefined,
          echoCancellation: false, // Reduce processing delay
          noiseSuppression: false, // Avoid unnecessary filtering
          autoGainControl: false, // Mantain original volume
        },
      });

      setStream(newStream);

      // Initialise Web Audio API
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;
      const source = audioContext.createMediaStreamSource(newStream);
      const gainNode = audioContext.createGain(); // Allows volume control

      // Connect microphone input directly to speakers
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Store references
      sourceRef.current = source;
      gainNodeRef.current = gainNode;
      
      console.log('Broadcast started.');
    } catch (error) {
      console.error('Microphone access error:', error);
    }

    if (type === 'quick') {
      const res = await fadeSpotifyVolume(100, 40, 2400);
      console.log(res);
    } else {
      const res = await fadeSpotifyVolume(100, 0, 4000);
      console.log(res);
    }
  };

  const stopBroadcast = async (type: 'quick' | 'long') => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    console.log('Broadcast stopped.');

    if (type === 'quick') {
      const res = await fadeSpotifyVolume(40, 100, 2400);
      console.log(res);
    } else {
      const res = await fadeSpotifyVolume(0, 100, 4000);
      console.log(res);
    }
  };

  const toggleMicrophone = () => {
    stream ? stopBroadcast(announcementType) : startBroadcast(announcementType);
  };

  useEffect(() => {
    // Fetch available audio input devices
    let groupId = new Set();
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const mics = devices.filter(device => {
        if (!groupId.has(device.groupId)) {
          groupId.add(device.groupId);
          return device.kind === 'audioinput';
        }
      });
      setInputDevices(mics);
      // Default to first microphone
      if (mics.length > 0) {
        setSelectedInput(mics[0].deviceId);
      }
      // Fetch default audio output
      const speaker = devices.find(device => device.kind === 'audiooutput');
      setOutputDevice(speaker ? speaker.label.split('Default - ').join('') : 'Default System Speaker');
    }).catch(error => {
      console.log(error(`${error.name}: ${error.message}`));
    });
  }, []);

  return (
    <div>
      <h2>Microphone</h2>

      <p><small>Change the output manually in your system settings.</small></p>
      <p>Output: {outputDevice || 'Detecting...'}</p>

      <label htmlFor='mic-select'>Select Microphone:</label>
      <select
        id='mic-select'
        value={selectedInput || ''}
        onChange={(e) => setSelectedInput(e.target.value)}
      >
        {inputDevices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label.split('Default -').join('') || `Microphone ${device.deviceId}`}
          </option>
        ))}
      </select>
      
      <input 
        type='radio'
        id='quick-announcement'
        name='announcement'
        value='quick'
        checked={announcementType === 'quick'}
        onChange={() => setAnnouncementType('quick')}
        disabled={!!stream}
      />
      <label htmlFor='quick-announcement'>Quick Announcement</label>

      <input
        type='radio'
        id='long-announcement'
        name='announcement' 
        value='long'
        checked={announcementType === 'long'}
        onChange={() => setAnnouncementType('long')}
        disabled={!!stream}
      />
      <label htmlFor='long-announcement'>Large Announcement</label>

      <div>
        <button onClick={toggleMicrophone}>
          {!stream ? 'Start Talking' : 'Stop Talking'}
        </button>
      </div>
    </div>
  );
};

export default Microphone;
