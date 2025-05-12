import { Route, Routes } from 'react-router'
import PrivateRouters from './private.routers'
import NotFoundPage from '@/pages/not-found.page'
import DashboardPage from '@/pages/dashboard/dashboard.page'
import LayoutPage from '@/pages/layout.page'
import UserPage from '@/pages/user/user.page'
import ProductPage from '@/pages/product/product.page'
import Brand from '@/pages/brand/brandPage'
import BrandForm from '@/pages/brand/brand.form.page'
import BrandUpdate from '@/pages/brand/brand.update.page'
import RolePage from '@/pages/role/role.page'
import PermissionsPage from '@/pages/permission/permissions.page'

const Routers = () => {
  const isAuthenticated = true

  return (
    <Routes>
      <Route element={<PrivateRouters isAllowed={isAuthenticated ? true : false} redirectTo='/signin' />}>
        <Route path='/' element={<LayoutPage />}>
          <Route index element={<DashboardPage />} />
          <Route path='/users' element={<UserPage />} />
          <Route path='/products' element={<ProductPage />} />
          <Route path='/brand' element={<Brand />} />
          <Route path='/brand/add' element={<BrandForm />} />
          <Route path='/brand/edit/1' element={<BrandUpdate/>} />
          <Route path='/roles' element={<RolePage />} />
          <Route path='/permissions' element={<PermissionsPage />} />
        </Route>
      </Route>
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default Routers
