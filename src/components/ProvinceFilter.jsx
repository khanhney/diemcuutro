import { useState, useEffect, useMemo } from 'react'
import provinces from '../data/provinces.json'
import './ProvinceFilter.css'

const ProvinceFilter = ({ onProvinceSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedProvince, setSelectedProvince] = useState(null)

  // Filter provinces based on search and type
  const filteredProvinces = useMemo(() => {
    return provinces.filter(province => {
      const matchesSearch = province.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           province.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || province.type === selectedType
      return matchesSearch && matchesType
    })
  }, [searchTerm, selectedType])

  // Central cities and provinces count
  const stats = useMemo(() => {
    return {
      all: provinces.length,
      city: provinces.filter(p => p.type === 'city').length,
      province: provinces.filter(p => p.type === 'province').length
    }
  }, [])

  const handleProvinceClick = (province) => {
    setSelectedProvince(province)
    onProvinceSelect(province)
  }

  const handleClearFilter = () => {
    setSearchTerm('')
    setSelectedType('all')
    setSelectedProvince(null)
    onProvinceSelect(null)
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className="province-filter-overlay" onClick={onClose}>
      <div className="province-filter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="filter-header">
          <h2 className="filter-title">Chọn Tỉnh/Thành phố</h2>
          <button className="close-button" onClick={onClose} aria-label="Đóng">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm tỉnh/thành phố..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="filter-chips">
          <button
            className={`chip ${selectedType === 'all' ? 'chip-active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            Tất cả ({stats.all})
          </button>
          <button
            className={`chip ${selectedType === 'city' ? 'chip-active' : ''}`}
            onClick={() => setSelectedType('city')}
          >
            Thành phố ({stats.city})
          </button>
          <button
            className={`chip ${selectedType === 'province' ? 'chip-active' : ''}`}
            onClick={() => setSelectedType('province')}
          >
            Tỉnh ({stats.province})
          </button>
        </div>

        {/* Selected Province Info */}
        {selectedProvince && (
          <div className="selected-info">
            <div className="selected-content">
              <span className="selected-icon">📍</span>
              <span className="selected-text">
                Đang lọc: <strong>{selectedProvince.fullName}</strong>
              </span>
            </div>
            <button className="clear-selection" onClick={handleClearFilter}>
              Xóa lọc
            </button>
          </div>
        )}

        {/* Provinces List */}
        <div className="provinces-list">
          {filteredProvinces.length > 0 ? (
            filteredProvinces.map((province) => (
              <button
                key={province.code}
                className={`province-item ${selectedProvince?.code === province.code ? 'province-selected' : ''}`}
                onClick={() => handleProvinceClick(province)}
              >
                <div className="province-info">
                  <span className="province-icon">
                    {province.type === 'city' ? '🏙️' : '🏞️'}
                  </span>
                  <div className="province-text">
                    <div className="province-name">{province.name}</div>
                    <div className="province-full-name">{province.fullName}</div>
                  </div>
                </div>
                {province.isCentral && (
                  <span className="central-badge">Trực thuộc TW</span>
                )}
                {selectedProvince?.code === province.code && (
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>
            ))
          ) : (
            <div className="no-results">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <p>Không tìm thấy tỉnh/thành phố</p>
              <button className="reset-button" onClick={handleClearFilter}>
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="filter-footer">
          <span className="footer-text">
            Hiển thị {filteredProvinces.length} trên {provinces.length} tỉnh/thành phố
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProvinceFilter
