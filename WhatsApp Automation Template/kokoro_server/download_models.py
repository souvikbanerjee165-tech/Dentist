import os
import sys
import urllib.request
import time

MODELS_DIR = os.path.dirname(os.path.abspath(__file__)) + '/models'
os.makedirs(MODELS_DIR, exist_ok=True)

FILES = [
    (
        'voices-v1.0.bin',
        'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin'
    ),
    (
        'kokoro-v1.0.onnx',
        'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx'
    )
]

def download_file(filename, url):
    dest = os.path.join(MODELS_DIR, filename)
    if os.path.exists(dest) and os.path.getsize(dest) > 1000000:
        print(f'[Kokoro Downloader] {filename} already exists ({os.path.getsize(dest) / 1024 / 1024:.1f} MB).')
        return dest

    print(f'[Kokoro Downloader] Downloading {filename} from {url}...')
    start_time = time.time()
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
        total_size = int(response.headers.get('Content-Length', 0))
        downloaded = 0
        chunk_size = 1024 * 1024 # 1MB chunks

        while True:
            chunk = response.read(chunk_size)
            if not chunk:
                break
            out_file.write(chunk)
            downloaded += len(chunk)
            if total_size > 0:
                percent = (downloaded / total_size) * 100
                speed = (downloaded / (time.time() - start_time + 0.001)) / 1024 / 1024
                sys.stdout.write(f'\r--> {filename}: {percent:.1f}% ({downloaded / 1024 / 1024:.1f}/{total_size / 1024 / 1024:.1f} MB) at {speed:.1f} MB/s')
                sys.stdout.flush()

    print(f'\n[Kokoro Downloader] {filename} downloaded successfully in {time.time() - start_time:.1f}s.')
    return dest

if __name__ == '__main__':
    for fname, url in FILES:
        download_file(fname, url)
    print('[Kokoro Downloader] All Kokoro assets downloaded successfully!')
