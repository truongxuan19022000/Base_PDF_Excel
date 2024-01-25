<?php

namespace App\Repositories;

use App\Models\ProductTemplate;

class ProductTemplateRepository
{
    public function create(array $request)
    {
        return ProductTemplate::create($request);
    }

    public function getProductTemplates($searchParams, $per_page, $paginate = true)
    {
        $sql = ProductTemplate::select([
            'id',
            'item',
            'profile',
            'created_at',
        ])->where(function ($query) use ($searchParams) {
            if (isset($searchParams['search'])) {
                $query->where('item', 'LIKE', '%' . $searchParams['search'] . '%');
            }
        });

        if (isset($searchParams['product_template_id']) && is_array($searchParams['product_template_id'])) {
            $sql->whereIn('product_templates.id', $searchParams['product_template_id']);
        }

        if (isset($searchParams['profile']) && is_array($searchParams['profile'])) {
            $sql->whereIn('product_templates.profile', $searchParams['profile']);
        }

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->orderBy('created_at', 'desc')->paginate($per_page);
    }

    public function getProductTemplatesForQuotations($searchParams, $per_page, $paginate = true)
    {
        $sql = ProductTemplate::select([
            'id',
            'item',
            'profile',
            'created_at',
        ])->where(function ($query) use ($searchParams) {
            if (isset($searchParams['search'])) {
                $query->where('item', 'LIKE', '%' . $searchParams['search'] . '%');
            }
        });

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->orderBy('created_at','desc')->paginate($per_page);
    }

    public function getProductTemplateDetail($productTemplateId)
    {
        return ProductTemplate::select([
            'product_templates.id',
            'item',
            'profile',
            'product_templates.created_at',
        ])->with(['productTemplateMaterial' => function ($query) {
            $query->join('materials', 'materials.id', 'product_template_materials.material_id');
            $query->select([
                'product_template_id',
                'materials.id as material_id',
                'category',
                'profile',
                'item',
                'code',
                'quantity',
                'door_window_type',
                'service_type',
                'inner_side',
                'outer_side',
                'weight',
                'raw_length',
                'min_size',
                'price',
                'price_unit',
                'coating_price'
            ])->orderBy('product_template_materials.created_at', 'desc');
        }])->where('product_templates.id', $productTemplateId)->first();
    }

    public function update($productTemplateId, $updateData)
    {
        return ProductTemplate::where('id', $productTemplateId)->update($updateData);
    }

    public function delete($productTemplateId)
    {
        return ProductTemplate::where('id', $productTemplateId)->delete();
    }

    public function multiDeleteProductTemplate($productTemplateIds)
    {
        return ProductTemplate::whereIn('id', $productTemplateIds)->delete();
    }
}
