import { useCallback, useEffect, useState } from 'react'
import { fetchLocations } from './api/client'
import { Header } from './components/Header'
import { LocationDetail } from './components/LocationDetail'
import { ReportModal } from './components/ReportModal'
import { useLocationFilters } from './hooks/useLocationFilters'
import { HomePage } from './pages/HomePage'
import { AdminPage } from './pages/AdminPage'
import type { PoolLocation } from './types/location'

function HomeApp() {
  const [locations, setLocations] = useState<PoolLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { query, region, view, filteredLocations, setQuery, setRegion, setView } = useLocationFilters(locations)
  const [selectedLocation, setSelectedLocation] = useState<PoolLocation | null>(null)
  const [detailLocation, setDetailLocation] = useState<PoolLocation | null>(null)
  const [reportLocation, setReportLocation] = useState<PoolLocation | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const loadLocations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setLocations(await fetchLocations())
    } catch {
      setError('地點資料暫時無法載入，請稍後再試。')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLocations()
  }, [loadLocations])

  const selectLocation = useCallback((location: PoolLocation) => {
    setSelectedLocation(location)
  }, [])

  const openReport = (location: PoolLocation | null = null) => {
    setReportLocation(location)
    setIsReportOpen(true)
  }

  const closeReport = () => {
    setIsReportOpen(false)
    setReportLocation(null)
  }

  return (
    <div className="app-shell">
      <Header onReport={() => openReport()} />

      <HomePage
        query={query}
        region={region}
        view={view}
        filteredLocations={filteredLocations}
        selectedLocation={selectedLocation}
        loading={loading}
        error={error}
        onRetry={() => void loadLocations()}
        onQueryChange={setQuery}
        onRegionChange={setRegion}
        onViewChange={setView}
        onSelectListLocation={setDetailLocation}
        onSelectMapLocation={selectLocation}
        onViewDetails={setDetailLocation}
        onCloseMapSelection={() => setSelectedLocation(null)}
      />

      <nav className="mobile-view-nav" aria-label="檢視模式">
        <button className={view === 'list' ? 'is-active' : ''} type="button" onClick={() => setView('list')}>
          清單
        </button>
        <button className={view === 'map' ? 'is-active' : ''} type="button" onClick={() => setView('map')}>
          地圖
        </button>
      </nav>

      {detailLocation && (
        <LocationDetail
          location={detailLocation}
          onClose={() => setDetailLocation(null)}
          onReport={() => {
            setDetailLocation(null)
            openReport(detailLocation)
          }}
        />
      )}
      <ReportModal open={isReportOpen} location={reportLocation} onClose={closeReport} />
    </div>
  )
}

function App() {
  const pathname = window.location.pathname
  if (pathname === '/admin' || pathname === '/admin/login') return <AdminPage />
  return <HomeApp />
}

export default App
