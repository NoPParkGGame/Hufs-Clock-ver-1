from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from bs4 import BeautifulSoup


def crawl_meals():
    """급식 크롤링 - Selenium 사용"""
    base_url = "https://www.hufs.ac.kr/hufs/11318/subview.do"

    try:
        print("=== HUFS 급식 크롤링 시작 (Selenium) ===")

        # Chrome 옵션 설정
        options = Options()
        options.add_argument('--headless')  # 브라우저 창 숨기기
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')

        # ChromeDriver 경로 설정 (자동 다운로드)
        from selenium.webdriver.chrome.service import Service
        from webdriver_manager.chrome import ChromeDriverManager

        # webdriver-manager 설치 필요
        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        except ImportError:
            print("❌ webdriver-manager가 설치되지 않았습니다.")
            print("설치 명령어: pip install webdriver-manager")
            return []

        print("✅ ChromeDriver 준비 완료")

        # 페이지 접속
        driver.get(base_url)
        print("✅ 페이지 접속 완료")

        # JavaScript 로딩 대기 (최대 10초)
        wait = WebDriverWait(driver, 10)

        try:
            # menuTableDiv가 로드될 때까지 대기
            menu_div = wait.until(
                EC.presence_of_element_located((By.ID, "menuTableDiv"))
            )
            print("✅ menuTableDiv 로드 완료")
        except:
            print("❌ menuTableDiv를 찾을 수 없습니다.")
            driver.quit()
            return []

        # 추가 대기 (급식 데이터 로딩)
        time.sleep(2)

        # 페이지 소스 가져오기
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')

        # menuTableDiv 찾기
        meal_table = soup.find('div', class_='detail', id='menuTableDiv')
        if not meal_table:
            print("❌ menuTableDiv 파싱 실패")
            driver.quit()
            return []

        # tr 태그 찾기
        meal_rows = meal_table.find_all('tr')
        print(f"✅ tr 태그 개수: {len(meal_rows)}")

        # 결과 출력
        meals = []
        for i, row in enumerate(meal_rows[:5]):  # 처음 5개만
            th = row.find('th')
            tds = row.find_all('strong', class_='point')
            tp = row.find_all('p', class_='pay')

            if th and tds and tp:
                meal_time = th.get_text(strip=True)
                print(f"\n{i+1}. {meal_time}")

                # 각 요일별 메뉴 출력 (월화수목금토일)
                days = ['월', '화', '수', '목', '금', '토', '일']
                for j, (td, p) in enumerate(zip(tds[:7], tp[:7])):
                    menu_text = td.get_text(strip=True)
                    price_text = p.get_text(strip=True)
                    if menu_text and '등록된 메뉴가 없습니다' not in menu_text and price_text:
                        print(f"  {days[j]}: {menu_text[:50]} ({price_text})")

                meals.append({
                    'time': meal_time,
                    'menus': [td.get_text(strip=True) for td in tds[:7]],
                    'prices': [p.get_text(strip=True) for p in tp[:7]]
                })

        driver.quit()
        print(f"\n🎉 총 {len(meals)}개 식사 시간대 크롤링 완료!")
        return meals

    except Exception as e:
        print(f"❌ Selenium 크롤링 실패: {e}")
        import traceback
        traceback.print_exc()
        try:
            driver.quit()
        except:
            pass
        return []


if __name__ == "__main__":
    result = crawl_meals()
    print(f"\n최종 결과: {len(result)}개 식사 시간대")