<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quotation extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'quotations';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'customer_id',
        'reference_no',
        'status',
        'price',
        'issue_date',
        'valid_till',
        'description',
        'terms_of_payment_confirmation',
        'terms_of_payment_balance',
        'terms_of_payment_balance',
        'discount_amount',
        'discount_type',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'issue_date' => 'date:d/m/Y',
        'valid_till'   => 'date:d/m/Y',
        'id' => 'integer',
        'customer_id' => 'integer',
        'status' => 'integer',
        'terms_of_payment_confirmation' => 'integer',
        'terms_of_payment_balance' => 'integer',
    ];

    public function customer()
    {
        return $this->hasOne(Customer::class, 'id', 'customer_id');
    }

    public function quotation_sections()
    {
        return $this->hasMany(QuotationSection::class, 'quotation_id', 'id');
    }

    public function other_fees()
    {
        return $this->hasMany(OtherFee::class, 'quotation_id', 'id');
    }

    public function claims()
    {
        return $this->hasMany(Claim::class,'quotation_id', 'id');
    }

    public function invoices()
    {
        return $this->hasMany(Claim::class,'quotation_id', 'id');
    }
}
