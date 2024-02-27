<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Scrap extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'scraps';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'quotation_id',
        'product_item_id',
        'product_template_material_id',
        'scrap_length',
        'scrap_weight',
        'cost_of_scrap',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'scrap_id' => 'integer',
        'product_item_id' => 'integer',
        'product_template_material_id' => 'integer',
        'status' => 'integer',

    ];
}
