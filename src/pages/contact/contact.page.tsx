import { useState } from 'react'
import {
  Table, Modal, Button, Tag, Space, message, Form, Input
} from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  isRead: boolean;
  reply?: string;
  repliedAt?: string;
}

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
    isRead: true,
    reply: 'Cảm ơn bạn đã phản hồi, chúng tôi sẽ kiểm tra.',
    repliedAt: '2025-05-13'
  }
]

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<Contact[]>(dummyContacts)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [form] = Form.useForm()

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
    setReplyContent(contact.reply || '')
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, isRead: true } : c))
    )
  }

  const handleSendReply = () => {
    if (!selectedContact) return

    if (!replyContent.trim()) {
      message.warning('Nội dung phản hồi không được để trống')
      return
    }

    const updatedContacts = contacts.map((c) =>
      c.id === selectedContact.id
        ? { ...c, reply: replyContent.trim(), repliedAt: new Date().toISOString().split('T')[0] }
        : c
    )
    setContacts(updatedContacts)
    message.success('Đã phản hồi liên hệ')
    setSelectedContact(null)
    setReplyContent('')
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
      key: 'status',
      render: (_, record) => (
        <>
          {record.isRead ? <Tag color='green'>Đã đọc</Tag> : <Tag color='red'>Chưa đọc</Tag>}
          {record.reply ? <Tag color='blue'>Đã phản hồi</Tag> : null}
        </>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type='link' onClick={() => handleView(record)}>Xem</Button>
          <Button danger type='link' onClick={() => handleDelete(record.id)}>Xoá</Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
        Quản lý liên hệ
      </h2>
      <Table columns={columns} dataSource={contacts} rowKey='id' bordered />

      {/* Modal phản hồi */}
      <Modal
        open={!!selectedContact}
        onCancel={() => setSelectedContact(null)}
        title='Chi tiết liên hệ'
        footer={[
          <Button key='cancel' onClick={() => setSelectedContact(null)}>Đóng</Button>,
          <Button
            key='reply'
            type='primary'
            onClick={handleSendReply}
            disabled={!replyContent.trim()}
          >
            Gửi phản hồi
          </Button>
        ]}
      >
        {selectedContact && (
          <>
            <p><strong>Tên:</strong> {selectedContact.name}</p>
            <p><strong>Email:</strong> {selectedContact.email}</p>
            <p><strong>Ngày gửi:</strong> {selectedContact.date}</p>
            <p><strong>Nội dung:</strong></p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedContact.message}</p>

            <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
              <Form.Item label='Phản hồi'>
                <Input.TextArea
                  rows={4}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder='Nhập nội dung phản hồi...'
                />
              </Form.Item>
            </Form>

            {selectedContact.reply && (
              <p style={{ marginTop: 8, fontSize: 12, color: 'gray' }}>
                Đã phản hồi vào ngày: {selectedContact.repliedAt}
              </p>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
