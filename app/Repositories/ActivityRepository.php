<?php

namespace App\Repositories;
use App\Models\Activity;
use App\Models\QuotationNote;

class ActivityRepository
{
    public function create(array $request)
    {
        return Activity::create($request);
    }

    public function getActivitiesByCustomerId($customerId)
    {
        return Activity::with([
            'quotation:id,reference_no',
            'invoice:id,invoice_no',
            'document:id,document_name',
            'user:id,role_id,name,username',
            'user.role:id,role_name',
            ])->where('customer_id', $customerId)
            ->orderBy('created_at', 'DESC')
            ->get();
    }

    public function getActivitiesByQuotationId($quotationId)
    {
        return Activity::join('users', 'users.id', 'activities.user_id')
            ->join('roles', 'roles.id', 'users.role_id')
            ->select([
                'activities.id',
                'activities.type',
                'activities.action_type',
                'users.id as user_id',
                'users.name',
                'users.username',
                'roles.role_name',
                'roles.id as role_id',
                'activities.created_at'
            ])
            ->where('activities.type', Activity::TYPE_QUOTATION)
            ->where('quotation_id', $quotationId)
            ->orderBy('activities.created_at', 'DESC')
            ->get();
    }
    public function getActivitiesByQuotationAndNote($quotationId)
    {
        return Activity::join('quotation_notes', 'quotation_notes.id', 'activities.quotation_note_id')
            ->join('quotations', 'quotations.id', 'activities.quotation_id')
            ->join('users', 'users.id', 'activities.user_id')
            ->join('roles', 'roles.id', 'users.role_id')
            ->select([
                'activities.id',
                'activities.type',
                'activities.action_type',
                'users.id as user_id',
                'users.name',
                'users.username',
                'roles.role_name',
                'roles.id as role_id',
                'activities.created_at'
            ])
            ->where('activities.type', Activity::TYPE_QUOTATION_NOTES)
            ->where('quotations.id', $quotationId)
            ->orderBy('activities.created_at', 'DESC')
            ->get();
    }
    public function getActivitiesByInvoiceId($invoiceId)
    {
        return Activity::join('users', 'users.id', 'activities.user_id')
            ->join('roles', 'roles.id', 'users.role_id')
            ->select([
                'activities.id',
                'activities.invoice_id',
                'activities.type',
                'activities.action_type',
                'users.id as user_id',
                'users.name',
                'users.username',
                'roles.role_name',
                'roles.id as role_id',
                'activities.created_at'
            ])
            ->where('activities.type', Activity::TYPE_INVOICE)
            ->where('activities.invoice_id', $invoiceId)
            ->orderBy('activities.created_at', 'DESC')
            ->get();
    }

    public function getActivitiesByMaterial($materialId)
    {
        return Activity::join('users', 'users.id', 'activities.user_id')
            ->join('roles', 'roles.id', 'users.role_id')
            ->select([
                'activities.id',
                'activities.material_id',
                'activities.type',
                'activities.action_type',
                'activities.message',
                'users.id as user_id',
                'users.name',
                'users.username',
                'roles.role_name',
                'roles.id as role_id',
                'activities.created_at'
            ])
            ->where('activities.type', Activity::TYPE_MATERIALS)
            ->where('activities.material_id', $materialId)
            ->orderBy('activities.created_at', 'DESC')
            ->get();
    }
}
