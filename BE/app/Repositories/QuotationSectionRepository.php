<?php

namespace App\Repositories;

use App\Models\QuotationSection;

class QuotationSectionRepository
{
    public function create(array $request)
    {
        return QuotationSection::create($request);
    }

    public function update($quotationSectionId, $updateData)
    {
        return QuotationSection::where('id', $quotationSectionId)->update($updateData);
    }

    public function getQuotationSections($quotationSectionId)
    {
        return QuotationSection::with([
            'products' => function ($query) {
                $query->select(
                    'products.id as productId',
                    'quotation_section_id',
                    'order_number',
                    'product_code',
                    'profile',
                    'glass_type',
                    'storey',
                    'storey_text',
                    'area',
                    'area_text',
                    'width',
                    'width_unit',
                    'height',
                    'height_unit',
                    'quantity',
                    'subtotal',
                );
                $query->orderBy('products.order_number', 'ASC');
                $query->with([
                    'product_items' => function ($qr) {
                        $qr->select(
                            'id',
                            'product_id',
                            'material_id',
                            'product_template_id',
                            'no_of_panels',
                            'order_number',
                            'type',
                            'quantity',
                            'title',
                            'service_type',
                            'unit_price',
                        );
                        $qr->orderBy('product_items.order_number', 'ASC');
                        $qr->with([
                            'materials' => function ($qr) {
                                $qr->select(
                                    'id',
                                    'item',
                                    'code',
                                    'category',
                                    'profile',
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
                                );
                            },
                            'product_template' => function ($qr) {
                                $qr->select(
                                    'id',
                                    'item',
                                    'profile',
                                );
                                $qr->with(['productTemplateMaterial' => function ($qr) {
//                                    $qr->where(function ($sq) {
//                                        $sq->whereDoesntHave('product_item_templates')
//                                            ->orwhereHas('product_item_templates', function ($q) {
//                                                $q->where('product_item_templates.delete_status', 0);
//                                            });
//                                    });
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
                                    $qr->with('all_product_item_templates');
                                }]);
                            }
                        ]);
                    }
                ]);
            }
        ])
            ->where('quotation_id', $quotationSectionId)
            ->orderBy('order_number', 'ASC')
            ->get(['id', 'quotation_id', 'order_number', 'section_name']);
    }

    public function delete($quotationSectionId)
    {
        return QuotationSection::where('id', $quotationSectionId)->delete();
    }
}
