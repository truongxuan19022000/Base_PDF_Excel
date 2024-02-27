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
                    'id',
                    'product_id',
                    'material_id',
                    'product_template_id',
                    'type',
                    'quantity',
                    'title',
                    'service_type',
                    'unit_price',
                    'subtotal',
                );
                $query->orderBy('type', 'ASC');
                $query->orderBy('created_at', 'DESC');
            }
        ])
            ->select([
                'products.id as productId',
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
            ])->where('id', $productId)
            ->first();
    }

    public function getProductItemByProduct($productId)
    {
        return Product::with([
            'product_items' => function ($query) {
                $query->select(
                    'id',
                    'product_id',
                    'material_id',
                    'product_template_id',
                    'type',
                    'quantity',
                    'title',
                    'service_type',
                    'unit_price',
                    'subtotal',
                );
                $query->orderBy('type', 'ASC');
                $query->orderBy('created_at', 'DESC');
                $query->with([
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
                ]);
            }
        ])->select([
            'products.id as productId',
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
        ])->where('id', $productId)
            ->first();
    }

    public function delete($productId)
    {
        return Product::where('id', $productId)->delete();
    }
}
