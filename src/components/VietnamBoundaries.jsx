import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

const VietnamBoundaries = () => {
  const map = useMap()

  useEffect(() => {
    // Tọa độ biên giới Việt Nam (simplified) bao gồm Hoàng Sa và Trường Sa
    const vietnamBoundary = {
      type: 'Feature',
      properties: {
        name: 'Việt Nam',
        color: '#da251d' // Màu đỏ của cờ Việt Nam
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          // Biên giới đất liền Việt Nam (từ Bắc xuống Nam)
          [109.4644, 23.3926], // Cao Bằng - Biên giới phía Bắc
          [108.0350, 22.3364], // Lào Cai
          [107.0850, 22.4350], // Lai Châu
          [105.9530, 22.5080], // Điện Biên
          [105.2710, 21.9080], // Sơn La
          [104.9420, 21.5350], // Hòa Bình
          [105.8542, 21.0285], // Hà Nội
          [106.4010, 20.4790], // Hải Phòng
          [107.0840, 20.8567], // Quảng Ninh
          [108.2200, 16.0544], // Đà Nẵng
          [109.1967, 12.2585], // Khánh Hòa
          [109.1772, 11.9380], // Ninh Thuận
          [108.9901, 11.5636], // Bình Thuận
          [107.8340, 10.3460], // Bà Rịa - Vũng Tàu
          [106.6297, 10.8231], // TP.HCM
          [105.4360, 10.3775], // Tiền Giang
          [105.0984, 9.8349],  // Bến Tre
          [105.1259, 9.4540],  // Trà Vinh
          [105.4430, 9.1832],  // Sóc Trăng
          [105.7272, 8.8601],  // Bạc Liêu
          [105.0251, 8.5500],  // Cà Mau (mũi)

          // Vùng biển đông (biên giới biển)
          [106.0000, 8.4000],  // Biển Đông
          [107.5000, 8.5000],  // Trường Sa (phía Nam)
          [111.9333, 8.6500],  // Trường Sa (phía Đông) - Đảo Sinh Tồn Đông
          [112.2000, 9.5000],  // Trường Sa (phía Đông Bắc)
          [113.0000, 10.5000], // Vùng biển Trường Sa
          [114.3500, 11.4167], // Trường Sa (ranh giới xa nhất)

          // Vùng Hoàng Sa
          [112.8333, 15.8000], // Đảo Phú Lâm (Woody Island) - phía Đông Hoàng Sa
          [112.3500, 16.5333], // Đảo Linh Côn (Lincoln Island) - phía Bắc
          [111.7000, 16.9000], // Hoàng Sa (phía Tây Bắc)
          [111.2000, 16.8000], // Hoàng Sa (phía Tây)

          // Quay lại đất liền
          [110.5000, 17.4000], // Vùng biển Quảng Nam
          [109.5000, 18.5000], // Quảng Bình
          [108.5000, 19.8000], // Hà Tĩnh
          [108.0000, 20.9000], // Nghệ An
          [107.5000, 21.5000], // Thanh Hóa
          [107.0000, 22.3000], // Vịnh Bắc Bộ
          [108.5000, 21.5000], // Quảng Ninh (biển)
          [109.4644, 23.3926]  // Quay lại điểm đầu
        ]]
      }
    }

    // Vẽ biên giới
    const boundaryLayer = L.geoJSON(vietnamBoundary, {
      style: {
        color: '#da251d',
        weight: 3,
        opacity: 0.8,
        fillColor: '#ffed4e',
        fillOpacity: 0.08,
        dashArray: '8, 4'
      }
    }).addTo(map)

    // Vùng đặc biệt cho Hoàng Sa
    const hoangSaArea = L.circle([16.5333, 112.3333], {
      color: '#da251d',
      fillColor: '#ffed4e',
      fillOpacity: 0.15,
      radius: 80000, // 80km radius
      weight: 2,
      dashArray: '5, 5'
    }).addTo(map)

    hoangSaArea.bindPopup(`
      <div style="font-family: system-ui; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #da251d; font-size: 16px;">
          🇻🇳 Quần đảo Hoàng Sa
        </h3>
        <p style="margin: 4px 0; font-size: 13px;">
          <strong>Paracel Islands</strong>
        </p>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">
          Chủ quyền: Việt Nam 🇻🇳
        </p>
        <p style="margin: 4px 0; font-size: 11px; color: #888;">
          Tọa độ: 16°32'N 112°20'E
        </p>
      </div>
    `)

    // Vùng đặc biệt cho Trường Sa
    const truongSaArea = L.circle([10.0000, 114.0000], {
      color: '#da251d',
      fillColor: '#ffed4e',
      fillOpacity: 0.15,
      radius: 120000, // 120km radius
      weight: 2,
      dashArray: '5, 5'
    }).addTo(map)

    truongSaArea.bindPopup(`
      <div style="font-family: system-ui; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #da251d; font-size: 16px;">
          🇻🇳 Quần đảo Trường Sa
        </h3>
        <p style="margin: 4px 0; font-size: 13px;">
          <strong>Spratly Islands</strong>
        </p>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">
          Chủ quyền: Việt Nam 🇻🇳
        </p>
        <p style="margin: 4px 0; font-size: 11px; color: #888;">
          Tọa độ: 10°00'N 114°00'E
        </p>
      </div>
    `)

    // Cleanup khi component unmount
    return () => {
      map.removeLayer(boundaryLayer)
      map.removeLayer(hoangSaArea)
      map.removeLayer(truongSaArea)
    }
  }, [map])

  return null
}

export default VietnamBoundaries
