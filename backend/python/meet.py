import google.auth
import sys
import os
import io
import pygame
import pyaudio
from six.moves import queue
from google.cloud import speech, translate_v2 as translate, texttospeech

sys.stdout.reconfigure(encoding="utf-8")
credentials, project = google.auth.default()

RATE = 16000
CHUNK = int(RATE / 10)

pygame.mixer.init()

if len(sys.argv) > 1:
    TARGET_LANGUAGE = sys.argv[1]
else:
    TARGET_LANGUAGE = "hi-IN"

ORIGINAL_LANGUAGE = "en-US"
print(f"Using target language: {TARGET_LANGUAGE}")


class MicrophoneStream:
    def __init__(self, rate, chunk):
        self.rate = rate
        self.chunk = chunk
        self.buff = queue.Queue()
        self.closed = True

    def __enter__(self):
        self.audio_interface = pyaudio.PyAudio()
        self.audio_stream = self.audio_interface.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=self.rate,
            input=True,
            frames_per_buffer=self.chunk,
            input_device_index=self.get_vb_cable_index(),
            stream_callback=self._fill_buffer,
        )
        self.closed = False
        return self

    def __exit__(self, type, value, traceback):
        self.audio_stream.stop_stream()
        self.audio_stream.close()
        self.closed = True
        self.buff.put(None)
        self.audio_interface.terminate()

    def _fill_buffer(self, in_data, frame_count, time_info, status_flags):
        self.buff.put(in_data)
        return None, pyaudio.paContinue

    def generator(self):
        while not self.closed:
            chunk = self.buff.get()
            if chunk is None:
                return
            yield chunk

    def get_vb_cable_index(self):
        for i in range(self.audio_interface.get_device_count()):
            device_info = self.audio_interface.get_device_info_by_index(i)
            if "VB-Audio Virtual Cable" in device_info.get("name", ""):
                return i
        raise ValueError("VB Cable not found. Ensure it's set up correctly.")


def translate_text(text, target_language):
    translate_client = translate.Client(credentials=credentials)
    result = translate_client.translate(text, target_language=target_language)
    return result["translatedText"]


def synthesize_speech_to_memory(text, language_code):
    client = texttospeech.TextToSpeechClient(credentials=credentials)
    input_text = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code=language_code,
        name=f"{language_code}-Standard-A"
    )
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
    response = client.synthesize_speech(input=input_text, voice=voice, audio_config=audio_config)
    return io.BytesIO(response.audio_content)

def play_audio_from_memory(audio_stream):
    audio_stream.seek(0)
    try:
        pygame.mixer.music.load(audio_stream, "mp3")
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            continue
    except pygame.error as e:
        print(f"Error playing audio: {e}")

# Process and translate recognized speech
def listen_print_loop(responses):
    last_transcript = None

    for response in responses:
        if not response.results:
            continue

        result = response.results[0]
        if not result.alternatives:
            continue

        transcript = result.alternatives[0].transcript.strip()

        if transcript != last_transcript and result.is_final:
            last_transcript = transcript
            print(f"Original: {transcript}")

            translated_text = translate_text(transcript, TARGET_LANGUAGE)
            print(f"Translated: {translated_text}".encode("utf-8", "ignore").decode("utf-8"))

            audio_stream = synthesize_speech_to_memory(translated_text, TARGET_LANGUAGE)
            play_audio_from_memory(audio_stream)

        if "exit" in transcript.lower():
            print("Exiting...")
            break

# Main function to start mic stream
def main():
    client = speech.SpeechClient(credentials=credentials)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=RATE,
        language_code=ORIGINAL_LANGUAGE,
    )
    streaming_config = speech.StreamingRecognitionConfig(
        config=config,
        interim_results=True,
    )

    with MicrophoneStream(RATE, CHUNK) as stream:
        audio_generator = stream.generator()
        requests = (speech.StreamingRecognizeRequest(audio_content=chunk) for chunk in audio_generator)

        responses = client.streaming_recognize(config=streaming_config, requests=requests)
        listen_print_loop(responses)

if __name__ == "__main__":
    main()
