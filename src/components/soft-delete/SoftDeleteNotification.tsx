import { notification } from 'antd'
import { UndoOutlined } from '@ant-design/icons'

interface SoftDeleteNotificationProps {
  itemName: string
  itemType: string
  onRestore?: () => void
}

export const showSoftDeleteNotification = ({ 
  itemName, 
  itemType, 
  onRestore 
}: SoftDeleteNotificationProps) => {
  notification.success({
    message: 'Xóa thành công',
    description: `${itemType} "${itemName}" đã được xóa mềm`,
    duration: 5,
    btn: onRestore ? (
      <button 
        onClick={onRestore}
        style={{
          background: '#1890ff',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        <UndoOutlined /> Hoàn tác
      </button>
    ) : undefined,
    placement: 'topRight'
  })
}

export const showRestoreNotification = (itemName: string, itemType: string) => {
  notification.success({
    message: 'Khôi phục thành công',
    description: `${itemType} "${itemName}" đã được khôi phục`,
    duration: 3,
    placement: 'topRight'
  })
}