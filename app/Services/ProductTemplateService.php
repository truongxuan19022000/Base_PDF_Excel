<?php

namespace App\Services;

use App\Repositories\ProductTemplateMaterialRepository;
use App\Repositories\ProductTemplateRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductTemplateService
{
    private $productTemplateMaterialRepository;
    private $productTemplateRepository;

    public function __construct(
        ProductTemplateRepository $productTemplateRepository,
        ProductTemplateMaterialRepository $productTemplateMaterialRepository
    )
    {
        $this->productTemplateRepository = $productTemplateRepository;
        $this->productTemplateMaterialRepository = $productTemplateMaterialRepository;
    }

    public function getProductTemplates($searchParams, $per_page)
    {
        $product_templates = $this->productTemplateRepository->getProductTemplates($searchParams, $per_page);
        $results = [
            'product_templates' => $product_templates,
        ];

        return $results;
    }

    public function getProductTemplatesForQuotations($searchParams, $per_page)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $product_templates = $this->productTemplateRepository->getProductTemplatesForQuotations($searchParams, $per_page, $paginate);
        $results = [
            'product_templates' => $product_templates,
        ];

        return $results;
    }

    public function getProductTemplateDetail($productTemplateId)
    {
        $product_templates = $this->productTemplateRepository->getProductTemplateDetail($productTemplateId);
        $results = [
            'product_templates' => $product_templates,
        ];

        return $results;
    }

    public function createProductTemplate($credentials, $products)
    {
        try {
            DB::beginTransaction();
            $data = [
                'item' => $credentials['item'],
                'profile' => $credentials['profile'],
                'created_at' => Carbon::now(),
                'updated_at' => null,
            ];
            $result = $this->productTemplateRepository->create($data);
            if (!empty($result)) {
                foreach ($products as $item) {
                    $item['product_template_id'] = $result->id;
                    $this->productTemplateMaterialRepository->create($item);
                }
            }
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ProductTemplateService" FUNCTION "createProductTemplate" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function updateProductTemplate($credentials)
    {
        try {
            DB::beginTransaction();
            $data = [
                'item' => $credentials['item'],
                'profile' => $credentials['profile'],
                'updated_at' => Carbon::now(),
            ];

            $productTemplate = $this->productTemplateRepository->update($credentials['product_template_id'], $data);
            //delete
            if (!empty($credentials['delete'])) {
                $this->productTemplateMaterialRepository->delete($credentials['delete'], $credentials['product_template_id']);
            }
            //create
            if (isset($credentials['create'])) {
                foreach ($credentials['create'] as $createData) {
                    $createData['product_template_id'] = $credentials['product_template_id'];
                    $this->productTemplateMaterialRepository->create($createData);
                }
            }
            //update
            if (isset($credentials['create'])) {
                foreach ($credentials['update'] as $updateData) {
                    $updateData['product_template_id'] = $credentials['product_template_id'];
                    $this->productTemplateMaterialRepository->update($updateData['material_id'], $credentials['product_template_id'], $updateData);
                }
            }

            $result = $this->productTemplateRepository->getProductTemplateDetail($credentials['product_template_id']);
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ProductTemplateService" FUNCTION "updateProductTemplate" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function delete($productTemplateId)
    {
        try {
            $result = $this->productTemplateRepository->delete($productTemplateId);
            if (!$result) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ProductTemplateService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiDeleteProductTemplate($productTemplateIds)
    {
        try {
            $result = $this->productTemplateRepository->multiDeleteProductTemplate($productTemplateIds);
            if (!$result) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ProductTemplateService" FUNCTION "multiDeleteProductTemplate" ERROR: ' . $e->getMessage());
        }

        return false;
    }
}
