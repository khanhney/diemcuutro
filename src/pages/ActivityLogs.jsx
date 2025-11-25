import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import './ActivityLogs.css'

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    fetchLogs()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/admin/login')
    }
  }

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select(`
          *,
          admin_users (
            email,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    return filterAction === 'all' || log.action === filterAction
  })

  const getActionBadgeClass = (action) => {
    const classes = {
      'INSERT': 'action-insert',
      'UPDATE': 'action-update',
      'DELETE': 'action-delete'
    }
    return classes[action] || 'action-default'
  }

  const formatJsonPreview = (data) => {
    if (!data) return 'N/A'
    const keys = Object.keys(data)
    if (keys.length === 0) return 'Empty'
    return `${keys.length} fields`
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">Đang tải logs...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="admin-filters">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả hành động</option>
            <option value="INSERT">Thêm mới</option>
            <option value="UPDATE">Cập nhật</option>
            <option value="DELETE">Xóa</option>
          </select>

          <button onClick={fetchLogs} className="refresh-button">
            🔄 Refresh
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="logs-stats">
          <div className="stat-card">
            <div className="stat-value">{logs.length}</div>
            <div className="stat-label">Tổng số logs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{logs.filter(l => l.action === 'INSERT').length}</div>
            <div className="stat-label">Thêm mới</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{logs.filter(l => l.action === 'UPDATE').length}</div>
            <div className="stat-label">Cập nhật</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{logs.filter(l => l.action === 'DELETE').length}</div>
            <div className="stat-label">Xóa</div>
          </div>
        </div>

        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Admin</th>
                <th>Hành động</th>
                <th>Bảng</th>
                <th>Record ID</th>
                <th>Dữ liệu cũ</th>
                <th>Dữ liệu mới</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="timestamp">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td>{log.admin_users?.email || 'Unknown'}</td>
                  <td>
                    <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="table-name">{log.table_name}</td>
                  <td className="record-id">{log.record_id?.substring(0, 8)}...</td>
                  <td className="data-preview">
                    {formatJsonPreview(log.old_data)}
                  </td>
                  <td className="data-preview">
                    {formatJsonPreview(log.new_data)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="no-results">
              Chưa có activity logs nào
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
