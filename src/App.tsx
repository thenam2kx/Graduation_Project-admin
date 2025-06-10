import { ConfigProvider, theme as antTheme } from 'antd'
import Routers from './routers/routers'
import { useAppSelector } from './redux/hooks'
import { lazy, Suspense, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { fetchAccountAPI } from './services/user-service/user.apis'

const MediaModal = lazy(() => import('./components/media-modal/media.modal'))


const App = () => {
  const navigate = useNavigate()

  const themeMode = useAppSelector(state => state.app.themeMode)
  useEffect(() => {
    (async () => {
      try {
        await fetchAccountAPI()
      } catch (error) {
        console.error('Error fetching account data:', error)
        navigate('/signin')
      }
    })()
  }, [navigate])

  return (
    <div>
      <ConfigProvider theme={{ algorithm: themeMode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm }}>
        <Routers />
        <Suspense fallback={<div>Đang tải...</div>}>
          <MediaModal />
        </Suspense>
      </ConfigProvider>
    </div>
  )
}

export default App
