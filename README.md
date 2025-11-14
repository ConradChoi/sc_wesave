# 네이버 Map API 이용요금 계산기 (WESAVE)

웹/모바일 지도 페이지 접속 수와 비율을 입력하면, 네이버 Map API 예상 요금을 계산하는 관리자용 계산기입니다.

## 기술 스택

- React + TypeScript
- Vite
- CSS (Inline Styles)

## 기능

- 웹/모바일 지도 페이지 접속 수 입력 (천단위 콤마 자동 표시)
- 주소/장소 검색 비율 입력 및 예상 검색 수 실시간 표시
- 길찾기 클릭 비율 입력 및 예상 클릭 수 실시간 표시
- 서비스별 상세 내역 테이블 (단가, 무료량, 호출수, 과금 대상, 예상 요금)
- 총 예상 요금 요약

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 사용 방법

1. 월간 웹/모바일 지도 페이지 접속 수를 입력합니다.
2. 각 서비스별 사용 비율을 입력합니다 (0~1 범위, 예: 0.3 = 30%).
3. 입력값 변경 시 실시간으로 예상 요금이 계산되어 표시됩니다.

## 지원 서비스

- Dynamic Map
- Geocoding
- Reverse Geocoding
- Static Map
- Directions 5
- Directions 15

