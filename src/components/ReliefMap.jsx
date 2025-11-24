import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import IslandMarkers from './IslandMarkers'
import ProvinceFilter from './ProvinceFilter'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import './ReliefMap.css'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons với hotspot effect
const createCustomIcon = (color, glowColor) => {
  const svgIcon = `
    <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer glow effect -->
      <defs>
        <filter id="glow-${color.replace('#', '')}">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="gradient-${color.replace('#', '')}">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.7" />
        </radialGradient>
      </defs>

      <!-- Pulsing ring effect -->
      <circle cx="20" cy="20" r="15" fill="${glowColor}" opacity="0.3">
        <animate attributeName="r" from="15" to="20" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite"/>
      </circle>

      <!-- Main marker pin -->
      <path d="M20 2C11.716 2 5 8.716 5 17c0 12 15 28 15 28s15-16 15-28c0-8.284-6.716-15-15-15z"
            fill="url(#gradient-${color.replace('#', '')})"
            stroke="#fff"
            stroke-width="2"
            filter="url(#glow-${color.replace('#', '')})"
            style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3))"/>

      <!-- Inner dot -->
      <circle cx="20" cy="17" r="6" fill="white" fill-opacity="0.95"/>
      <circle cx="20" cy="17" r="4" fill="${color}"/>
    </svg>
  `

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker hotspot-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
  })
}

const yellowIcon = createCustomIcon('#eab308', '#fbbf24')
const grayIcon = createCustomIcon('#6b7280', '#9ca3af')
const orangeIcon = createCustomIcon('#f59e0b', '#fbbf24')

