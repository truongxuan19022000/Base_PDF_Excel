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

    public function getActivitiesByCustomerId($customerId, $per_page, $paginate = true)
    {
        $actionArray = [Activity::ACTION_CREATED, Activity::ACTION_DELETED];

        $sql = Activity::where('customer_id', $customerId)->where(function ($query) use ($actionArray) {
            $query->whereHas('quotation', function ($q) use ($actionArray) {
                $q->where('type', Activity::TYPE_QUOTATION);
                $q->whereIn('action_type', $actionArray);
            });
            $query->orWhereHas('invoice', function ($q) use ($actionArray) {
                $q->where('type', Activity::TYPE_INVOICE);
                $q->whereIn('action_type', $actionArray);
            });
            $query->orWhereHas('document', function ($q) use ($actionArray) {
                $q->where('type', Activity::TYPE_DOCUMENT);
                $q->whereIn('action_type', $actionArray);
            });
            $query->orWhereHas('claim', function ($q) use ($actionArray) {
                $q->where('type', Activity::TYPE_CLAIM);
                $q->whereIn('action_type', $actionArray);
            });
        })->with([
            'quotation:id,reference_no',
            'invoice:id,invoice_no',
            'document:id,document_name',
            'claim:id,claim_no',
            'user:id,role_id,name,username',
            'user.role:id,role_name',
        ])->orderBy('created_at', 'DESC');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate($per_page);
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

    public function getActivities($conditions)
    {
        $sql = Activity::join('users', 'users.id', 'activities.user_id')
            ->join('roles', 'roles.id', 'users.role_id')
            ->select([
                'activities.id',
                'activities.material_id',
                'activities.invoice_id',
                'activities.claim_id',
                'activities.scrap_id',
                'activities.type',
                'activities.action_type',
                'activities.message',
                'users.id as user_id',
                'users.name',
                'users.username',
                'roles.role_name',
                'roles.id as role_id',
                'activities.created_at'
            ])->orderBy('activities.created_at', 'DESC');
        if (!empty($conditions['invoice_id'])) {
            $sql->where('activities.type', Activity::TYPE_INVOICE)
                ->where('activities.invoice_id', $conditions['invoice_id']);
        }
        if (!empty($conditions['material_id'])) {
            $sql->where('activities.type', Activity::TYPE_MATERIALS)
                ->where('activities.material_id', $conditions['material_id']);
        }
        if (!empty($conditions['scrap_id'])) {
            $sql->where('activities.type', Activity::TYPE_SCRAP)
                ->where('activities.scrap_id', $conditions['scrap_id']);
        }
        if (!empty($conditions['claim_id'])) {
            $sql->where('activities.type', Activity::TYPE_CLAIM)
                ->where('activities.claim_id', $conditions['claim_id']);
        }
        if (!empty($conditions['vendor_id'])) {
            $sql->where('activities.type', Activity::TYPE_VENDOR)
                ->where('activities.vendor_id', $conditions['vendor_id']);
        }
        if (!empty($conditions['purchase_order_id'])) {
            $sql->where('activities.type', Activity::TYPE_PURCHASE)
                ->where('activities.purchase_order_id', $conditions['purchase_order_id']);
        }
        return $sql->get();
    }
}
