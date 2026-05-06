import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Economy from './modules/Economy'
import Arsenal from './modules/Arsenal'
import PvP from './modules/PvP'
import Quetes from './modules/Quetes'
import { useLocalStorage } from './hooks/useLocalStorage'

const TITLES = {
  economie: { title: 'Économie',  subtitle: 'Affinage & flips Marché Noir.' },
  arsenal:  { title: 'Arsenal',   subtitle: 'Loadouts, budget et tolérance au risque.' },
  pvp:      { title: 'PvP',       subtitle: 'Journal de combats, fame et K/D.' },
  quetes:   { title: 'Tâches',    subtitle: 'Routine quotidienne d\'Aventurier.' },
}

export default function App() {
  const [route, setRoute] = useLocalStorage('app.route', 'economie')
  const [fortune, setFortune] = useLocalStorage('app.fortune', 5_000_000)

  const meta = TITLES[route] ?? TITLES.economie

  return (
    <div className="h-full flex">
      <Sidebar current={route} onChange={setRoute} />
      <main className="flex-1 flex flex-col min-w-0">
        <Topbar title={meta.title} subtitle={meta.subtitle} fortune={fortune} />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {route === 'economie' && <Economy />}
            {route === 'arsenal'  && <Arsenal fortune={fortune} setFortune={setFortune} />}
            {route === 'pvp'      && <PvP />}
            {route === 'quetes'   && <Quetes />}
          </div>
        </div>
      </main>
    </div>
  )
}
