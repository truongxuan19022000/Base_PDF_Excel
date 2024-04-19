<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;
    const PENDING_STATUS = 1;
    const PAID_STATUS = 2;

    protected $table = 'invoices';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'invoice_no',
        'quotation_id',
        'issue_date',
        'tax',
        'total_amount',
        'payment_received_date',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'id' => 'integer',
        'quotation_id' => 'integer',
        'status' => 'integer',
        'tax' => 'integer',
        'issue_date' => 'date:d/m/Y',
        'payment_received_date'   => 'date:d/m/Y',
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
