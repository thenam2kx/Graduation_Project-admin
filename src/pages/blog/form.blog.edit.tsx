import { Form, Input, Typography, Button, Switch, Select, message } from 'antd'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/config/axios.customize'
import { useNavigate, useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { UploadOutlined } from '@ant-design/icons'
import { setIsOpenModalUpload } from '@/redux/slices/media.slice'

const { Title } = Typography

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean']
  ]
}

interface IBlog {
  title: string
  slug: string
  content: string
  isPublic: boolean
  categoryBlogId?: string
}

// Hàm chuyển title thành slug
function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const FormBlogEdit = () => {
  const [form] = Form.useForm()
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
  const [isSlugTouched, setIsSlugTouched] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const mediaUrl = useAppSelector((state) => state.media.selectedMedia)

  // Theo dõi giá trị title
  const titleValue = Form.useWatch('title', form)

  // Lấy danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/v1/cateblog')
        setCategories(res.data.results || [])
      } catch (error) {
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  // Lấy thông tin bài viết
  const { data: blogData } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/blogs/${id}`)
      return res.data?.results
    },
    enabled: !!id
  })

  useEffect(() => {
    if (blogData) {
      form.setFieldsValue({
        title: blogData.title,
        slug: blogData.slug,
        categoryBlogId: blogData.categoryBlogId,
        isPublic: blogData.isPublic
      })
      setContent(blogData.content)
      setIsSlugTouched(false) // reset khi load bài viết mới
    }
  }, [blogData, form])

  // Auto cập nhật slug khi title thay đổi, nếu slug chưa bị sửa thủ công
  useEffect(() => {
    if (!isSlugTouched) {
      form.setFieldsValue({ slug: toSlug(titleValue || '') })
    }
  }, [titleValue, isSlugTouched, form])

  const editBlogMutation = useMutation({
    mutationFn: async (values: IBlog) => {
      const { data } = await axios.patch(`/api/v1/blogs/${id}`, {
        ...values,
        content
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      message.success('Cập nhật bài viết thành công')
      navigate('/blogs')
    }
  })

    // Khi mediaUrl thay đổi, tự động set vào form
  useEffect(() => {
    console.log('mediaUrl effect:', mediaUrl)
    if (mediaUrl) {
      form.setFieldsValue({ image: mediaUrl })
    }
  }, [mediaUrl, form])

  const onFinish = async (values: IBlog) => {
    if (!content || content === '<p><br></p>') {
      return
    }
    editBlogMutation.mutate({ ...values, content })
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Chỉnh sửa bài viết</Title>
        <Button icon={<UploadOutlined />} onClick={() => dispatch(setIsOpenModalUpload(true))}>
          Tải lên
        </Button>
      <Form
        layout='vertical'
        form={form}
        onFinish={onFinish}
        style={{ maxWidth: 800, margin: '0 auto' }}
        initialValues={{ isPublic: true }}
      >
        <Form.Item
          label='Tiêu đề'
          name='title'
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input
            placeholder='Nhập tiêu đề'
            onChange={() => setIsSlugTouched(false)}
          />
        </Form.Item>

        <Form.Item
          label='Slug'
          name='slug'
          rules={[{ required: true, message: 'Vui lòng nhập Slug' }]}
        >
          <Input
            placeholder='Nhập slug'
            onChange={() => setIsSlugTouched(true)}
          />
        </Form.Item>

        <Form.Item
          label='Danh mục'
          name='categoryBlogId'
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        >
          <Select
            placeholder='Chọn danh mục'
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat._id
            }))}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label='Nội dung'
          name='content'
          required
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <ReactQuill
            theme='snow'
            value={content}
            onChange={setContent}
            modules={modules}
            style={{ minHeight: 200, borderRadius: 6, height: 180, marginBottom: 30 }}
          />
        </Form.Item>

        <Form.Item
          label="Hình ảnh (URL)"
          name="image"
        >
          <Input placeholder="Đường dẫn ảnh sẽ tự động điền sau khi tải lên" value={form.getFieldValue('image') || ''} />
        </Form.Item>

        <Form.Item
          label='Hiển thị công khai'
          name='isPublic'
          valuePropName='checked'
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            style={{ marginTop: 16 }}
            loading={editBlogMutation.isPending}
          >
            Cập nhật bài viết
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormBlogEdit
