<?php

namespace App\Imports;

use App\Models\Material;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\HasReferencesToOtherSheets;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportAluminiumLocalMaterial implements ToModel, HasReferencesToOtherSheets, WithHeadingRow
{
    protected $rowIndex = 1;

    public function model(array $row)
    {
        $validator = Validator::make($row, [
            'door_window_type' => ['required', Rule::in(array_values(config("common.door_window_type")))],
            'side' => 'nullable',
            'item' => 'required',
            'code' => 'nullable',
            'weight_kgm' => 'nullable',
            'raw_length_m' => 'nullable',
            'price' => 'required',
            'coating_price_m2' => 'required',
        ]);

        if ($validator->fails()) {
            $errors['row'] = "Error in row {$this->rowIndex}";
            $error = implode(PHP_EOL, $validator->errors()->all());
            $errors['error'] = $error;
            throw new \Exception(implode(PHP_EOL, $errors));
        }
        $side = explode(" / ", $row['side']);
        $DoorWindowType = array_flip(config("common.door_window_type"));
        [$price, $price_unit] = explode(" ", explode(" / ", $row['price'])[0] ?? '');
        [$coating_price] = explode(" ", explode(" / ", $row['coating_price_m2'])[0] ?? '');
        $price = floatval(str_replace(',', '', $price ?? null));
        $price_unit = $priceUnit[$price_unit[0]] ?? null;
        $coating_price = floatval(str_replace(',', '', $coating_price ?? null));

        $coating_price_status = isset($coating_price) ? 1 : '';
        $coating_price_unit = isset($coating_price) ? 1 : '';

        $data = [
            'category' => config("common.material_category.aluminium"),
            'profile' => config("common.profile.euro"),
            'door_window_type' => $DoorWindowType[$row['door_window_type']],
            'inner_side' => in_array('Inner', $side) ? 2 : "",
            'outer_side' => in_array('Outer', $side) ? 2 : "",
            'item' => $row['item'],
            'code' => $row['item'],
            'weight' => $row['weight_kgm'],
            'raw_length' =>  $row['raw_length_m'],
            'price' => $price,
            'price_unit' => $price_unit,
            'coating_price_status' => $coating_price_status,
            'coating_price' => $coating_price,
            'coating_price_unit' => $coating_price_unit,
        ];

        $this->rowIndex++;
        return new Material($data);
    }
}
