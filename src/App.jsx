import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Economy from './modules/Economy'
import Arsenal from './modules/Arsenal'
import Progression from './modules/Progression'
import Ile from './modules/Ile'
import { useLocalStorage } from './hooks/useLocalStorage'

const TITLES = {
  economie:    { title: 'Économie',    subtitle: 'Affinage & flips Marché Noir.' },
  arsenal:     { title: 'Arsenal',     subtitle: 'Loadouts, budget et tolérance au risque.' },
  progression: { title: 'Progression', subtitle: 'Chrono de session & fame par heure.' },
  ile:         { title: 'Gestion d\'Île', subtitle: 'Minuteurs de récoltes et d\'élevage.' },
}

const DEFAULT_ROUTE = 'economie'

export default function App() {
  const [route, setRoute] = useLocalStorage('app.route', DEFAULT_ROUTE)
  const [fortune, setFortune] = useLocalStorage('app.fortune', 5_000_000)

  const meta = TITLES[route] ?? TITLES[DEFAULT_ROUTE]
  const safeRoute = TITLES[route] ? route : DEFAULT_ROUTE

  return (
    <div className="h-full flex">
      <Sidebar current={safeRoute} onChange={setRoute} />
      <main className="flex-1 flex flex-col min-w-0">
        <Topbar title={meta.title} subtitle={meta.subtitle} fortune={fortune} />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {safeRoute === 'economie'    && <Economy />}
            {safeRoute === 'arsenal'     && <Arsenal fortune={fortune} setFortune={setFortune} />}
            {safeRoute === 'progression' && <Progression />}
            {safeRoute === 'ile'         && <Ile />}
          </div>
        </div>
      </main>
    </div>
  )
}
