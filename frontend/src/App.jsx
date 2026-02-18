import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
  ArcElement
} from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { Search, Bell, Sparkles, Menu, LogOut, LayoutDashboard, Database, PieChart as PieChartIcon } from 'lucide-react'

import Sidebar from './components/Sidebar'
import { useScrollSpy } from './hooks/useScrollSpy'
import SummaryHero from './components/SummaryHero'
import ChannelTable from './components/ChannelTable'
import MonthlyTrend from './components/MonthlyTrend'
import CampaignSection from './components/CampaignSection'
import InsightsPanel from './components/InsightsPanel'
import FiltersBar from './components/FiltersBar'
import BudgetSimulator from './components/BudgetSimulator'
import Login from './components/Login'
import { useAuth } from './context/AuthContext'
import { Toast, SkeletonHeroGrid, SkeletonTable, SkeletonCards } from './components/Feedback'

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
  ArcElement
)

const SECTION_IDS = [
  'section-overview', 'section-channels', 'section-monthly',
  'section-simulator', 'section-campaigns', 'section-insights', 'section-settings',
]
const CHANNEL_NAMES = ['Email', 'SEO', 'LinkedIn', 'Google Ads', 'Influencer', 'Meta Ads', 'Instagram']

// ─── Safe fetch ───────────────────────────────────────────────────────────────
async function safeFetch(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`)
  return res.json()
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading: authLoading, logout } = useAuth()

  // ── Data ────────────────────────────────────────────────────────────────────
  const [summary, setSummary] = useState(null)
  const [channels, setChannels] = useState([])
  const [monthly, setMonthly] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [insights, setInsights] = useState([])

  // ── Loading flags ────────────────────────────────────────────────────────────
  const [loadingInit, setLoadingInit] = useState(true)
  const [loadingChannels, setLoadingChannels] = useState(false)
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)

  // ── Toast ────────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ message: '', type: 'error' })
  const showError = (msg) => setToast({ message: msg, type: 'error' })
  const showSuccess = (msg) => setToast({ message: msg, type: 'success' })

  // ── Filters — use refs ───────────────────────────────────────────────────────
  const [channelFilter, setChannelFilter] = useState('')
  const [minRoas, setMinRoas] = useState('')
  const [maxRoas, setMaxRoas] = useState('')
  const [channelSort, setChannelSort] = useState('roas')
  const [channelOrder, setChannelOrder] = useState('desc')

  const channelFilterRef = useRef('')
  const minRoasRef = useRef('')
  const maxRoasRef = useRef('')
  const channelSortRef = useRef('roas')
  const channelOrderRef = useRef('desc')

  const setChannelFilterSync = (v) => { channelFilterRef.current = v; setChannelFilter(v) }
  const setMinRoasSync = (v) => { minRoasRef.current = v; setMinRoas(v) }
  const setMaxRoasSync = (v) => { maxRoasRef.current = v; setMaxRoas(v) }
  const setChannelSortSync = (v) => { channelSortRef.current = v; setChannelSort(v) }
  const setChannelOrderSync = (v) => { channelOrderRef.current = v; setChannelOrder(v) }

  // ── Mobile sidebar ───────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Scroll spy ───────────────────────────────────────────────────────────────
  const { activeId, scrollToSection } = useScrollSpy(SECTION_IDS, 'main-scroll-area', 100)

  // ── Fetch helpers ────────────────────────────────────────────────────────────

  const fetchChannels = useCallback(async (sort, order) => {
    const s = sort !== undefined ? sort : channelSortRef.current
    const o = order !== undefined ? order : channelOrderRef.current
    setLoadingChannels(true)
    try {
      const params = new URLSearchParams({ sort_by: s, order: o })
      const data = await safeFetch(`/api/channels?${params}`)
      setChannels(data)
    } catch {
      showError('Failed to load channel data.')
    } finally {
      setLoadingChannels(false)
    }
  }, [])

  const fetchCampaigns = useCallback(async (ch, mn, mx) => {
    const channel = ch !== undefined ? ch : channelFilterRef.current
    const minR = mn !== undefined ? mn : minRoasRef.current
    const maxR = mx !== undefined ? mx : maxRoasRef.current
    setLoadingCampaigns(true)
    try {
      const params = new URLSearchParams()
      if (channel) params.set('channel', channel)
      if (minR) params.set('min_roas', minR)
      if (maxR) params.set('max_roas', maxR)
      const data = await safeFetch(`/api/campaigns?${params}`)
      setCampaigns(data)
    } catch {
      showError('Failed to load campaign data.')
    } finally {
      setLoadingCampaigns(false)
    }
  }, [])

  // ── Initial load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return; // Don't fetch if not logged in

    const init = async () => {
      setLoadingInit(true)
      try {
        const [sum, ch, mo, camp, ins] = await Promise.allSettled([
          safeFetch('/api/summary'),
          safeFetch('/api/channels?sort_by=roas&order=desc'),
          safeFetch('/api/monthly'),
          safeFetch('/api/campaigns'),
          safeFetch('/api/insights'),
        ])
        if (sum.status === 'fulfilled') setSummary(sum.value)
        if (ch.status === 'fulfilled') setChannels(ch.value)
        if (mo.status === 'fulfilled') setMonthly(mo.value)
        if (camp.status === 'fulfilled') setCampaigns(camp.value)
        if (ins.status === 'fulfilled') setInsights(ins.value)
      } finally {
        setLoadingInit(false)
      }
    }
    init()
  }, [user])

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleSortChange = (col, ord) => {
    const newSort = col !== undefined ? col : channelSortRef.current
    const newOrder = ord !== undefined ? ord : (channelSortRef.current === col && channelOrderRef.current === 'desc' ? 'asc' : 'desc')
    setChannelSortSync(newSort)
    setChannelOrderSync(newOrder)
    fetchChannels(newSort, newOrder)
  }

  const handleApplyFilters = () => {
    fetchChannels(channelSortRef.current, channelOrderRef.current)
    fetchCampaigns(channelFilterRef.current, minRoasRef.current, maxRoasRef.current)
    showSuccess('Filters applied.')
  }

  const handleResetFilters = () => {
    setChannelFilterSync('')
    setMinRoasSync('')
    setMaxRoasSync('')
    setChannelSortSync('roas')
    setChannelOrderSync('desc')
    fetchChannels('roas', 'desc')
    fetchCampaigns('', '', '')
    showSuccess('Filters reset.')
  }

  const handleNavClick = (id) => {
    scrollToSection(id)
    setSidebarOpen(false)
  }

  // ── Auth Logic ──
  if (authLoading) return <div className="loading-screen">Authenticating...</div>
  if (!user) return <Login />

  // ── Extra Viz Data ──
  const pieData = {
    labels: channels.map(c => c.name),
    datasets: [{
      data: channels.map(c => c.total_spend),
      backgroundColor: ['#8b5cf6', '#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#3b82f6', '#f97316'],
      borderWidth: 0,
    }]
  }

  // ── Full-page loading ──
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
            <button className="icon-btn" onClick={logout} title="Log Out"><LogOut size={20} /></button>
            <div className="avatar-badge">AK</div>
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

        <div className="dashboard-grid">
          {/* 1. Overview */}
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

          {/* 2. Channels */}
          <section id="section-channels" className="dashboard-section">
            <div className="section-heading">
              <h2 className="section-title">Channel Performance</h2>
              <p className="section-desc">Real-time efficiency tracking</p>
            </div>
            {!loadingChannels ? <ChannelTable channels={channels} sortBy={channelSort} order={channelOrder} onSort={handleSortChange} /> : <SkeletonTable rows={7} />}
          </section>

          {/* 3. Monthly */}
          {monthly.length > 0 && <MonthlyTrend monthly={monthly} />}

          {/* 4. Simulator (BONUS) */}
          <BudgetSimulator channels={channels} />

          {/* 5. Campaigns */}
          <section id="section-campaigns" className="dashboard-section">
            <div className="section-heading">
              <h2 className="section-title">Campaign Performance</h2>
              <p className="section-desc">Granular campaign tracking</p>
            </div>
            {!loadingCampaigns ? <CampaignSection campaigns={campaigns} /> : <SkeletonCards count={5} />}
          </section>

          <InsightsPanel insights={insights} />

          {/* 6. Settings */}
          <section id="section-settings" className="dashboard-section">
            <div className="section-heading"><h2 className="section-title">Settings</h2></div>
            <div className="settings-grid">
              {[{ t: 'Profile', d: 'Manage account' }, { t: 'API', d: 'Connect integrations' }].map(s => (
                <div key={s.t} className="settings-card"><h4>{s.t}</h4><p>{s.d}</p></div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />
    </div>
  )
}
