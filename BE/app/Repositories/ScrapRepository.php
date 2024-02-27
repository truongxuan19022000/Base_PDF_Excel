<?php

namespace App\Repositories;

use App\Models\Scrap;
use Illuminate\Support\Facades\DB;

class ScrapRepository
{
    public function create(array $request)
    {
        return Scrap::create($request);
    }

    public function getScraps($searchParams)
    {
        $sql = Scrap::join('quotations', 'quotations.id', 'scraps.quotation_id')
            ->join('product_items', 'product_items.id', 'scraps.product_item_id')
            ->join('products', 'products.id', 'product_items.product_id')
            ->join('product_template_materials', 'product_template_materials.id', 'scraps.product_template_material_id')
            ->join('materials', 'materials.id', 'product_template_materials.material_id')
            ->select([
                'scraps.id as scrap_id',
                'quotations.id as quotation_id',
                'product_items.id as product_item_id',
                'product_items.title',
                'products.id as product_id',
                'product_template_materials.id as product_template_material_id',
                'products.product_code',
                'materials.id as material_id',
                'materials.item',
                'scrap_length',
                'scrap_weight',
                'cost_of_scrap',
                'scraps.status',
                'scraps.created_at',
            ])->where('scraps.status', 1)
            ->where('quotation_id', $searchParams['quotation_id'])
            ->where('materials.id', $searchParams['material_id']);
        return $sql->orderBy('scraps.created_at', 'DESC')->get();
    }

    public function countAllScraps()
    {
        return Scrap::count();
    }

    public function getScrapDetail($scrapId)
    {
        $sql = Scrap::join('quotations', 'quotations.id', 'scraps.quotation_id')
            ->join('product_items', 'product_items.id', 'scraps.product_item_id')
            ->join('products', 'products.id', 'product_items.product_id')
            ->join('product_template_materials', 'product_template_materials.id', 'scraps.product_template_material_id')
            ->join('materials', 'materials.id', 'product_template_materials.material_id')
            ->select([
                'scraps.id as scrap_id',
                'quotations.id as quotation_id',
                'product_items.id as product_item_id',
                'products.id as product_id',
                'product_template_materials.id as product_template_material_id',
                'products.product_code',
                'materials.id as material_id',
                'materials.item',
                'scrap_length',
                'scrap_weight',
                'cost_of_scrap',
                'scraps.status',
                'scraps.created_at',
            ]);
        return $sql->where('scraps.id', $scrapId)->first();
    }

    public function deleteScrapByQuotation($quotationId, $productItemId, $productTemplateMaterialId)
    {
        return Scrap::where('quotation_id', $quotationId)
            ->where('product_item_id', $productItemId)
            ->where('product_template_material_id', $productTemplateMaterialId)
            ->where('status', 1)
            ->delete();
    }

    public function delete($scrapId)
    {
        return Scrap::where('id', $scrapId)->delete();
    }

    public function update($scrapId, $updateData)
    {
        return Scrap::where('id', $scrapId)->update($updateData);
    }

    public function updateByMulticolumn($scrap, $updateData)
    {
        return Scrap::where('quotation_id', $scrap['quotation_id'])
            ->where('product_item_id', $scrap['product_item_id'])
            ->where('product_template_material_id', $scrap['product_template_material_id'])
            ->update($updateData);
    }

    public function checkExist($quotationId, $productId, $productTemplateId)
    {
        return Scrap::where('quotation_id', $quotationId)
            ->where('product_item_id', $productId)
            ->where('product_template_material_id', $productTemplateId)
            ->count();
    }

    public function getScrapsByQuotationId($quotationId, $product_item_id, $product_template_material_id)
    {
        $sql = Scrap::join('quotations', 'quotations.id', 'scraps.quotation_id')
            ->join('product_items', 'product_items.id', 'scraps.product_item_id')
            ->join('products', 'products.id', 'product_items.product_id')
            ->join('product_template_materials', 'product_template_materials.id', 'scraps.product_template_material_id')
            ->join('materials', 'materials.id', 'product_template_materials.material_id')
            ->select([
                'scraps.id as scrap_id',
                'quotations.id as quotation_id',
                'product_items.id as product_item_id',
                'product_items.title',
                'products.id as product_id',
                'product_template_materials.id as product_template_material_id',
                'products.product_code',
                'materials.id as material_id',
                'materials.item',
                'scrap_length',
                'scrap_weight',
                'cost_of_scrap',
                'scraps.status',
                'scraps.created_at',
            ])->where('quotations.id', $quotationId)
            ->where('product_item_id', $product_item_id)
            ->where('product_template_material_id', $product_template_material_id);
        return $sql->first();
    }
}
