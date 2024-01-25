<?php

namespace App\Repositories;
use App\Models\Inventory;

class InventoryRepository
{
    public function create(array $request)
    {
        return Inventory::create($request);
    }

    public function getInventories($searchParams, $paginate = true)
    {
        $sql = Inventory::select([
                'id',
                'category',
                'item',
                'sku_code',
                'type',
                'thickness',
                'price'
            ])->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('category', 'LIKE', '%'. $searchParams['search'] .'%')
                        ->orWhere('item', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('sku_code', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['inventory_id']) && is_array($searchParams['inventory_id'])) {
            $sql->whereIn('inventories.id', $searchParams['inventory_id']);
        }

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function countAllInventories()
    {
        return Inventory::count();
    }

    public function delete($inventoryId)
    {
        return Inventory::where('id', $inventoryId)->delete();
    }

    public function getInventoryDetail($inventoryId)
    {
        return Inventory::select([
                'id',
                'category',
                'item',
                'sku_code',
                'type',
                'thickness',
                'price'
            ])->where('id', $inventoryId)->first();
    }

    public function update($inventoryId, $updateData)
    {
        return Inventory::where('id', $inventoryId)->update($updateData);
    }

    public function multiDeleteInventory($inventoryId)
    {
        return Inventory::whereIn('id', $inventoryId)->delete();
    }
}
