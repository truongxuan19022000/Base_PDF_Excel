<?php

namespace App\Imports;

use App\Models\Material;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\HasReferencesToOtherSheets;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportServiceMaterial implements ToModel, HasReferencesToOtherSheets, WithHeadingRow
{
    protected $rowIndex = 1;
    private $category_material = "Service";

    public function model(array $row)
    {
        try {
            $validator = Validator::make($row, [
                'service_type' => 'required',
                'item' => 'required',
                'price' => [
                    'required',
                    'regex:/^\$ \d+(\.\d{2})? \/ (pcs|m2|m|panel)$/'
                ],
            ]);

            if ($validator->fails()) {
                $errors['row'] = "Error in sheet {$this->category_material} at line {$this->rowIndex}";
                $error = implode(PHP_EOL, $validator->errors()->all());
                $errors['error'] = $error;
                throw new \Exception(implode(PHP_EOL, $errors));
            }

            $priceUnit = array_flip(config("common.material_price_unit"));
            $ServiceType = array_flip(config("common.service_type"));
            $row_price = explode(" / ", $row['price']);
            $price = isset($row_price[0]) ? explode(" ", $row_price[0])[1] : null;
            $price_unit = isset($row_price[1]) ? explode(" ", $row_price[1]) : null;
            $data = [
                'category' => config("common.material_category.services"),
                'service_type' => $ServiceType[$row['service_type']],
                'item' => $row['item'],
                'price' => floatval(str_replace(',', '', $price)),
                'price_unit' => $priceUnit[$price_unit[0]],
            ];
            $this->rowIndex++;
            return new Material($data);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            Log::error('CLASS "ImportServiceMaterial" FUNCTION "upload" ERROR: ' . $e->getMessage());
        }
    }

}
