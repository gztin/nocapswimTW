import { useEffect, useMemo, useState } from 'react'
import type { PoolLocation, Region } from '../types/location'

export type RegionFilter = Region | 'all'

interface FilterState {
  query: string
  region: RegionFilter
}

const validRegions: RegionFilter[] = ['all', 'north', 'central', 'south', 'east', 'islands']

function readUrlState(): FilterState {
  const params = new URLSearchParams(window.location.search)
  const urlRegion = params.get('region') as RegionFilter | null
  return {
    query: params.get('q') ?? '',
    region: urlRegion && validRegions.includes(urlRegion) ? urlRegion : 'all',
  }
}

function writeUrlState(state: FilterState) {
  const params = new URLSearchParams()
  if (state.query.trim()) params.set('q', state.query.trim())
  if (state.region !== 'all') params.set('region', state.region)
  const queryString = params.toString()
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`
  window.history.replaceState(null, '', nextUrl)
}

export function useLocationFilters(allLocations: PoolLocation[]) {
  const [state, setState] = useState<FilterState>(readUrlState)

  useEffect(() => {
    const handlePopState = () => setState(readUrlState())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    writeUrlState(state)
  }, [state])

  const filteredLocations = useMemo(() => {
    const normalizedQuery = state.query.trim().toLocaleLowerCase('zh-TW')

    return allLocations.filter((location) => {
      const matchesRegion = state.region === 'all' || location.region === state.region
      const searchableText = [location.name, location.city, location.district, location.address]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('zh-TW')
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery)
      return matchesRegion && matchesQuery
    })
  }, [allLocations, state.query, state.region])

  return {
    ...state,
    filteredLocations,
    setQuery: (query: string) => setState((current) => ({ ...current, query })),
    setRegion: (region: RegionFilter) => setState((current) => ({ ...current, region })),
  }
}
