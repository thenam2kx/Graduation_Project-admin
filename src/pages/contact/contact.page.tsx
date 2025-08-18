import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/config/axios.customize'
import {
  Table, Modal, Button, Tag, Space, message, Input
} from 'antd'
const { TextArea } = Input
import type { ColumnsType } from 'antd/es/table'

import { useState } from 'react'
import { IContact } from '@/types/contact'

export default function AdminContactPage() {
  const queryClient = useQueryClient()
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null)
  const [replyModalOpen, setReplyModalOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyingContact, setReplyingContact] = useState<IContact | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: contactData, isLoading, refetch } = useQuery({
    queryKey: ['contacts', currentPage, pageSize],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/contacts?page=${currentPage}&limit=${pageSize}`)
      return res.data?.data || res.data || { results: [], meta: { total: 0 } }
    }
  })

  const contacts = contactData?.results || []
  const totalContacts = contactData?.meta?.total || 0

  const handleRefresh = () => {
    refetch()
    message.info('Đã cập nhật danh sách liên hệ')
  }

  const deleteMutation = useMutation({
    mutationFn: async (_id: string) => {
      await axios.patch(`/api/v1/contacts/soft-delete/${_id}`, {
        deleted: true,
        deletedAt: new Date().toISOString()
      })
    },
    onSuccess: () => {
      message.success('Xoá liên hệ thành công')
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
    onError: (error) => {
      console.error('Delete contact error:', error)
      message.error('Xoá liên hệ thất bại')
    }
  })

  const handleSoftDelete = (_id: string) => {
    Modal.confirm({
      title: 'Xác nhận xoá',
      content: 'Bạn có chắc muốn xoá liên hệ này?',
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk() {
        deleteMutation.mutate(_id)
      }
    })
  }

  const replyMutation = useMutation({
    mutationFn: async ({ contactId, message }: { contactId: string; message: string }) => {
      await axios.post(`/api/v1/contacts/reply/${contactId}`, { replyMessage: message })
    },
    onSuccess: () => {
      message.success('Gửi email phản hồi thành công')
      setReplyModalOpen(false)
      setReplyMessage('')
      setReplyingContact(null)
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
    onError: (error) => {
      console.error('Reply email error:', error)
      message.error('Gửi email phản hồi thất bại')
    }
  })

  const handleReply = (contact: IContact) => {
    setReplyingContact(contact)
    setReplyModalOpen(true)
  }

  const handleSendReply = () => {
    if (!replyingContact || !replyMessage.trim()) {
      message.warning('Vui lòng nhập nội dung phản hồi')
      return
    }
    replyMutation.mutate({ contactId: replyingContact._id, message: replyMessage })
  }

  const handleView = (contact: IContact) => {
    setSelectedContact(contact)
  }

  const columns: ColumnsType<IContact> = [
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
        <Tag color={record.repliedAt ? 'green' : 'orange'}>
          {record.repliedAt ? 'Đã trả lời' : 'Chưa trả lời'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type='link' onClick={() => handleView(record)} disabled={record.deleted}>Xem</Button>
          {!record.repliedAt && (
            <Button type='link' onClick={() => handleReply(record)} disabled={record.deleted}>Trả lời</Button>
          )}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          Quản lý liên hệ ({totalContacts})
        </h2>
        <Button onClick={handleRefresh} loading={isLoading}>
          Cập nhật
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={contacts?.filter((c: any) => !c.deleted)}
        rowKey='_id'
        bordered
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalContacts,
          onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size || 10)
          }
        }}
      />

      <Modal
        open={!!selectedContact}
        onCancel={() => setSelectedContact(null)}
        title='Chi tiết liên hệ'
        footer={<Button onClick={() => setSelectedContact(null)}>Đóng</Button>}
      >
        {selectedContact && (
          <>
            <p><strong>Tên:</strong> {selectedContact.name}</p>
            <p><strong>Email:</strong> {selectedContact.email}</p>
            <p><strong>SĐT:</strong> {selectedContact.phone}</p>
            <p><strong>Ngày gửi:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
            <p><strong>Nội dung:</strong></p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedContact.message}</p>
            {selectedContact.repliedAt && (
              <>
                <hr style={{ margin: '16px 0' }} />
                <p><strong>Phản hồi của admin:</strong></p>
                <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f0f8ff', padding: 12, borderRadius: 4 }}>
                  {selectedContact.replyMessage}
                </p>
                <p><strong>Ngày trả lời:</strong> {new Date(selectedContact.repliedAt).toLocaleString()}</p>
              </>
            )}
          </>
        )}
      </Modal>

      <Modal
        open={replyModalOpen}
        onCancel={() => {
          setReplyModalOpen(false)
          setReplyMessage('')
          setReplyingContact(null)
        }}
        title='Trả lời liên hệ'
        footer={[
          <Button key='cancel' onClick={() => {
            setReplyModalOpen(false)
            setReplyMessage('')
            setReplyingContact(null)
          }}>
            Hủy
          </Button>,
          <Button 
            key='send' 
            type='primary' 
            loading={replyMutation.isPending}
            onClick={handleSendReply}
          >
            Gửi email
          </Button>
        ]}
      >
        {replyingContact && (
          <>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
              <p><strong>Khách hàng:</strong> {replyingContact.name} ({replyingContact.email})</p>
              <p><strong>Tin nhắn gốc:</strong></p>
              <p style={{ fontStyle: 'italic' }}>'{replyingContact.message}'</p>
            </div>
            <p><strong>Nội dung phản hồi:</strong></p>
            <TextArea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={6}
              placeholder='Nhập nội dung phản hồi cho khách hàng...'
            />
          </>
        )}
      </Modal>
    </div>
  )
}
