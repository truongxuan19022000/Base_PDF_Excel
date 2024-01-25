<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'inventories';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'category',
        'item',
        'sku_code',
        'type',
        'thickness',
        'price',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $hidden = [];
}
