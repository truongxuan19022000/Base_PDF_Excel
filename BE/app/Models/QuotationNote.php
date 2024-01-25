<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class QuotationNote extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'quotation_notes';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'quotation_id',
        'description',
        'type',
        'order',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'id' => 'integer',
        'quotation_id' => 'integer',
        'type' => 'integer',
        'order' => 'integer',
    ];
}
