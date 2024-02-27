<?php

namespace App\Services;

use App\Repositories\ProductItemRepository;
use App\Repositories\ProductItemTemplateRepository;
use App\Repositories\ProductTemplateMaterialRepository;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductItemService
{
    private $productItemRepository;
    /**
     * @var ProductTemplateMaterialRepository
     */
    private $productTemplateMaterialRepository;
    /**
     * @var ProductItemTemplateRepository
     */
    private $productItemTemplateRepository;
    /**
     * @var ProductTemplateService
     */
    private $productTemplateService;
    /**
     * @var QuotationSectionService
     */
    private $quotationSectionService;
    /**
     * @var MaterialService
     */
    private $materialService;
    /**
     * @var ScrapService
     */
    private $scrapService;
    /**
     * @var ProductService
     */
    private $productService;

    public function __construct(
        ProductItemRepository $productItemRepository,
        ProductTemplateMaterialRepository $productTemplateMaterialRepository,
        ProductItemTemplateRepository $productItemTemplateRepository,
        ProductTemplateService $productTemplateService,
        QuotationSectionService $quotationSectionService,
        MaterialService $materialService,
        ScrapService $scrapService,
        ProductService $productService
    )
    {
        $this->productTemplateMaterialRepository = $productTemplateMaterialRepository;
        $this->productItemRepository = $productItemRepository;
        $this->productItemTemplateRepository = $productItemTemplateRepository;
        $this->productTemplateService = $productTemplateService;
        $this->quotationSectionService = $quotationSectionService;
        $this->materialService = $materialService;
        $this->scrapService = $scrapService;
        $this->productService = $productService;
    }

    public function createProductItem($credentials)
    {
        try {
            $credentials['created_at'] = Carbon::now();
            $credentials['updated_at'] = null;
            $data = [
                'product_id' => $credentials['product_id'],
                'title' => isset($credentials['title']) ? $credentials['title'] : null,
                'no_of_panels' => isset($credentials['no_of_panels']) ? $credentials['no_of_panels'] : 0,
                'order_number' => $credentials['order_number'],
                'type' => $credentials['type'],
                'quantity' => isset($credentials['quantity']) ? $credentials['quantity'] : 0,
                'service_type' => isset($credentials['service_type']) ? $credentials['service_type'] : 0,
                'unit_price' => isset($credentials['unit_price']) ? $credentials['unit_price'] : 0,
                'updated_at' => Carbon::now(),
            ];
            if (isset($credentials['material_id'])) {
                $data['material_id'] = $credentials['material_id'];
            }
            if (isset($credentials['product_template_id'])) {
                $data['product_template_id'] = $credentials['product_template_id'];
            }

            $result = $this->productItemRepository->create($data);
            $credentials['product_item_id'] = $result->id;
            $this->calculateQuotationAmount($result, $credentials, config('common.product_item_screen.product_item'));

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
            $data = [
                'product_id' => $credentials['product_id'],
                'title' => isset($credentials['title']) ? $credentials['title'] : null,
                'no_of_panels' => isset($credentials['no_of_panels']) ? $credentials['no_of_panels'] : 0,
                'order_number' => $credentials['order_number'],
                'type' => $credentials['type'],
                'quantity' => isset($credentials['quantity']) ? $credentials['quantity'] : 0,
                'service_type' => isset($credentials['service_type']) ? $credentials['service_type'] : 0,
                'unit_price' => isset($credentials['unit_price']) ? $credentials['unit_price'] : 0,
                'updated_at' => Carbon::now(),
            ];
            if (isset($credentials['material_id'])) {
                $data['material_id'] = $credentials['material_id'];
            }
            if (isset($credentials['product_template_id'])) {
                $data['product_template_id'] = $credentials['product_template_id'];
            }
            $result = $this->productItemRepository->update($credentials['product_item_id'], $credentials);

            $productItemDetail = $this->getProductItemDetail($credentials['product_item_id']);
            $this->calculateQuotationAmount($productItemDetail, $credentials, config('common.product_item_screen.product_item'));
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

    public function deleteProductItem($productItemId, $quotationId)
    {
        try {
            DB::beginTransaction();
            // delete scraps by product item
            $product_items = $this->productItemRepository->getProductTemplateByProductItem($productItemId);
            if (!empty($product_items['product_template_id']) && $product_items['type'] == config('common.material_type.product')) {
                foreach ($product_items->product_template->productTemplateMaterial as $product_template_material) {
                    $data_delete = [
                        'quotation_id' => $quotationId,
                        'product_item_id' => $productItemId,
                        'product_template_material_id' => $product_template_material->id
                    ];
                    $this->scrapService->deleteScrapByQuotation($data_delete);
                }
            }
            $result = $this->productItemRepository->delete($productItemId);
            $this->quotationSectionService->handleCalculateQuotationForUpdate($quotationId);

            if (!$result) {
                return false;
            }
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ProductItemService" FUNCTION "deleteProductItem" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function createMaterialItem($credentials)
    {
        try {
            DB::beginTransaction();
            $data = [
                'product_template_id' => $credentials['product_template_id'],
                'material_id' => $credentials['material_id'],
                'quantity' => 1,
                'type' => 2,
                'created_at' => Carbon::now(),
                'updated_at' => null,
            ];
            $result = $this->productTemplateMaterialRepository->create($data);
            if ($credentials['category'] === config('common.material_category.aluminium')) {
                $material_data = [
                    'product_template_material_id' => $result->id,
                    'product_item_id' => $credentials['product_item_id'],
                    'used_scrap_id' => !empty($credentials['scrap_id']) ? $credentials['scrap_id'] : null,
                    'width_quantity' => $credentials['width_quantity'],
                    'height_quantity' => $credentials['height_quantity'],
                    'cost_of_raw_aluminium' => $credentials['cost_of_raw_aluminium'],
                    'cost_of_powder_coating' => $credentials['cost_of_powder_coating'],
                    'cost_of_scrap' => $credentials['cost_of_scrap'],
                ];
            } else {
                $material_data = [
                    'product_template_material_id' => $result->id,
                    'product_item_id' => $credentials['product_item_id'],
                    'used_scrap_id' => !empty($credentials['scrap_id']) ? $credentials['scrap_id'] : null,
                    'quantity' => $credentials['quantity'] ?? null,
                    'cost_of_item' => $credentials['cost_of_item'],
                ];
            }
            $data = $this->productItemTemplateRepository->create($material_data);
            // update scrap
            if (!empty($credentials['scrap_id']) && $credentials['scrap_id'] != 0) {
                $credentials['status'] = 2;
                $this->scrapService->updateStatus($credentials);
            }

            if (!empty($credentials['scrap_length']) && $credentials['scrap_length'] > 0) {
                $credentials['product_template_material_id'] = !empty($credentials['product_template_material_id']) ? $credentials['product_template_material_id'] : $result->id;
                $this->scrapService->createScrap($credentials);
            }
            $productItem = $this->getProductItemDetail($credentials['product_item_id']);
            $credentials['type'] = config('common.material_type.product');
            $this->calculateQuotationAmount($productItem, $credentials, config('common.product_item_screen.material_item'));
            if (!$result) {
                return false;
            }
            DB::commit();
            return $data;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ProductItemService" FUNCTION "createProductMaterialItem" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function updateMaterialItem($id, $credentials)
    {
        try {
            DB::beginTransaction();
            if ($credentials['category'] === config('common.material_category.aluminium')) {
                $material_data = [
                    'product_template_material_id' => $credentials['product_template_material_id'],
                    'product_item_id' => $credentials['product_item_id'],
                    'width_quantity' => $credentials['width_quantity'],
                    'height_quantity' => $credentials['height_quantity'],
                    'cost_of_raw_aluminium' => $credentials['cost_of_raw_aluminium'],
                    'cost_of_powder_coating' => $credentials['cost_of_powder_coating'],
                    'cost_of_scrap' => $credentials['cost_of_scrap'],
                ];
            } else {
                $material_data = [
                    'product_template_material_id' => $credentials['product_template_material_id'],
                    'product_item_id' => $credentials['product_item_id'],
                    'quantity' => $credentials['quantity'],
                    'cost_of_item' => $credentials['cost_of_item'],
                ];
            }

            if (!empty($credentials['product_item_template_id']) && $credentials['product_item_template_id'] != 0) {
                $result = $this->productItemTemplateRepository->update($id, $material_data);
            } else {
                $result = $this->productItemTemplateRepository->create($material_data);
            }

            if (!$result) {
                return false;
            }
            // update scrap
            if (!empty($credentials['scrap_id']) && $credentials['scrap_id'] != 0) {
                $credentials['status'] = 1;
                $this->scrapService->updateScrap($credentials);
            }
            $productItem = $this->getProductItemDetail($credentials['product_item_id']);
            $credentials['type'] = config('common.material_type.product');
            $this->calculateQuotationAmount($productItem, $credentials, config('common.product_item_screen.material_item'));
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ProductItemService" FUNCTION "updateProductMaterialItem" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function deleteMaterialItem($credentials)
    {
        try {
            DB::beginTransaction();
            $material_data = [
                'product_template_material_id' => $credentials['product_template_material_id'],
                'product_item_id' => $credentials['product_item_id'],
                'delete_status' => 1
            ];

            if (!empty($credentials['product_item_template_id']) && $credentials['product_item_template_id'] != 0) {
                $result = $this->productItemTemplateRepository->update($credentials['product_item_template_id'], ['delete_status' => 1]);
            } else {
                $result = $this->productItemTemplateRepository->create($material_data);
            }

            if (!empty($credentials['scrap_id']) || !empty($credentials['used_scrap_id'])) {
                $this->scrapService->delete($credentials['scrap_id']);
                $credentials = [
                    'scrap_id' => $credentials['used_scrap_id'],
                    'status' => 1,
                ];
                $this->scrapService->updateStatus($credentials);
            }

            if (!$result) {
                return false;
            }
            DB::commit();
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ProductItemService" FUNCTION "deleteMaterialItem" ERROR: ' . $e->getMessage());
            DB::rollBack();
            return false;
        }
    }

    public function checkExistMaterial($materialId)
    {
        try {
            $result = $this->productItemRepository->checkExistMaterial($materialId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ProductItemService" FUNCTION "checkExistMaterial" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function checkExistProductTemplate($productTemplateId)
    {
        try {
            $result = $this->productItemRepository->checkExistProductTemplate($productTemplateId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ProductItemService" FUNCTION "checkExistProductTemplate" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function updateSubTotal($productItemId, $update)
    {
        try {
            $updateData = [
                'unit_price' => $update['unit_price'],
                'subtotal' => $update['subtotal'],
                'updated_at' => Carbon::now(),
            ];
            $result = $this->productItemRepository->update($productItemId, $updateData);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "ProductItemService" FUNCTION "updateSubTotal" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function getProductItemDetail($productItemId)
    {
        return $this->productItemRepository->getProductItemDetail($productItemId);
    }

    public function calculateQuotationAmount($productItem, $credentials, $screen=null)
    {
        try {
            $totalCostOfItems = 0;
            $totalCostOfOthers = 0;
            $scraps = [];
            $totalCostOfAluminium = 0;
            if ($credentials['type'] == config('common.material_type.product') && isset($credentials['product_template_id'])) {
                $productTemplate = $this->productTemplateService->getProductTemplateForQuotation($credentials['product_template_id'], $productItem->id);
                foreach ($productTemplate['product_templates']->productTemplateMaterial as $material) {
                    $material->product_item_id = $credentials['product_item_id'];
                    if ($material->category === "Aluminium") {
                        $aluminium = $this->quotationSectionService->calculateTypeAluminium($credentials, $material);
                        $totalCostOfItems += $aluminium['totalCosOfRawMaterial'];
                        $totalCostOfAluminium = ($credentials['width'] / 1000 * $credentials['height'] / 1000) * $totalCostOfItems;
                        if ($material->type == 1 && $aluminium['scraps']['scrap_length'] > 0) {
                            $scraps[] = $aluminium['scraps'];
                        }
                    } else {
                        $other = $this->quotationSectionService->calculateTypeOther($credentials, $material);
                        $totalCostOfItems += $other['totalCostOfItems'];
                        $totalCostOfAluminium = ($credentials['width'] / 1000 * $credentials['height'] / 1000) * $totalCostOfItems;
                    }
                }
                $this->updateSubTotal($productItem->id, ['unit_price' => round($totalCostOfItems, 2), 'subtotal' => round($totalCostOfAluminium, 2)]);
            } else {
                $credentials["quantity"] = $productItem['quantity'];
                $credentials["unit_price"] = $productItem['unit_price'];
                $detail = $this->materialService->getMaterialDetail($credentials['material_id']);
                $meterialType = $this->quotationSectionService->calculateMaterial($credentials, $detail['materials']);
                if ($productItem->type == 3) {
                    $totalCostOfOthers += $productItem['unit_price'] * $productItem['quantity'];
                } else {
                    $totalCostOfOthers += $meterialType['subTotal'];
                }
                $this->updateSubTotal($productItem->id, ['unit_price' => round($productItem['unit_price'], 2), 'subtotal' => round($totalCostOfOthers, 2)]);
            }
            if ($screen == config('common.product_item_screen.product_item')) {
                //handle scraps
                foreach ($scraps as $scrap) {
                    $this->scrapService->updateOrInsert($scrap);
                }
            }
            $this->quotationSectionService->handleCalculateQuotationForUpdate($credentials['quotation_id']);
            return [
                'status' => true,
                'totalCostOfItems' => $totalCostOfItems || $totalCostOfOthers,
                'scraps' => $scraps
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "ProductItemService" FUNCTION "calculateQuotationAmount" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }
}
