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
    /**
     * @var QuotationRepository
     */
    private $quotationSectionService;
    /**
     * @var ScrapService
     */
    private $scrapService;
    /**
     * @var QuotationService
     */
    private $quotationService;
    /**
     * @var ProductRepository
     */
    private $productRepository;

    public function __construct(
        QuotationSectionRepository $quotationSectionRepository,
        ActivityRepository $activityRepository,
        QuotationRepository $quotationRepository,
        ScrapService $scrapService,
        ProductRepository $productRepository,
        QuotationService $quotationService
    ) {
        $this->quotationSectionRepository = $quotationSectionRepository;
        $this->activityRepository = $activityRepository;
        $this->quotationRepository = $quotationRepository;
        $this->scrapService = $scrapService;
        $this->productRepository = $productRepository;
        $this->quotationService = $quotationService;
    }

    public function getQuotationSections($quotationId)
    {
        $quotation_sections = $this->quotationSectionRepository->getQuotationSections($quotationId);
        $data = $this->handleData($quotation_sections);

        $quotations = $this->quotationRepository->getDiscountAndOtherFeeOfQuotation($quotationId);
        $results = [
            'quotation_sections' => $data,
            'quotations' => $quotations
        ];

        return $results;
    }

    public function handleData($quotation_sections) {
        foreach ($quotation_sections as $quotation_section) {
            foreach ($quotation_section->products as $product) {
                foreach ($product->product_items as $product_item) {
                    if ($product_item['type'] == config('common.material_type.product') && !empty($product_item['product_template_id'])) {
                        $product_template_materials = $product_item['product_template']->productTemplateMaterial;
                        $new_product_template_material = [];
                        foreach ($product_template_materials as $key => $product_template_material) {
                            if (isset($product_template_material->all_product_item_templates)) {
                                $product_item_template = $product_template_material->all_product_item_templates->where('product_item_id', $product_item->id)->first();
                                if ($product_item_template) {
                                    if ($product_item_template->delete_status == 0) {
                                        $new_product_template_material[] = $product_template_material;
                                    }
                                } else {
                                    if ($product_template_material['type'] == 1) {
                                        $new_product_template_material[] = $product_template_material;
                                    }
                                }
                            } else {
                                $new_product_template_material[] = $product_template_material;
                            }
                        }
                        $product_item['product_template']['productTemplateMaterial' . $product_item->id] = $new_product_template_material;
                    }
                }
            }
        }

        return $quotation_sections;
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

    public function updateQuotationSection($credentials)
    {
        try {
            $quotation_section = [
                'quotation_id' => $credentials['quotation_id'],
                'section_name' => $credentials['section_name'],
                'order_number' => $credentials['order_number'],
                'updated_at' => Carbon::now(),
            ];
            $result = $this->quotationSectionRepository->update($credentials['quotation_section_id'], $quotation_section);

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

    public function delete($quotationSectionId, $quotationId)
    {
        try {
            DB::beginTransaction();
            $quotationSections = $this->quotationSectionRepository->getQuotationSections($quotationId);
            foreach ($quotationSections as $sections) {
                foreach ($sections->products as $products) {
                    foreach ($products->product_items as $product_items) {
                        if (!empty($product_items['product_template_id']) && $product_items['type'] == config('common.material_type.product')){
                            foreach ($product_items->product_template->productTemplateMaterial as $product_template_material) {
                                $data_delete = [
                                    'quotation_id' => $quotationId,
                                    'product_item_id' => $product_items->id,
                                    'product_template_material_id' => $product_template_material->id
                                ];
                                $this->scrapService->deleteScrapByQuotation($data_delete);
                            }
                        }
                    }
                }
            }
            $result = $this->quotationSectionRepository->delete($quotationSectionId);
            if (!$result) {
                return false;
            }
            if (isset($results['quotation_sections']) && !empty($results['quotation_sections']['quotation_id'])) {
                $this->handleCalculateQuotationForUpdate($quotationId);
            } else {
                $credentials = [
                    'quotation_id' => $quotationId,
                    'price' => 0
                ];
                $this->quotationService->update($credentials);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "QuotationSectionService" FUNCTION "delete" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function handleCalculateQuotation($quotationId)
    {
        try {
            $results = $this->getQuotationSections($quotationId);
            $finalData = [];
            $sumSections = 0;
            $sectionsTemp = [];
            $estimated_scrap_cost = 0;
            foreach ($results['quotation_sections'] as $quotation_sections) {
                $productsTemp = [];
                $sumProducts = 0;
                $totalProduct = 0;
                $scrap_section = 0;
                foreach ($quotation_sections->products as $products) {
                    $productItemsTemp = [];
                    $sumItems = 0;
                    $sumItemAlumiums = 0;
                    $otherItemSubTotal = 0;
                    $aluminiumItemSubTotal = 0;
                    $sub_total = 0;
                    $scrap_product = 0;
                    foreach ($products->product_items as $product_items) {
                        $sumAluminium = 0;
                        $otherSum = 0;
                        $materials = [];
                        $productTemplate = [];
                        $scraps = [];
                        $quantityUnit = 0;
                        $credentials = [
                            "product_id" => $product_items['product_id'],
                            "type" => $product_items['type'],
                            "width" => $products['width'],
                            "height" => $products['height'],
                            "no_of_panels" => $product_items['no_of_panels'],
                            "product_template_id" => $product_items['product_template_id'],
                            "quotation_id" => $quotation_sections['quotation_id'],
                            "product_item_id" => $product_items['id'],
                            // "quantity" => $products['quotation_section_id'],
                        ];
                        if (!empty($product_items['product_template_id']) && $product_items['type'] == config('common.material_type.product')) {
                            $credentials["quantity"] = $products['quantity'];
                            foreach ($product_items['product_template']['productTemplateMaterial' . $product_items->id] as $product) {
                                // If check item is aluminum, calculate according to the following formula:
                                $product->product_item_id = $product_items->id;

                                if ($product->category === "Aluminium") {
                                    $aluminium = $this->calculateTypeAluminium($credentials, $product);
                                    $productTemplate[] = $aluminium['afterCalculate'];
                                    $scraps[] = $aluminium['scraps'];
                                    $sumAluminium += $aluminium['totalCosOfRawMaterial'];
                                    $aluminiumItemSubTotal = ($products['width'] / 1000 * $products['height'] / 1000) * round(floatval($sumAluminium), 2);
                                } else {
                                    $other = $this->calculateTypeOther($credentials, $product);
                                    $productTemplate[] = $other['afterCalculate'];
                                    $sumAluminium += $other['totalCostOfItems'];
                                    $aluminiumItemSubTotal = ($products['width'] / 1000 * $products['height'] / 1000) * round(floatval($sumAluminium), 2);
                                }
                            }
                            $sumItemAlumiums += $aluminiumItemSubTotal;
                        } else {
                            $credentials["quantity"] = $product_items['quantity'];
                            $credentials["unit_price"] = round(floatval($product_items['unit_price']), 2);
                            $meterialType = $this->calculateMaterial($credentials, $product_items['materials']);
                            $quantityUnit = $meterialType['quantity_unit'];
                            if ($product_items->type == 3) {
                                $materials[] = $meterialType['afterCalculate'];
                                $otherSum = round(floatval($product_items['unit_price']), 2);
                                $otherItemSubTotal = round(floatval($product_items['unit_price'] * $product_items['quantity']), 2);
                            } else {
                                $otherSum = round(floatval($product_items['unit_price']), 2);
                                $otherItemSubTotal = round(floatval($meterialType['subTotal']), 2);
                            }
                            $sumItems += $otherItemSubTotal;
                        }

                        if (!empty($product_items['product_template_id']) && $product_items['type'] == config('common.material_type.product')) {
                            $sub_total = round(floatval($aluminiumItemSubTotal), 2);
                        } else {
                            $sub_total = round(floatval($otherItemSubTotal), 2);
                        }

                        $productItemsTemp[] = [
                            'id' => intval($product_items['id']),
                            'product_id' => intval($product_items['product_id']),
                            'material_id' => intval($product_items['material_id']),
                            'product_template_id' => $product_items['product_template_id'],
                            'no_of_panels' => $product_items['no_of_panels'],
                            'order_number' => $product_items['order_number'],
                            'type' => intval($product_items['type']),
                            'quantity' => $product_items['quantity'],
                            'quantity_unit' => intval($quantityUnit),
                            'title' => $product_items['title'],
                            'service_type' => intval($product_items['service_type']),
                            // 'unit_price' => $product_items['unit_price'],
                            'product_template' => $productTemplate,
                            'materials' => $materials,
                            'unit_price' => ($sumAluminium != 0) ? round(floatval($sumAluminium), 2) : round(floatval($otherSum), 2),
                            'sub_total' => round(floatval($sub_total), 2),
                        ];
                    }
                    $sumProducts = round(floatval($sumItemAlumiums + $sumItems), 2);
                    $productsTemp[] = [
                        'productId' => intval($products['productId']),
                        'quotation_section_id' => intval($products['quotation_section_id']),
                        'order_number' => intval($products['order_number']),
                        'product_code' => $products['product_code'],
                        'profile' => $products['profile'],
                        'glass_type' => $products['glass_type'],
                        'storey' => $products['storey'],
                        'area' => $products['area'],
                        'width' => $products['width'],
                        'width_unit' => intval($products['width_unit']),
                        'height' => $products['height'],
                        'height_unit' => intval($products['height_unit']),
                        'quantity' => $products['quantity'],
                        'sub_total' => round(floatval($sumProducts), 2),
                        'product_items' => $productItemsTemp
                    ];

                    $totalProduct += round(floatval($sumProducts * $products['quantity']), 2);
                    $scrap_section += $scrap_product;
                }

                $sectionsTemp[] = [
                    'id' => intval($quotation_sections['id']),
                    'quotation_id' => intval($quotation_sections['quotation_id']),
                    'order_number' => intval($quotation_sections['order_number']),
                    'section_name' => $quotation_sections['section_name'],
                    'products' => $productsTemp
                ];

                $finalData = $sectionsTemp;
                $sumSections += round(floatval($totalProduct), 2);
                $estimated_scrap_cost += $scrap_section;
            }
            $discount = $results['quotations']->discount_amount ?? null;
            $other_fees = $results['quotations']['other_fees'];
            $total_fees = 0;
            foreach ($other_fees as $fee) {
                if ($fee->type == 2) {
                    $total_fees += $fee->amount;
                }
            }
            $total_before_gst = round(floatval($sumSections), 2) + round(floatval($total_fees), 2);
            $grand_total =  $total_before_gst - round(floatval($discount), 2);

            return [
                'finalData' => $finalData,
                'sumSections' => round(floatval($sumSections), 2),
                'other_fees' => round(floatval($total_fees), 2),
                'total_before_gst' => round(floatval($total_before_gst), 2),
                'discount_amount' => round(floatval($discount), 2),
                'discount_type' => $results['quotations']->discount_type ?? null,
                'grand_total' => round(floatval($grand_total), 2),
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationSectionService" FUNCTION "handleCalculateQuotation" ERROR: ' . $e->getMessage());
            return [];
        }
    }

    public function handleCalculateQuotationForUpdate($quotationId)
    {
        try {
            $results = $this->getQuotationSections($quotationId);
            $finalData = [];
            $sumSections = 0;
            $sectionsTemp = [];
            $estimated_scrap_cost = 0;
            foreach ($results['quotation_sections'] as $quotation_sections) {
                $productsTemp = [];
                $sumProducts = 0;
                $totalProduct = 0;
                $scrap_section = 0;
                foreach ($quotation_sections->products as $products) {
                    $productItemsTemp = [];
                    $sumItems = 0;
                    $sumItemAlumiums = 0;
                    $otherItemSubTotal = 0;
                    $aluminiumItemSubTotal = 0;
                    $sub_total = 0;
                    $scrap_product = 0;
                    foreach ($products->product_items as $product_items) {
                        $sumAluminium = 0;
                        $otherSum = 0;
                        $materials = [];
                        $productTemplate = [];
                        $scraps = [];
                        $quantityUnit = 0;
                        $credentials = [
                            "product_id" => $product_items['product_id'],
                            "type" => $product_items['type'],
                            "width" => $products['width'],
                            "height" => $products['height'],
                            "no_of_panels" => $product_items['no_of_panels'],
                            "product_template_id" => $product_items['product_template_id'],
                            "quotation_id" => $quotation_sections['quotation_id'],
                            "product_item_id" => $product_items['id'],
                            // "quantity" => $products['quotation_section_id'],
                        ];
                        if (!empty($product_items['product_template_id']) && $product_items['type'] == config('common.material_type.product')) {
                            $credentials["quantity"] = $products['quantity'];
                            foreach ($product_items['product_template']['productTemplateMaterial' . $product_items->id] as $product) {
                                // If check item is aluminum, calculate according to the following formula:
                                $product->product_item_id = $product_items->id;

                                if ($product->category === "Aluminium") {
                                    $aluminium = $this->calculateTypeAluminium($credentials, $product);
                                    $productTemplate[] = $aluminium['afterCalculate'];
                                    $scraps[] = $aluminium['scraps'];
                                    $sumAluminium += $aluminium['totalCosOfRawMaterial'];
                                    $aluminiumItemSubTotal = ($products['width'] / 1000 * $products['height'] / 1000) * round(floatval($sumAluminium), 2);
                                } else {
                                    $other = $this->calculateTypeOther($credentials, $product);
                                    $productTemplate[] = $other['afterCalculate'];
                                    $sumAluminium += $other['totalCostOfItems'];
                                    $aluminiumItemSubTotal = ($products['width'] / 1000 * $products['height'] / 1000) * round(floatval($sumAluminium), 2);
                                }
                            }
                            $sumItemAlumiums += $aluminiumItemSubTotal;
                        } else {
                            $credentials["quantity"] = $product_items['quantity'];
                            $credentials["unit_price"] = round(floatval($product_items['unit_price']), 2);
                            $meterialType = $this->calculateMaterial($credentials, $product_items['materials']);
                            $quantityUnit = $meterialType['quantity_unit'];
                            if ($product_items->type == 3) {
                                $materials[] = $meterialType['afterCalculate'];
                                $otherSum = round(floatval($product_items['unit_price']), 2);
                                $otherItemSubTotal = round(floatval($product_items['unit_price'] * $product_items['quantity']), 2);
                            } else {
                                $otherSum = round(floatval($product_items['unit_price']), 2);
                                $otherItemSubTotal = round(floatval($meterialType['subTotal']), 2);
                            }
                            $sumItems += $otherItemSubTotal;
                        }

                        if (!empty($product_items['product_template_id']) && $product_items['type'] == config('common.material_type.product')) {
                            $sub_total = round(floatval($aluminiumItemSubTotal), 2);
                        } else {
                            $sub_total = round(floatval($otherItemSubTotal), 2);
                        }

                        $productItemsTemp[] = [
                            'id' => intval($product_items['id']),
                            'product_id' => intval($product_items['product_id']),
                            'material_id' => intval($product_items['material_id']),
                            'product_template_id' => $product_items['product_template_id'],
                            'no_of_panels' => $product_items['no_of_panels'],
                            'order_number' => $product_items['order_number'],
                            'type' => intval($product_items['type']),
                            'quantity' => $product_items['quantity'],
                            'quantity_unit' => intval($quantityUnit),
                            'title' => $product_items['title'],
                            'service_type' => intval($product_items['service_type']),
                            // 'unit_price' => $product_items['unit_price'],
                            'product_template' => $productTemplate,
                            'materials' => $materials,
                            'unit_price' => ($sumAluminium != 0) ? round(floatval($sumAluminium), 2) : round(floatval($otherSum), 2),
                            'sub_total' => round(floatval($sub_total), 2),
                        ];
                    }
                    $sumProducts = round(floatval($sumItemAlumiums + $sumItems), 2);
                    $productsTemp[] = [
                        'productId' => intval($products['productId']),
                        'quotation_section_id' => intval($products['quotation_section_id']),
                        'order_number' => intval($products['order_number']),
                        'product_code' => $products['product_code'],
                        'profile' => $products['profile'],
                        'glass_type' => $products['glass_type'],
                        'storey' => $products['storey'],
                        'area' => $products['area'],
                        'width' => $products['width'],
                        'width_unit' => intval($products['width_unit']),
                        'height' => $products['height'],
                        'height_unit' => intval($products['height_unit']),
                        'quantity' => $products['quantity'],
                        'sub_total' => round(floatval($sumProducts), 2),
                        'product_items' => $productItemsTemp
                    ];
                    $updateData = [
                        'subtotal' => round(floatval($sumProducts), 2),
                        'updated_at' => Carbon::now(),
                    ];
                    $this->productRepository->update(intval($products['productId']), $updateData);
                    $totalProduct += round(floatval($sumProducts * $products['quantity']), 2);
                    $scrap_section += $scrap_product;
                }

                $sectionsTemp[] = [
                    'id' => intval($quotation_sections['id']),
                    'quotation_id' => intval($quotation_sections['quotation_id']),
                    'order_number' => intval($quotation_sections['order_number']),
                    'section_name' => $quotation_sections['section_name'],
                    'products' => $productsTemp
                ];

                $finalData = $sectionsTemp;
                $sumSections += round(floatval($totalProduct), 2);
                $estimated_scrap_cost += $scrap_section;
            }
            $discount = $results['quotations']->discount_amount ?? null;
            $other_fees = $results['quotations']['other_fees'];
            $total_fees = 0;
            foreach ($other_fees as $fee) {
                if ($fee->type == 2) {
                    $total_fees += $fee->amount;
                }
            }
            $total_before_gst = round(floatval($sumSections), 2) + round(floatval($total_fees), 2);
            $grand_total =  $total_before_gst - round(floatval($discount), 2);
            $credentials = [
              'quotation_id' => intval($quotation_sections['quotation_id']),
              'price' => round(floatval($grand_total), 2)
            ];
            $this->quotationService->update($credentials);
            return [
                'finalData' => $finalData,
                'sumSections' => round(floatval($sumSections), 2),
                'other_fees' => round(floatval($total_fees), 2),
                'total_before_gst' => round(floatval($total_before_gst), 2),
                'discount_amount' => round(floatval($discount), 2),
                'discount_type' => $results['quotations']->discount_type ?? null,
                'grand_total' => round(floatval($grand_total), 2),
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationSectionService" FUNCTION "handleCalculateQuotation" ERROR: ' . $e->getMessage());
            return [];
        }
    }

    public function calculateTypeAluminium($credentials, $product)
    {
        $scrap = $this->scrapService->getScrapsByQuotationId($credentials['quotation_id'], $credentials['product_item_id'], $product->id);
        $widthQuantityDefault = $heightQuantityDefault = 2;
        $costOfScrap = 2.00;
        $costOfRawAluminium = $product->price;
        $costOfPowderCoating = ($product->coating_price_status == 1) ? $product->coating_price : 0;

        $updateMaterials = isset($product->all_product_item_templates) ? $product->all_product_item_templates : null;

        foreach ($updateMaterials as $updateMaterial) {
            if ($updateMaterial && $updateMaterial['product_template_material_id'] == $product->id && $updateMaterial['product_item_id'] == $product->product_item_id) {
                $widthQuantityDefault = isset($updateMaterial['width_quantity']) ? intval($updateMaterial['width_quantity']) : $widthQuantityDefault;
                $heightQuantityDefault = isset($updateMaterial['height_quantity']) ? intval($updateMaterial['height_quantity']) : $heightQuantityDefault;
                $costOfRawAluminium = isset($updateMaterial['cost_of_raw_aluminium']) ? floatval($updateMaterial['cost_of_raw_aluminium']) : $costOfRawAluminium;
                $costOfPowderCoating = isset($updateMaterial['cost_of_powder_coating']) ? floatval($updateMaterial['cost_of_powder_coating']) : $costOfPowderCoating;
                $costOfScrap = isset($updateMaterial['cost_of_scrap']) ? floatval($updateMaterial['cost_of_scrap']) : $costOfScrap;
                $product_item_template_id = $updateMaterial['id'];
            }
            if (!empty($updateMaterial->used_scrap_id)) {
                $usedScrap = $this->scrapService->getScrapById($updateMaterial->used_scrap_id);
                $used_scrap_id = $updateMaterial->used_scrap_id;
            }
        }

        $totalPerimeter = ($credentials['width'] / 1000 * $widthQuantityDefault) + ($credentials['height'] / 1000 * $heightQuantityDefault);
        $rawQuantity = ceil($totalPerimeter / $product->raw_length) ?? 2;
        $totalRawPerimeter = $product->raw_length * $rawQuantity;
        $totalCostOfPowderCoating = $product->raw_length * $rawQuantity * $product->raw_girth * $costOfPowderCoating;
        $totalCosOfRawAluminium = $costOfRawAluminium * $rawQuantity;
        $totalCosOfRawMaterial = $totalCosOfRawAluminium + $totalCostOfPowderCoating;
        $side = ($product->inner_side == 1 && $product->outer_side == 1) ? config("common.side.inner_outer") :
            (($product->inner_side == 1) ? config("common.side.inner") :
                (($product->outer_side == 1) ? config("common.side.outer") : ""));



        $afterCalculate = [
            "product_item_id" => $credentials['product_item_id'] ? intval($credentials['product_item_id']) : 0,
            "product_item_template_id" => isset($product_item_template_id) ? intval($product_item_template_id) : 0,
            "product_template_material_id" => intval($product->id),
            "product_template_id" => intval($product->product_template_id),
            "used_scrap_id" => isset($used_scrap_id) ? intval($used_scrap_id) : 0,
            "material_id" => intval($product->material_id),
            "item" => $product->item,
            "category" => $product->category,
            "side" => $side,
            "code" => $product->code,
            "weight" => floatval($product->weight),
            "type" => intval(config('quotation.product_item_type.aluminium')),
            "order_number" => '',
            "actual_material_needed" => [
                "width" => floatval($credentials['width'] / 1000),
                "width_quantity" => intval($widthQuantityDefault),
                "height" => floatval($credentials['height'] / 1000),
                "height_quantity" => intval($heightQuantityDefault),
                "total_perimeter" => floatval($totalPerimeter),
                "total_weight" => floatval($product->weight * $totalPerimeter)
            ],
            "raw_material_needed" => [
                "raw_length" => floatval($product->raw_length),
                "raw_quantity" => intval($rawQuantity),
                "raw_girth" => floatval($product->raw_girth),
                "coating_price_status" => intval($product->coating_price_status),
                "total_raw_perimeter" => floatval($product->raw_length * $rawQuantity),
                "total_raw_weight" => floatval($totalRawPerimeter * $product->weight),
                "cost_of_raw_aluminium" => floatval($costOfRawAluminium),
                "total_cost_of_raw_aluminium" => floatval($totalCosOfRawAluminium),
                "cost_of_powder_coating" => floatval($costOfPowderCoating),
                "total_cost_of_powder_coating" => floatval($totalCostOfPowderCoating),
                "total_cost_of_raw_material" => round(floatval($totalCosOfRawMaterial), 2)
            ],
            "scrap_used" => [
                "scrap_length" => !empty($usedScrap->scrap_length) ? floatval($usedScrap->scrap_length) : null,
                "scrap_weight" => !empty($usedScrap->scrap_weight) ? floatval($usedScrap->scrap_weight) : null,
                "cost_of_scrap" =>!empty($usedScrap->cost_of_scrap) ?  floatval($usedScrap->cost_of_scrap) : null,
                "scrap_from" => !empty($usedScrap->product_code) ?  floatval($usedScrap->product_code) : null,
            ],
            "scrap" => isset($scrap) ? $scrap : null
        ];

        $scraps = [
            "quotation_id" => intval($credentials['quotation_id']),
            "product_item_id" => intval($credentials['product_item_id']),
            "product_template_material_id" => intval($product->id),
            "material_id" => intval($product->material_id),
            "scrap_length" => round(abs($product->raw_length * $rawQuantity - $totalPerimeter), 2),
            "scrap_weight" => round(abs($totalRawPerimeter * $product->weight - $product->weight * $totalPerimeter), 2),
            "cost_of_scrap" => floatval($costOfScrap),
            "total_cost_of_scrap" => round(abs(($totalRawPerimeter * $product->weight - $product->weight * $totalPerimeter) * $costOfScrap), 2),
        ];

        return [
            'afterCalculate' => $afterCalculate,
            'totalCosOfRawMaterial' => round(floatval($totalCosOfRawMaterial), 2),
            'scraps' => $scraps
        ];
    }

    public function calculateTypeOther($credentials, $product)
    {
        $informationCommon = [
            "product_item_id" => $credentials ? intval($credentials['product_item_id']) : 0,
            "product_template_id" => intval($product->product_template_id),
            "product_template_material_id" => intval($product->id),
            "category" => $product->category,
            "material_id" => intval($product->material_id),
            "item" => $product->item,
            "code" => $product->code,
            "type" => intval(config('quotation.product_item_type.other')),
            "order_number" => '',
            "quantity" =>  intval($product->quantity),
            "cost_of_item" => floatval($product->price),
            "cost_unit" => intval($product->price_unit),

        ];

        $updateMaterials = isset($product->all_product_item_templates) ? $product->all_product_item_templates : null;
        foreach ($updateMaterials as $updateMaterial) {
            if ($updateMaterial && $updateMaterial['product_template_material_id'] == $product->id && $updateMaterial['product_item_id'] == $product->product_item_id) {
                $product_item_template_id = $updateMaterial['id'];
                $informationCommon['quantity'] = isset($updateMaterial['quantity']) ? floatval($updateMaterial['quantity']) : $product->quantity;
                $informationCommon['cost_of_item'] = isset($updateMaterial['cost_of_item']) ? floatval($updateMaterial['cost_of_item']) : floatval($product->price);
            }
        }

        $informationCommon['product_item_template_id'] = isset($product_item_template_id) ? intval($product_item_template_id) : 0;

        if ($product->price_unit == config('quotation.material_price_unit.pc') || $product->price_unit == config('quotation.material_price_unit.panel')) {
            $informationCommon["total_cost_of_item"] =  $informationCommon['quantity'] *  $informationCommon['cost_of_item'];
            $totalCostOfItems =  $informationCommon['quantity'] *  $informationCommon['cost_of_item'];
        } elseif ($product->price_unit == config('quotation.material_price_unit.m2')) {
            $informationCommon["total_area"] = $credentials['width'] / 1000 * $credentials['height'] / 1000;
            $informationCommon["total_cost_of_item"] =  $informationCommon['cost_of_item'] * $credentials['width'] / 1000 * $credentials['height'] / 1000;
            $totalCostOfItems =  $informationCommon['cost_of_item'] * $credentials['width'] / 1000 * $credentials['height'] / 1000;
        } else {
            $quantityDefaultTypeMeter = 2;
            $totalPerimeterTypeMeter = $credentials['width'] / 1000 * $quantityDefaultTypeMeter + $credentials['height'] / 1000 * $quantityDefaultTypeMeter;
            $informationCommon["total_perimeter"] = $totalPerimeterTypeMeter;
            $informationCommon["total_cost_of_item"] = $informationCommon['cost_of_item'] * $totalPerimeterTypeMeter;
            $informationCommon["quantity"] = $quantityDefaultTypeMeter;
            $totalCostOfItems = $informationCommon['cost_of_item'] * $totalPerimeterTypeMeter;
        }
        $informationCommon["total_cost_of_item"] = round(floatval($informationCommon["total_cost_of_item"]), 2);
        $afterCalculate = $informationCommon;
        return [
            'afterCalculate' => $afterCalculate,
            'totalCostOfItems' => round(floatval($totalCostOfItems) , 2),
        ];
    }

    public function calculateMaterial($credentials, $material)
    {
        $informationCommon = [
            "material_id" => isset($material->id) ? intval($material->id) : null,
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
