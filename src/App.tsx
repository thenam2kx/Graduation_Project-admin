import { ConfigProvider, theme as antTheme } from 'antd'
import Routers from './routers/routers'
import { useAppSelector } from './redux/hooks'
import MediaModal from './components/media-modal/media.modal'


const App = () => {
  const themeMode = useAppSelector(state => state.app.themeMode)

  return (
    <div>
      <ConfigProvider theme={{ algorithm: themeMode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm }}>
        <Routers />
        <MediaModal />
      </ConfigProvider>
    </div>
  )
}

export default App
