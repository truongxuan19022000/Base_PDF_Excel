<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BillSchedule extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'bill_schedules';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'order_number',
        'invoice_id',
        'type_invoice_statement',
        'type_percentage',
        'amount',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}
