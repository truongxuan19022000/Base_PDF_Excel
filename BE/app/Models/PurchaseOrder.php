<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, SoftDeletes;
    const UNSENT = 1;
    const SENT = 2;

    protected $table = 'purchase_orders';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'vendor_id',
        'purchase_order_no',
        'issue_date',
        'status',
        'subtotal',
        'shipping_fee',
        'discount_type',
        'discount_amount',
        'tax',
        'total_amount',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'vendor_id' => 'integer',
        'status' => 'integer',
        'issue_date' => 'date:d/m/Y',
        'tax' => 'integer',
    ];

    public function purchase_order_items()
    {
        return $this->hasMany(PurchaseOrderItem::class, 'purchase_order_id', 'id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id', 'id');
    }
}
