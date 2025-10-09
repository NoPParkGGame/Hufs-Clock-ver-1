import json
import os
from datetime import datetime

# 크롤링 모듈 임포트 (test_crawling.py의 로직 사용)
import requests
from bs4 import BeautifulSoup

# Selenium 추가
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

def crawl_schedule():
    """학사일정 크롤링"""
    base_url = "https://www.hufs.ac.kr/hufs/index.do#section4"
    domain = "https://www.hufs.ac.kr"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        # 메인 페이지에서 학사일정 링크 추출
        response = requests.get(base_url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        schedule_link = soup.select_one('#top_k2wiz_GNB_11360')
        if not schedule_link:
            raise ValueError("학사일정 링크를 찾을 수 없습니다.")

        # 학사일정 페이지 크롤링
        schedule_url = domain + schedule_link['href']
        schedule_response = requests.get(schedule_url, headers=headers)
        schedule_response.raise_for_status()
        
        schedule_soup = BeautifulSoup(schedule_response.text, 'html.parser')
        content_wrap = schedule_soup.find('div', class_='wrap-contents')
        
        if not content_wrap:
            raise ValueError("학사일정 내용을 찾을 수 없습니다.")
        
        # 학사일정 추출
        schedule_dates = _extract_schedule_dates(content_wrap.find_all('li'))
        print("학사일정 크롤링 성공")
        return schedule_dates

    except Exception as e:
        print(f"학사일정 크롤링 실패: {e}")
        # 기본 일정 반환
        return {
            'first_start': "03.04",
            'first_end': "06.20",
            'second_start': "09.01",
            'second_end': "12.19"
        }

def _extract_schedule_dates(content_list):
    """
    학사일정 리스트에서 날짜 정보 추출
    """
    schedule_dates = {
        'first_start': None,   # 1학기 개강일
        'first_end': None,     # 1학기 종강일
        'second_start': None,  # 2학기 개강일
        'second_end': None     # 2학기 종강일
    }
    
    for item in content_list:
        date_elems = item.find_all('p', class_='list-date')
        event_elems = item.find_all('p', class_='list-content')
        
        for date, event in zip(date_elems, event_elems):
            date_str = date.get_text(strip=True).split('~')[-1].strip()
            event_str = event.get_text(strip=True)
            
            # 주요 학사일정 매칭
            if '제1학기 개강' in event_str:
                schedule_dates['first_start'] = date_str
            elif '제1학기 기말시험' in event_str:
                schedule_dates['first_end'] = date_str
            elif '제2학기 개강' in event_str:
                schedule_dates['second_start'] = date_str
            elif '제2학기 기말시험' in event_str:
                schedule_dates['second_end'] = date_str
                
    return schedule_dates

def crawl_notices():
    """공지사항 크롤링"""
    base_url = "https://www.hufs.ac.kr/hufs/11281/subview.do"
    domain = "https://www.hufs.ac.kr"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        # 공지사항 페이지 요청
        response = requests.get(base_url, headers=headers)
        response.raise_for_status()
        
        # HTML 파싱
        soup = BeautifulSoup(response.text, 'html.parser')
        notice_rows = soup.find_all('tr', class_='')
        
        # 공지사항 정보 추출
        notices = []
        for row in notice_rows[:10]:  # 최근 10개
            notice_info = _extract_notice_info(row, domain)
            if notice_info:
                notices.append(notice_info)
        
        print("공지사항 크롤링 성공")
        return notices

    except requests.RequestException as e:
        print(f"공지사항 크롤링 실패: {e}")
        return []

def _extract_notice_info(row, domain):
    """
    공지사항 행에서 정보 추출
    """
    title_td = row.find('td', class_='td-subject')
    date_td = row.find('td', class_='td-date')
    writer_td = row.find('td', class_='td-write')
    
    if not (title_td and date_td):
        return None
        
    link_tag = title_td.find('a')
    if not link_tag:
        return None
        
    # 공지사항 정보 추출
    link = link_tag.get('href', '')
    title = (link_tag.find('strong') or link_tag).text.strip()
    full_date = date_td.text.strip()
    date = '.'.join(full_date.split('.')[1:3])  # MM.DD 형식으로 변환
    writer = writer_td.text.strip() if writer_td else ''
    
    return {
        'date': date,
        'title': title,
        'writer': writer,
        'link': domain + link if link else ''
    }


def crawl_meals():
    """급식 크롤링 - Selenium 사용"""
    base_url = "https://www.hufs.ac.kr/hufs/11318/subview.do"

    try:
        print("급식 크롤링 시작...")

        # Chrome 옵션 설정
        options = Options()
        options.add_argument('--headless')  # 브라우저 창 숨기기
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')

        # ChromeDriver 설정
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)

        # 페이지 접속
        driver.get(base_url)

        # JavaScript 로딩 대기
        wait = WebDriverWait(driver, 10)
        menu_div = wait.until(
            EC.presence_of_element_located((By.ID, "menuTableDiv"))
        )

        # 추가 대기
        time.sleep(2)

        # 페이지 소스 파싱
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')

        meal_table = soup.find('div', class_='detail', id='menuTableDiv')
        if not meal_table:
            driver.quit()
            return []

        # tr 태그 파싱
        meal_rows = meal_table.find_all('tr')

        meals = []
        for row in meal_rows:
            th = row.find('th')
            tds = row.find_all('strong', class_='point')
            tp = row.find_all('p', class_='pay')

            if th and tds and tp:
                meal_time = th.get_text(strip=True)
                # 요일별 메뉴 (월화수목금토일)
                menus = [td.get_text(strip=True) for td in tds[:7]]
                # 요일별 가격
                prices = [p.get_text(strip=True) for p in tp[:7]]

                meals.append({
                    'time': meal_time,
                    'menus': menus,
                    'prices': prices
                })

        driver.quit()
        print(f"급식 크롤링 성공: {len(meals)}개 식사 시간대")
        return meals

    except Exception as e:
        print(f"급식 크롤링 실패: {e}")
        try:
            driver.quit()
        except:
            pass
        return []



