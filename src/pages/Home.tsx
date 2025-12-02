import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '90%',
        backgroundColor: '#ffffff',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{
          marginTop: 0,
          marginBottom: '16px',
          fontSize: '32px',
          color: '#333',
          fontWeight: 700
        }}>
          SAVE THE CHILDREN
        </h1>
        <p style={{
          marginBottom: '48px',
          fontSize: '18px',
          color: '#666'
        }}>
          유용한 도구 모음
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <Link
            to="/calculator"
            style={{
              display: 'block',
              padding: '24px',
              backgroundColor: '#0077c8',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 600,
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#005a9e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0077c8';
            }}
          >
            네이버 지도 API 계산
          </Link>

          <Link
            to="/editor"
            style={{
              display: 'block',
              padding: '24px',
              backgroundColor: '#0077c8',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 600,
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#005a9e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0077c8';
            }}
          >
            WYSIWYG 에디터
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;

