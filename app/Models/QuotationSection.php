<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class QuotationSection extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'quotation_sections';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'quotation_id',
        'order_number',
        'section_name',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $hidden = [];

    public function products()
    {
        return $this->hasMany(Product::class, 'quotation_section_id', 'id');
    }

    protected $casts = [
        'id' => 'integer',
        'quotation_id' => 'integer',
        'order_number' => 'integer',
    ];
}
