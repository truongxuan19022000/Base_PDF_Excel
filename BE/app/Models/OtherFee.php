<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OtherFee extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'other_fees';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'order_number',
        'claim_order_number',
        'quotation_id',
        'description',
        'amount',
        'type',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'id' => 'integer',
        'order_number' => 'integer',
        'claim_order_number' => 'integer',
        'quotation_id' => 'integer',
        'type' => 'integer',
    ];

    public function quotation() {
        return $this->belongsTo(Quotation::class,'quotation_id', 'id');
    }

}
