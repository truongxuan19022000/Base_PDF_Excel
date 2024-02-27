<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClaimProgress extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'claim_progress';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'quotation_section_id',
        'product_id',
        'other_fee_id',
        'claim_number',
        'claim_percent',
        'current_amount',
        'previous_amount',
        'accumulative_amount',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}
