import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import IslandMarkers from './IslandMarkers'
import ProvinceFilter from './ProvinceFilter'
import AddPointModal from './AddPointModal'
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

const formatRelativeTime = (dateString) => {
  const now = new Date()
  const postDate = new Date(dateString)
  const diffInSeconds = Math.floor((now - postDate) / 1000)

  if (diffInSeconds < 60) {
    return 'Vừa xong'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `Đã đăng ${diffInMinutes} phút trước`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `Đã đăng ${diffInHours} giờ trước`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `Đã đăng ${diffInDays} ngày trước`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `Đã đăng ${diffInMonths} tháng trước`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `Đã đăng ${diffInYears} năm trước`
}

const ReliefPointPopup = ({ point, onMarkAsClosed }) => {
  const handleMarkClosed = () => {
    if (window.confirm('Xác nhận đánh dấu điểm này đã hết tiếp nhận?')) {
      onMarkAsClosed(point.id)
    }
  }

  return (
    <div className="popup-content">
      <div className="popup-header">
        <h3 className="popup-title">{point.location_name || point.type}</h3>
        <div className="popup-header-actions">
          <span className={`status-badge status-${point.status.toLowerCase()}`}>
            {point.status === 'Open' ? 'Đang hoạt động' :
             point.status === 'Closed' ? 'Đã đóng' : 'Đã đầy'}
          </span>
          <button
            className="popup-close-btn"
            onClick={() => document.querySelector('.leaflet-popup-close-button')?.click()}
            aria-label="Đóng"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
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

      {point.content_facebook && (
        <div className="popup-section">
          <div className="section-label">📱 Nội dung từ Facebook</div>
          <div className="section-content facebook-content">{point.content_facebook}</div>
        </div>
      )}

      {point.album_preview && point.album_preview.length > 0 && (
        <div className="popup-section">
          <div className="section-label">📷 Hình ảnh ({point.album_preview.length})</div>
          <div className="album-preview">
            {point.album_preview.map((item, index) => {
              const imageUrl = typeof item === 'string' ? item : item.image_file_uri
              const fbUrl = typeof item === 'object' ? item.url : null

              return (
                <a
                  key={index}
                  href={fbUrl || imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="album-image"
                  title={`Xem ảnh ${index + 1}`}
                >
                  <img
                    src={imageUrl}
                    alt={`Ảnh ${index + 1}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </a>
              )
            })}
          </div>
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

      {(point.reaction_count > 0 || point.timestamp) && (
        <div className="popup-section post-meta-section">
          {point.reaction_count > 0 && (
            <div className="post-meta-item">
              <span className="meta-icon">❤️</span>
              <span className="meta-text">{point.reaction_count.toLocaleString('vi-VN')} lượt tương tác</span>
            </div>
          )}
          {point.timestamp && (
            <div className="post-meta-item">
              <span className="meta-icon">🕒</span>
              <span className="meta-text">{formatRelativeTime(point.timestamp)}</span>
            </div>
          )}
        </div>
      )}

      {point.source_url && (
        <div className="popup-section source-section">
          <div className="section-label">Nguồn</div>
          <a
            href={point.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
          >
            <svg className="facebook-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Xem bài viết trên Facebook
          </a>
        </div>
      )}

      {point.verified_at && (
        <div className="verified-time">
          Cập nhật: {formatDate(point.verified_at)}
        </div>
      )}

      {point.status === 'Open' && (
        <button className="mark-closed-button" onClick={handleMarkClosed}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span>Đánh dấu hết tiếp nhận</span>
        </button>
      )}
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

const AddPointButton = ({ onClick }) => {
  return (
    <button
      className="floating-add-button"
      onClick={onClick}
      title="Thêm điểm tiếp nhận mới"
      aria-label="Thêm điểm tiếp nhận mới"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span className="button-text">Thêm điểm tiếp nhận</span>
    </button>
  )
}

const ReliefMap = () => {
  const [reliefPoints, setReliefPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showProvinceFilter, setShowProvinceFilter] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState(null)
  const [showAddPointModal, setShowAddPointModal] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [nearbyFilter, setNearbyFilter] = useState(false)
  const [searchRadius, setSearchRadius] = useState(20) // Default 20km
  const [showRadiusSlider, setShowRadiusSlider] = useState(false)

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
        .not('verified_at', 'is', null) // Only show verified points

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

  const handleAddPoint = () => {
    setShowAddPointModal(true)
  }

  const handlePointAdded = (newPoint) => {
    // Refresh the relief points list
    fetchReliefPoints()
  }

  const handleMarkAsClosed = async (pointId) => {
    try {
      const { error } = await supabase
        .from('relief_points')
        .update({ status: 'Closed' })
        .eq('id', pointId)

      if (error) throw error

      // Refresh the relief points list
      fetchReliefPoints()

      // Close any open popups
      document.querySelector('.leaflet-popup-close-button')?.click()
    } catch (err) {
      console.error('Error marking point as closed:', err)
      alert('Không thể cập nhật trạng thái. Vui lòng thử lại.')
    }
  }

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return distance
  }

  const handleFindNearby = async () => {
    setIsLoadingLocation(true)
    setError(null)

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị. Vui lòng sử dụng trình duyệt khác.')
      setIsLoadingLocation(false)
      return
    }

    // Request geolocation with high accuracy and timeout
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setNearbyFilter(true)
        setSelectedProvince(null) // Clear province filter
        setIsLoadingLocation(false)

        // Always show radius slider when nearby filter is active
        setShowRadiusSlider(true)
      },
      (error) => {
        setIsLoadingLocation(false)
        let errorMessage = 'Không thể lấy vị trí của bạn.'

        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng cấp quyền trong cài đặt trình duyệt.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không khả dụng. Vui lòng kiểm tra kết nối GPS.'
            break
          case error.TIMEOUT:
            errorMessage = 'Yêu cầu lấy vị trí đã hết thời gian. Vui lòng thử lại.'
            break
          default:
            errorMessage = 'Đã xảy ra lỗi khi lấy vị trí. Vui lòng thử lại.'
        }

        alert(errorMessage)
      },
      options
    )
  }

  const handleClearNearbyFilter = () => {
    setNearbyFilter(false)
    setUserLocation(null)
    setShowRadiusSlider(false)
    setSearchRadius(20) // Reset to default
  }

  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value)
    setSearchRadius(newRadius)
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
            chunkedLoading={true}
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            animate={true}
            animateAddingMarkers={true}
            disableClusteringAtZoom={18}
            removeOutsideVisibleBounds={false}
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
              .filter(point => {
                // Filter out Full status
                if (point.status === 'Full') return false

                // If nearby filter is active, only show points within searchRadius
                if (nearbyFilter && userLocation) {
                  const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    point.lat,
                    point.lng
                  )
                  return distance <= searchRadius
                }

                return true
              })
              .map((point) => (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={getMarkerIcon(point.status)}
              >
                <Popup className="custom-popup" maxWidth={350}>
                  <ReliefPointPopup point={point} onMarkAsClosed={handleMarkAsClosed} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Right Side Controls */}
      <div className="map-controls-right">
        <button
          className={`nearby-button ${isLoadingLocation ? 'loading' : ''} ${nearbyFilter ? 'active' : ''}`}
          onClick={handleFindNearby}
          disabled={isLoadingLocation}
          aria-label="Tìm điểm cứu trợ gần bạn"
        >
          {isLoadingLocation ? (
            <>
              <div className="spinner-small"></div>
              <span>Đang tìm...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Tìm gần bạn</span>
              {nearbyFilter && (
                <span className="filter-badge">{searchRadius}km</span>
              )}
            </>
          )}
        </button>

{nearbyFilter && (
          <div className="radius-slider-container">
            <div className="slider-header">
              <span className="slider-label">Điều chỉnh bán kính</span>
              <button
                className="slider-close"
                onClick={handleClearNearbyFilter}
                aria-label="Đóng"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="slider-info">
              <span>Tìm kiếm trong bán kính</span>
            </div>
            <div className="slider-wrapper">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={searchRadius}
                onChange={handleRadiusChange}
                className="radius-slider"
              />
              <div className="slider-value">
                <span className="value-display">{searchRadius} km</span>
              </div>
            </div>
            <div className="slider-marks">
              <span>5km</span>
              <span>50km</span>
              <span>100km</span>
            </div>
          </div>
        )}

        <MapLegend />
      </div>

      {/* Province Filter Modal */}
      {showProvinceFilter && (
        <ProvinceFilter
          onProvinceSelect={handleProvinceSelect}
          onClose={() => setShowProvinceFilter(false)}
        />
      )}

      {/* Add Point Modal */}
      {showAddPointModal && (
        <AddPointModal
          onClose={() => setShowAddPointModal(false)}
          onPointAdded={handlePointAdded}
        />
      )}
    </>
  )
}

export default ReliefMap
