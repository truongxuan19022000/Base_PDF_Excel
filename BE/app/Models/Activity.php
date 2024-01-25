<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    const TYPE_CUSTOMER   = 1;
    const TYPE_QUOTATION  = 2;
    const TYPE_INVOICE    = 3;
    const TYPE_DOCUMENT   = 4;
    const TYPE_QUOTATION_NOTES = 5;
    const TYPE_QUOTATION_SECTIONS = 6;
    const TYPE_MATERIALS = 7;
    const TYPE_OTHER_FEES = 8;
    const ACTION_CREATED  = 1;
    const ACTION_UPDATED  = 2;
    const ACTION_UPLOADED = 3;
    const ACTION_DELETED  = 4;

    protected $table = 'activities';

    protected $primaryKey = 'id';

    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'id',
        'customer_id',
        'quotation_id',
        'quotation_note_id',
        'invoice_id',
        'document_id',
        'material_id',
        'other_fee_id',
        'type',
        'user_id',
        'action_type',
        'message',
        'created_at'
    ];

    protected $hidden = [];

    public function customer() {
        return $this->belongsTo(Customer::class, 'customer_id', 'id')->withTrashed();
    }

    public function quotation() {
        return $this->belongsTo(Quotation::class, 'quotation_id', 'id')->withTrashed();
    }

    public function invoice() {
        return $this->belongsTo(Invoice::class, 'invoice_id', 'id')->withTrashed();
    }

    public function document() {
        return $this->belongsTo(Document::class, 'document_id', 'id')->withTrashed();
    }

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'id')->withTrashed();
    }
}
