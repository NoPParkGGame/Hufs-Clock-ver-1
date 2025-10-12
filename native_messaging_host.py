#!/usr/bin/env python3
# native_messaging_host.py

import json
import sys
import struct
import subprocess
import os
import logging

# 로깅 설정
import logging.handlers
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
# UTF-8로 로그 파일 작성
file_handler = logging.FileHandler('native_messaging_host.log', encoding='utf-8')
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logging.getLogger().addHandler(file_handler)

def send_message(message):
    """Chrome 확장 프로그램으로 메시지 전송"""
    message_json = json.dumps(message, ensure_ascii=False)
    sys.stdout.buffer.write(struct.pack('<I', len(message_json.encode('utf-8'))))
    sys.stdout.buffer.write(message_json.encode('utf-8'))
    sys.stdout.buffer.flush()

def read_message():
    """Chrome 확장 프로그램으로부터 메시지 수신"""
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        sys.exit(0)
    message_length = struct.unpack('<I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

def main():
    try:
        logging.info("Native messaging host 시작")
        
        # 메시지 수신
        message = read_message()
        logging.info(f"메시지 수신: {message}")
        
        # 메시지 처리
        action = message.get('action', 'update_cache')
        
        if action == 'update_notices':
            script_args = ['notices']
        else:
            script_args = []  # 전체 크롤링
        
        # 크롤링 실행
        script_dir = os.path.dirname(os.path.abspath(__file__))
        update_script = os.path.join(script_dir, 'update_cache.py')
        logging.info(f"크롤링 스크립트 실행: {update_script} with args: {script_args}")

        result = subprocess.run([sys.executable, update_script] + script_args,
                              capture_output=True, text=True, cwd=script_dir, encoding='cp949', errors='replace')

        if result.returncode == 0:
            logging.info("스크립트 실행 성공")
            
            # 일반 크롤링의 경우
            send_message({
                "success": True,
                "message": "크롤링 완료",
                "output": result.stdout.strip()
            })
        else:
            logging.error(f"스크립트 실행 실패: {result.stderr.strip()}")
            send_message({
                "success": False,
                "error": result.stderr.strip()
            })

    except Exception as e:
        logging.error(f"예상치 못한 오류: {str(e)}")
        send_message({"success": False, "error": f"예상치 못한 오류: {str(e)}"})

if __name__ == "__main__":
    main()