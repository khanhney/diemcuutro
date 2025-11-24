import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Custom icon cho các đảo với màu cờ đỏ sao vàng
const createIslandIcon = () => {
  const svgIcon = `
    <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
      </defs>
      <!-- Marker shape với màu đỏ cờ VN -->
      <path d="M20 2C11.716 2 5 8.716 5 17c0 12 15 27 15 27s15-15 15-27c0-8.284-6.716-15-15-15z"
            fill="#da251d"
            stroke="#fff"
            stroke-width="2"
            filter="url(#shadow)"/>
      <!-- Ngôi sao vàng -->
      <path d="M20 10l2.1 6.5h6.8l-5.5 4 2.1 6.5-5.5-4-5.5 4 2.1-6.5-5.5-4h6.8z"
            fill="#ffed4e"
            stroke="#da251d"
            stroke-width="0.5"/>
      <!-- Đường viền sao -->
      <circle cx="20" cy="17" r="9" fill="none" stroke="#fff" stroke-width="0.8" opacity="0.6"/>
    </svg>
  `

  return L.divIcon({
    html: svgIcon,
    className: 'island-marker',
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48]
  })
}

const islandIcon = createIslandIcon()

// Dữ liệu các đảo chính của Hoàng Sa
const hoangSaIslands = [
  {
    id: 'hoang-sa-1',
    name: 'Đảo Phú Lâm',
    englishName: 'Woody Island',
    coordinates: [16.8333, 112.3333],
    description: 'Đảo lớn nhất quần đảo Hoàng Sa, diện tích khoảng 0.46 km²',
    details: 'Đảo Phú Lâm là đảo tự nhiên lớn nhất trong quần đảo Hoàng Sa, nằm ở rìa phía đông của quần đảo.'
  },
  {
    id: 'hoang-sa-2',
    name: 'Đảo Linh Côn',
    englishName: 'Lincoln Island',
    coordinates: [16.6833, 112.7333],
    description: 'Đảo thuộc quần đảo Hoàng Sa',
    details: 'Đảo Linh Côn là một trong những đảo quan trọng của quần đảo Hoàng Sa.'
  },
  {
    id: 'hoang-sa-3',
    name: 'Đảo Bắc',
    englishName: 'North Island',
    coordinates: [17.0833, 111.5000],
    description: 'Đảo phía Bắc quần đảo Hoàng Sa',
    details: 'Đảo Bắc nằm ở vị trí phía Bắc của quần đảo, có vị trí chiến lược quan trọng.'
  }
]

// Dữ liệu các đảo chính của Trường Sa
const truongSaIslands = [
  {
    id: 'truong-sa-1',
    name: 'Đảo Trường Sa Lớn',
    englishName: 'Spratly Island',
    coordinates: [8.6383, 111.9219],
    description: 'Đảo lớn nhất do Việt Nam kiểm soát tại Trường Sa',
    details: 'Đảo Trường Sa Lớn có diện tích khoảng 0.13 km², là trung tâm hành chính của quần đảo.'
  },
  {
    id: 'truong-sa-2',
    name: 'Đảo Song Tử Tây',
    englishName: 'Southwest Cay',
    coordinates: [11.4264, 114.3339],
    description: 'Đảo thuộc quần đảo Trường Sa',
    details: 'Đảo Song Tử Tây là đảo tự nhiên lớn thứ hai trong quần đảo Trường Sa.'
  },
  {
    id: 'truong-sa-3',
    name: 'Đảo Nam Yết',
    englishName: 'Namyit Island',
    coordinates: [10.1833, 114.3667],
    description: 'Đảo quan trọng của quần đảo Trường Sa',
    details: 'Đảo Nam Yết có vị trí chiến lược, nằm ở trung tâm quần đảo.'
  },
  {
    id: 'truong-sa-4',
    name: 'Đảo Sinh Tồn',
    englishName: 'Sin Cowe Island',
    coordinates: [9.8833, 114.2167],
    description: 'Đảo Sinh Tồn thuộc quần đảo Trường Sa',
    details: 'Đảo Sinh Tồn có diện tích khoảng 0.08 km².'
  },
  {
    id: 'truong-sa-5',
    name: 'Đảo Sơn Ca',
    englishName: 'Son Ca Island',
    coordinates: [11.4000, 113.3000],
    description: 'Đảo Sơn Ca thuộc quần đảo Trường Sa',
    details: 'Đảo Sơn Ca là một trong những đảo tiền tiêu quan trọng.'
  }
]

const IslandPopup = ({ island }) => {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '12px',
      minWidth: '280px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '2px solid #da251d'
      }}>
        <span style={{ fontSize: '32px' }}>🇻🇳</span>
        <div>
          <h3 style={{
            margin: 0,
            color: '#da251d',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            {island.name}
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '13px',
            color: '#666',
            fontStyle: 'italic'
          }}>
            {island.englishName}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <p style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#333'
        }}>
          {island.description}
        </p>
        <p style={{
          margin: 0,
          fontSize: '13px',
          lineHeight: '1.5',
          color: '#555'
        }}>
          {island.details}
        </p>
      </div>

      <div style={{
        backgroundColor: '#fef3c7',
        padding: '10px',
        borderRadius: '6px',
        borderLeft: '4px solid #da251d'
      }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          fontWeight: '600',
          color: '#92400e'
        }}>
          ⚓ Chủ quyền: Cộng hòa Xã hội Chủ nghĩa Việt Nam
        </p>
        <p style={{
          margin: '6px 0 0 0',
          fontSize: '11px',
          color: '#78350f'
        }}>
          📍 Tọa độ: {island.coordinates[0].toFixed(4)}°N, {island.coordinates[1].toFixed(4)}°E
        </p>
      </div>

      <button
        onClick={() => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${island.coordinates[0]},${island.coordinates[1]}`
          window.open(url, '_blank')
        }}
        style={{
          marginTop: '12px',
          width: '100%',
          padding: '10px',
          backgroundColor: '#da251d',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#da251d'}
      >
        <span>🗺️</span>
        <span>Dẫn đường đến đây</span>
      </button>
    </div>
  )
}

const IslandMarkers = () => {
  return (
    <>
      {/* Markers cho Hoàng Sa */}
      {hoangSaIslands.map((island) => (
        <Marker
          key={island.id}
          position={island.coordinates}
          icon={islandIcon}
        >
          <Popup maxWidth={320}>
            <IslandPopup island={island} />
          </Popup>
        </Marker>
      ))}

      {/* Markers cho Trường Sa */}
      {truongSaIslands.map((island) => (
        <Marker
          key={island.id}
          position={island.coordinates}
          icon={islandIcon}
        >
          <Popup maxWidth={320}>
            <IslandPopup island={island} />
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export default IslandMarkers
