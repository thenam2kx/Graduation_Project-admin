import { message } from "antd";
import ProductForm from "./product.form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchProductById, updateProductAPI } from "@/services/product-service/product.apis";
import { PRODUCT_QUERY_KEYS } from "@/services/product-service/product.key";
import { useParams } from "react-router";
import { clearSelectedMedia } from "@/redux/slices/media.slice";
import { useAppDispatch } from "@/redux/hooks";

const ProductUpdatePage = () => {
  const { id: productId } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await updateProductAPI(productId as string, data);
      if (res && res.data) {
        return res.data;
      } else {
        throw new Error("Failed to update product");
      }
    },
    onSuccess: (data) => {
      console.log("Product update successfully:", data);
      message.success("Product updated successfully!");
      dispatch(clearSelectedMedia());
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      message.error("Failed to update product.");
    }
  })

  const fetchInfoProduct = useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.FETCH_INFO, productId],
    queryFn: async () => {
      const res = await fetchProductById(productId as string)
      if (res && res.data) {
        return res.data;
      } else {
        message.error('Failed to fetch product details!');
        throw new Error('Failed to fetch product details');
      }
    }
  })

  const onSubmit = (data: any) => {
    console.log('🚀 ~ onSubmit ~ data:', data)
    updateProductMutation.mutate(data);
  }
  return (
    <div>
      <div>
        <ProductForm onSubmit={onSubmit} initialValues={fetchInfoProduct.data} />
      </div>
    </div>
  )
}

export default ProductUpdatePage;
