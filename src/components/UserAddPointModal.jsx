import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './AddPointModal.css'

const STORAGE_KEY = 'userAddPointFormDraft'

export default function UserAddPointModal({ onClose, onSave }) {
  const [formData, setFormData] = useState(() => {
    // Load saved draft from localStorage
    const savedDraft = localStorage.getItem(STORAGE_KEY)
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft)
      } catch (e) {
        console.error('Failed to parse saved draft:', e)
      }
    }
    return {
      address: '',
      facebook_url: '',
      phone: '',
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Save draft to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
  }, [formData])

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
      if (!formData.address) {
        throw new Error('Vui lòng điền địa chỉ')
      }

      // Extract address components to get location name and city
      const addressParts = formData.address.split(',').map(s => s.trim())
      const location_name = addressParts[0] || 'Điểm cứu trợ'
      const city = addressParts[addressParts.length - 1] || 'Vietnam'

      const insertData = {
        location_name,
        address: formData.address,
        city,
        source_url: formData.facebook_url || null,
        contact_info: formData.phone ? JSON.stringify({ phone: formData.phone }) : null,
        lat: 0, // Will be updated by admin
        lng: 0, // Will be updated by admin
        status: 'Open',
        type: 'Điểm tập kết',
        verified_at: null, // NULL để admin xét duyệt
      }

      const { error } = await supabase
        .from('relief_points')
        .insert([insertData])

      if (error) throw error

      // Clear the saved draft after successful submission
      localStorage.removeItem(STORAGE_KEY)

      alert('✅ Cảm ơn bạn! Thông tin đã được gửi và đang chờ xét duyệt.')
      onSave()
      onClose()
    } catch (err) {
      console.error('Error adding point:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClearDraft = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu đã nhập?')) {
      localStorage.removeItem(STORAGE_KEY)
      setFormData({
        address: '',
        facebook_url: '',
        phone: '',
      })
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
            <h2>Điểm tiếp nhận mới</h2>
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
          </div>

          <div className="form-group">
            <label htmlFor="facebook_url" className="label-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <span>Link bài viết Facebook</span>
            </label>
            <input
              type="url"
              id="facebook_url"
              name="facebook_url"
              value={formData.facebook_url}
              onChange={handleChange}
              placeholder="https://www.facebook.com/..."
              className="input-large"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="label-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>Số điện thoại liên hệ</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0901234567"
              className="input-large"
            />
          </div>

          <div className="info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <p><strong>Lưu ý quan trọng:</strong></p>
              <p>• Thông tin sẽ được xét duyệt trước khi hiển thị</p>
              <p>• Vui lòng cung cấp thông tin chính xác</p>
              <p>• Điểm cứu trợ sẽ xuất hiện trên bản đồ sau khi được duyệt</p>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Gửi thông tin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
