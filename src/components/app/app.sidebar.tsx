import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setStateSignout } from '@/redux/slices/auth.slice'
import { signoutAPI } from '@/services/auth-service/auth.apis'
import { ControlOutlined, DashboardOutlined, FileImageOutlined, InsertRowRightOutlined, LogoutOutlined, ProductOutlined, UserOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Menu, MenuProps, message, Popconfirm, PopconfirmProps } from 'antd'
import Sider from 'antd/es/layout/Sider'
import { Link, useLocation, useNavigate } from 'react-router'

const items: MenuProps['items'] = [
  {
    key: 'overview',
    type: 'group',
    label: 'Tổng quan',
    children: [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: <Link to={'/'}>Thống kê</Link>
      }
    ]
  },
  {
    key: 'management',
    type: 'group',
    label: 'Quản lý',
    children: [
      {
        key: '/users',
        icon: <UserOutlined />,
        label: <Link to={'/users'} style={{ color: 'inherit' }}>Khách hàng</Link>
      },
      {
        key: '/products',
        icon: <ProductOutlined />,
        label: <Link to={'/products'}>Sản phẩm</Link>
      },
      {
        key: '/variants',
        icon: <ProductOutlined />,
        label: <Link to={'/variants'}>Biến thể sản phẩm</Link>
      },
      {
        key: '/attributes',
        icon: <ProductOutlined />,
        label: <Link to={'/attributes'}>Thuộc tính</Link>
      },
      {
        key: '/variantsat',
        icon: <ProductOutlined />,
        label: <Link to={'/variantsat'}>Biến thể thuộc tính</Link>
      },
      {
        key: '/cateblog',
        icon: <ProductOutlined />,
        label: <Link to={'/cateblog'} style={{ color: 'inherit' }}>Danh mục bài viết</Link>
      },
      {
        key: '/categories',
        icon: <ProductOutlined />,
        label: <Link to={'/categories'}>Danh mục</Link>
      },
      {
        key: '/roles',
        icon: <ControlOutlined />,
        label: <Link to={'/roles'}>Vai trò</Link>
      },
      {
        key: '/permissions',
        icon: <InsertRowRightOutlined />,
        label: <Link to={'/permissions'}>Quyền hạn</Link>
      },
      {
        key: '/blogs',
        icon: <ProductOutlined />,
        label: <Link to={'/blogs'}>Bài viết</Link>
      },
      {
        key: '/brand',
        icon: <ProductOutlined />,
        label: <Link to={'/brand'}>Thương hiệu</Link>
      },
      {
        key: '/discounts',
        icon: <ProductOutlined />,
        label: <Link to={'/discounts'}>Mã giảm giá</Link>
      },
      {
        key: '/media',
        icon: <FileImageOutlined />,
        label: <Link to={'/media'}>Media</Link>
      }
    ]
  }
]


const AppSidebar = () => {
  const isOpenDrawer = useAppSelector((state) => state.app.isOpenDrawer)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const signoutMutation = useMutation({
    mutationFn: async () => {
      const res = await signoutAPI()
      if (res.data) {
        dispatch(setStateSignout())
        navigate('/signin')
      }
    },
    onSuccess: () => {
      message.success('Đăng xuất thành công')
    },
    onError: (error) => {
      message.error(`Đăng xuất thất bại: ${error.message}`)
    }
  })

  const confirm: PopconfirmProps['onConfirm'] = () => {
    signoutMutation.mutate()
  };

  const cancel: PopconfirmProps['onCancel'] = () => {
    message.error('Click on No');
  };

  return (
    <Sider trigger={null} collapsible collapsed={!isOpenDrawer}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '0 0 20px 0'
      }}>
        <section>
          <div style={{ height: 64 }} />

          <Menu
            theme='dark'
            mode='inline'
            selectedKeys={[location.pathname]}
            defaultSelectedKeys={['/']}
            items={items}
          />
        </section>

        <section style={{ margin: '0 10px' }}>
          <Popconfirm
            title="Đăng xuất"
            description="Bạn có chắc chắn muốn đăng xuất không?"
            onConfirm={confirm}
            onCancel={cancel}
            okText="Có"
            cancelText="Không"
          >
          <Button type="primary" icon={<LogoutOutlined />} style={{ width: '100%' }}>Đăng xuất</Button>
          </Popconfirm>
        </section>
      </div>
    </Sider>
  )
}

export default AppSidebar
