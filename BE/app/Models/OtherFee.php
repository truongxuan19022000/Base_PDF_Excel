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
        'quotation_id',
        'description',
        'amount',
        'type',
        'created_at',
        'updated_at',
    ];

    public function quotation() {
        return $this->belongsTo(Quotation::class,'quotation_id', 'id');
    }

    public function claim_progress() {
        return $this->hasMany(ClaimProgress::class, 'other_fee_id', 'id');
    }
}
