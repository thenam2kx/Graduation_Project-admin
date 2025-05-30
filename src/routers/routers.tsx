import { Route, Routes } from 'react-router'
import PrivateRouters from './private.routers'
import NotFoundPage from '@/pages/not-found.page'
import DashboardPage from '@/pages/dashboard/dashboard.page'
import LayoutPage from '@/pages/layout.page'
import UserPage from '@/pages/user/user.page'
import ProductPage from '@/pages/product/product.page'
import Brand from '@/pages/brand/brand.page'
import BlogCategoryPage from '@/pages/blog/category/blogCategory.page'
import FormCateBlogAdd from '@/pages/blog/category/addCategory.page'
import FormCateBlogEdit from '@/pages/blog/category/editCategory.page'
import CategoryList from '@/pages/category/category.page'
import CategoryAdd from '@/pages/category/form.category.add'
import CategoryEdit from '@/pages/category/form.category.edit'
import BlogPage from '@/pages/blog/blog.page'
import FormBlogAdd from '@/pages/blog/form.blog.add'
import FormBlogEdit from '@/pages/blog/form.blog.edit'
import RolePage from '@/pages/role/role.page'
import PermissionsPage from '@/pages/permission/permissions.page'
import AdminContactPage from '@/pages/contact/contact.page'
import Discounts from '@/pages/discounts/discounts.pages'


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
          <Route path='/blogCategory' element={<BlogCategoryPage />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/add" element={<CategoryAdd/>} />
          <Route path="/categories/edit/:id" element={<CategoryEdit />} />

          <Route path='/blogs' element={<BlogPage />} />
          <Route path='/blogs/add' element={<FormBlogAdd />} />
          <Route path='/blogs/edit/:id' element={<FormBlogEdit />} />
          <Route path='/brand' element={<Brand />} />
          <Route path='/discounts' element={<Discounts />} />
          <Route path='/roles' element={<RolePage />} />
          <Route path='/permissions' element={<PermissionsPage />} />
          <Route path='/contact' element={<AdminContactPage />} />
        </Route>
      </Route>
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default Routers
