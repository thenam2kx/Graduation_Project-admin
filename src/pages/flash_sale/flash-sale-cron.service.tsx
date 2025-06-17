import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag, message, Popconfirm } from 'antd'
import { EditOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'

import { 
  getAllFlashSales, 
  createCronJob, 
  getCronJobs, 
  updateCronJob, 
  deleteCronJob,
  CronJobData
} from '@/services/flash-sale-service/flash-sale.apis'
import { FLASH_SALE_QUERY_KEYS } from '@/services/flash-sale-service/flash-sale.keys'
import { IFlashSale } from '@/types/flash-sale'

interface CronJob {
  _id: string
  name: string
  flashSaleId: string
  jobType: 'start' | 'end'
  status: 'scheduled' | 'completed' | 'failed'
  scheduledTime: string
  createdAt?: string
  updatedAt?: string
}

// Định nghĩa query key cho cron jobs
const CRON_JOBS_QUERY_KEY = 'cron-jobs'

const FlashSaleCronService = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null)
  const [editMode, setEditMode] = useState(false)
  
  const queryClient = useQueryClient()

  // Fetch flash sales for selection
  const { data: flashSalesData } = useQuery({
    queryKey: [FLASH_SALE_QUERY_KEYS.FETCH_ALL, { current: 1, pageSize: 100 }],
    queryFn: () => getAllFlashSales({ current: 1, pageSize: 100 }),
    select: (response) => response.data?.results || []
  })

  // Fetch cron jobs from backend
  const { data: cronJobsData, isLoading: isLoadingJobs, refetch: refetchJobs } = useQuery({
    queryKey: [CRON_JOBS_QUERY_KEY],
    queryFn: getCronJobs,
    select: (response) => response.data?.results || [],
    refetchInterval: 30000 // Tự động refetch mỗi 30 giây
  })

  // Mutations
  const createJobMutation = useMutation({
    mutationFn: createCronJob,
    onSuccess: () => {
      message.success('Đã tạo lịch chạy tự động thành công')
      queryClient.invalidateQueries({ queryKey: [CRON_JOBS_QUERY_KEY] })
      handleCloseModal()
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi tạo lịch chạy tự động')
    }
  })

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<CronJobData> }) => 
      updateCronJob(id, data),
    onSuccess: () => {
      message.success('Đã cập nhật lịch chạy tự động thành công')
      queryClient.invalidateQueries({ queryKey: [CRON_JOBS_QUERY_KEY] })
      handleCloseModal()
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi cập nhật lịch chạy tự động')
    }
  })

  const deleteJobMutation = useMutation({
    mutationFn: deleteCronJob,
    onSuccess: () => {
      message.success('Đã xóa lịch chạy tự động thành công')
      queryClient.invalidateQueries({ queryKey: [CRON_JOBS_QUERY_KEY] })
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi xóa lịch chạy tự động')
    }
  })

  const handleOpenModal = (job?: CronJob) => {
    if (job) {
      setSelectedJob(job)
      setEditMode(true)
      form.setFieldsValue({
        flashSaleId: job.flashSaleId,
        jobType: job.jobType
      })
    } else {
      setSelectedJob(null)
      setEditMode(false)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedJob(null)
    setEditMode(false)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // Tìm flash sale được chọn
      const flashSale = flashSalesData.find((sale: IFlashSale) => sale._id === values.flashSaleId)
      if (!flashSale) return
      
      // Xác định thời gian dự kiến dựa trên loại công việc
      const scheduledTime = values.jobType === 'start' 
        ? flashSale.startDate
        : flashSale.endDate
      
      // Tạo tên công việc
      const jobName = `${values.jobType === 'start' ? 'Bắt đầu' : 'Kết thúc'}: ${flashSale.name}`
      
      if (editMode && selectedJob) {
        // Cập nhật công việc hiện có
        updateJobMutation.mutate({
          id: selectedJob._id,
          data: {
            flashSaleId: values.flashSaleId,
            jobType: values.jobType,
            scheduledTime
          }
        })
      } else {
        // Tạo công việc mới
        createJobMutation.mutate({
          flashSaleId: values.flashSaleId,
          jobType: values.jobType,
          scheduledTime
        })
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }
  
  const handleDelete = (id: string) => {
    deleteJobMutation.mutate(id)
  }

  const columns: ColumnsType<CronJob> = [
    {
      title: 'Tên công việc',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Flash Sale',
      key: 'flashSale',
      render: (_, record) => {
        const flashSale = flashSalesData?.find((sale: IFlashSale) => sale._id === record.flashSaleId)
        return flashSale ? flashSale.name : 'N/A'
      }
    },
    {
      title: 'Loại',
      dataIndex: 'jobType',
      key: 'jobType',
      render: (type) => (
        type === 'start' ? 'Bắt đầu' : 'Kết thúc'
      )
    },
    {
      title: 'Thời gian dự kiến',
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
      render: (time) => dayjs(time).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue'
        let text = 'Đã lên lịch'
        
        if (status === 'completed') {
          color = 'green'
          text = 'Đã hoàn thành'
        } else if (status === 'failed') {
          color = 'red'
          text = 'Thất bại'
        }
        
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const isCompleted = record.status === 'completed'
        
        return (
          <Space size="middle">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
              disabled={isCompleted}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xóa lịch chạy tự động"
              description="Bạn có chắc chắn muốn xóa lịch chạy tự động này?"
              onConfirm={() => handleDelete(record._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button 
                danger 
                icon={<DeleteOutlined />}
                disabled={isCompleted}
              />
            </Popconfirm>
          </Space>
        )
      }
    }
  ]

  return (
    <div>
      <Card title="Quản lý lịch chạy tự động Flash Sale">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetchJobs()}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Thêm lịch chạy tự động
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={cronJobsData}
          rowKey="_id"
          loading={isLoadingJobs}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editMode ? "Sửa lịch chạy tự động" : "Thêm lịch chạy tự động"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="back" onClick={handleCloseModal}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={createJobMutation.isPending || updateJobMutation.isPending}
          >
            {editMode ? "Cập nhật" : "Tạo lịch"}
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="cron_job_form"
        >
          <Form.Item
            name="flashSaleId"
            label="Flash Sale"
            rules={[{ required: true, message: 'Vui lòng chọn flash sale' }]}
          >
            <Select 
              placeholder="Chọn flash sale"
              disabled={editMode}
              onChange={(value) => {
                // Khi chọn flash sale, reset loại công việc
                form.setFieldsValue({ jobType: undefined })
              }}
            >
              {flashSalesData?.map((sale: IFlashSale) => (
                <Select.Option key={sale._id} value={sale._id}>
                  {sale.name} ({dayjs(sale.startDate).format('DD/MM/YYYY')} - {dayjs(sale.endDate).format('DD/MM/YYYY')})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="jobType"
            label="Loại công việc"
            rules={[{ required: true, message: 'Vui lòng chọn loại công việc' }]}
          >
            <Select placeholder="Chọn loại công việc">
              <Select.Option value="start">Bắt đầu Flash Sale</Select.Option>
              <Select.Option value="end">Kết thúc Flash Sale</Select.Option>
            </Select>
          </Form.Item>
          
          {form.getFieldValue('flashSaleId') && form.getFieldValue('jobType') && (
            <div>
              <p><strong>Thời gian dự kiến:</strong></p>
              {form.getFieldValue('jobType') === 'start' ? (
                <p>{dayjs(flashSalesData?.find((sale: IFlashSale) => 
                  sale._id === form.getFieldValue('flashSaleId'))?.startDate).format('DD/MM/YYYY HH:mm:ss')}</p>
              ) : (
                <p>{dayjs(flashSalesData?.find((sale: IFlashSale) => 
                  sale._id === form.getFieldValue('flashSaleId'))?.endDate).format('DD/MM/YYYY HH:mm:ss')}</p>
              )}
            </div>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default FlashSaleCronService
