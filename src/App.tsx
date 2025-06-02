import { ConfigProvider, theme as antTheme } from 'antd'
import Routers from './routers/routers'
import { useAppSelector } from './redux/hooks'
import { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchAccountAPI } from './services/user-service/user.apis'

const MediaModal = lazy(() => import('./components/media-modal/media.modal'))


const App = () => {
  // const navigate = useNavigate()

  const themeMode = useAppSelector(state => state.app.themeMode)
  // const { data: infoUser } = useQuery({
  //   queryKey: ['homeData'],
  //   queryFn: async () => {
  //     const res = await fetchAccountAPI()
  //     return res.data
  //   },
  //   refetchOnWindowFocus: false
  // })
  // if (!infoUser) {
  //   navigate('/signin')
  // }

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
