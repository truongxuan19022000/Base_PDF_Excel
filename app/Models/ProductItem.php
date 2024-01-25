<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'product_items';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'product_id',
        'material_id',
        'product_template_id',
        'no_of_panels',
        'order_number',
        'type',
        'quantity',
        'title',
        'service_type',
        'unit_price',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function getQuantityAttribute($quantity)
    {
        return $quantity * 1;
    }

    public function materials()
    {
        return $this->belongsTo(Material::class, 'material_id', 'id');
    }

    public function product_template()
    {
        return $this->belongsTo(ProductTemplate::class, 'product_template_id', 'id');
    }

    protected $casts = [
        'product_id' => 'integer',
        'material_id' => 'integer',
        'product_template_id' => 'integer',
        'order_number' => 'integer',
        'type' => 'integer',
    ];
}
