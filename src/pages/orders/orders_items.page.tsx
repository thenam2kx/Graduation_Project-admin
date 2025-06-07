import React, { useState } from 'react'
import { Table, Button, Modal, Form, InputNumber, DatePicker, message, Space, Tooltip, Select } from 'antd'
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import moment from 'moment'
import { IOrderItem } from '@/types/orders'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Link } from 'react-router'

const OrderPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState<IOrderItem | null>(null)
  const [form] = Form.useForm()
  const { confirm } = Modal
  const [messageApi, contextHolder] = message.useMessage()
  const queryClient = useQueryClient()

  interface IProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  capacity: number;
  image: string;
  brandId: string;
  categoryId: string;
  discountId?: string;
  description: string;
}

  const { data  = [], isLoading } = useQuery({
    queryKey: ['orderItems'],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:8080/api/v1/orderitems`)
      return res.data.data.results;
    }
  })

  // Lấy danh sách products
  const { data: productsData, isLoading: isProductsLoading } = useQuery<IProduct[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/products');
      return res.data.data?.results || res.data.results || [];
    }
  });

  const mutation = useMutation({
    mutationFn: async (item: IOrderItem) => {
      const updatedItem = item.deleted
        ? { ...item, deleted: false, deletedAt: null }
        : { ...item, deleted: true, deletedAt: new Date().toISOString() }

      return axios.put(`http://localhost:8080/api/v1/orderitems/${item._id}`, updatedItem)
    },
    onSuccess: () => {
      messageApi.success('Cập nhật trạng thái thành công')
      queryClient.invalidateQueries({ queryKey: ['orderItems']})
    }
  })

  const columns = [
    {
      title: 'Đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId'
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productId',
      key: 'productId'
    },
    {
      title: 'Loại',
      dataIndex: 'variantId',
      key: 'variantId'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Giá (đơn vị)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price ? `${price.toLocaleString()} đ` : '-'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => new Date(value).toLocaleString()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'deleted',
      key: 'deleted',
      render: (deleted: boolean | undefined) =>
        deleted ? <span style={{ color: 'red' }}>Đã xóa</span> : <span style={{ color: 'green' }}>Hoạt động</span>
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: IOrderItem) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          </Tooltip>
          <Tooltip title={record.deleted ? 'Phục hồi' : 'Xóa'}>
            <Button
              icon={<DeleteOutlined />}
              danger={!record.deleted}
              type={record.deleted ? 'default' : 'primary'}
              onClick={() => showDeleteConfirm(record)}
            >
              {record.deleted ? 'Phục hồi' : 'Xóa'}
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ]

  const showEditModal = (item: IOrderItem) => {
    setCurrentItem(item)
    form.setFieldsValue({
      ...item,
      createdAt: moment(item.createdAt)
    })
    setIsModalVisible(true)
  }

  const showDeleteConfirm = (item: IOrderItem) => {
    confirm({
      title: item.deleted ? 'Bạn có muốn phục hồi đơn hàng này?' : 'Bạn có chắc chắn muốn xóa đơn hàng này?',
      icon: <ExclamationCircleOutlined />,
      okText: item.deleted ? 'Phục hồi' : 'Xóa',
      okType: item.deleted ? 'default' : 'danger',
      cancelText: 'Hủy',
      onOk() {
        mutation.mutate(item)
      }
    })
  }

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields()
      const newItem: IOrderItem = {
        ...values,
        _id: currentItem ? currentItem._id : Date.now().toString(),
        createdAt: values.createdAt.format('YYYY-MM-DD'),
        deleted: values.deleted || false
      }

      if (currentItem) {
        await axios.put(`http://localhost:8080/api/v1/orderitems/${currentItem._id}`, newItem)
        messageApi.success('Cập nhật đơn hàng thành công')
      } else {
        await axios.post(`http://localhost:8080/api/v1/orderitems`, newItem)
        messageApi.success('Thêm đơn hàng thành công')
      }

      queryClient.invalidateQueries({ queryKey: ['orderItems']})
      setIsModalVisible(false)
    } catch (error) {
      messageApi.error('Có lỗi xảy ra khi gửi form')
    }
  }

  return (
    <div>
      {contextHolder}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <Link to={`/orderitems/add`}>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm đơn hàng
        </Button>
        </Link>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={currentItem ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleFormSubmit}
        okText={currentItem ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={{ deleted: false }}>
          <Form.Item
            name="productId"
            label="Product ID"
            rules={[{ required: true, message: 'Product ID không được để trống' }]}
          >
            <Select style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="variantId"
            label="Variant ID"
            rules={[{ required: true, message: 'Variant ID không được để trống' }]}
          >
            <Select style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (đơn vị)"
            rules={[{ required: true, type: 'number', min: 0, message: 'Giá phải lớn hơn hoặc bằng 0' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="createdAt"
            label="Ngày tạo"
            rules={[{ required: true, message: 'Ngày tạo không được để trống' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default OrderPage
