import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { CloseOutlined } from '@ant-design/icons'
import { Modal, Tabs, TabsProps } from 'antd'
import UploadMedia from './upload.media'
import { useQuery } from '@tanstack/react-query'
import { fetchListMediaAPI } from '@/services/media-service/media.apis'
import { setIsOpenModalUpload, setSelectedMedia } from '@/redux/slices/media.slice'
import { MEDIA_QUERY_KEYS } from '@/services/media-service/media.keys'

const MediaModal = () => {
  const dispatch = useAppDispatch()
  const isOpenModalUpload = useAppSelector((state) => state.media.isOpenModalUpload)

  const { data: listMedia } = useQuery({
    queryKey: [MEDIA_QUERY_KEYS.FETCH_ALL],
    queryFn: async () => {
      const res = await fetchListMediaAPI()
      if (res && res.data) {
        return res.data
      } else {
        throw new Error('Failed to fetch media data')
      }
    }
  })


  const onChangeTabs = (key: string) => {
    // eslint-disable-next-line no-console
    console.log(key)
  }

  const handleSelectImage = (image: string) => {
    dispatch(setSelectedMedia(image))
    dispatch(setIsOpenModalUpload(false))
  }

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Tải lên tệp mới',
      children: (
        <div className="" style={{ height: '500px' }}>
          <UploadMedia />
        </div>
      )
    },
    {
      key: '2',
      label: 'Chọn từ thư viện Media',
      children: (
        <div className='grid grid-cols-8 bg-white rounded-lg gap-4'>
          {
            listMedia && listMedia.results.length > 0 && listMedia.results?.map((media: IMedia) => (
              <img
                key={media?._id}
                src={`${import.meta.env.VITE_BACKEND_URL}${media?.filePath}`}
                alt={media?.filename}
                className='object-cover rounded cursor-pointer'
                onClick={() => handleSelectImage(media?.filePath || '/placeholder.svg')}
                crossOrigin="anonymous"
              />
            ))
          }
        </div>
      )
    }
  ]

  return (
    <Modal
      open={isOpenModalUpload}
      onOk={() => dispatch(setIsOpenModalUpload(false))}
      onCancel={() => dispatch(setIsOpenModalUpload(false))}
      width='90%'
      height={'80vh'}
      centered
      title="Media Library"
      className='media-modal'
      closeIcon={<CloseOutlined className='text-white text-xl' />}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <OkBtn />
        </>
      )}
      styles={{
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)'
        },
        content: {
          backgroundColor: 'white',
          boxShadow: 'none',
          padding: '16px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }
      }}
      style={{ zIndex: 1000 }}
    >
      <Tabs defaultActiveKey="1" items={items} onChange={onChangeTabs} />
    </Modal>
  )
}

export default MediaModal
