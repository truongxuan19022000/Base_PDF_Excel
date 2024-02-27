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
            'profile',
            'created_at',
        ])->where(function ($query) use ($searchParams) {
            if (isset($searchParams['search'])) {
                $query->where('item', 'LIKE', '%' . $searchParams['search'] . '%');
            }
        })->withCount(['product_item as product_item_use']);

        if (isset($searchParams['product_template_id']) && is_array($searchParams['product_template_id'])) {
            $sql->whereIn('product_templates.id', $searchParams['product_template_id']);
        }

        if (isset($searchParams['profile']) && is_array($searchParams['profile'])) {
            $sql->whereIn('product_templates.profile', $searchParams['profile']);
        }
        $sql->where('create_type', 1);
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
        $sql->where('create_type', 1);
        $sql->orderBy('created_at', 'desc');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate($per_page);
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
                'product_template_materials.id',
                'product_template_id',
                'materials.id as material_id',
                'type',
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
            ])->where('product_template_materials.type', config('common.screen_type.product_template_screen'))
                ->orderBy('product_template_materials.created_at', 'desc');
        }])->where('product_templates.id', $productTemplateId)->first();
    }

    public function getProductTemplateForQuotation($productTemplateId, $productItemId) {
        return ProductTemplate::select([
            'product_templates.id',
            'item',
            'profile',
            'product_templates.created_at',
        ])->with(['productTemplateMaterial' => function ($qr)  use ($productItemId) {
            $qr->where(function ($sq) use ($productItemId) {
                $sq->whereDoesntHave('all_product_item_templates')
                    ->orwhereHas('all_product_item_templates', function ($q) use ($productItemId) {
                        $q->where('delete_status', 0);
                        $q->where('product_item_id', $productItemId);
                    });
            });
            $qr->join('materials', 'materials.id', 'product_template_materials.material_id');
            $qr->select([
                'product_template_materials.id',
                'product_template_id',
                'materials.id as material_id',
                'type',
                'category',
                'profile',
                'item',
                'code',
                'door_window_type',
                'service_type',
                'inner_side',
                'outer_side',
                'weight',
                'raw_length',
                'raw_girth',
                'min_size',
                'price',
                'price_unit',
                'coating_price_status',
                'coating_price',
                'coating_price_unit',
                'quantity',
            ]);
            $qr->with('product_item_templates');
            $qr->with([
                'all_product_item_templates' => function ($qr) use ($productItemId){
                    $qr->where('product_item_id', $productItemId);
                }
            ]);
        }])->where('product_templates.id', $productTemplateId)->where('create_type', 1)->first();
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
