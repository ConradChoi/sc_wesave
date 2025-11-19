import { useState, useMemo } from 'react';

// 서비스별 상수 정의
const SERVICES_CONFIG = {
  dynamicMap: {
    name: 'Dynamic Map',
    unitPrice: 0.1,
    freeQuota: 10_000_000,
  },
  geocoding: {
    name: 'Geocoding',
    unitPrice: 0.5,
    freeQuota: 3_000_000,
  },
  reverseGeocoding: {
    name: 'Reverse Geocoding',
    unitPrice: 0.5,
    freeQuota: 3_000_000,
  },
  staticMap: {
    name: 'Static Map',
    unitPrice: 2,
    freeQuota: 3_000_000,
  },
  directions5: {
    name: 'Directions 5',
    unitPrice: 5,
    freeQuota: 60_000,
  },
  directions15: {
    name: 'Directions 15',
    unitPrice: 20,
    freeQuota: 3_000,
  },
} as const;

interface MapApiServiceRow {
  name: string;
  unitPrice: number;
  freeQuota: number;
  calls: number;
  chargeableCalls: number;
  cost: number;
}

type TimeUnit = 'daily' | 'weekly' | 'monthly';

// 서비스별 활용 범위 설명
const SERVICE_DESCRIPTIONS: Record<string, string> = {
  'Dynamic Map': '위치 기반 서비스, 검색 지도, 매장 지도, 탐색 지도 등',
  'Static Map': '상세페이지 위치 이미지, 장소 안내 이미지, 미니맵',
  'Geocoding': '주소 -> 좌표, 주소 입력 후 지도에 핀 찍기, 장소 저장 기능',
  'Reverse Geocoding': '좌표 -> 주소, 사용자 현재 위치 주소 표시, 지도 기반 위치 저장',
  'Directions 5': '간단한 길찾기, 소규모 방문 경로 안내(경유지 최대 5개)',
  'Directions 15': '영업 동선, 배달/방문 루트, 다중 지역 최적화(경유지 최대 15개)',
};

