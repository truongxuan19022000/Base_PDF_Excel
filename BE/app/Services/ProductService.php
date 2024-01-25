<?php

namespace App\Services;

use App\Repositories\ProductRepository;
use App\Repositories\QuotationSectionRepository;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class ProductService
{
    private $productRepository;

    public function __construct(
        ProductRepository $productRepository
    ) {
        $this->productRepository = $productRepository;
    }

    public function createProduct($credentials)
    {
        try {
            $credentials['created_at'] = Carbon::now();
            $credentials['updated_at'] = null;
            $result = $this->productRepository->create($credentials);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "ProductService" FUNCTION "createProduct" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function updateProduct($credentials)
    {
        try {
            $credentials['updated_at'] = Carbon::now();
            $productId = $credentials['product_id'];
            unset($credentials['product_id']);
            $result = $this->productRepository->update($productId, $credentials);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "ProductService" FUNCTION "updateProduct" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function deleteProduct($productId)
    {
        try {
            $result = $this->productRepository->delete($productId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ProductService" FUNCTION "deleteProduct" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function getProductDetail($productId)
    {
        $product = $this->productRepository->getProductDetail($productId);
        $results = [
            'product' => $product,
        ];

        return $results;
    }

    public function updateOrderNumber($credentials)
    {
        try {
            $result = false;
            foreach ($credentials['products'] as $updateData) {
                $productId = $updateData['product_id'];
                unset($updateData['product_id']);
                $result = $this->productRepository->update($productId, $credentials['quotation_section_id'], $updateData);
            }

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "ProductService" FUNCTION "updateOrderProduct" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function updateSubTotal($productId, $subTotal)
    {
        try {
            $updateData = [
                'subtotal' => $subTotal,
                'updated_at' => now(),
            ];
            $result = $this->productRepository->update($productId, $updateData);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "ProductService" FUNCTION "updateSubTotal" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }
}
