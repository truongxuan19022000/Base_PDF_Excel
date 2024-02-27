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
        'total_from_claim',
        'is_copied',
        'previous_claim_no',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'issue_date' => 'date:d/m/Y',
        'payment_received_date'   => 'date:d/m/Y',
    ];

    public function quotation()
    {
        return $this->hasOne(Quotation::class, 'id', 'quotation_id');
    }
}
