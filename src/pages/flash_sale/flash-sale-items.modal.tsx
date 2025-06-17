import { useEffect, useState } from 'react'
import { Modal, Table, Button, Space, Popconfirm, message, Form, InputNumber, Select, Spin, Radio, Alert } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'

import { 
  getFlashSaleItems, 
  createFlashSaleItem, 
  deleteFlashSaleItem, 
  updateFlashSaleItem 
} from '@/services/flash-sale-service/flash-sale.apis'
import { FLASH_SALE_ITEM_QUERY_KEYS } from '@/services/flash-sale-service/flash-sale.keys'
import { IFlashSaleItem } from '@/types/flash-sale'
import { fetchAllProducts } from '@/services/product-service/product.apis'
import { PRODUCT_QUERY_KEYS } from '@/services/product-service/product.key'

interface FlashSaleItemsModalProps {
  open: boolean
  onCancel: () => void
  flashSaleId: string
}

interface ProductVariant {
  _id: string
  sku: string
  price: number
  stock: number
}

interface Product {
  _id: string
  name: string
  variants: ProductVariant[]
}

const FlashSaleItemsModal = ({ open, onCancel, flashSaleId }: FlashSaleItemsModalProps) => {
  const [form] = Form.useForm()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<IFlashSaleItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [applyType, setApplyType] = useState<'product' | 'variant'>('product')
  
  const queryClient = useQueryClient()

  // Fetch flash sale items
  const { data: itemsData, isLoading } = useQuery({
    queryKey: [FLASH_SALE_ITEM_QUERY_KEYS.FETCH_BY_FLASH_SALE, { flashSaleId, current: currentPage, pageSize }],
    queryFn: () => getFlashSaleItems({ 
      flashSaleId, 
      current: currentPage, 
      pageSize 
    }),
    select: (response) => response.data,
    enabled: open && !!flashSaleId
  })

  // Fetch products for selection
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.FETCH_ALL, { current: 1, pageSize: 100 }],
    queryFn: async () => {
      const params = `?current=1&pageSize=100`
      const res = await fetchAllProducts(params)
      return res.data
    },
    enabled: isAddModalOpen
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFlashSaleItem,
    onSuccess: (response) => {
      console.log('Create response:', response)
      message.success('Thêm sản phẩm vào flash sale thành công')
      queryClient.invalidateQueries({ 
        queryKey: [FLASH_SALE_ITEM_QUERY_KEYS.FETCH_BY_FLASH_SALE, { flashSaleId }] 
      })
      handleCloseAddModal()
    },
    onError: (error) => {
      console.error('Create error:', error)
      message.error('Có lỗi xảy ra khi thêm sản phẩm vào flash sale')
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IFlashSaleItem> }) => 
      updateFlashSaleItem(id, data),
    onSuccess: () => {
      message.success('Cập nhật sản phẩm flash sale thành công')
      queryClient.invalidateQueries({ 
        queryKey: [FLASH_SALE_ITEM_QUERY_KEYS.FETCH_BY_FLASH_SALE, { flashSaleId }] 
      })
      handleCloseAddModal()
    },
    onError: (error) => {
      console.error('Update error:', error)
      message.error('Có lỗi xảy ra khi cập nhật sản phẩm flash sale')
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFlashSaleItem,
    onSuccess: () => {
      message.success('Xóa sản phẩm khỏi flash sale thành công')
      queryClient.invalidateQueries({ 
        queryKey: [FLASH_SALE_ITEM_QUERY_KEYS.FETCH_BY_FLASH_SALE, { flashSaleId }] 
      })
    },
    onError: (error) => {
      console.error('Delete error:', error)
      message.error('Có lỗi xảy ra khi xóa sản phẩm khỏi flash sale')
    }
  })

  useEffect(() => {
    if (isAddModalOpen) {
      if (editingItem) {
        const productId = typeof editingItem.productId === 'object' 
          ? editingItem.productId._id 
          : editingItem.productId
        
        const variantId = typeof editingItem.variantId === 'object' && editingItem.variantId
          ? editingItem.variantId._id
          : editingItem.variantId

        setSelectedProduct(productId)
        setSelectedVariant(variantId || null)
        
        // Xác định loại áp dụng dựa trên dữ liệu
        setApplyType(variantId ? 'variant' : 'product')
        
        form.setFieldsValue({
          productId,
          variantId: variantId || undefined,
          discountPercent: editingItem.discountPercent,
          applyType: variantId ? 'variant' : 'product'
        })
      } else {
        form.resetFields()
        setSelectedProduct(null)
        setSelectedVariant(null)
        setApplyType('product')
        form.setFieldValue('applyType', 'product')
      }
    }
  }, [isAddModalOpen, editingItem, form])

  const handleOpenAddModal = (item?: IFlashSaleItem) => {
    setEditingItem(item || null)
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    setEditingItem(null)
    form.resetFields()
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const handleProductChange = (value: string) => {
    setSelectedProduct(value)
    setSelectedVariant(null)
    form.setFieldValue('variantId', undefined)
    
    // Kiểm tra nếu sản phẩm đã có flash sale cho tất cả biến thể
    if (value && applyType === 'product' && checkProductFlashSaleExists()) {
      message.warning('Sản phẩm này đã có Flash Sale cho tất cả biến thể. Vui lòng chọn một biến thể cụ thể hoặc chọn sản phẩm khác.')
    }
    
    // Kiểm tra nếu đang chọn áp dụng cho toàn bộ sản phẩm nhưng đã có biến thể có flash sale
    if (value && applyType === 'product' && checkAnyVariantHasFlashSale()) {
      message.warning('Một số biến thể của sản phẩm này đã có Flash Sale. Không thể áp dụng Flash Sale cho toàn bộ sản phẩm.')
    }
  }
  
  const handleApplyTypeChange = (e: any) => {
    const value = e.target.value;
    setApplyType(value);
    
    // Nếu chuyển từ variant sang product, xóa variantId
    if (value === 'product') {
      setSelectedVariant(null);
      form.setFieldValue('variantId', undefined);
      
      if (selectedProduct) {
        // Kiểm tra nếu sản phẩm đã có flash sale
        if (checkProductFlashSaleExists()) {
          message.warning('Sản phẩm này đã có Flash Sale cho tất cả biến thể. Vui lòng chọn một biến thể cụ thể hoặc chọn sản phẩm khác.')
        }
        
        // Kiểm tra nếu có biến thể đã có flash sale
        if (checkAnyVariantHasFlashSale()) {
          message.warning('Một số biến thể của sản phẩm này đã có Flash Sale. Không thể áp dụng Flash Sale cho toàn bộ sản phẩm.')
          // Tự động chuyển lại sang chế độ biến thể
          setApplyType('variant');
          form.setFieldValue('applyType', 'variant');
        }
      }
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingItem) {
        updateMutation.mutate({ 
          id: editingItem._id, 
          data: { discountPercent: values.discountPercent } 
        })
      } else {
        // Kiểm tra trùng lặp trước khi tạo
        if (values.applyType === 'product') {
          if (checkProductFlashSaleExists()) {
            message.error('Sản phẩm này đã có Flash Sale cho tất cả biến thể. Vui lòng chọn một biến thể cụ thể hoặc chọn sản phẩm khác.')
            return
          }
          
          if (checkAnyVariantHasFlashSale()) {
            message.error('Một số biến thể của sản phẩm này đã có Flash Sale. Không thể áp dụng Flash Sale cho toàn bộ sản phẩm.')
            return
          }
        }
        
        if (values.applyType === 'variant' && values.variantId && checkVariantFlashSaleExists(values.variantId)) {
          message.error('Biến thể này đã có trong Flash Sale. Vui lòng chọn biến thể khác.')
          return
        }
        
        const data = {
          flashSaleId,
          productId: values.productId,
          ...(values.applyType === 'variant' && values.variantId ? { variantId: values.variantId } : {}),
          discountPercent: values.discountPercent
        }
        createMutation.mutate(data)
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const columns: ColumnsType<IFlashSaleItem> = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productId',
      key: 'productId',
      render: (product) => {
        if (typeof product === 'object') {
          return product.name
        }
        return 'N/A'
      }
    },
    {
      title: 'Biến thể',
      dataIndex: 'variantId',
      key: 'variantId',
      render: (variant) => {
        if (!variant) {
          return 'Tất cả biến thể'
        }
        if (typeof variant === 'object') {
          return variant.sku
        }
        return 'N/A'
      }
    },
    {
      title: 'Giá gốc',
      key: 'originalPrice',
      render: (_, record) => {
        if (typeof record.variantId === 'object' && record.variantId) {
          return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.variantId.price)
        } else if (typeof record.productId === 'object') {
          return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.productId.price)
        }
        return 'N/A'
      }
    },
    {
      title: 'Giảm giá (%)',
      dataIndex: 'discountPercent',
      key: 'discountPercent'
    },
    {
      title: 'Giá sau giảm',
      key: 'finalPrice',
      render: (_, record) => {
        let originalPrice = 0;
        
        if (typeof record.variantId === 'object' && record.variantId) {
          originalPrice = record.variantId.price;
        } else if (typeof record.productId === 'object') {
          originalPrice = record.productId.price;
        } else {
          return 'N/A';
        }
        
        const discountAmount = originalPrice * (record.discountPercent / 100);
        const finalPrice = originalPrice - discountAmount;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice);
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={() => handleOpenAddModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi flash sale?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  // Get variants for selected product
  const getVariantsForProduct = () => {
    if (!selectedProduct || !productsData?.results) return []
    
    const product = productsData.results.find((p: any) => p._id === selectedProduct)
    if (!product || !product.variants) {
      console.log('No variants found for product:', product)
      return []
    }
    
    return product.variants
  }
  
  // Check if a flash sale already exists for this product (without variant)
  const checkProductFlashSaleExists = () => {
    if (!selectedProduct || !itemsData?.results) return false
    
    return itemsData.results.some((item: IFlashSaleItem) => {
      const productId = typeof item.productId === 'object' ? item.productId._id : item.productId
      return productId === selectedProduct && !item.variantId
    })
  }
  
  // Check if a flash sale already exists for this variant
  const checkVariantFlashSaleExists = (variantId: string) => {
    if (!itemsData?.results) return false
    
    return itemsData.results.some((item: IFlashSaleItem) => {
      const itemVariantId = typeof item.variantId === 'object' && item.variantId ? item.variantId._id : item.variantId
      return itemVariantId === variantId
    })
  }
  
  // Check if any variant of this product already has a flash sale
  const checkAnyVariantHasFlashSale = () => {
    if (!selectedProduct || !itemsData?.results) return false
    
    return itemsData.results.some((item: IFlashSaleItem) => {
      const productId = typeof item.productId === 'object' ? item.productId._id : item.productId
      return productId === selectedProduct && item.variantId
    })
  }

  return (
    <>
      <Modal
        title="Quản lý sản phẩm Flash Sale"
        open={open}
        onCancel={onCancel}
        width={1000}
        footer={[
          <Button key="back" onClick={onCancel}>
            Đóng
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenAddModal()}
          >
            Thêm sản phẩm
          </Button>
        ]}
      >
        <Table
          columns={columns}
          dataSource={itemsData?.results}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: itemsData?.meta.total || 0,
            onChange: (page, pageSize) => {
              setCurrentPage(page)
              setPageSize(pageSize)
            }
          }}
        />
      </Modal>

      <Modal
        title={editingItem ? "Cập nhật sản phẩm Flash Sale" : "Thêm sản phẩm vào Flash Sale"}
        open={isAddModalOpen}
        onCancel={handleCloseAddModal}
        footer={[
          <Button key="back" onClick={handleCloseAddModal}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={handleSubmit}
          >
            {editingItem ? 'Cập nhật' : 'Thêm'}
          </Button>
        ]}
      >
        {isLoadingProducts ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Đang tải..." />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            name="flash_sale_item_form"
          >
            <Alert
              message="Hướng dẫn thêm sản phẩm vào Flash Sale"
              description={
                <ul className="list-disc pl-5">
                  <li>Chọn "Toàn bộ sản phẩm" để áp dụng Flash Sale cho tất cả biến thể của sản phẩm</li>
                  <li>Chọn "Biến thể cụ thể" để áp dụng Flash Sale cho một biến thể nhất định</li>
                  <li>Không thể áp dụng Flash Sale cho toàn bộ sản phẩm nếu đã có biến thể có Flash Sale</li>
                  <li>Không thể áp dụng Flash Sale cho biến thể đã có trong Flash Sale khác</li>
                </ul>
              }
              type="info"
              showIcon
              className="mb-4"
            />

            <Form.Item
              name="applyType"
              label="Áp dụng cho"
              rules={[{ required: true, message: 'Vui lòng chọn loại áp dụng' }]}
              initialValue="product"
              disabled={!!editingItem}
              help="Chọn áp dụng Flash Sale cho toàn bộ sản phẩm hoặc chỉ cho một biến thể cụ thể"
            >
              <Radio.Group onChange={handleApplyTypeChange} disabled={!!editingItem}>
                <Radio value="product">Toàn bộ sản phẩm</Radio>
                <Radio value="variant">Biến thể cụ thể</Radio>
              </Radio.Group>
            </Form.Item>
            
            {selectedProduct && checkProductFlashSaleExists() && applyType === 'product' && (
              <Alert
                message="Cảnh báo: Sản phẩm đã có Flash Sale"
                description="Sản phẩm này đã có Flash Sale cho tất cả biến thể. Vui lòng chọn một biến thể cụ thể hoặc chọn sản phẩm khác."
                type="warning"
                showIcon
                className="mb-4"
              />
            )}
            
            {selectedProduct && checkAnyVariantHasFlashSale() && applyType === 'product' && (
              <Alert
                message="Cảnh báo: Biến thể đã có Flash Sale"
                description="Một số biến thể của sản phẩm này đã có Flash Sale. Không thể áp dụng Flash Sale cho toàn bộ sản phẩm. Vui lòng chọn 'Biến thể cụ thể' và chọn biến thể chưa có Flash Sale."
                type="warning"
                showIcon
                className="mb-4"
              />
            )}
            
            <Form.Item
              name="productId"
              label="Sản phẩm"
              rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
              disabled={!!editingItem}
            >
              <Select
                placeholder="Chọn sản phẩm"
                onChange={handleProductChange}
                disabled={!!editingItem}
              >
                {productsData?.results?.map((product: any) => (
                  <Select.Option key={product._id} value={product._id}>
                    {product.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {applyType === 'variant' && (
              <Form.Item
                name="variantId"
                label="Biến thể"
                rules={[{ required: applyType === 'variant', message: 'Vui lòng chọn biến thể' }]}
                disabled={!!editingItem}
                help="Chọn biến thể cụ thể để áp dụng Flash Sale"
              >
                <Select
                  placeholder="Chọn biến thể"
                  disabled={!selectedProduct || !!editingItem}
                >
                  {getVariantsForProduct().map((variant: any) => (
                    <Select.Option key={variant._id} value={variant._id}>
                      {variant.sku} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              name="discountPercent"
              label="Phần trăm giảm giá (%)"
              rules={[
                { required: true, message: 'Vui lòng nhập phần trăm giảm giá' },
                { type: 'number', min: 0, max: 100, message: 'Giảm giá phải từ 0% đến 100%' }
              ]}
              help="Nhập phần trăm giảm giá từ 0% đến 100%"
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="Nhập phần trăm giảm giá"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  )
}

export default FlashSaleItemsModal
