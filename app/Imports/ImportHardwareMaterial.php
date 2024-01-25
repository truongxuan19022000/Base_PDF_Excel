<?php

namespace App\Imports;

use App\Models\Material;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\HasReferencesToOtherSheets;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportHardwareMaterial implements ToModel, HasReferencesToOtherSheets, WithHeadingRow
{
    protected $rowIndex = 1;

    public function model(array $row)
    {
        $validator = Validator::make($row, [
            'item' => 'required',
            'code' => 'nullable',
            'price' => 'required',
        ]);

        if ($validator->fails()) {
            $errors['row'] = "Error in row {$this->rowIndex}";
            $error = implode(PHP_EOL, $validator->errors()->all());
            $errors['error'] = $error;
            throw new \Exception(implode(PHP_EOL, $errors));
        }

        $priceUnit = array_flip(config("common.material_price_unit"));
        $row_price = explode(" / ", $row['price']);
        $price = isset($row_price[0]) ? explode(" ", $row_price[0])[1] : null;
        $price_unit = isset($row_price[1]) ? explode(" ", $row_price[1]) : null;
        $data = [
            'category' => config("common.material_category.aluminium"),
            'item' => $row['item'],
            'code' => $row['item'],
            'price' => floatval(str_replace(',', '', $price)),
            'price_unit' => $priceUnit[$price_unit[0]],
        ];
        $this->rowIndex++;
        return new Material($data);
    }
}
