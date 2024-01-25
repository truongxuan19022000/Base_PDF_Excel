<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\ProductRepository;
use App\Repositories\QuotationRepository;
use App\Repositories\QuotationSectionRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuotationSectionService
{
    private $quotationSectionRepository;
    /**
     * @var ActivityRepository
     */
    private $activityRepository;
    /**
     * @var QuotationRepository
     */
    private $quotationRepository;

    public function __construct(
        QuotationSectionRepository $quotationSectionRepository,
        ActivityRepository $activityRepository,
        QuotationRepository $quotationRepository
    ) {
        $this->quotationSectionRepository = $quotationSectionRepository;
        $this->activityRepository = $activityRepository;
        $this->quotationRepository = $quotationRepository;
    }

    public function getQuotationSections($quotationId)
    {
        $quotation_sections = $this->quotationSectionRepository->getQuotationSections($quotationId);
        $quotations = $this->quotationRepository->getDiscountAndOtherFeeOfQuotation($quotationId);
        $results = [
            'quotation_sections' => $quotation_sections,
            'quotations' => $quotations
        ];

        return $results;
    }

    public function createQuotationSection($credentials)
    {
        try {
            $quotation_section = [
                'quotation_id' => $credentials['quotation_id'],
                'section_name' => $credentials['section_name'],
                'order_number' => $credentials['order_number'],
                'created_at' => Carbon::now(),
                'updated_at' => null,
            ];
            $result = $this->quotationSectionRepository->create($quotation_section);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationSectionService" FUNCTION "createQuotationSection" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function updateOrderNumber($credentials)
    {
        try {
            $result = false;
            foreach ($credentials['quotation_sections'] as $updateData) {
                $quotationSectionId = $updateData['quotation_section_id'];
                unset($updateData['quotation_section_id']);
                $result = $this->quotationSectionRepository->update($quotationSectionId, $updateData);
            }

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationSectionService" FUNCTION "updateOrderQuotationSection" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function handleQuotationSections($credentials)
    {
        try {
            DB::beginTransaction();
            //create
            foreach ($credentials['create'] as $createData) {
                $createData['quotation_id'] = $credentials['quotation_id'];
                $quotation_section = $this->quotationSectionRepository->create($createData);
                if ($quotation_section) {
                    $this->insertSectionsActivity($credentials['quotation_id'], Activity::ACTION_CREATED);
                }
            }

            //update
            foreach ($credentials['update'] as $updateData) {
                $quotationSectionId = $updateData['id'];
                unset($updateData['id']);
                $updateData['quotation_id'] = $credentials['quotation_id'];
                $quotation_sections = $this->quotationSectionRepository->update($quotationSectionId, $updateData);
                if (!empty($quotation_sections)) {
                    $this->insertSectionsActivity($credentials['quotation_id'], Activity::ACTION_UPDATED);
                }
            }

            //delete
            if (!empty($credentials['delete'])) {
                $quotation_sections = $this->quotationSectionRepository->delete($credentials['delete']);
                if (!empty($quotation_sections)) {
                    $this->insertSectionsActivity($credentials['quotation_id'], Activity::ACTION_DELETED);
                }
            }

            $result = $this->quotationSectionRepository->getQuotationSections($credentials['quotation_id']);
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "QuotationSectionsService" FUNCTION "handleQuotationSections" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function insertSectionsActivity($quotation_id, $action)
    {
        try {
            $quotation = $this->quotationRepository->getQuotationDetail($quotation_id);
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'customer_id' => $quotation->customer_id,
                'quotation_id' => $quotation->id,
                'type' => Activity::TYPE_QUOTATION_SECTIONS,
                'user_id' => $user->id,
                'action_type' => $action,
                'created_at' => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationSectionService" FUNCTION "insertSectionsActivity" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function delete($quotationSectionId)
    {
        try {
            $result = $this->quotationSectionRepository->delete($quotationSectionId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationSectionService" FUNCTION "delete" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function calculateTypeAluminium($credentials, $product)
    {
        $rawQuantity = 2;
        $widthQuantityDefault = $heightQuantityDefault = 2;
        $costOfScrap = 2.00;
        $costOfRawAluminium = $product->price;
        $costOfPowderCoating = $product->coating_price;

        if (isset($credentials['material_id']) && $credentials['material_id'] == $product->material_id) {
            $widthQuantityDefault = isset($credentials['width_quantity']) ? $credentials['width_quantity'] : $widthQuantityDefault;
            $heightQuantityDefault = isset($credentials['width_quantity']) ? $credentials['width_quantity'] : $heightQuantityDefault;
            $costOfRawAluminium = isset($credentials['cost_of_raw_aluminium']) ? $credentials['cost_of_raw_aluminium'] : $costOfRawAluminium;
            $costOfPowderCoating = isset($credentials['cost_of_powder_coating']) ? $credentials['cost_of_powder_coating'] : $costOfPowderCoating;
            $costOfScrap = isset($credentials['cost_of_scrap']) ? $credentials['cost_of_scrap'] : $costOfScrap;
        }

        $totalPerimeter = ($credentials['width'] / 1000 * $widthQuantityDefault) + ($credentials['height'] / 1000 * $heightQuantityDefault);
        $rawQuantity = ceil($totalPerimeter / $product->raw_length) ?? 2;
        $totalRawPerimeter = $product->raw_length * $rawQuantity;
        $totalCostOfPowderCoating = $product->raw_length * $rawQuantity * $product->raw_girth * $product->coating_price;
        $totalCosOfRawMaterial = $product->price * $rawQuantity + $totalCostOfPowderCoating;

        $side = ($product->inner_side == 2 && $product->outer_side == 2) ? config("common.side.inner_outer") :
                (($product->inner_side == 2) ? config("common.side.inner") :
                (($product->outer_side == 2) ? config("common.side.outer") : ""));

        $afterCalculate = [
            "product_template_id" =>intval( $product->product_template_id),
            "material_id" => intval($product->material_id),
            "item" => $product->item,
            "category" => $product->category,
            "side" => $side,
            "code" => $product->code,
            "type" => intval(config('quotation.product_item_type.aluminium')),
            "order_number" => '',
            "actual_material_needed" => [
                "width" => $credentials['width'] / 1000,
                "width_quantity" => $widthQuantityDefault,
                "height" => $credentials['height'] / 1000,
                "height_quantity" => $heightQuantityDefault,
                "total_perimeter" => $totalPerimeter,
                "total_weight" => $product->weight * $totalPerimeter
            ],
            "raw_material_needed" => [
                "raw_length" => $product->raw_length,
                "raw_quantity" => $rawQuantity,
                "raw_girth" => $product->raw_girth,
                "total_raw_perimeter" => $product->raw_length * $rawQuantity,
                "total_raw_weight" => $totalRawPerimeter * $product->weight,
                "cost_of_raw_aluminium" =>  $costOfRawAluminium,
                "total_cost_of_raw_aluminium" => $product->price * $rawQuantity,
                "cost_of_powder_coating" => $costOfPowderCoating,
                "total_cost_of_powder_coating" => $totalCostOfPowderCoating,
                "total_cost_of_raw_material" => $totalCosOfRawMaterial
            ],
            "scrap" => [
                "scrap_length" => abs($product->raw_length * $rawQuantity - $totalPerimeter),
                "scrap_weight" => abs($totalRawPerimeter * $product->weight - $product->weight * $totalPerimeter),
                "cost_of_scrap" => abs($costOfScrap),
                "total_cost_of_scrap" => abs(($totalRawPerimeter * $product->weight - $product->weight * $totalPerimeter) * $costOfScrap)
            ]
        ];

        $scraps = [
            "quotation_section_id" => intval($credentials['quotation_section_id']),
            "product_id" => intval($credentials['product_id']),
            "material_id" => intval($product->material_id),
            "scrap_length" => abs($product->raw_length * $rawQuantity - $totalPerimeter),
            "cost_of_scrap" => $costOfScrap,
            "created_at" => now(),
            "updated_at" => null,
            "deleted_at" => null,
        ];

        return [
            'afterCalculate' => $afterCalculate,
            'totalCosOfRawMaterial' => $totalCosOfRawMaterial,
            'scraps' => $scraps
        ];
    }

    public function calculateTypeOther($credentials, $product)
    {
        $informationCommon = [
            "product_template_id" => intval($product->product_template_id),
            "category" => $product->category,
            "material_id" => $product->material_id,
            "item" => $product->item,
            "code" => $product->code,
            "type" => intval(config('quotation.product_item_type.other')),
            "order_number" => '',
            "cost_of_item" => floatval($product->price),
            "cost_unit" => intval($product->price_unit),

        ];

        if ($product->price_unit == config('quotation.material_price_unit.pc')) {
            $informationCommon["total_cost_of_item"] = $product->quantity * $product->price;
            $informationCommon["quantity"] = $product->quantity;
            $afterCalculate = $informationCommon;
            $totalCostOfItems = $product->quantity * $product->price;
        } elseif ($product->price_unit == config('quotation.material_price_unit.m2')) {
            $informationCommon["total_area"] = $credentials['width'] / 1000 * $credentials['height'] / 1000;
            $informationCommon["total_cost_of_item"] = $product->price * $credentials['width'] / 1000 * $credentials['height'] / 1000;
            $informationCommon["quantity"] = $product->quantity;
            $afterCalculate = $informationCommon;
            $totalCostOfItems = $product->price * $credentials['width'] / 1000 * $credentials['height'] / 1000;
        } else {
            $quantityDefaultTypeMeter = 2;
            $totalPerimeterTypeMeter = $credentials['width'] / 1000 * $quantityDefaultTypeMeter + $credentials['height'] / 1000 * $quantityDefaultTypeMeter;
            $informationCommon["total_perimeter"] = $totalPerimeterTypeMeter;
            $informationCommon["total_cost_of_item"] = $product->price * $totalPerimeterTypeMeter;
            $informationCommon["quantity"] = $quantityDefaultTypeMeter;
            $afterCalculate = $informationCommon;
            $totalCostOfItems = $product->price * $totalPerimeterTypeMeter;
        }

        return [
            'afterCalculate' => $afterCalculate,
            'totalCostOfItems' => $totalCostOfItems,
        ];
    }

    public function calculateMaterial($credentials, $material)
    {
        $informationCommon = [
            "material_id" => intval($material->id) ?? null,
            "category" => $material->category ?? null,
            "item" => $material->item ?? null,
            "code" => $material->code ?? null,
            "order_number" => ''
        ];
        $price_unit = $material->price_unit ?? null;
        if ($price_unit && ($price_unit == config('quotation.material_price_unit.panel') && $credentials['type'] == 3)) {
            $informationCommon["unit_price"] = $credentials['unit_price'];
            $subTotal = $credentials['quantity'] * $credentials['unit_price'];
            $informationCommon["quantity"] = $credentials['quantity'];
            $afterCalculate = $informationCommon;
            $totalCostOfItems = $credentials['quantity'] * $credentials['unit_price'];
        } else {
            $width = !empty($credentials['no_of_panels']) ? $credentials['width'] / $credentials['no_of_panels'] : $credentials['width'];
            $informationCommon["unit_price"] = $credentials['unit_price'];
            $subTotal = $credentials['unit_price'] * $width / 1000 * $credentials['height'] / 1000;
            $totalCostOfItems = $credentials['unit_price'] * $width / 1000 * $credentials['height'] / 1000;
            $informationCommon["quantity"] = $width / 1000 * $credentials['height'] / 1000;
            $afterCalculate = $informationCommon;
        }

        return [
            'afterCalculate' => $afterCalculate,
            'totalCostOfItems' => $totalCostOfItems,
            'subTotal' => $subTotal,
            "quantity_unit" => $material->price_unit ?? null,
        ];
    }
}
