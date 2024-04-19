<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrderItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'purchase_order_items';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'order_number',
        'purchase_order_id',
        'item_code',
        'item_description',
        'quantity',
        'unit_price',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'order_number' => 'integer',
        'purchase_order_id' => 'integer',
    ];
}
