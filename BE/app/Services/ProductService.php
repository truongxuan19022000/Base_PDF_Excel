<?php

namespace App\Services;

use App\Repositories\ProductRepository;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductService
{
    private $productRepository;
    private $scrapService;
    private $quotationSectionService;

    public function __construct(
        ProductRepository $productRepository,
        ScrapService $scrapService,
        QuotationSectionService $quotationSectionService
    ) {
        $this->productRepository = $productRepository;
        $this->scrapService = $scrapService;
        $this->quotationSectionService = $quotationSectionService;
    }

    public function createProduct($credentials)
    {
        try {
            $data = [
                'quotation_section_id' => $credentials['quotation_section_id'],
                'order_number' => $credentials['order_number'],
                'product_code' => $credentials['product_code'],
                'profile' => $credentials['profile'],
                'glass_type' => $credentials['glass_type'],
                'quantity' => $credentials['quantity'],
                'storey' => isset($credentials['storey']) ? $credentials['storey'] : 0,
                'storey_text' => isset($credentials['storey_text']) ? $credentials['storey_text'] : null,
                'area' => isset($credentials['area']) ? $credentials['area'] : 0,
                'area_text' => isset($credentials['area_text']) ? $credentials['area_text'] : null,
                'width' => $credentials['width'],
                'width_unit' => isset($credentials['width_unit']) ? $credentials['width_unit'] : 0,
                'height' => $credentials['height'],
                'height_unit' => isset($credentials['height_unit']) ? $credentials['height_unit'] : 0,
                'created_at' => Carbon::now(),
                'updated_at' => null,
            ];

            $result = $this->productRepository->create($data);
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
            $data = [
                'quotation_section_id' => $credentials['quotation_section_id'],
                'order_number' => $credentials['order_number'],
                'product_code' => $credentials['product_code'],
                'profile' => $credentials['profile'],
                'glass_type' => $credentials['glass_type'],
                'quantity' => $credentials['quantity'],
                'storey' => isset($credentials['storey']) ? $credentials['storey'] : 0,
                'storey_text' => isset($credentials['storey_text']) ? $credentials['storey_text'] : null,
                'area' => isset($credentials['area']) ? $credentials['area'] : 0,
                'area_text' => isset($credentials['area_text']) ? $credentials['area_text'] : null,
                'width' => $credentials['width'],
                'width_unit' => isset($credentials['width_unit']) ? $credentials['width_unit'] : 0,
                'height' => $credentials['height'],
                'height_unit' => isset($credentials['height_unit']) ? $credentials['height_unit'] : 0,
                'updated_at' => Carbon::now(),
            ];
            $result = $this->productRepository->update($credentials['product_id'], $data);
            $this->quotationSectionService->handleCalculateQuotationForUpdate(78);
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

    public function deleteProduct($productId, $quotationId)
    {
        try {
            DB::beginTransaction();
            $products = $this->productRepository->getProductItemByProduct($productId);
            foreach ($products->product_items as $product_item) {
                if (!empty($product_item['product_template_id']) && $product_item['type'] == config('common.material_type.product')) {
                    foreach ($product_item->product_template->productTemplateMaterial as $product_template_material) {
                        $data_delete = [
                            'quotation_id' => $quotationId,
                            'product_item_id' => $product_item->id,
                            'product_template_material_id' => $product_template_material->id
                        ];
                        $this->scrapService->deleteScrapByQuotation($data_delete);
                    }
                }
            }
            $result = $this->productRepository->delete($productId);
            $this->quotationSectionService->handleCalculateQuotationForUpdate($quotationId);
            if (!$result) {
                return false;
            }
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ProductService" FUNCTION "deleteProduct" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function getProductDetail($productId)
    {
        $results = $this->productRepository->getProductDetail($productId);
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
