<?php

namespace App\Imports;

use App\Models\Material;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\HasReferencesToOtherSheets;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportAluminiumEuroMaterial implements ToModel, HasReferencesToOtherSheets, WithHeadingRow
{
    protected $rowIndex = 1;
    private $category_material = "Aluminium EURO";

    public function model(array $row)
    {
        try {
            $rule = [
                'door_window_type' => ['required', Rule::in(array_values(config("common.door_window_type")))],
                'side' => 'nullable',
                'item' => 'required',
                'code' => 'nullable',
                'weight_kgm' => 'nullable',
                'raw_length_m' => 'nullable',
                'raw_girth_m' => 'nullable',
                'price' => [
                    'required',
                    'regex:/^\$ \d+(\.\d{2})? \/ (pcs|m2|m|panel)$/'
                ],
            ];
            if ($row['coating_price_m2']) {
                $rule['coating_price_m2'] = 'regex:/^\$ \d+(\.\d{2})? \/ (m2)$/';
            }
            $validator = Validator::make($row, $rule);
            if ($validator->fails()) {
                $errors['row'] = "Error in sheet {$this->category_material} at line {$this->rowIndex}";
                $error = implode(PHP_EOL, $validator->errors()->all());
                $errors['error'] = $error;
                throw new \Exception(implode(PHP_EOL, $errors));
            }

            $priceUnit = array_flip(config("common.material_price_unit"));
            $side = explode(" / ", $row['side']);
            $DoorWindowType = array_flip(config("common.door_window_type"));
            [$price, $price_unit] = explode(" / ", $row['price']);
            $price = explode(" ", $price)[1];
            $price = floatval(str_replace(',', '', $price ?? null));
            $price_unit = $priceUnit[$price_unit] ?? null;

            if ($row['coating_price_m2']) {
                $coating_price = explode(" ", explode(" / ", $row['coating_price_m2'])[0] ?? '')[1];
                $coating_price = floatval(str_replace(',', '', $coating_price ?? null));
                $coating_price_status = 1;
                $coating_price_unit = 1;
            }
            $data = [
                'category' => config("common.material_category.aluminium"),
                'profile' => config("common.profile.euro"),
                'door_window_type' => $DoorWindowType[$row['door_window_type']],
                'inner_side' => in_array('Inner', $side) ? Material::INNER_SIDE['CHECKED'] : Material::INNER_SIDE['UNCHECKED'],
                'outer_side' => in_array('Outer', $side) ? Material::INNER_SIDE['CHECKED'] : Material::INNER_SIDE['UNCHECKED'],
                'item' => $row['item'],
                'code' => $row['item'],
                'weight' => $row['weight_kgm'],
                'raw_length' => $row['raw_length_m'] ?? 0,
                'raw_girth' => $row['raw_girth_m'] ?? 0,
                'price' => $price,
                'price_unit' => $price_unit,
                'coating_price_status' => $coating_price_status ?? 2,
                'coating_price' => $coating_price ?? 0,
                'coating_price_unit' => $coating_price_unit ?? null,
            ];

            $this->rowIndex++;
            return new Material($data);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            Log::error('CLASS "ImportAluminiumEuroMaterial" FUNCTION "upload" ERROR: ' . $e->getMessage());
        }
    }

}
