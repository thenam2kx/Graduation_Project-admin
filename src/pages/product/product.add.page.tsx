import { message } from "antd";
import ProductForm from "./product.form";
import { useMutation } from "@tanstack/react-query";
import { createProductAPI } from "@/services/product-service/product.apis";

export default function ProductAddPage() {
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await createProductAPI(data);
      if (res && res.data) {
        return res.data;
      } else {
        throw new Error("Failed to create product");
      }
    },
    onSuccess: (data) => {
      console.log("Product created successfully:", data);
      message.success("Product created successfully!");
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      message.error("Failed to create product.");
    }
  })

  const onSubmit = (data: any) => {
    createProductMutation.mutate(data);
  }
  return (
    <div>
      <div>
        <ProductForm onSubmit={onSubmit} />
      </div>
    </div>
  )
}