def main():
    try:
        print("HUFS 데이터 크롤링 및 로컬 저장 시작")

        # 학사일정 크롤링
        print("학사일정 크롤링 중...")
        schedule = crawl_schedule()
        schedule_data = {
            'timestamp': datetime.now().isoformat(),
            'schedule': schedule
        }

        # 공지사항 크롤링
        print("공지사항 크롤링 중...")
        notices = crawl_notices()
        notice_data = {
            'timestamp': datetime.now().isoformat(),
            'notices': notices
        }

        # 급식 크롤링
        print("급식 크롤링 중...")
        meals = crawl_meals()
        meal_data = {
            'timestamp': datetime.now().isoformat(),
            'meals': meals
        }

        # JSON 파일로 저장
        script_dir = os.path.dirname(os.path.abspath(__file__))

        with open(os.path.join(script_dir, 'schedule_cache.json'), 'w', encoding='utf-8') as f:
            json.dump(schedule_data, f, ensure_ascii=False, indent=2)

        with open(os.path.join(script_dir, 'notice_cache.json'), 'w', encoding='utf-8') as f:
            json.dump(notice_data, f, ensure_ascii=False, indent=2)

        with open(os.path.join(script_dir, 'meal_cache.json'), 'w', encoding='utf-8') as f:
            json.dump(meal_data, f, ensure_ascii=False, indent=2)

        print("[SUCCESS] 데이터 저장 완료!")
        print("=== 크롤링된 학사일정 ===")
        print(json.dumps(schedule, ensure_ascii=False, indent=2))
        print(f"\n공지사항: {len(notices)}개 크롤링됨")
        print("=== 크롤링된 공지사항 목록 ===")

        for i, notice in enumerate(notices, 1):
            print(f"{i}. [{notice['date']}] {notice['title']}")
            print(f"   작성자: {notice.get('writer', 'N/A')}")
            print(f"   링크: {notice['link']}")
            print("")
        
        print(f"\n급식: {len(meals)}개 식사 시간대 크롤링됨")
        print("=== 크롤링된 급식 목록 ===")
        for i, meal in enumerate(meals, 1):
            print(f"{i}. {meal['time']}")
            days = ['월', '화', '수', '목', '금', '토', '일']

            for j, (menu, price) in enumerate(zip(meal['menus'][:7], meal['prices'][:7])):
                if menu and '등록된 메뉴가 없습니다' not in menu and price:
                    print(f"   {days[j]}: {menu[:30]} ({price})")
            
            print("")
    except Exception as e:
        print(f"크롤링 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()