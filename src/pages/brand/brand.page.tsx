import { DeleteFilled, EditFilled, FolderAddFilled } from '@ant-design/icons'
import { Button, Popconfirm, Switch, Table, Modal, Form, Input, Select, message, Tooltip } from 'antd'
import { useState } from 'react'

interface IBrand {
  _id: number
  name: string
  isPublic: boolean
}
const Brand = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [form] = Form.useForm()
  const [data, setData] = useState<IBrand[]>([
    { _id: 1, name: 'Thương hiệu 1', isPublic: true },
    { _id: 2, name: 'Thương hiệu 2', isPublic: false },
    { _id: 3, name: 'Thương hiệu 3', isPublic: true }
  ])
  const handleAdd = () => {
    setModalMode('add')
    form.resetFields()
    setModalOpen(true)
  }
  const handleEdit = (brand: IBrand) => {
    setModalMode('edit')
    form.setFieldsValue({ name: brand.name, isPublic: brand.isPublic })
    setModalOpen(true)
  }
  const handleFinish = () => {
    // console.log(values)
    message.success('Thêm thương hiệu thành công')
    setModalOpen(false)
  }
  const handleToggle = (checked: boolean, record: IBrand) => {
    setData(data.map(item =>
      item._id === record._id ? { ...item, isPublic: checked } : item
    ))
  }
  const handleDelete = () => {
  }
  const columns = [
    {
      title: 'Tên thương hiệu',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (isPublic: boolean, record: IBrand) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Switch
            checked={isPublic}
            onChange={(checked) => handleToggle(checked, record)}
            checkedChildren="Hiển thị"
            unCheckedChildren="Ẩn"
          />
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record:IBrand) =>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Tooltip title="Chỉnh sửa">
            <Button type='primary' onClick={ () => handleEdit(record)}><EditFilled /></Button>
          </Tooltip>
          <Popconfirm
            title="Xóa thương hiệu"
            description="Bạn có chắc chắn muốn xóa thương hiệu này?"
            okText="Đồng ý"
            cancelText="Không đồng ý"
            onConfirm={() => handleDelete()}
          >
            <Tooltip title="Xóa">
              <Button danger><DeleteFilled /></Button>
            </Tooltip>
          </Popconfirm>
        </div>
    }
  ]

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Quản lý thương hiệu</h1>
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Button type='primary' onClick={handleAdd}><FolderAddFilled />Thêm thương hiệu</Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey={(data) => data._id} />
      <Modal
        open={modalOpen}
        title={modalMode === 'add' ? 'Thêm thương hiệu' : 'Cập nhật thương hiệu'}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        footer={null}
        destroyOnClose
        forceRender
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            name="name"
            label="Tên"
            rules={[
              { required: true, message: 'Vui lòng không bỏ trống' },
              { min: 5, message: 'Tối thiểu 5 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="isPublic"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value={true}>Hiển thị</Select.Option>
              <Select.Option value={false}>Ẩn</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
            </Button>
            <Button onClick={() => { setModalOpen(false); form.resetFields() }}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
export default Brand