import instance from '@/config/axios.customize'
import { IDiscounts } from '@/types/discounts'
import { DeleteFilled, EditFilled, FolderAddFilled } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Modal, Form, Input, Select, message, DatePicker, Row, Col, Popconfirm, Switch, Tooltip, Table, InputNumber } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import debounce from 'debounce'
import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { AxiosError } from 'axios'



const Discounts = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingID, setEditingID] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [data, setData] = useState<IDiscounts[]>([])
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState<IPagination>({ current: 1, pageSize: 10, total: 10 })

  const ListDiscounts = async (qs?: string) => {
    try {
      const url = `/api/v1/discounts?current=${pagination.current}&pageSize=${pagination.pageSize}${qs ? `&qs=${encodeURIComponent(qs)}` : ''}`
      const res = await instance.get(url)
      // console.log('Request URL:', url)

      const results = res?.data?.results || []
      setData(results)
      setPagination((prev) => ({
        ...prev,
        total: res?.data?.meta?.total || results.length
      }))
    } catch (error) {
      message.error('Không thể tải danh sách mã giảm giá ')
      setData([])
    }
  }
  const debounceSearch = useMemo(() =>
    debounce((text: string) => {
      ListDiscounts(text)
    }, 500), [pagination.current, pagination.pageSize]
  )

  useEffect(() => {
    const fetchData = async () => {
      await ListDiscounts(searchText)
    }
    fetchData()
  }, [debounceSearch,pagination.current, pagination.pageSize, searchText])

  const handleAdd = () => {
    setModalMode('add')
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (discount: IDiscounts) => {
  setModalMode('edit')
  setEditingID(discount._id)  
  form.setFieldsValue({
    code: discount.code,
    description: discount.description,
    type: discount.type,
    value: discount.value,
    min_order_value: discount.min_order_value,
    max_discount_amount: discount.max_discount_amount,
    status: discount.status,
    applies_category: discount.applies_category,
    applies_product: discount.applies_product,
    applies_variant: discount.applies_variant,
    startDate: discount.startDate ? moment(discount.startDate) : null,
    endDate: discount.endDate ? moment(discount.endDate) : null,
    usage_limit: discount.usage_limit,
    usage_per_user: discount.usage_per_user
  })
  setModalOpen(true)
}


 const handleFinish = async (values: IDiscounts) => {
  try {
     const payload = {
      ...values,
      startDate: values.startDate ? values.startDate.toISOString() : null,
      endDate: values.endDate ? values.endDate.toISOString() : null,
    };
    if (modalMode === 'add') {
      await instance.post('/api/v1/discounts/', payload);
      message.success('Thêm mã giảm giá thành công');
      console.log(payload);
      
    } else if (modalMode === 'edit' && editingID) {
      await instance.patch(`api/v1/discounts/${editingID}`, payload);
      message.success('Cập nhật giảm giá thành công');
    }
    setModalOpen(false);
    ListDiscounts();
  } catch (error: any) {
  console.log('Lỗi khi submit:', error);
}
}
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await instance.delete(`/api/v1/discounts/${id}`)
      } catch (error: any) {
        console.log(error)
      }
    },
    onSuccess: (_, id) => {  
    const deletedCode = data.find(item => item._id === id)?.code || id
    message.success(`Xóa mã giảm giá ${deletedCode} thành công`)
    ListDiscounts()
  },
  })
  const handleDelete = (id:string) => {
    mutation.mutate(id)
  }
  
  const columns = [
  {
    title: 'Mã giảm giá',
    dataIndex: 'code',
    key: 'code',
    width: 150, 
  },
  {
    title: 'Sản phẩm áp dụng',
    dataIndex: 'applies_product',
    key: 'applies_product',
    width: 200,
  },
  {
    title: 'Danh mục áp dụng',
    dataIndex: 'applies_category',
    key: 'applies_category',
    width: 180,
  },
  {
    title: 'Biến thể áp dụng',
    dataIndex: 'applies_variant',
    key: 'applies_variant',
    width: 180,
  },
  {
    title: 'Kiểu giảm giá',
    dataIndex: 'type',
    key: 'type',
    width: 120,
  },
  {
    title: 'Giá trị giảm',
    dataIndex: 'value',
    key: 'value',
    width: 120,
  },
  {
    title: 'Đơn hàng tối thiểu',
    dataIndex: 'min_order_value',
    key: 'min_order_value',
    width: 150,
  },
  {
    title: 'Giảm tối đa',
    dataIndex: 'max_discount_amount',
    key: 'max_discount_amount',
    width: 150,
  },
  {
    title: 'Ngày bắt đầu',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 180,
    render: (date: string | Date) => new Date(date).toLocaleString()
  },
  {
    title: 'Ngày kết thúc',
    dataIndex: 'endDate',
    key: 'endDate',
    width: 180,
    render: (date: string | Date) => new Date(date).toLocaleString()
  },
  {
    title: 'Giới hạn sử dụng',
    dataIndex: 'usage_limit',
    key: 'usage_limit',
    width: 140,
  },
  {
    title: 'Giới hạn mỗi người dùng',
    dataIndex: 'usage_per_user',
    key: 'usage_per_user',
    width: 160,
  },
 
  {
    title: 'Mô tả',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    width: 250,
  },
   {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (status: boolean, record: IDiscounts) => (
      <Switch
        checked={!!status}
        checkedChildren="Hiển thị"
        unCheckedChildren="Ẩn"
        onChange={async(checked)=>{
          try {
            await instance.patch(`api/v1/discounts/${record._id}`,{
              status:checked
            })
            message.success("Thay đổi trạng thái thành công")
            ListDiscounts()
          } catch (error){
            console.log(error);
            
            
          }
        }}
      />
    )
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 150,
    render: (_: any, record: any) => (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Tooltip title="Chỉnh sửa">
          <Button type="primary" onClick={() => handleEdit(record)}>
            <EditFilled />
          </Button>
        </Tooltip>
        <Popconfirm
          title="Xóa mã giảm giá"
          description="Bạn có chắc chắn muốn xóa mã giảm giá này?"
          okText="Đồng ý"
          cancelText="Không đồng ý"
          onConfirm={() => handleDelete(record._id)}
        >
          <Tooltip title="Xóa">
            <Button danger>
              <DeleteFilled />
            </Button>
          </Tooltip>
        </Popconfirm>
      </div>
    )
  }
]

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Quản lý mã giảm giá</h1>
          <p className='text-gray-500'>Quản lý mã giảm giá trong hệ thống</p>
          <Input.Search
            placeholder="Tìm kiếm mã giảm giá "
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => {
              setSearchText(value)
              ListDiscounts(value)
            }}
            style={{ width: 300 }}
          />

        </div>
        <div style={{}} >
          <Button type='primary' onClick={handleAdd}>
            <FolderAddFilled /> Thêm mã giảm giá
          </Button>
        </div>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={(data) => data._id}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize
            }))
          }
        }}
