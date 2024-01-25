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
        'reference_no',
        'customer_id',
        'price',
        'issue_date',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'issue_date' => 'date:d/m/Y',
        'valid_till'   => 'date:d/m/Y',
    ];

    public function customer()
    {
        return $this->hasOne(Customer::class, 'id', 'customer_id');
    }
}
