<?php

namespace App\Repositories;

use App\Models\Product;

class ProductRepository
{
    public function create(array $request)
    {
        return Product::create($request);
    }

    public function update($productId, $data)
    {
        return Product::where('id', $productId)->update($data);
    }

    public function getProductDetail($productId)
    {
        return Product::with([
            'product_items' => function ($query) {
                $query->select(
                    'product_id',
                    'material_id',
                    'product_template_id',
                    'type',
                    'quantity',
                    'title',
                    'service_type',
                    'unit_price',
                );
                $query->orderBy('type', 'ASC');
                $query->orderBy('created_at', 'DESC');
            }
        ])
            ->where('id', $productId)
            ->first([
                'quotation_section_id',
                'product_code',
                'profile',
                'glass_type',
                'storey',
                'area',
                'width',
                'width_unit',
                'height',
                'height_unit',
                'quantity',
                'subtotal',
                'created_at'
            ]);
    }

    public function delete($productId)
    {
        return Product::where('id', $productId)->delete();
    }
}
