<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Claim extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'claims';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'claim_no',
        'quotation_id',
        'issue_date',
        'payment_received_date',
        'deposit_amount',
        'tax',
        'is_copied',
        'copied_claim_id',
        'status',
        'accumulative_from_claim',
        'subtotal_from_claim',
        'actual_paid_amount',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'id' => 'integer',
        'claim_id' => 'integer',
        'is_copied' => 'integer',
        'quotation_id' => 'integer',
        'copied_claim_id' => 'integer',
        'tax' => 'integer',
        'status' => 'integer',
        'issue_date' => 'date:d/m/Y',
        'payment_received_date'   => 'date:d/m/Y',
    ];

    public function quotation()
    {
        return $this->hasOne(Quotation::class, 'id', 'quotation_id');
    }

    public function claim_copied()
    {
        return $this->belongsTo(Claim::class, 'copied_claim_id');
    }

    public function claim_progress()
    {
        return $this->hasManyThrough(ClaimProgress::class, ClaimLogs::class, 'claim_id', 'id', 'id', 'claim_progress_id');
    }
}