/>

      <Modal
        open={modalOpen}
        title={modalMode === 'add' ? 'Thêm giảm giá' : 'Cập nhật giảm giá'}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mã giảm giá"
                name="code"
                rules={[
                  { required: true, message: 'Vui lòng không bỏ trống' },
                  { min: 5, message: 'Tối thiểu 5 ký tự' }
                ]}
              >
                <Input placeholder='Mã code' />
              </Form.Item>
            </Col>
    <Col span={12}>
      <Form.Item
        label="Sản phẩm áp dụng"
        name="applies_product"
      >
        <Input placeholder="Tên sản phẩm " />
      </Form.Item>
    </Col>

    <Col span={12}>
      <Form.Item
        label="Danh mục áp dụng"
        name="applies_category"
      >
        <Input placeholder="Tên danh mục " />
      </Form.Item>
    </Col>

    <Col span={12}>
      <Form.Item
        label="Biến thể áp dụng"
        name="applies_variant"
      >
        <Input placeholder="Tên biến thể " />
      </Form.Item>
    </Col>
      <Col span={12}>
              <Form.Item
                name="type"
                label="Kiểu giảm giá"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn kiểu giảm giá">
          <Select.Option value='%'>%</Select.Option>
          <Select.Option value='Vnd'>Vnđ</Select.Option>
        </Select>
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item
        label="Giá trị giảm"
        name="value"
        rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm' }]}
      >
        <InputNumber placeholder='Giá trị giảm' min={0} className="w-full" />
      </Form.Item>
    </Col>

    <Col span={12}>
      <Form.Item
        label="Giá trị đơn hàng tối thiểu"
        name="min_order_value"
      >
        <InputNumber placeholder='Giá trị đơn hàng tối thiểu' min={0} className="w-full" />
      </Form.Item>
    </Col>

    <Col span={12}>
      <Form.Item
        label="Giảm tối đa"
        name="max_discount_amount"
      >
        <InputNumber placeholder='Giảm tối đa' min={0} className="w-full" />
      </Form.Item>
    </Col>
 <Col span={12}>
      <Form.Item
        label="Giới hạn sử dụng toàn hệ thống"
        name="usage_limit"
      >
        <InputNumber placeholder='Giới hạn sử dụng toàn hệ thống' min={100} className="w-full" />
      </Form.Item>
    </Col>
     <Col span={12}>
      <Form.Item
        label="Giới hạn mỗi người dùng"
        name="usage_per_user"
      >
        <InputNumber placeholder='Giới hạn mỗi người dùng' min={1} className="w-full" />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item
        name="startDate"
        label="Ngày bắt đầu"
        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
      >
        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
      </Form.Item>
    </Col>

    <Col span={12}>
      <Form.Item
        name="endDate"
        label="Ngày kết thúc"
        rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
      >
        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
      </Form.Item>
    </Col>

   

   

    <Col span={12}>
      <Form.Item
        name="status"
        label="Trạng thái"
        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
      >
        <Select placeholder="Chọn trạng thái">
          <Select.Option value={true}>Hiển thị</Select.Option>
          <Select.Option value={false}>Ẩn</Select.Option>
        </Select>
      </Form.Item>
    </Col>

    <Col span={12}>
      <Form.Item
        name="description"
        label="Mô tả"
        rules={[
          { required: true, message: 'Vui lòng không bỏ trống' },
          { min: 5, message: 'Tối thiểu 5 ký tự' }
        ]}
      >
        <TextArea placeholder='Mô tả...' />
      </Form.Item>
    </Col>

    <Col span={24}>
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
          {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
        </Button>
        <Button onClick={() => { setModalOpen(false); form.resetFields() }}>
          Hủy
        </Button>
      </Form.Item>
    </Col>
  </Row>
</Form>

      </Modal>
    </div>
  )
}

export default Discounts
