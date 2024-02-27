<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Material extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'materials';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'item',
        'code',
        'category',
        'profile',
        'door_window_type',
        'service_type',
        'inner_side',
        'outer_side',
        'weight',
        'raw_length',
        'raw_girth',
        'min_size',
        'price',
        'price_unit',
        'coating_price_status',
        'coating_price',
        'coating_price_unit',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $hidden = [];

    protected $casts = [
        'id' => 'integer',
    ];

    public function product_item() {
        return $this->hasMany(ProductItem::class, 'material_id', 'id');
    }

    public function product_template_material() {
        return $this->hasMany(ProductTemplateMaterial::class, 'material_id', 'id');
    }
}
