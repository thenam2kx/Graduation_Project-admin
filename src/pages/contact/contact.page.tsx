import { useState } from 'react'
import { Table, Modal, Button, Tag, Space, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  isRead: boolean;
}

// Dữ liệu mẫu
const dummyContacts: Contact[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'a@example.com',
    message: 'Tôi muốn hỏi về dịch vụ...',
    date: '2025-05-13',
    isRead: false
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'b@example.com',
    message: 'Trang web của bạn có lỗi...',
    date: '2025-05-12',
    isRead: true
  }
]

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<Contact[]>(dummyContacts)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xoá',
      content: 'Bạn có chắc muốn xoá liên hệ này?',
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk() {
        setContacts((prev) => prev.filter((c) => c.id !== id))
        message.success('Đã xoá liên hệ')
      }
    })
  }

  const handleView = (contact: Contact) => {
    setSelectedContact(contact)
    // Đánh dấu là đã đọc
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contact.id ? { ...c, isRead: true } : c
      )
    )
  }

  const columns: ColumnsType<Contact> = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isRead',
      key: 'isRead',
      render: (isRead: boolean) =>
        isRead ? (
          <Tag color='green'>Đã đọc</Tag>
        ) : (
          <Tag color='red'>Chưa đọc</Tag>
        )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type='link' onClick={() => handleView(record)}>
            Xem
          </Button>
          <Button danger type='link' onClick={() => handleDelete(record.id)}>
            Xoá
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
        Quản lý liên hệ
      </h2>
      <Table
        columns={columns}
        dataSource={contacts}
        rowKey='id'
        bordered
      />

      {/* Modal chi tiết */}
      <Modal
        open={!!selectedContact}
        onCancel={() => setSelectedContact(null)}
        title='Chi tiết liên hệ'
        footer={[
          <Button key='close' onClick={() => setSelectedContact(null)}>
            Đóng
          </Button>
        ]}
      >
        {selectedContact && (
          <>
            <p>
              <strong>Tên:</strong> {selectedContact.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedContact.email}
            </p>
            <p>
              <strong>Ngày gửi:</strong> {selectedContact.date}
            </p>
            <p>
              <strong>Nội dung:</strong>
            </p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedContact.message}</p>
          </>
        )}
      </Modal>
    </div>
  )
}
