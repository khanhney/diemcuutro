import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useSearchParams } from 'react-router-dom'
import EditPointModal from '../components/EditPointModal'
import AddPointModal from '../components/AddPointModal'
import AdminLayout from '../components/AdminLayout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { cn } from '../lib/utils'
import {
  MoreHorizontal,
  Edit,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Trash2,
  MapPin,
  Plus,
} from 'lucide-react'
import { useAdminRole } from '../hooks/useAdminRole'

export default function AdminDashboard() {
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingPoint, setEditingPoint] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'all'
  const { isAdmin, isReviewer } = useAdminRole()

  useEffect(() => {
    checkAuth()
    fetchPoints()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/admin/login')
    }
  }

  const fetchPoints = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('relief_points')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPoints(data || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (point) => {
    try {
      const newStatus = point.status === 'Open' ? 'closed' : 'open'
      const { error } = await supabase
        .from('relief_points')
        .update({ status: newStatus })
        .eq('id', point.id)

      if (error) throw error

      setPoints(points.map(p =>
        p.id === point.id ? { ...p, status: newStatus } : p
      ))
    } catch (error) {
      alert('Lỗi cập nhật trạng thái: ' + error.message)
    }
  }

  const handleDelete = async (pointId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa điểm này?')) return

    try {
      const { error } = await supabase
        .from('relief_points')
        .delete()
        .eq('id', pointId)

      if (error) throw error

      setPoints(points.filter(p => p.id !== pointId))
    } catch (error) {
      alert('Lỗi xóa điểm: ' + error.message)
    }
  }

  const handleVerify = async (point) => {
    try {
      const newVerifiedAt = point.verified_at ? null : new Date().toISOString()
      const { error } = await supabase
        .from('relief_points')
        .update({ verified_at: newVerifiedAt })
        .eq('id', point.id)

      if (error) throw error

      setPoints(points.map(p =>
        p.id === point.id ? { ...p, verified_at: newVerifiedAt } : p
      ))
    } catch (error) {
      alert('Lỗi cập nhật verified: ' + error.message)
    }
  }

  const filteredPoints = points.filter(point => {
    const matchesSearch =
      point.location_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.city?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || point.status === filterStatus

    const matchesTab = activeTab === 'all' || (activeTab === 'unverified' && !point.verified_at)

    return matchesSearch && matchesStatus && matchesTab
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredPoints.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPoints.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, activeTab])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-[hsl(var(--color-muted-foreground))]">Đang tải dữ liệu...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {activeTab === 'unverified' ? 'Chờ xét duyệt' : 'Quản trị điểm cứu trợ'}
            </h1>
            <p className="text-[hsl(var(--color-muted-foreground))] mt-1">
              {activeTab === 'unverified'
                ? 'Xem và duyệt các điểm cứu trợ chờ xác minh'
                : 'Quản lý tất cả các điểm cứu trợ trong hệ thống'}
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm điểm mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="text-2xl font-bold">{points.length}</div>
            <div className="text-sm text-[hsl(var(--color-muted-foreground))]">Tổng số điểm</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">{points.filter(p => p.status === 'open').length}</div>
            <div className="text-sm text-[hsl(var(--color-muted-foreground))]">Đang mở</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">{points.filter(p => !p.verified_at).length}</div>
            <div className="text-sm text-[hsl(var(--color-muted-foreground))]">Chờ xét duyệt</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, địa chỉ, thành phố..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-md border border-[hsl(var(--color-input))] bg-[hsl(var(--color-background))] px-3 py-2 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="open">Đang mở</option>
            <option value="closed">Đã đóng</option>
          </select>
        </div>

        {error && (
          <div className="rounded-md bg-[hsl(var(--color-destructive)/0.1)] p-3 text-sm text-[hsl(var(--color-destructive))]">
            {error}
          </div>
        )}

        {/* Table - Desktop */}
        <Card className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[hsl(var(--color-muted)/0.3)]">
                <tr className="text-sm text-[hsl(var(--color-muted-foreground))]">
                  <th className="px-6 py-4 text-left font-medium">Địa điểm</th>
                  <th className="px-6 py-4 text-left font-medium">Địa chỉ</th>
                  <th className="px-6 py-4 text-left font-medium">Trạng thái</th>
                  <th className="px-6 py-4 text-left font-medium">Ngày tạo</th>
                  <th className="px-6 py-4 text-left font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((point, index) => (
                  <tr
                    key={point.id}
                    className={cn(
                      "border-b border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-muted)/0.1)] transition-colors",
                      index % 2 === 0 ? "bg-white" : "bg-[hsl(var(--color-muted)/0.05)]"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-[hsl(var(--color-muted-foreground))] shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{point.location_name || 'N/A'}</div>
                          {!point.verified_at && (
                            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                              Chờ duyệt
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[hsl(var(--color-foreground))]">
                        {point.address || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-md px-3 py-1 text-sm font-medium",
                        point.status === 'Open'
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {point.status === 'Open' ? 'Đang mở' : 'Đã đóng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[hsl(var(--color-foreground))]">
                      {new Date(point.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-5 w-5" />
                            <span className="sr-only">Mở menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setEditingPoint(point)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusToggle(point)}>
                            {point.status === 'Open' ? (
                              <>
                                <Lock className="mr-2 h-4 w-4" />
                                Đóng điểm
                              </>
                            ) : (
                              <>
                                <Unlock className="mr-2 h-4 w-4" />
                                Mở điểm
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVerify(point)}>
                            {point.verified_at ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Bỏ xác minh
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Xác minh
                              </>
                            )}
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(point.id)}
                                className="text-[hsl(var(--color-destructive))]"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPoints.length === 0 && (
              <div className="p-12 text-center text-[hsl(var(--color-muted-foreground))]">
                Không tìm thấy điểm nào phù hợp
              </div>
            )}
          </div>
        </Card>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-3">
          {currentItems.map((point) => (
            <Card key={point.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-[hsl(var(--color-muted-foreground))] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">{point.location_name || 'N/A'}</h3>
                      <p className="text-xs text-[hsl(var(--color-muted-foreground))] mt-0.5">
                        {point.address || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      point.status === 'Open'
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    )}>
                      {point.status === 'Open' ? 'Đang mở' : 'Đã đóng'}
                    </span>

                    {!point.verified_at && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                        Chờ duyệt
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[hsl(var(--color-muted-foreground))] mt-2">
                    {new Date(point.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Mở menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setEditingPoint(point)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusToggle(point)}>
                      {point.status === 'Open' ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Đóng điểm
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Mở điểm
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleVerify(point)}>
                      {point.verified_at ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Bỏ xác minh
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Xác minh
                        </>
                      )}
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(point.id)}
                          className="text-[hsl(var(--color-destructive))]"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}

          {filteredPoints.length === 0 && (
            <Card className="p-8">
              <div className="text-center text-[hsl(var(--color-muted-foreground))]">
                Không tìm thấy điểm nào phù hợp
              </div>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPoints.length)} / {filteredPoints.length} điểm
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Trước
              </Button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                ) {
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                } else if (
                  pageNumber === currentPage - 3 ||
                  pageNumber === currentPage + 3
                ) {
                  return <span key={pageNumber} className="px-2">...</span>
                }
                return null
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Tiếp →
              </Button>
            </div>
          </div>
        )}
      </div>

      {editingPoint && (
        <EditPointModal
          point={editingPoint}
          onClose={() => setEditingPoint(null)}
          onSave={fetchPoints}
        />
      )}

      {showAddModal && (
        <AddPointModal
          onClose={() => setShowAddModal(false)}
          onSave={fetchPoints}
        />
      )}
    </AdminLayout>
  )
}
