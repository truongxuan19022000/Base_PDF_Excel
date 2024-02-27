<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'product_templates';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'item',
        'profile',
        'create_type',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function productTemplateMaterial()
    {
        return $this->hasMany(ProductTemplateMaterial::class, 'product_template_id', 'id');
    }

    public function product_item() {
        return $this->hasMany(ProductItem::class, 'product_template_id', 'id');
    }

    protected $casts = [
        'id' => 'integer',
    ];
}
