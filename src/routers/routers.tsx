import { Route, Routes } from 'react-router'
import PrivateRouters from './private.routers'
import NotFoundPage from '@/pages/not-found.page'
import DashboardPage from '@/pages/dashboard/dashboard.page'
import LayoutPage from '@/pages/layout.page'
import UserPage from '@/pages/user/user.page'
import ProductPage from '@/pages/product/product.page'
import RolePage from '@/pages/role/role.page'
import PermissionsPage from '@/pages/permission/permissions.page'
import BlogPage from '@/pages/blog/blogPage'
import FormBlogAdd from '@/pages/blog/formBlogAdd'
import FormBlogEdit from '@/pages/blog/formBlogEdit'


const Routers = () => {
  const isAuthenticated = true

  return (
    <Routes>
      <Route element={<PrivateRouters isAllowed={isAuthenticated ? true : false} redirectTo='/signin' />}>
        <Route path='/' element={<LayoutPage />}>
          <Route index element={<DashboardPage />} />
          <Route path='/users' element={<UserPage />} />
          <Route path='/products' element={<ProductPage />} />

          <Route path='/roles' element={<RolePage />} />
          <Route path='/permissions' element={<PermissionsPage />} />

          <Route path='/blogs' element={<BlogPage />} />
          <Route path='/blogs/add' element={<FormBlogAdd />} />
          <Route path='/blogs/edit/:id' element={<FormBlogEdit />} />
        </Route>
      </Route>
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default Routers
