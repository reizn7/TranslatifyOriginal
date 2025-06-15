from google.cloud import texttospeech
import io
import google.auth

credentials, project = google.auth.default()

import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key="AIzaSyAyQcDivAKpHJog5NEZqC1NsBjDVGotXss")

def synthesize_speech_to_memory(text, language_code="en-US", voice_name=None):
    """Converts text to speech and returns WAV audio content in memory."""
    client = texttospeech.TextToSpeechClient(credentials=credentials)

    input_text = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code=language_code, 
        name=voice_name or f"{language_code}-Standard-A"
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.LINEAR16  # <-- WAV format
    )

    response = client.synthesize_speech(
        input=input_text,
        voice=voice,
        audio_config=audio_config
    )

    return io.BytesIO(response.audio_content)

import pyaudio
import wave
import io

def play_wav_from_memory(wav_buffer: io.BytesIO, output_device_index=None):
    # Rewind the buffer to start
    wav_buffer.seek(0)

    # Open the WAV audio from memory
    wf = wave.open(wav_buffer, 'rb')

    # Initialize PyAudio
    p = pyaudio.PyAudio()

    # Open output stream (optionally to Voicemeeter)
    stream = p.open(format=p.get_format_from_width(wf.getsampwidth()),
                    channels=wf.getnchannels(),
                    rate=wf.getframerate(),
                    output=True,
                    output_device_index=output_device_index)

    # Play the WAV audio
    data = wf.readframes(1024)
    while data:
        stream.write(data)
        data = wf.readframes(1024)

    # Cleanup
    stream.stop_stream()
    stream.close()
    wf.close()
    p.terminate()


def gemini_response(transcript_list, query):
    if not transcript_list:
        print("No transcript available")
        return

    transcript_text = "\n".join(transcript_list)  # Combine all spoken text

    prompt = f"""
        You are MeetingPro, an AI meeting assistant designed to respond naturally and helpfully to queries made during online meetings.

        Respond to the following user query in a clear, concise, and friendly tone.

        If the query is casual, keep the response short and conversational.

        If the query is work-related or asks for specific help, give an appropriate, informative response, keeping it as short as possible.

        The user query language may be in any language, and your response should be in the same language as the query.
        
        User Query:

        {query}

        Your Response:
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    if response.text:
        summary = response.text.strip()
        # print("\n=== Minutes of Meeting ===\n")
        print(summary)
        return summary
    
        # Optionally, save the summary to a text file
        # with open("minutes_of_meeting.txt", "w") as file:
        #     file.write(summary)
        
        # print("Minutes of Meeting saved successfully!")
    else:
        print("Error generating MoM.")

def bot_response(transcript_list, query):
    buffer = synthesize_speech_to_memory(gemini_response(transcript_list, query), language_code="en-US")
    play_wav_from_memory(buffer, output_device_index=13) 

if __name__=="__main__":
    # Example usage
    transcript_list = ["Hello, how are you?", "What is the agenda for today?"]
    query = "हे नवप्रवर्तक क्या आप मुझे भारत की राजधानी बता सकते हैं?"

    bot_response(transcript_list, query)