const getMarkerIcon = (status) => {
  switch (status) {
    case 'Open':
      return yellowIcon
    case 'Closed':
      return grayIcon
    case 'Full':
      return orangeIcon
    default:
      return redIcon
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const ReliefPointPopup = ({ point }) => {
  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`
    window.open(url, '_blank')
  }

  return (
    <div className="popup-content">
      <div className="popup-header">
        <h3 className="popup-title">{point.location_name || point.type}</h3>
        <span className={`status-badge status-${point.status.toLowerCase()}`}>
          {point.status === 'Open' ? 'Đang hoạt động' :
           point.status === 'Closed' ? 'Đã đóng' : 'Đã đầy'}
        </span>
      </div>

      {(point.address || point.city) && (
        <div className="popup-section">
          <div className="section-label">📍 Địa chỉ</div>
          <div className="section-content">
            {point.address && <div>{point.address}</div>}
            {point.city && <div style={{ fontWeight: 600, marginTop: '4px' }}>{point.city}</div>}
          </div>
        </div>
      )}

      {point.type && (
        <div className="popup-section">
          <div className="section-label">Loại điểm</div>
          <div className="section-content">{point.type}</div>
        </div>
      )}

      {point.description && (
        <div className="popup-section">
          <div className="section-label">Thông tin</div>
          <div className="section-content">{point.description}</div>
        </div>
      )}

      {point.contact_info && (
        <div className="popup-section">
          <div className="section-label">Liên hệ</div>
          <div className="contact-info">
            {point.contact_info.name && (
              <div className="contact-item">
                <span className="contact-icon">👤</span>
                <span>{point.contact_info.name}</span>
              </div>
            )}
            {point.contact_info.phone && (
              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <a href={`tel:${point.contact_info.phone}`} className="contact-link">
                  {point.contact_info.phone}
                </a>
              </div>
            )}
            {point.contact_info.facebook_link && (
              <div className="contact-item">
                <span className="contact-icon">💬</span>
                <a
                  href={point.contact_info.facebook_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  Facebook
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {point.source_url && (
        <div className="popup-section">
          <div className="section-label">Nguồn</div>
          <div className="section-content">
            <a
              href={point.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              Xem bài gốc
            </a>
          </div>
        </div>
      )}

      {point.verified_at && (
        <div className="verified-time">
          Cập nhật: {formatDate(point.verified_at)}
        </div>
      )}

      <button className="directions-button" onClick={handleDirections}>
        <span>🗺️</span>
        <span>Dẫn đường</span>
      </button>
    </div>
  )
}

const MapLegend = () => {
  return (
    <div className="map-legend">
      <div className="legend-title">Chú thích</div>
      <div className="legend-item">
        <div className="legend-color yellow"></div>
        <span>Đang hoạt động</span>
      </div>
      <div className="legend-item">
        <div className="legend-color gray"></div>
        <span>Đã đóng</span>
      </div>
    </div>
  )
}

const ReliefMap = () => {
  const [reliefPoints, setReliefPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showProvinceFilter, setShowProvinceFilter] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState(null)

  // Center map on Vietnam (tập trung vào miền Trung để thấy cả Hoàng Sa)
  const vietnamCenter = [14.5, 108.5] // Giữa Việt Nam, lệch về phía Đông để thấy Hoàng Sa
  const defaultZoom = 6.3

  useEffect(() => {
    fetchReliefPoints()
  }, [selectedProvince])

  const fetchReliefPoints = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('relief_points')
        .select('*')

      // Filter by province if selected
      if (selectedProvince) {
        query = query.eq('city', selectedProvince.name)
      }

      const { data, error } = await query.order('verified_at', { ascending: false })

      if (error) throw error

      setReliefPoints(data || [])
    } catch (err) {
      console.error('Error fetching relief points:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProvinceSelect = (province) => {
    setSelectedProvince(province)
    if (province) {
      setShowProvinceFilter(false)
    }
  }

  const handleClearFilter = () => {
    setSelectedProvince(null)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Đang tải bản đồ...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="loading-text" style={{ color: '#dc2626' }}>
          Lỗi: {error}
        </div>
        <button
          onClick={fetchReliefPoints}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Filter Button */}
      <div className="filter-controls">
        <button
          className="filter-toggle-button"
          onClick={() => setShowProvinceFilter(true)}
          aria-label="Lọc theo tỉnh thành"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Lọc theo tỉnh</span>
          {selectedProvince && (
            <span className="filter-badge">{selectedProvince.name}</span>
          )}
        </button>

        {selectedProvince && (
          <button
            className="clear-filter-button"
            onClick={handleClearFilter}
            aria-label="Xóa bộ lọc"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Xóa lọc
          </button>
        )}
      </div>

      <div className="map-container">
        <MapContainer
          center={vietnamCenter}
          zoom={defaultZoom}
          minZoom={4.5}
          maxZoom={18}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* CartoDB Positron - Bản đồ sáng, tối giản, dễ nhìn */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={20}
          />

          {/* Markers cho các đảo Hoàng Sa và Trường Sa */}
          <IslandMarkers />

          {/* Marker clustering cho relief points */}
          <MarkerClusterGroup
            chunkedLoading={false}
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            animate={true}
            animateAddingMarkers={false}
            disableClusteringAtZoom={16}
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount()
              let size = 'small'
              let clusterClass = 'marker-cluster-small'

              if (count >= 10) {
                size = 'large'
                clusterClass = 'marker-cluster-large'
              } else if (count >= 5) {
                size = 'medium'
                clusterClass = 'marker-cluster-medium'
              }

              return L.divIcon({
                html: `<div><span>${count}</span></div>`,
                className: `marker-cluster ${clusterClass}`,
                iconSize: L.point(40, 40)
              })
            }}
          >
            {reliefPoints
              .filter(point => point.status !== 'Full')
              .map((point) => (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={getMarkerIcon(point.status)}
              >
                <Popup className="custom-popup" maxWidth={350}>
                  <ReliefPointPopup point={point} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <MapLegend />

      {/* Province Filter Modal */}
      {showProvinceFilter && (
        <ProvinceFilter
          onProvinceSelect={handleProvinceSelect}
          onClose={() => setShowProvinceFilter(false)}
        />
      )}
    </>
  )
}

export default ReliefMap
