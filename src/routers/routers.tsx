import { Route, Routes } from 'react-router'
import PrivateRouters from './private.routers'
import NotFoundPage from '@/pages/not-found.page'
import DashboardPage from '@/pages/dashboard/dashboard.page'
import LayoutPage from '@/pages/layout.page'
import UserPage from '@/pages/user/user.page'
import ProductPage from '@/pages/product/product.page'
import Brand from '@/pages/brand/brand.page'
import BlogCategoryPage from '@/pages/blog/category/blogCategory.page'
import CategoryList from '@/pages/category/category.page'
import CategoryAdd from '@/pages/category/form.category.add'
import CategoryEdit from '@/pages/category/form.category.edit'
import BlogPage from '@/pages/blog/blog.page'
import FormBlogAdd from '@/pages/blog/form.blog.add'
import FormBlogEdit from '@/pages/blog/form.blog.edit'
import RolePage from '@/pages/role/role.page'
import PermissionsPage from '@/pages/permission/permissions.page'
import AdminContactPage from '@/pages/contact/contact.page'
import FormProductAdd from '@/pages/product/form.product.add'
import FormProductEdit from '@/pages/product/form.product.edit'
import ProductVariantsPage from '@/pages/productVariant/productVariant.page'
import AttributePage from '@/pages/attribute/attribute.page'
import VariantAttributePage from '@/pages/variantsat/variantAttribute.page'


const Routers = () => {
  const isAuthenticated = true

  return (
    <Routes>
      <Route element={<PrivateRouters isAllowed={isAuthenticated ? true : false} redirectTo='/signin' />}>
        <Route path='/' element={<LayoutPage />}>
          <Route index element={<DashboardPage />} />
          <Route path='/users' element={<UserPage />} />
          <Route path='/products' element={<ProductPage />} />
          <Route path='/variants' element={<ProductVariantsPage />} />
          <Route path='/attributes' element={<AttributePage />} />
          <Route path='/variantsat' element={<VariantAttributePage />} />
          <Route path='/products/add' element={<FormProductAdd />} />
          <Route path='/products/edit/:id' element={<FormProductEdit />} />
          <Route path='/cateblog' element={<BlogCategoryPage />} />
          <Route path='/blogCategory' element={<BlogCategoryPage />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/add" element={<CategoryAdd/>} />
          <Route path="/categories/edit/:id" element={<CategoryEdit />} />
          <Route path='/blogs' element={<BlogPage />} />
          <Route path='/blogs/add' element={<FormBlogAdd />} />
          <Route path='/blogs/edit/:id' element={<FormBlogEdit />} />
          <Route path='/brand' element={<Brand />} />
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
