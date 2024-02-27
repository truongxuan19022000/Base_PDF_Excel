<?php

namespace App\Repositories;

use App\Models\ProductItemTemplate;

class ProductItemTemplateRepository
{
    public function create(array $request)
    {
        return ProductItemTemplate::create($request);
    }

    public function update($id, $updateData) {
        return ProductItemTemplate::where('id', $id)->update($updateData);
    }

    public function delete($materialId, $productTemplateId)
    {
        return ProductItemTemplate::where('product_template_id', $productTemplateId)
            ->whereIn('material_id', $materialId)
            ->delete();
    }
}
