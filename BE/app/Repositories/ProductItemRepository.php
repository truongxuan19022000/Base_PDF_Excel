<?php

namespace App\Repositories;

use App\Models\ProductItem;

class ProductItemRepository
{
    public function create(array $request)
    {
        return ProductItem::create($request);
    }

    public function update($productItemId, $updateData)
    {
        return ProductItem::where('id', $productItemId)->update($updateData);
    }

    public function delete($productItemId)
    {
        return ProductItem::where('id', $productItemId)->delete();
    }

    public function checkExistMaterial($materialId) {
        return ProductItem::where('material_id', $materialId)->exists();
    }

    public function checkExistProductTemplate($productTemplateId) {
        return ProductItem::where('product_template_id', $productTemplateId)->exists();
    }

    public function getProductItemDetail($productItemId)
    {
        return ProductItem::where('id', $productItemId)->first();
    }

    public function getProductTemplateByProductItem($productItemId)
    {
        return ProductItem::with([
            'product_template' => function ($qr) {
                $qr->select(
                    'id',
                    'item',
                    'profile',
                );
                $qr->with(['productTemplateMaterial' => function ($qr) {
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
                }]);
            }
        ])->where('product_items.id', $productItemId)->first();
    }
}
