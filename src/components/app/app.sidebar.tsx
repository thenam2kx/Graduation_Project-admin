import { useAppSelector } from '@/redux/hooks'
import { ContactsOutlined, ControlOutlined, DashboardOutlined, InsertRowRightOutlined, LogoutOutlined, ProductOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Menu, MenuProps } from 'antd'
import Sider from 'antd/es/layout/Sider'
import { Link, useLocation } from 'react-router'

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
        key: '/blog',
        icon: <UserOutlined />,
        label: <Link to={'/blog'} style={{ color: 'inherit' }}>Bài viết</Link>,
        children: [
          {
            key: '/cateblog',
            label: <Link to={'/cateblog'}>Danh mục bài viết</Link>
          },
          {
            key: '/cateblog/add',
            label: <Link to={'/cateblog/add'}>Thêm mới danh mục bài viết</Link>
          }
        ]
      },
      {
        key: '/categories',
        icon: <ProductOutlined />,
        label: <Link to={'/categories'}>Danh mục</Link>
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
        label: <Link to={'/brand'}>Thương hiệu</Link>,
        children: [
          {
            key: '/brand/add',
            label: <Link to={'/brand/add'}>Thêm mới</Link>
          },
          {
            key: '/brand/edit/1',
            label: <Link to={'/brand/edit/1'}>Chỉnh sửa</Link>
          }
        ]
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
        key: '/contact',
        icon: <ContactsOutlined />,
        label: <Link to={'/contact'}>Liên hệ</Link>

      }
    ]
  }
]

const AppSidebar = () => {
  const isOpenDrawer = useAppSelector((state) => state.app.isOpenDrawer)

  const location = useLocation()

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
          <Button type="primary" icon={<LogoutOutlined />} style={{ width: '100%' }}>Đăng xuất</Button>
        </section>
      </div>
    </Sider>
  )
}

export default AppSidebar
