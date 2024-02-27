<?php

namespace App\Repositories;

use App\Models\ProductTemplateMaterial;

class ProductTemplateMaterialRepository
{
    public function create(array $request)
    {
        return ProductTemplateMaterial::create($request);
    }

    public function update($materialId, $productTemplateId, $updateData)
    {
        return ProductTemplateMaterial::where('material_id', $materialId)
            ->where('product_template_id', $productTemplateId)
            ->update($updateData);
    }

    public function updateItem($id, $updateData) {
        return ProductTemplateMaterial::where('id', $id)->update($updateData);
    }

    public function delete($materialId, $productTemplateId)
    {
        return ProductTemplateMaterial::where('product_template_id', $productTemplateId)
            ->whereIn('material_id', $materialId)
            ->delete();
    }
}
