<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\InvoiceRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class InvoiceService
{
    private $invoiceRepository;
    private $activityRepository;

    public function __construct(
        InvoiceRepository $invoiceRepository,
        ActivityRepository $activityRepository
    ){
        $this->invoiceRepository = $invoiceRepository;
        $this->activityRepository = $activityRepository;
    }

    public function getInvoices($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $invoices = $this->invoiceRepository->getInvoices($searchParams,$paginate);
        $results = [
            'invoices' => $invoices
        ];

        return $results;

    }

    public function getInvoiceDetail($invoiceId)
    {
        $conditions['status'] = config('quotation.status.unpaid');
        $invoice = $this->invoiceRepository->getInvoiceDetail($invoiceId, $conditions);
        $activities = $this->activityRepository->getActivitiesByInvoiceId($invoiceId);
        $results = [
            'invoice' => $invoice,
            'activities' => $activities
        ];

        return $results;
    }

    public function getInvoiceOverview($invoiceId)
    {
        $invoice = $this->invoiceRepository->getInvoiceOverview($invoiceId);

        $results = [
            'invoice' => $invoice
        ];

        return $results;
    }

    public function delete($invoiceId)
    {
        try {
            $result = $this->invoiceRepository->delete($invoiceId);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $invoice = $this->invoiceRepository->findInvoiceDeleted($invoiceId);
            $activity_logs = [
                'customer_id' => $invoice->customer_id,
                'invoice_id'  => $invoice->id,
                'type'        => Activity::TYPE_INVOICE,
                'user_id'     => $user->id,
                'action_type' => Activity::ACTION_DELETED,
                'created_at'  => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "InvoiceService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiDeleteInvoice($invoiceId)
    {
        try {
            $result = $this->invoiceRepository->multiDeleteInvoice($invoiceId);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $invoices = $this->invoiceRepository->findInvoiceMultiDeleted($invoiceId);
            foreach ($invoices as $invoice) {
                $activity_logs = [
                    'customer_id' => $invoice->customer_id,
                    'invoice_id'  => $invoice->id,
                    'type'        => Activity::TYPE_INVOICE,
                    'user_id'     => $user->id,
                    'action_type' => Activity::ACTION_DELETED,
                    'created_at'  => Carbon::now(),
                ];
                $this->activityRepository->create($activity_logs);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "InvoiceService" FUNCTION "multiDeleteInvoice" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function createInvoice($credentials)
    {
        try {
            $invoice = [
                'invoice_no'   => $credentials['invoice_no'],
                'quotation_id' => $credentials['quotation_id'],
                'created_at'   => Carbon::now(),
            ];
            $result = $this->invoiceRepository->create($invoice);

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'customer_id' => $credentials['customer_id'],
                'invoice_id'  => $result->id,
                'type'        => Activity::TYPE_INVOICE,
                'user_id'     => $user->id,
                'action_type' => Activity::ACTION_CREATED,
                'created_at'  => $invoice['created_at'],
            ];
            $this->activityRepository->create($activity_logs);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "InvoiceService" FUNCTION "createInvoice" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function updateInvoice($credentials)
    {
        try {
            $updateData = [
                'invoice_no'   => $credentials['invoice_no'],
                'quotation_id' => $credentials['quotation_id'],
                'updated_at'   => Carbon::now(),
            ];

            $result = $this->invoiceRepository->update($credentials['invoice_id'], $updateData);
            if (!$result) {
                return false;
            }

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'customer_id' => $credentials['customer_id'],
                'invoice_id'  => $credentials['invoice_id'],
                'type'        => Activity::TYPE_INVOICE,
                'user_id'     => $user->id,
                'action_type' => Activity::ACTION_UPDATED,
                'created_at'  => $updateData['updated_at'],
            ];
            $this->activityRepository->create($activity_logs);

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "InvoiceService" FUNCTION "updateInvoice" ERROR: ' . $e->getMessage());
        }

        return false;
    }
}


