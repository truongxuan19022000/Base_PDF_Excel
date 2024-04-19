<?php

namespace App\Repositories;

use App\Models\Material;

class MaterialRepository
{
    public function create(array $request)
    {
        return Material::create($request);
    }

    public function getMaterials($searchParams, $paginate = true)
    {
        $sql = Material::select([
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
            'created_at',
        ])->where(function ($query) use ($searchParams) {
            if (isset($searchParams['search'])) {
                $query->where('category', 'LIKE', '%' . $searchParams['search'] . '%')
                    ->orWhere('profile', 'LIKE', '%' . $searchParams['search'] . '%')
                    ->orWhere('item', 'LIKE', '%' . $searchParams['search'] . '%')
                    ->orWhere('code', 'LIKE', '%' . $searchParams['search'] . '%')
                    ->orWhere('price', 'LIKE', '%' . $searchParams['search'] . '%');
            }
        })->withCount(['product_item as product_item_use'])
            ->withCount(['product_template_material as product_template_use']);

        if (isset($searchParams['material_id']) && is_array($searchParams['material_id'])) {
            $sql->whereIn('materials.id', $searchParams['material_id']);
        }

        if (isset($searchParams['category']) && is_array($searchParams['category'])) {
            $sql->whereIn('materials.category', $searchParams['category']);
        }

        if (isset($searchParams['profile']) && is_array($searchParams['profile'])) {
            $sql->whereIn('materials.profile', $searchParams['profile']);
        }

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->orderBy('created_at', 'DESC')->paginate(config('common.paginate'));
    }

    public function getMaterialsForQuotation($searchParams, $per_page, $paginate = true)
    {
        $sql = Material::select([
            'id',
            'category',
            'item',
            'code',
            'inner_side',
            'outer_side',
            'min_size',
            'service_type',
            'price',
            'price_unit',
        ])->where(function ($query) use ($searchParams) {
            if (isset($searchParams['search'])) {
                $query->where('item', 'LIKE', '%' . $searchParams['search'] . '%');
            }
            if (isset($searchParams['service_type'])) {
                $query->where('service_type', $searchParams['service_type']);
            }
        });

        if (isset($searchParams['category']) && is_array($searchParams['category'])) {
            $sql->whereIn('materials.category', $searchParams['category']);
        }
        $sql->orderBy('created_at', 'desc');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate($per_page);
    }

    public function countAllMaterials()
    {
        return Material::count();
    }

    public function delete($materialId)
    {
        return Material::where('id', $materialId)->delete();
    }

    public function findMaterialMultiDeleted($materialIds)
    {
        return Material::onlyTrashed()->whereIn('id', $materialIds)->get();
    }

    public function getMaterialDetail($materialId)
    {
        return Material::select([
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
        ])->where('id', $materialId)
            ->withCount(['product_item as product_item_use'])
            ->withCount(['product_template_material as product_template_use'])
            ->first();
    }

    public function update($materialId, $updateData)
    {
        return Material::where('id', $materialId)->update($updateData);
    }

    public function multiDeleteMaterial($materialIds)
    {
        return Material::whereIn('id', $materialIds)->delete();
    }

    public function getMaterialForCalculate($materialId)
    {
        return Material::select([
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
        ])->where('id', $materialId)->get();
    }
}