function App() {
  // 입력값 state
  const [webVisits, setWebVisits] = useState<number>(0); // 월간 기준
  const [mobileVisits, setMobileVisits] = useState<number>(0); // 월간 기준
  const [webInputUnit, setWebInputUnit] = useState<TimeUnit>('monthly');
  const [mobileInputUnit, setMobileInputUnit] = useState<TimeUnit>('monthly');
  const [webSearchRate, setWebSearchRate] = useState<number>(0);
  const [mobileSearchRate, setMobileSearchRate] = useState<number>(0);
  const [webDirectionsRate, setWebDirectionsRate] = useState<number>(0);
  const [mobileDirectionsRate, setMobileDirectionsRate] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // 계산 로직
  const services = useMemo((): MapApiServiceRow[] => {
    // 각 서비스별 호출수 계산
    const dynamicMapCalls = webVisits + mobileVisits;
    const geocodingCalls = webVisits * webSearchRate + mobileVisits * mobileSearchRate;
    const reverseGeocodingCalls = 0;
    const staticMapCalls = 0;
    const directions5Calls = webVisits * webDirectionsRate + mobileVisits * mobileDirectionsRate;
    const directions15Calls = 0;

    // 서비스별 데이터 생성
    const calculateService = (
      name: string,
      unitPrice: number,
      freeQuota: number,
      calls: number
    ): MapApiServiceRow => {
      const chargeableCalls = Math.max(Math.round(calls) - freeQuota, 0);
      const cost = chargeableCalls * unitPrice;
      return {
        name,
        unitPrice,
        freeQuota,
        calls: Math.round(calls),
        chargeableCalls,
        cost,
      };
    };

    return [
      calculateService(
        SERVICES_CONFIG.dynamicMap.name,
        SERVICES_CONFIG.dynamicMap.unitPrice,
        SERVICES_CONFIG.dynamicMap.freeQuota,
        dynamicMapCalls
      ),
      calculateService(
        SERVICES_CONFIG.geocoding.name,
        SERVICES_CONFIG.geocoding.unitPrice,
        SERVICES_CONFIG.geocoding.freeQuota,
        geocodingCalls
      ),
      calculateService(
        SERVICES_CONFIG.reverseGeocoding.name,
        SERVICES_CONFIG.reverseGeocoding.unitPrice,
        SERVICES_CONFIG.reverseGeocoding.freeQuota,
        reverseGeocodingCalls
      ),
      calculateService(
        SERVICES_CONFIG.staticMap.name,
        SERVICES_CONFIG.staticMap.unitPrice,
        SERVICES_CONFIG.staticMap.freeQuota,
        staticMapCalls
      ),
      calculateService(
        SERVICES_CONFIG.directions5.name,
        SERVICES_CONFIG.directions5.unitPrice,
        SERVICES_CONFIG.directions5.freeQuota,
        directions5Calls
      ),
      calculateService(
        SERVICES_CONFIG.directions15.name,
        SERVICES_CONFIG.directions15.unitPrice,
        SERVICES_CONFIG.directions15.freeQuota,
        directions15Calls
      ),
    ];
  }, [webVisits, mobileVisits, webSearchRate, mobileSearchRate, webDirectionsRate, mobileDirectionsRate]);

  // 총 접속 수 및 총 요금 계산
  const totalVisits = useMemo(() => {
    return webVisits + mobileVisits;
  }, [webVisits, mobileVisits]);

  const totalCost = useMemo(() => {
    return services.reduce((sum, service) => sum + service.cost, 0);
  }, [services]);

  // 숫자 포맷팅 헬퍼 함수
  const formatNumber = (num: number): string => {
    return num.toLocaleString('ko-KR');
  };

  const formatCurrency = (num: number): string => {
    return `${formatNumber(num)}원`;
  };

  // 입력값 처리 헬퍼 함수
  const handleNumberInput = (
    value: string,
    setter: (value: number) => void
  ) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      setter(0);
    } else {
      setter(num);
    }
  };

  // 시간 단위별 월간 값 계산
  const convertToMonthly = (value: number, unit: TimeUnit): number => {
    switch (unit) {
      case 'daily':
        return value * 30;
      case 'weekly':
        return value * (30 / 7);
      case 'monthly':
        return value;
      default:
        return value;
    }
  };

  // 월간 값을 다른 단위로 변환
  const convertFromMonthly = (monthlyValue: number, unit: TimeUnit): number => {
    switch (unit) {
      case 'daily':
        return monthlyValue / 30;
      case 'weekly':
        return monthlyValue * 7 / 30;
      case 'monthly':
        return monthlyValue;
      default:
        return monthlyValue;
    }
  };

  // 웹 접속 수 입력 처리 (단위 변환 포함)
  const handleWebVisitsInput = (value: string, unit: TimeUnit) => {
    const cleanedValue = value.replace(/,/g, '');
    if (cleanedValue === '') {
      setWebVisits(0);
    } else {
      const num = parseInt(cleanedValue, 10);
      if (!isNaN(num)) {
        const monthlyValue = convertToMonthly(num, unit);
        setWebVisits(monthlyValue);
      }
    }
  };

  // 모바일 접속 수 입력 처리 (단위 변환 포함)
  const handleMobileVisitsInput = (value: string, unit: TimeUnit) => {
    const cleanedValue = value.replace(/,/g, '');
    if (cleanedValue === '') {
      setMobileVisits(0);
    } else {
      const num = parseInt(cleanedValue, 10);
      if (!isNaN(num)) {
        const monthlyValue = convertToMonthly(num, unit);
        setMobileVisits(monthlyValue);
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* 페이지 상단 */}
        <h1 style={{ 
          textAlign: 'center', 
          marginTop: 0, 
          marginBottom: '8px',
          color: '#333'
        }}>
          네이버 Map API 이용요금 계산기
        </h1>
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginBottom: '32px',
          fontSize: '14px'
        }}>
          웹/모바일 지도 페이지 접속 수와 비율을 입력하면, 네이버 Map API 예상 요금을 계산합니다.
        </p>

        {/* 좌우 분할 레이아웃 */}
        <div style={{ 
          display: 'flex', 
          gap: '32px',
          alignItems: 'flex-start'
        }}>
          {/* 왼쪽: 입력 + 요약 */}
          <div style={{ 
            flex: '0 0 400px',
            minWidth: 0
          }}>
            {/* 입력 영역 */}
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: '16px',
              fontSize: '18px',
              color: '#333',
              borderBottom: '2px solid #eee',
              paddingBottom: '8px'
            }}>
              입력
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#333'
                }}>
                  웹 지도 페이지 접속 수
                </label>
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginBottom: '8px',
                  alignItems: 'center'
                }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="webUnit"
                      value="daily"
                      checked={webInputUnit === 'daily'}
                      onChange={(e) => setWebInputUnit(e.target.value as TimeUnit)}
                      style={{ cursor: 'pointer' }}
                    />
                    일간
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="webUnit"
                      value="weekly"
                      checked={webInputUnit === 'weekly'}
                      onChange={(e) => setWebInputUnit(e.target.value as TimeUnit)}
                      style={{ cursor: 'pointer' }}
                    />
                    주간
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="webUnit"
                      value="monthly"
                      checked={webInputUnit === 'monthly'}
                      onChange={(e) => setWebInputUnit(e.target.value as TimeUnit)}
                      style={{ cursor: 'pointer' }}
                    />
                    월간
                  </label>
                </div>
                <input
                  type="text"
                  value={formatNumber(Math.round(convertFromMonthly(webVisits || 0, webInputUnit)))}
                  onChange={(e) => handleWebVisitsInput(e.target.value, webInputUnit)}
                  placeholder={webInputUnit === 'daily' ? '333' : webInputUnit === 'weekly' ? '2,333' : '10,000'}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ 
                  marginTop: '4px', 
                  fontSize: '12px', 
                  color: '#666',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <span>일간: {formatNumber(Math.round(webVisits / 30))}</span>
                  <span>주간: {formatNumber(Math.round(webVisits * 7 / 30))}</span>
                  <span>월간: {formatNumber(Math.round(webVisits))}</span>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#333'
                }}>
                  모바일 지도 페이지 접속 수
                </label>
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginBottom: '8px',
                  alignItems: 'center'
                }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="mobileUnit"
                      value="daily"
                      checked={mobileInputUnit === 'daily'}
                      onChange={(e) => setMobileInputUnit(e.target.value as TimeUnit)}
                      style={{ cursor: 'pointer' }}
                    />
                    일간
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="mobileUnit"
                      value="weekly"
                      checked={mobileInputUnit === 'weekly'}
                      onChange={(e) => setMobileInputUnit(e.target.value as TimeUnit)}
                      style={{ cursor: 'pointer' }}
                    />
                    주간
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="mobileUnit"
                      value="monthly"
                      checked={mobileInputUnit === 'monthly'}
                      onChange={(e) => setMobileInputUnit(e.target.value as TimeUnit)}
                      style={{ cursor: 'pointer' }}
                    />
                    월간
                  </label>
                </div>
                <input
                  type="text"
                  value={formatNumber(Math.round(convertFromMonthly(mobileVisits || 0, mobileInputUnit)))}
                  onChange={(e) => handleMobileVisitsInput(e.target.value, mobileInputUnit)}
                  placeholder={mobileInputUnit === 'daily' ? '167' : mobileInputUnit === 'weekly' ? '1,167' : '5,000'}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ 
                  marginTop: '4px', 
                  fontSize: '12px', 
                  color: '#666',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <span>일간: {formatNumber(Math.round(mobileVisits / 30))}</span>
                  <span>주간: {formatNumber(Math.round(mobileVisits * 7 / 30))}</span>
                  <span>월간: {formatNumber(Math.round(mobileVisits))}</span>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#333'
                }}>
                  웹 주소/장소 검색 비율 (예: 0.3 = 30%)
                </label>
                <input
                  type="number"
                  value={webSearchRate === 0 ? '0' : webSearchRate || ''}
                  onChange={(e) => handleNumberInput(e.target.value, setWebSearchRate)}
                  placeholder="0.3"
                  min="0"
                  max="1"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '12px', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  예상 검색 수: {formatNumber(Math.round(webVisits * webSearchRate))} 회
                </p>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#333'
                }}>
                  모바일 주소/장소 검색 비율 (예: 0.3 = 30%)
                </label>
                <input
                  type="number"
                  value={mobileSearchRate === 0 ? '0' : mobileSearchRate || ''}
                  onChange={(e) => handleNumberInput(e.target.value, setMobileSearchRate)}
                  placeholder="0.3"
                  min="0"
                  max="1"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '12px', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  예상 검색 수: {formatNumber(Math.round(mobileVisits * mobileSearchRate))} 회
                </p>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#333'
                }}>
                  웹 '길찾기' 클릭 비율 (예: 0.1 = 10%)
                </label>
                <input
                  type="number"
                  value={webDirectionsRate === 0 ? '0' : webDirectionsRate || ''}
                  onChange={(e) => handleNumberInput(e.target.value, setWebDirectionsRate)}
                  placeholder="0.1"
                  min="0"
                  max="1"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '12px', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  예상 클릭 수: {formatNumber(Math.round(webVisits * webDirectionsRate))} 회
                </p>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#333'
                }}>
                  모바일 '길찾기' 클릭 비율 (예: 0.1 = 10%)
                </label>
                <input
                  type="number"
                  value={mobileDirectionsRate === 0 ? '0' : mobileDirectionsRate || ''}
                  onChange={(e) => handleNumberInput(e.target.value, setMobileDirectionsRate)}
                  placeholder="0.1"
                  min="0"
                  max="1"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '12px', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  예상 클릭 수: {formatNumber(Math.round(mobileVisits * mobileDirectionsRate))} 회
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 상세 내역 + 요약 */}
          <div style={{ 
            flex: '1',
            minWidth: 0
          }}>
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: '16px',
              fontSize: '18px',
              color: '#333',
              borderBottom: '2px solid #eee',
              paddingBottom: '8px'
            }}>
              상세 내역
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      border: '1px solid #ddd',
                      fontWeight: 600
                    }}>
                      서비스명
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'right', 
                      border: '1px solid #ddd',
                      fontWeight: 600
                    }}>
                      단가(원/건)
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'right', 
                      border: '1px solid #ddd',
                      fontWeight: 600
                    }}>
                      월 무료량(건)
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'right', 
                      border: '1px solid #ddd',
                      fontWeight: 600
                    }}>
                      월 예상 호출수
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'right', 
                      border: '1px solid #ddd',
                      fontWeight: 600
                    }}>
                      과금 대상 호출수
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'right', 
                      border: '1px solid #ddd',
                      fontWeight: 600
                    }}>
                      월 예상 요금(원)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ 
                        padding: '12px', 
                        border: '1px solid #ddd',
                        fontWeight: 600
                      }}>
                        <span
                          onClick={() => setSelectedService(service.name)}
                          style={{
                            cursor: 'pointer',
                            color: '#0077c8',
                            textDecoration: 'underline',
                            textDecorationColor: '#0077c8'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#005a9e';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#0077c8';
                          }}
                        >
                          {service.name}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'right', 
                        border: '1px solid #ddd'
                      }}>
                        {formatNumber(service.unitPrice)}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'right', 
                        border: '1px solid #ddd'
                      }}>
                        {formatNumber(service.freeQuota)}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'right', 
                        border: '1px solid #ddd'
                      }}>
                        {formatNumber(service.calls)}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'right', 
                        border: '1px solid #ddd'
                      }}>
                        {formatNumber(service.chargeableCalls)}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'right', 
                        border: '1px solid #ddd',
                        fontWeight: service.cost > 0 ? 600 : 400,
                        color: service.cost > 0 ? '#d90008' : '#333'
                      }}>
                        {formatCurrency(service.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 요약 영역 */}
            <h2 style={{ 
              marginTop: '32px', 
              marginBottom: '16px',
              fontSize: '18px',
              color: '#333',
              borderBottom: '2px solid #eee',
              paddingBottom: '8px'
            }}>
              요약
            </h2>
            <div style={{ 
              backgroundColor: '#f9f9f9',
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '32px'
            }}>
              <p style={{ margin: '8px 0', fontSize: '16px', color: '#333' }}>
                총 월간 지도 페이지 접속 수 (웹+모바일): <strong>{formatNumber(totalVisits)}</strong> 회
              </p>
              <p style={{ margin: '8px 0', fontSize: '16px', color: '#333' }}>
                총 월 예상 요금: <strong style={{ color: '#d90008', fontSize: '20px' }}>{formatCurrency(totalCost)}</strong>
              </p>
            </div>

            {/* 네이버 MAP API 호출 기준 표 */}
            <h2 style={{ 
              marginTop: '32px', 
              marginBottom: '16px',
              fontSize: '18px',
              color: '#333',
              borderBottom: '2px solid #eee',
              paddingBottom: '8px'
            }}>
              네이버 MAP API 호출 기준
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      border: '1px solid #ddd',
                      fontWeight: 600,
                      width: '60%'
                    }}>
                      사용자 행동
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      border: '1px solid #ddd',
                      fontWeight: 600,
                      width: '40%'
                    }}>
                      API 호출(과금) 여부
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#ffffff' }}>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #ddd'
                    }}>
                      지도페이지 첫 접속
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      border: '1px solid #ddd',
                      fontWeight: 600,
                      color: '#0077c8'
                    }}>
                      O(1회)
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#fafafa' }}>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #ddd'
                    }}>
                      지도 확대/축소
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      border: '1px solid #ddd',
                      fontWeight: 600,
                      color: '#d90008'
                    }}>
                      X
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffffff' }}>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #ddd'
                    }}>
                      지도 이동(Pan)
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      border: '1px solid #ddd',
                      fontWeight: 600,
                      color: '#d90008'
                    }}>
                      X
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#fafafa' }}>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #ddd'
                    }}>
                      주소/장소 검색 버튼 클릭
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      border: '1px solid #ddd',
                      fontWeight: 600,
                      color: '#0077c8'
                    }}>
                      O(요청당 1회)
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffffff' }}>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #ddd'
                    }}>
                      '길찾기' 버튼
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      border: '1px solid #ddd',
                      fontWeight: 600,
                      color: '#0077c8'
                    }}>
                      O(요청당 1회)
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#fafafa' }}>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #ddd'
                    }}>
                      '길찾기' 옵션 변경
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      border: '1px solid #ddd',
                      fontWeight: 600,
                      color: '#0077c8'
                    }}>
                      O(새로 요청 시)
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffffff' }}>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #ddd'
                    }}>
                      DB에 저장된 매장 마커
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      border: '1px solid #ddd',
                      fontWeight: 600,
                      color: '#d90008'
                    }}>
                      X
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#fafafa' }}>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #ddd'
                    }}>
                      마커 클릭(정보창 표시)
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      border: '1px solid #ddd',
                      fontWeight: 600,
                      color: '#d90008'
                    }}>
                      X
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 팝업 모달 */}
      {selectedService && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedService(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '32px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                color: '#333',
                fontWeight: 600
              }}>
                {selectedService}
              </h3>
              <button
                onClick={() => setSelectedService(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              fontSize: '16px',
              color: '#555',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#333' }}>활용 범위:</strong>
              <p style={{ margin: '12px 0 0 0' }}>
                {SERVICE_DESCRIPTIONS[selectedService] || '설명이 없습니다.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

