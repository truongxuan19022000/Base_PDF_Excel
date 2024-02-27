<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'products';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'quotation_section_id',
        'order_number',
        'product_code',
        'profile',
        'glass_type',
        'storey',
        'storey_text',
        'area',
        'area_text',
        'width',
        'width_unit',
        'height',
        'height_unit',
        'quantity',
        'subtotal',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function getQuantityAttribute($quantity)
    {
        return $quantity * 1;
    }

    public function product_items()
    {
        return $this->hasMany(ProductItem::class, 'product_id', 'productId');
    }

    public function claim_progress()
    {
        return $this->hasMany(ClaimProgress::class, 'product_id', 'id');
    }

    protected $casts = [
        'quotation_section_id' => 'integer'
    ];
}
