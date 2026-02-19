import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
  ArcElement
} from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { Search, Bell, Sparkles, Menu, LogOut, LayoutDashboard, Database, PieChart as PieChartIcon, ArrowUp, ArrowDown, ListFilter } from 'lucide-react'

import Sidebar from './components/Sidebar'
import { useScrollSpy } from './hooks/useScrollSpy'
import SummaryHero from './components/SummaryHero'
import ChannelTable from './components/ChannelTable'
import MonthlyTrend from './components/MonthlyTrend'
import AdditionalCharts from './components/AdditionalCharts'
import CampaignSection from './components/CampaignSection'
import InsightsPanel from './components/InsightsPanel'
import FiltersBar from './components/FiltersBar'
import BudgetSimulator from './components/BudgetSimulator'
import Login from './components/Login'
import Tutorial from './components/Tutorial'
import { useAuth } from './context/AuthContext'
import { Toast, SkeletonHeroGrid, SkeletonTable, SkeletonCards } from './components/Feedback'

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
  ArcElement
)

const SECTION_IDS = [
  'section-overview', 'section-channels', 'section-monthly',
  'section-simulator', 'section-campaigns', 'section-insights',
]
const CHANNEL_NAMES = ['Email', 'SEO', 'LinkedIn', 'Google Ads', 'Influencer', 'Meta Ads', 'Instagram']


import API_BASE_URL from './config'

async function safeFetch(url) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, { credentials: 'include' })
  if (!res.ok) throw new Error(`API error ${res.status}: ${fullUrl}`)
  return res.json()
}


