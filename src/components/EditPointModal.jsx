import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './EditPointModal.css'

export default function EditPointModal({ point, onClose, onSave }) {
  const [formData, setFormData] = useState({
    location_name: point.location_name || '',
    address: point.address || '',
    city: point.city || '',
    lat: point.lat || 0,
    lng: point.lng || 0,
    status: point.status || 'open',
    type: point.type || 'relief_center',
    description: point.description || '',
    source_url: point.source_url || '',
    content_facebook: point.content_facebook || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'lat' || name === 'lng' ? parseFloat(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('relief_points')
        .update(formData)
        .eq('id', point.id)

      if (error) throw error

      onSave()
      onClose()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chỉnh sửa điểm cứu trợ</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="location_name">Tên địa điểm *</label>
              <input
                id="location_name"
                name="location_name"
                type="text"
                value={formData.location_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Thành phố</label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">Địa chỉ</label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lat">Vĩ độ (Latitude) *</label>
              <input
                id="lat"
                name="lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lng">Kinh độ (Longitude) *</label>
              <input
                id="lng"
                name="lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Loại điểm *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Điểm tập kết">Điểm tập kết</option>
                <option value="Điểm tiếp nhận">Điểm tiếp nhận</option>
                <option value="Trung tâm cứu trợ">Trung tâm cứu trợ</option>
                <option value="Nơi trú ẩn">Nơi trú ẩn</option>
                <option value="Y tế">Y tế</option>
                <option value="Thực phẩm">Thực phẩm</option>
                <option value="Nước uống">Nước uống</option>
                <option value="Sửa xe miễn phí">Sửa xe miễn phí</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng thái *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="open">Đang mở</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="content_facebook">Nội dung Facebook</label>
              <textarea
                id="content_facebook"
                name="content_facebook"
                value={formData.content_facebook}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="source_url">URL nguồn</label>
              <input
                id="source_url"
                name="source_url"
                type="url"
                value={formData.source_url}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="save-button">
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
