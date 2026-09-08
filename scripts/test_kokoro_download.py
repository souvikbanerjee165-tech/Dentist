import urllib.request
url_model_019 = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files/kokoro-v0_19.onnx'
url_voices_019 = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files/voices.bin'
try:
    with urllib.request.urlopen(urllib.request.Request(url_model_019, headers={'User-Agent': 'Mozilla/5.0'})) as r:
        print('0.19 model size:', r.headers.get('Content-Length'))
except Exception as e:
    print('0.19 model err:', e)
