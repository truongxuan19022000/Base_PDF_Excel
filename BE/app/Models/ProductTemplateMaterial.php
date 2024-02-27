<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductTemplateMaterial extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'product_template_materials';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'material_id',
        'product_template_id',
        'quantity',
        'type',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function materials()
    {
        return $this->belongsTo(Material::class, 'material_id', 'id');
    }

    public function product_item_templates()
    {
        return $this->hasOne(ProductItemTemplate::class, 'product_template_material_id', 'id');
    }

    public function all_product_item_templates()
    {
        return $this->hasMany(ProductItemTemplate::class, 'product_template_material_id', 'id');
    }

    protected $casts = [
        'id' => 'integer',
        'material_id' => 'integer',
        'product_template_id' => 'integer',
        'type' => 'integer',
    ];
}
