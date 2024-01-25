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

    public function getScraps($searchParams, $paginate = true)
    {
        $sql = Scrap::join('quotation_sections', 'quotation_sections.id', 'scraps.quotation_section_id')
            ->join('products', 'products.id', 'scraps.product_id')
            ->join('materials', 'materials.id', 'scraps.material_id')
            ->select([
                'scraps.id as scrap_id',
                'quotation_sections.id as quotation_section_id',
                'products.id as product_id',
                'products.product_code',
                'materials.id as material_id',
                'materials.item',
                'scrap_length',
                'cost_of_scrap',
                'scraps.created_at',
            ])->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('products.product_code', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('materials.item', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['material_id'])) {
            $sql->where('materials.id', $searchParams['material_id']);
        }

        if (isset($searchParams['quotation_section_id'])) {
            $sql->where('quotation_sections.id', $searchParams['quotation_section_id']);
        }

        if (isset($searchParams['quotation_section_id'])) {
            $sql->where('quotation_sections.id', $searchParams['quotation_section_id']);
        }

        $sql->orderBy('scraps.created_at', 'DESC');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function countAllScraps()
    {
        return Scrap::count();
    }

    public function getScrapDetail($scrapId)
    {
        $sql = Scrap::join('quotation_sections', 'quotation_sections.id', 'scraps.quotation_section_id')
            ->join('products', 'products.id', 'scraps.product_id')
            ->join('materials', 'materials.id', 'scraps.material_id')
            ->select([
                'scraps.id as scrap_id',
                'quotation_sections.id as quotation_section_id',
                'products.product_code',
                'materials.item',
                'scrap_length',
                'cost_of_scrap',
                'scraps.created_at',
            ]);
        return $sql->where('id', $scrapId)->first();
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
        return Scrap::where('quotation_section_id', $scrap['quotation_section_id'])
            ->where('product_id', $scrap['product_id'])
            ->where('material_id', $scrap['material_id'])
            ->update($updateData);
    }

    public function checkExsit($quotationSectionId, $productId, $materialId)
    {
        return Scrap::where('quotation_section_id', $quotationSectionId)
            ->where('product_id', $productId)
            ->where('material_id', $materialId)
            ->count();
    }
}
