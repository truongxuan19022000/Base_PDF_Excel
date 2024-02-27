<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductItemTemplate extends Model
{
    use HasFactory;

    protected $table = 'product_item_templates';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'product_template_material_id',
        'product_item_id',
        'used_scrap_id',
        'width_quantity',
        'height_quantity',
        'cost_of_raw_aluminium',
        'cost_of_powder_coating',
        'cost_of_scrap',
        'quantity',
        'raw_quantity',
        'cost_of_item',
        'delete_status',
        'created_at',
        'updated_at',
    ];

    public function materials()
    {
        return $this->belongsTo(Material::class, 'material_id', 'id');
    }

}
