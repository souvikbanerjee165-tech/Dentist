import os
import soundfile as sf
from kokoro_onnx import Kokoro

models_dir = os.path.join(os.getcwd(), 'kokoro_server', 'models')
model_path = os.path.join(models_dir, 'kokoro-v1.0.onnx')
voices_path = os.path.join(models_dir, 'voices-v1.0.bin')

print('Loading Kokoro model...')
kokoro = Kokoro(model_path, voices_path)
voices = kokoro.get_voices()
print(f'Model loaded successfully! Found {len(voices)} voices. Sample voices: {voices[:10]}')

test_text = "Hello! Thank you for calling St. James Dental Practice. I am Dr. Sarah's AI receptionist. How can I help you today?"
print(f'Synthesizing test speech: "{test_text}"...')
samples, sample_rate = kokoro.create(test_text, voice='bf_emma', speed=1.0, lang='en-gb')
out_wav = os.path.join(models_dir, 'test_output.wav')
sf.write(out_wav, samples, sample_rate)
print(f'Synthesis succeeded! Output written to {out_wav} ({os.path.getsize(out_wav)} bytes, sample rate: {sample_rate}Hz)')
