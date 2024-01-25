<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Scrap extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'scraps';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'quotation_section_id',
        'product_id',
        'material_id',
        'scrap_length',
        'cost_of_scrap',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}
