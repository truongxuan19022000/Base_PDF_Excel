<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TermCondition extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'term_conditions';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'order_number',
        'quotation_id',
        'description',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'id' => 'integer',
        'quotation_id' => 'integer',
        'order_number' => 'integer',
    ];
}
