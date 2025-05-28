import { Route, Routes } from 'react-router'
import PrivateRouters from './private.routers'
import NotFoundPage from '@/pages/not-found.page'
import DashboardPage from '@/pages/dashboard/dashboard.page'
import LayoutPage from '@/pages/layout.page'
import UserPage from '@/pages/user/user.page'
import ProductPage from '@/pages/product/product.page'
import BlogCategoryPage from '@/pages/blog/category/blogCategory.page'
import FormCateBlogAdd from '@/pages/blog/category/addCategory.page'
import FormCateBlogEdit from '@/pages/blog/category/editCategory.page'

const Routers = () => {
  const isAuthenticated = true

  return (
    <Routes>
      <Route element={<PrivateRouters isAllowed={isAuthenticated ? true : false} redirectTo='/signin' />}>
        <Route path='/' element={<LayoutPage />}>
          <Route index element={<DashboardPage />} />
          <Route path='/users' element={<UserPage />} />
          <Route path='/products' element={<ProductPage />} />
          <Route path='/cateblog' element={<BlogCategoryPage />} />
          <Route path='/cateblog/add' element={<FormCateBlogAdd />} />
          <Route path='/cateblog/edit/:id' element={<FormCateBlogEdit />} />
        </Route>
      </Route>
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default Routers
