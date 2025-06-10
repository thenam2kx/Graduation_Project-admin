import { useState } from 'react'
import {
  Table, Modal, Button, Tag, Space, message
} from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deleted: boolean;
}

const dummyContacts: Contact[] = [
  {
    _id: '1',
    name: 'Nguyễn Văn A',
    email: 'a@example.com',
    phone: '0901234567',
    message: 'Tôi muốn hỏi về dịch vụ...',
    createdAt: '2025-05-13T10:00:00Z',
    updatedAt: '2025-05-13T10:00:00Z',
    deleted: false
  },
  {
    _id: '2',
    name: 'Trần Thị B',
    email: 'b@example.com',
    phone: '0912345678',
    message: 'Trang web của bạn có lỗi...',
    createdAt: '2025-05-12T14:30:00Z',
    updatedAt: '2025-05-12T14:30:00Z',
    deleted: false
  }
]

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<Contact[]>(dummyContacts)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const handleSoftDelete = (_id: string) => {
    Modal.confirm({
      title: 'Xác nhận xoá',
      content: 'Bạn có chắc muốn xoá liên hệ này?',
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk() {
        setContacts((prev) =>
          prev.map((c) =>
            c._id === _id ? { ...c, deleted: true, deletedAt: new Date().toISOString() } : c
          )
        )
        message.success('Đã xoá liên hệ (mềm)')
      }
    })
  }

  const handleView = (contact: Contact) => {
    setSelectedContact(contact)
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
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => new Date(value).toLocaleString()
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <>
          {!record.deleted ? <Tag color='green'>Đang hoạt động</Tag> : <Tag color='red'>Đã xoá</Tag>}
        </>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type='link' onClick={() => handleView(record)} disabled={record.deleted}>Xem</Button>
          <Button
            danger
            type='link'
            onClick={() => handleSoftDelete(record._id)}
            disabled={record.deleted}
          >
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
        dataSource={contacts.filter((c) => !c.deleted)}
        rowKey='_id'
        bordered
      />

      <Modal
        open={!!selectedContact}
        onCancel={() => setSelectedContact(null)}
        title='Chi tiết liên hệ'
        footer={[
          <Button key='cancel' onClick={() => setSelectedContact(null)}>Đóng</Button>
        ]}
      >
        {selectedContact && (
          <>
            <p><strong>Tên:</strong> {selectedContact.name}</p>
            <p><strong>Email:</strong> {selectedContact.email}</p>
            <p><strong>SĐT:</strong> {selectedContact.phone}</p>
            <p><strong>Ngày gửi:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
            <p><strong>Nội dung:</strong></p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedContact.message}</p>
          </>
        )}
      </Modal>
    </div>
  )
}
