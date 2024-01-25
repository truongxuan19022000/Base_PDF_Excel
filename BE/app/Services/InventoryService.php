<?php

namespace App\Services;

use App\Repositories\InventoryRepository;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class InventoryService
{
    private $inventoryRepository;

    public function __construct(InventoryRepository $inventoryRepository)
    {
        $this->inventoryRepository = $inventoryRepository;
    }

    public function getInventories($searchParams)
    {
        $inventories = $this->inventoryRepository->getInventories($searchParams);
        $numberRecord = $inventories->total();
        // $numberRecord = $this->inventoryRepository->countAllInventories();

        $results = [
            'number_record' => $numberRecord,
            'inventories' => $inventories
        ];

        return $results;
    }

    public function createInventory($credentials)
    {
        try {
            $inventory = [
                'category' => $credentials['category'],
                'item' => $credentials['item'],
                'sku_code' => $credentials['sku_code'],
                'type' => $credentials['type'],
                'thickness' => $credentials['thickness'],
                'price' => $credentials['price'],
                'created_at' => Carbon::now(),
                'updated_at' => null,
            ];
            $result = $this->inventoryRepository->create($inventory);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "InventoryService" FUNCTION "createInventory" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function delete($inventoryId)
    {
        try {
            $result = $this->inventoryRepository->delete($inventoryId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "InventoryService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function getInventoryDetail($inventoryId)
    {
        return $this->inventoryRepository->getInventoryDetail($inventoryId);
    }

    public function updateInventory($credentials)
    {
        try {
            $inventoryData = [
                'category' => $credentials['category'],
                'item' => $credentials['item'],
                'sku_code' => $credentials['sku_code'],
                'type' => $credentials['type'],
                'thickness' => $credentials['thickness'],
                'price' => $credentials['price'],
                'updated_at' => now(),
            ];
            $result = $this->inventoryRepository->update($credentials['inventory_id'], $inventoryData);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "InventoryService" FUNCTION "updateInventory" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function multiDeleteInventory($inventoryId)
    {
        try {
            $result = $this->inventoryRepository->multiDeleteInventory($inventoryId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "InventoryService" FUNCTION "multiDeleteInventory" ERROR: ' . $e->getMessage());
        }

        return false;
    }
}
