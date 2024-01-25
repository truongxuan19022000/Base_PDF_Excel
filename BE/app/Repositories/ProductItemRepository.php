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
}
