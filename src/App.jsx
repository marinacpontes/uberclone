import { AppProvider, useApp } from './state/AppProvider';
import { TripProvider } from './state/TripProvider';
import MapView from './components/MapView';
import StatusBar from './components/StatusBar';
import Toast from './components/Toast';
import DesktopAside from './components/DesktopAside';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import MapPickScreen from './screens/MapPickScreen';
import RideOptionsScreen from './screens/RideOptionsScreen';
import MatchingScreen from './screens/MatchingScreen';
import TripScreen from './screens/TripScreen';
import ChatScreen from './screens/ChatScreen';
import RatingScreen from './screens/RatingScreen';
import ServicesScreen from './screens/ServicesScreen';
import ActivityScreen from './screens/ActivityScreen';
import AccountScreen from './screens/AccountScreen';
import { useMapScene } from './hooks/useMapScene';
import './App.css';

const SCREENS = {
  home: HomeScreen,
  search: SearchScreen,
  pick: MapPickScreen,
  options: RideOptionsScreen,
  matching: MatchingScreen,
  trip: TripScreen,
  chat: ChatScreen,
  rating: RatingScreen,
  services: ServicesScreen,
  activity: ActivityScreen,
  account: AccountScreen,
};

/** Telas que dependem de uma viagem montada (origem + destino). */
const NEEDS_DESTINATION = new Set(['options', 'matching']);

function Shell() {
  const { current, stack, destination, toast } = useApp();
  const scene = useMapScene();
  const screenName = NEEDS_DESTINATION.has(current.name) && !destination ? 'home' : current.name;
  const Screen = SCREENS[screenName] ?? HomeScreen;

  return (
    <div className="stage">
      <DesktopAside />
      <main className="device" aria-label="Aplicativo de transporte">
        <span className="device__island" aria-hidden="true" />
        <StatusBar />
        <MapView scene={scene} />
        <Screen key={`${screenName}-${stack.length}`} params={current.params} />
        <Toast toast={toast} />
        <span className="device__home-indicator" aria-hidden="true" />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <TripProvider>
        <Shell />
      </TripProvider>
    </AppProvider>
  );
}
