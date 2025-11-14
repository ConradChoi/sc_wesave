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

function App() {
  // 입력값 state
  const [webVisits, setWebVisits] = useState<number>(10000);
  const [mobileVisits, setMobileVisits] = useState<number>(5000);
  const [webSearchRate, setWebSearchRate] = useState<number>(0.3);
  const [mobileSearchRate, setMobileSearchRate] = useState<number>(0.3);
  const [webDirectionsRate, setWebDirectionsRate] = useState<number>(0.1);
  const [mobileDirectionsRate, setMobileDirectionsRate] = useState<number>(0.1);

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

  // 천단위 콤마가 포함된 숫자 입력 처리 함수
  const handleFormattedNumberInput = (
    value: string,
    setter: (value: number) => void
  ) => {
    // 콤마 제거
    const cleanedValue = value.replace(/,/g, '');
    if (cleanedValue === '') {
      setter(0);
    } else {
      const num = parseInt(cleanedValue, 10);
      if (!isNaN(num)) {
        setter(num);
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
          네이버 Map API 이용요금 계산기 (WESAVE / Web + Mobile)
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
                  월간 웹 지도 페이지 접속 수
                </label>
                <input
                  type="text"
                  value={webVisits ? formatNumber(webVisits) : ''}
                  onChange={(e) => handleFormattedNumberInput(e.target.value, setWebVisits)}
                  placeholder="10,000"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#333'
                }}>
                  월간 모바일 지도 페이지 접속 수
                </label>
                <input
                  type="text"
                  value={mobileVisits ? formatNumber(mobileVisits) : ''}
                  onChange={(e) => handleFormattedNumberInput(e.target.value, setMobileVisits)}
                  placeholder="5,000"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
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
                  value={webSearchRate || ''}
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
                  value={mobileSearchRate || ''}
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
                  value={webDirectionsRate || ''}
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
                  value={mobileDirectionsRate || ''}
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
                        {service.name}
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
              borderRadius: '4px'
            }}>
              <p style={{ margin: '8px 0', fontSize: '16px', color: '#333' }}>
                총 월간 지도 페이지 접속 수 (웹+모바일): <strong>{formatNumber(totalVisits)}</strong> 회
              </p>
              <p style={{ margin: '8px 0', fontSize: '16px', color: '#333' }}>
                총 월 예상 요금: <strong style={{ color: '#d90008', fontSize: '20px' }}>{formatCurrency(totalCost)}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

