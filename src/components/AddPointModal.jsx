import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './AddPointModal.css'

const AddPointModal = ({ onClose, onPointAdded }) => {
  const [formData, setFormData] = useState({
    address: '',
    facebook_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.address || !formData.facebook_url) {
        throw new Error('Vui lòng điền đầy đủ địa chỉ và link Facebook')
      }

      // Extract location from address using a simple geocoding approach
      // For now, we'll use a default location (Vietnam center) and let user refine later
      // In production, you should use a geocoding API like Google Maps Geocoding API

      setIsExtracting(true)

      // Mock data - in production, extract from Facebook post
      // Note: No verified_at field - only verified points will be shown on map
      const insertData = {
        lat: 16.0544, // Default to central Vietnam
        lng: 108.2022,
        address: formData.address,
        source_url: formData.facebook_url,
        type: 'Điểm tiếp nhận',
        status: 'Open',
        location_name: formData.address.split(',')[0]?.trim() || 'Điểm tiếp nhận',
        city: formData.address.split(',').pop()?.trim() || null,
        description: `Được thêm từ Facebook: ${formData.facebook_url}`
      }

      const { data, error } = await supabase
        .from('relief_points')
        .insert([insertData])
        .select()

      if (error) throw error

      // Success - notify parent component
      if (onPointAdded) {
        onPointAdded(data[0])
      }

      // Close modal
      onClose()
    } catch (err) {
      console.error('Error adding point:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setIsExtracting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content compact" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div className="header-text">
            <h2>Thêm điểm tiếp nhận mới</h2>
            <p>Chia sẻ thông tin để giúp đỡ cộng đồng</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && (
          <div className="error-message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        {isExtracting && (
          <div className="extracting-info">
            <div className="spinner-small"></div>
            <span>Đang xử lý thông tin...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-point-form compact">
          <div className="form-group">
            <label htmlFor="address" className="label-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Địa chỉ điểm cứu trợ</span>
              <span className="required">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              required
              placeholder="VD: Nhà văn hóa thôn Mỹ Thành, xã Phong Bình, huyện Phong Điền, Thừa Thiên Huế"
              className="input-large"
            />
            {/* <p className="form-hint">
              💡 Nhập địa chỉ chi tiết nhất có thể để mọi người dễ tìm
            </p> */}
          </div>

          <div className="form-group">
            <label htmlFor="facebook_url" className="label-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <span>Link bài viết Facebook</span>
              <span className="required">*</span>
            </label>
            <input
              type="url"
              id="facebook_url"
              name="facebook_url"
              value={formData.facebook_url}
              onChange={handleChange}
              required
              placeholder="https://www.facebook.com/..."
              className="input-large"
            />
            {/* <p className="form-hint">
              📱 Dán link bài viết Facebook về điểm cứu trợ này
            </p> */}
          </div>

          <div className="info-box">
            <div>
              <p>Thông tin sẽ được hiển thị công khai. Vui lòng đảm bảo chính xác.</p>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Thêm điểm tiếp nhận</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPointModal
