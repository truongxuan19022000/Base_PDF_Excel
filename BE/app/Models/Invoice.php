<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'invoices';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'invoice_no',
        'quotation_id',
        'issue_date',
        'total_amount',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $hidden = [];

    public function quotation()
    {
        return $this->belongsTo(Quotation::class, 'quotation_id', 'id');
    }

    public function bill_schedules()
    {
        return $this->hasMany(BillSchedule::class, 'invoice_id', 'id');
    }
}
