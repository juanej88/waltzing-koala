'use client';

import { useEffect, useState, useRef } from 'react';

const Microphone = () => {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState<string | null>('null');
  const [outputDevice, setOutputDevice] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startBroadcast = async () => {
    if (!selectedInput) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedInput ? { exact: selectedInput } : undefined },
      });

      setStream(stream);

      // Create an audio element to play the microphone stream
      const audioElement = new Audio();
      audioElement.srcObject = stream;
      audioElement.autoplay = true;
      audioRef.current = audioElement;

      console.log('Broadcast started.');
    } catch (error) {
      console.error('Microphone access error:', error);
    }
  };

  const stopBroadcast = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }
    console.log('Broadcast stopped.');
  };

  const toggleMicrophone = () => {
    stream ? stopBroadcast() : startBroadcast();
  };

  useEffect(() => {
    // Fetch available audio input devices and the default output device
    let groupId = new Set();
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const mics = devices.filter(device => {
        if (!groupId.has(device.groupId)) {
          groupId.add(device.groupId);
          return device.kind === 'audioinput';
        }
      });
      setInputDevices(mics);

      const speaker = devices.find(device => device.kind === 'audiooutput');
      setOutputDevice(speaker ? speaker.label.split('Default - ').join('') : 'Default System Speaker');

      if (mics.length > 0) {
        setSelectedInput(mics[0].deviceId); // Default to first microphone
      }
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

      <div>
        <button onClick={toggleMicrophone}>
          {!stream ? 'Start Broadcast' : 'Stop Broadcast'}
        </button>
      </div>
    </div>
  );
};

export default Microphone;
