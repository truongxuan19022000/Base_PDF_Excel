<?php

namespace App\Services;

use App\Repositories\ProductItemRepository;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class ProductItemService
{
    private $productItemRepository;

    public function __construct(
        ProductItemRepository $productItemRepository
    )
    {
        $this->productItemRepository = $productItemRepository;
    }

    public function createProductItem($credentials)
    {
        try {
            $credentials['created_at'] = Carbon::now();
            $credentials['updated_at'] = null;
            unset(
                $credentials['quotation_section_id'],
                $credentials['width'],
                $credentials['height'],
            );
            $result = $this->productItemRepository->create($credentials);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "ProductItemService" FUNCTION "createProductItem" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function updateProductItem($credentials)
    {
        try {
            $credentials['updated_at'] = Carbon::now();
            $productItemId = $credentials['product_item_id'];
            unset(
                $credentials['product_item_id'],
                $credentials['quotation_section_id'],
                $credentials['width'],
                $credentials['height'],
            );
            $result = $this->productItemRepository->update($productItemId, $credentials);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "ProductItemService" FUNCTION "updateProductItem" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function deleteProductItem($productItemId)
    {
        try {
            $result = $this->productItemRepository->delete($productItemId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationSectionService" FUNCTION "deleteProductItem" ERROR: ' . $e->getMessage());
            return false;
        }
    }
}
