document.getElementById('year').textContent = new Date().getFullYear()
const menuButton = document.querySelector('.menu-button')
const nav = document.querySelector('.site-header nav')
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open')
  menuButton.setAttribute('aria-expanded', String(open))
})

const data = window.FOOTPRINT_DATA
const fmt = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
const cityNames = {
  'Beijing':'北京','Neijiang':'内江','Guangzhou':'广州','Xian':'西安','Xi?an':'西安','Suzhou':'苏州','Dalian':'大连',
  'Macau':'澳门','Hong Kong':'香港','Changsha':'长沙','Chengdu':'成都','Yichang':'宜昌','Shenzhen':'深圳',
  'Zhuhai':'珠海','Wuhan':'武汉','Chongqing':'重庆','Milan':'米兰','Unknown':'旅途中的一站'
}

document.getElementById('stat-years').textContent = data.meta.years
document.getElementById('stat-points').textContent = data.meta.totalPoints.toLocaleString('zh-CN')
document.getElementById('stat-photos').textContent = data.meta.photoPoints.toLocaleString('zh-CN')
document.getElementById('stat-cities').textContent = data.meta.cities

const mapStatus = document.getElementById('map-status')
if (window.L) {
  const map = L.map('footprint-map', { zoomControl: false, preferCanvas: true })
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(map)
  const track = L.polyline(data.track.map(p => [p[1], p[0]]), { color: '#355c4d', weight: 1.5, opacity: .48 }).addTo(map)
  const photoLayer = L.layerGroup().addTo(map)
  data.photos.forEach(p => {
    const marker = L.circleMarker([p[1], p[0]], { radius: 2.7, color: '#fff', weight: .6, fillColor: '#c69055', fillOpacity: .72 })
    marker.bindPopup(`<strong>${fmt.format(new Date(p[2] * 1000))}</strong><br>${p[1].toFixed(3)}, ${p[0].toFixed(3)}`)
    marker.addTo(photoLayer)
  })
  map.fitBounds(track.getBounds(), { padding: [25, 25] })
  mapStatus.hidden = true
  document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => {
    document.querySelector('.filter-button.active').classList.remove('active')
    button.classList.add('active')
    const choice = button.dataset.layer
    if (choice === 'photos') map.removeLayer(track); else if (!map.hasLayer(track)) track.addTo(map)
    if (choice === 'track') map.removeLayer(photoLayer); else if (!map.hasLayer(photoLayer)) photoLayer.addTo(map)
  }))
} else {
  mapStatus.textContent = '地图底图暂时无法载入，请检查网络后刷新。'
}

const timeline = document.getElementById('journey-timeline')
const filters = document.getElementById('year-filters')
const visitsData = data.visits.filter(v => v.city !== 'Unknown')
const years = [...new Set(visitsData.map(v => String(v.year)))].sort((a, b) => b - a)
function renderTimeline(year = '全部') {
  timeline.innerHTML = ''
  const visits = year === '全部' ? visitsData : visitsData.filter(v => String(v.year) === year)
  visits.forEach(v => {
    const item = document.createElement('article')
    item.className = 'timeline-item'
    const end = v.end === v.start ? '' : ` — ${v.end.slice(5).replace('-', '.')}`
    item.innerHTML = `<time class="timeline-date">${v.start.replaceAll('-', '.')}${end}</time><div class="timeline-mark"></div><div class="timeline-place"><h3>${cityNames[v.city] || v.city}</h3><p>${v.days} 天记录 · ${v.points.toLocaleString('zh-CN')} 个足迹点${v.photos ? ` · ${v.photos.toLocaleString('zh-CN')} 个照片位置` : ''}</p><p class="coords">${v.lat.toFixed(3)}°N / ${v.lon.toFixed(3)}°E</p></div>`
    timeline.appendChild(item)
  })
}
;['全部', ...years].forEach((year, index) => {
  const button = document.createElement('button')
  button.textContent = year
  button.className = index === 0 ? 'active' : ''
  button.addEventListener('click', () => {
    filters.querySelector('.active').classList.remove('active')
    button.classList.add('active')
    renderTimeline(year)
  })
  filters.appendChild(button)
})
renderTimeline()