export default function App() {
  const { user, loading: authLoading, logout } = useAuth()


  const [summary, setSummary] = useState(null)
  const [channels, setChannels] = useState([])
  const [monthly, setMonthly] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [insights, setInsights] = useState([])


  const [loadingInit, setLoadingInit] = useState(true)
  const [loadingChannels, setLoadingChannels] = useState(false)
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [isApplyingFilters, setIsApplyingFilters] = useState(false)


  const [toast, setToast] = useState({ message: '', type: 'error' })
  const [showTutorial, setShowTutorial] = useState(false)

  const showError = (msg) => setToast({ message: msg, type: 'error' })
  const showSuccess = (msg) => setToast({ message: msg, type: 'success' })

  const fetchTutorialStatus = useCallback(async () => {
    try {
      const data = await safeFetch('/api/tutorial/status')
      if (!data.tutorialSeen) setShowTutorial(true)
    } catch (err) {
      console.error('Could not fetch tutorial status', err)
    }
  }, [])

  const handleTutorialComplete = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/tutorial/complete`, {
        method: 'POST',
        credentials: 'include'
      })
      setShowTutorial(false)
    } catch (err) {
      console.error('Could not complete tutorial', err)
      setShowTutorial(false)
    }
  }


  const [channelFilter, setChannelFilter] = useState('')
  const [minRoas, setMinRoas] = useState('')
  const [maxRoas, setMaxRoas] = useState('')
  const [channelSort, setChannelSort] = useState('roas')
  const [channelOrder, setChannelOrder] = useState('desc')
  const [selectedMonth, setSelectedMonth] = useState('')

  const channelFilterRef = useRef('')
  const minRoasRef = useRef('')
  const maxRoasRef = useRef('')
  const channelSortRef = useRef('roas')
  const channelOrderRef = useRef('desc')
  const selectedMonthRef = useRef('')

  const setChannelFilterSync = (v) => { channelFilterRef.current = v; setChannelFilter(v) }
  const setMinRoasSync = (v) => { minRoasRef.current = v; setMinRoas(v) }
  const setMaxRoasSync = (v) => { maxRoasRef.current = v; setMaxRoas(v) }
  const setChannelSortSync = (v) => { channelSortRef.current = v; setChannelSort(v) }
  const setChannelOrderSync = (v) => { channelOrderRef.current = v; setChannelOrder(v) }

  const handleMonthChange = (m) => {
    if (m === selectedMonthRef.current) return

    selectedMonthRef.current = m
    setSelectedMonth(m)

    const ch = channelFilterRef.current

    fetchChannels(undefined, undefined, m)
    fetchCampaigns(undefined, undefined, undefined, m)
    fetchSummary(m, ch)
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)


  const { activeId, scrollToSection } = useScrollSpy(SECTION_IDS, 'main-scroll-area', 120)



  const fetchChannels = useCallback(async (sort, order, month) => {
    const s = sort !== undefined ? sort : channelSortRef.current
    const o = order !== undefined ? order : channelOrderRef.current
    const m = month !== undefined ? month : selectedMonthRef.current

    const channel = channelFilterRef.current
    const minR = minRoasRef.current
    const maxR = maxRoasRef.current

    setLoadingChannels(true)
    try {
      const params = new URLSearchParams({ sort_by: s, order: o })
      if (m) params.append('month', m)
      if (channel) params.append('channel', channel)
      if (minR) params.append('min_roas', minR)
      if (maxR) params.append('max_roas', maxR)

      const data = await safeFetch(`/api/channels?${params}`)
      setChannels(data)
    } catch {
      showError('Failed to load channel data.')
    } finally {
      setLoadingChannels(false)
    }
  }, [])

  const fetchCampaigns = useCallback(async (ch, mn, mx, month) => {
    const channel = ch !== undefined ? ch : channelFilterRef.current
    const minR = mn !== undefined ? mn : minRoasRef.current
    const maxR = mx !== undefined ? mx : maxRoasRef.current
    const m = month !== undefined ? month : selectedMonthRef.current

    setLoadingCampaigns(true)
    try {
      const params = new URLSearchParams()
      if (channel) params.set('channel', channel)
      if (minR) params.set('min_roas', minR)
      if (maxR) params.set('max_roas', maxR)
      if (m) params.set('month', m)

      const data = await safeFetch(`/api/campaigns?${params}`)
      setCampaigns(data)
    } catch {
      showError('Failed to load campaign data.')
    } finally {
      setLoadingCampaigns(false)
    }
  }, [])

  const fetchSummary = useCallback(async (month, channel) => {
    try {
      const params = new URLSearchParams()
      if (month) params.append('month', month)
      if (channel) params.append('channel', channel)
      const data = await safeFetch(`/api/summary?${params}`)
      setSummary(data)
    } catch (err) {
      console.error("Failed to fetch summary", err)
    }
  }, [])

  const fetchMonthly = useCallback(async (channel) => {
    try {
      const params = new URLSearchParams()
      if (channel) params.append('channel', channel)
      const data = await safeFetch(`/api/monthly?${params}`)
      setMonthly(data)
    } catch (err) {
      console.error("Failed to fetch monthly trends", err)
    }
  }, [])


  useEffect(() => {
    if (!user) return;

    const init = async () => {
      setLoadingInit(true)
      try {
        await Promise.allSettled([
          fetchSummary('', ''),
          fetchChannels('roas', 'desc', ''),
          fetchMonthly(''),
          fetchCampaigns('', '', '', ''),
          safeFetch('/api/insights').then(setInsights)
        ])
        fetchTutorialStatus()
      } finally {
        setLoadingInit(false)
      }
    }
    init()
  }, [user, fetchChannels, fetchCampaigns, fetchSummary, fetchMonthly])


  const handleSortChange = (col, ord) => {
    const newSort = col !== undefined ? col : channelSortRef.current
    const newOrder = ord !== undefined ? ord : (channelSortRef.current === col && channelOrderRef.current === 'desc' ? 'asc' : 'desc')
    setChannelSortSync(newSort)
    setChannelOrderSync(newOrder)
    fetchChannels(newSort, newOrder)
  }

  const handleApplyFilters = async () => {
    setIsApplyingFilters(true)
    const ch = channelFilterRef.current
    const m = selectedMonthRef.current

    try {
      await Promise.all([
        fetchChannels(channelSortRef.current, channelOrderRef.current),
        fetchCampaigns(channelFilterRef.current, minRoasRef.current, maxRoasRef.current),
        fetchSummary(m, ch),
        fetchMonthly(ch)
      ])
      showSuccess('Filters applied.')
    } finally {
      setIsApplyingFilters(false)
    }
  }

  const handleResetFilters = () => {
    setChannelFilterSync('')
    setMinRoasSync('')
    setMaxRoasSync('')
    setChannelSortSync('roas')
    setChannelOrderSync('desc')

    selectedMonthRef.current = ''
    setSelectedMonth('')

    fetchChannels('roas', 'desc', '')
    fetchCampaigns('', '', '', '')
    fetchSummary('', '')
    fetchMonthly('')

    showSuccess('Filters reset.')
  }

  const handleNavClick = (id) => {
    scrollToSection(id)
    setSidebarOpen(false)
  }


  if (authLoading) return (
    <div className="loading-screen">
      <img src="/logo.png" alt="MarketingOS" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        <span>Loading...</span>
      </div>
    </div>
  )
  if (!user) return <Login />


  const pieData = {
    labels: channels.map(c => c.name),
    datasets: [{
      data: channels.map(c => c.total_spend),
      backgroundColor: ['#059669', '#10b981', '#34d399', '#f59e0b', '#047857', '#065f46', '#6ee7b7'],
      borderWidth: 0,
    }]
  }


  if (loadingInit) {
    return (
      <div className="loading-screen" role="status" aria-label="Loading dashboard">
        <div className="loading-spinner" />
        <p className="loading-text">Loading Marketing Data…</p>
      </div>
    )
  }



  return (
    <div className="app-container">
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar activeId={activeId} onNavClick={handleNavClick} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main id="main-scroll-area" className="main-content" tabIndex={-1}>
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
            <div>
              <h1 className="page-title">Marketing Analytics</h1>
              <p className="page-subtitle">Welcome back, {user.name}</p>
            </div>
          </div>
          <div className="top-actions">
          </div>
        </header>

        <FiltersBar
          channels={CHANNEL_NAMES}
          selectedChannel={channelFilter} onChannelChange={setChannelFilterSync}
          minRoas={minRoas} onMinRoas={setMinRoasSync}
          maxRoas={maxRoas} onMaxRoas={setMaxRoasSync}
          sortBy={channelSort} onSortBy={handleSortChange}
          order={channelOrder} onOrderChange={(ord) => handleSortChange(undefined, ord)}
          onApply={handleApplyFilters} onReset={handleResetFilters}
        />

        {(selectedMonth || channelFilter || minRoas || maxRoas) && (
          <div className="active-filters" style={{ display: 'flex', gap: '12px', padding: '0 2.5rem 1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Filters:</span>

            {selectedMonth && (
              <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, color: '#374151', border: '1px solid #e5e7eb' }}>
                <span style={{ marginRight: '6px' }}>Month:</span> <strong>{selectedMonth}</strong>
                <button onClick={() => handleMonthChange('')} style={{ background: 'transparent', border: 'none', marginLeft: '8px', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0, fontSize: '1.2rem', lineHeight: 1 }}>×</button>
              </div>
            )}

            {channelFilter && (
              <div style={{ display: 'flex', alignItems: 'center', background: '#ede9fe', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                <span style={{ marginRight: '6px' }}>Channel:</span> <strong>{channelFilter}</strong>
                <button onClick={() => { setChannelFilterSync(''); handleApplyFilters(); }} style={{ background: 'transparent', border: 'none', marginLeft: '8px', cursor: 'pointer', color: '#8b5cf6', display: 'flex', alignItems: 'center', padding: 0, fontSize: '1.2rem', lineHeight: 1 }}>×</button>
              </div>
            )}

            {minRoas && (
              <div style={{ display: 'flex', alignItems: 'center', background: '#ecfdf5', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, color: '#059669', border: '1px solid #a7f3d0' }}>
                <span style={{ marginRight: '6px' }}>Min ROAS:</span> <strong>{minRoas}</strong>
                <button onClick={() => { setMinRoasSync(''); handleApplyFilters(); }} style={{ background: 'transparent', border: 'none', marginLeft: '8px', cursor: 'pointer', color: '#059669', display: 'flex', alignItems: 'center', padding: 0, fontSize: '1.2rem', lineHeight: 1 }}>×</button>
              </div>
            )}

            {maxRoas && (
              <div style={{ display: 'flex', alignItems: 'center', background: '#ecfdf5', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, color: '#059669', border: '1px solid #a7f3d0' }}>
                <span style={{ marginRight: '6px' }}>Max ROAS:</span> <strong>{maxRoas}</strong>
                <button onClick={() => { setMaxRoasSync(''); handleApplyFilters(); }} style={{ background: 'transparent', border: 'none', marginLeft: '8px', cursor: 'pointer', color: '#059669', display: 'flex', alignItems: 'center', padding: 0, fontSize: '1.2rem', lineHeight: 1 }}>×</button>
              </div>
            )}
          </div>
        )}

        <div className="dashboard-grid">
          <section id="section-overview" className="dashboard-section">
            <div className="section-heading">
              <h2 className="section-title">Performance Summary</h2>
              <p className="section-desc">Key metrics and budget distribution</p>
            </div>
            <div className="overview-container" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
              {summary ? <SummaryHero summary={summary} /> : <SkeletonHeroGrid />}
              <div className="pie-card">
                <h3 className="chart-title"><PieChartIcon size={16} /> Spend Distribution</h3>
                <div style={{ height: '220px', position: 'relative' }}>
                  <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
                </div>
              </div>
            </div>
          </section>

          <section id="section-channels" className="dashboard-section">
            <div className="section-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="section-title">Channel Performance</h2>
                <p className="section-desc">Real-time efficiency tracking {selectedMonth && `(${selectedMonth})`}</p>
              </div>
              {!loadingChannels && (
                <div className="sorting-controls">
                  <span className="filter-label" style={{ fontSize: '0.65rem' }}>Sort:</span>
                  <select
                    className="filter-select"
                    value={channelSort}
                    onChange={(e) => handleSortChange(e.target.value, channelOrder)}
                    style={{ height: '36px', padding: '0 2rem 0 0.8rem', fontSize: '0.8rem', minWidth: '110px' }}
                  >
                    <option value="name">Name</option>
                    <option value="total_spend">Spend</option>
                    <option value="total_revenue">Revenue</option>
                    <option value="total_conversions">Conversions</option>
                    <option value="roas">ROAS</option>
                    <option value="cpa">CPA</option>
                    <option value="cpc">CPC</option>
                  </select>
                  <button
                    className="sort-btn"
                    onClick={() => handleSortChange(channelSort, channelOrder === 'asc' ? 'desc' : 'asc')}
                    title={channelOrder === 'asc' ? 'Ascending' : 'Descending'}
                    style={{ padding: '0.5rem', height: '36px' }}
                  >
                    {channelOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  </button>
                </div>
              )}
            </div>
            {!loadingChannels ? <ChannelTable channels={channels} sortBy={channelSort} order={channelOrder} onSort={handleSortChange} /> : <SkeletonTable rows={7} />}
          </section>

          {monthly.length > 0 && <MonthlyTrend monthly={monthly} selected={selectedMonth} onSelect={handleMonthChange} />}

          <AdditionalCharts channels={channels} />

          <BudgetSimulator channels={channels} />

          <section id="section-campaigns" className="dashboard-section">
            <div className="section-heading">
              <h2 className="section-title">Campaign Performance</h2>
              <p className="section-desc">Granular campaign tracking {selectedMonth && `(${selectedMonth})`}</p>
            </div>
            {!loadingCampaigns ? <CampaignSection campaigns={campaigns} /> : <SkeletonCards count={5} />}
          </section>

          <InsightsPanel insights={insights} />

        </div>
      </main>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />
    </div>
  )
}
