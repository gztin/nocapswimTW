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
  const { query, region, filteredLocations, setQuery, setRegion } = useLocationFilters(locations)
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
        filteredLocations={filteredLocations}
        loading={loading}
        error={error}
        onRetry={() => void loadLocations()}
        onQueryChange={setQuery}
        onRegionChange={setRegion}
        onSelectListLocation={setDetailLocation}
      />

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
