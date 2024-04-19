<?php

namespace App\Repositories;
use App\Models\Document;

class DocumentRepository
{
    public function create(array $request)
    {
        return Document::create($request);
    }

    public function getDocumentsByCustomerId($customerId)
    {
        return Document::select([
            'id',
            'document_name',
            'file',
            'file_type',
            'created_at'
        ])->where('customer_id', $customerId)->get();
    }

    public function getDocuments($searchParams, $paginate = true)
    {
        $sql = Document::join('customers', 'customers.id', 'documents.customer_id')
            ->join('quotations', 'quotations.id', 'documents.quotation_id')
            ->select([
                'documents.id',
                'documents.document_name',
                'documents.file',
                'customers.name as customer_name',
                'quotations.reference_no',
                'documents.file_type',
                'documents.created_at'
            ])->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('documents.document_name', 'LIKE', '%'. $searchParams['search'] .'%')
                        ->orWhere('customers.name', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['document_id']) && is_array($searchParams['document_id'])) {
            $sql->whereIn('documents.id', $searchParams['document_id']);
        }

        if (isset($searchParams['customer_id'])) {
            $sql->where('documents.customer_id', $searchParams['customer_id']);
        }
        if (isset($searchParams['type']) && is_array($searchParams['type'])) {
            $sql->whereIn('documents.file_type', $searchParams['type']);
        }
        if (isset($searchParams['start_date'])) {
            $sql->whereDate('documents.created_at', '>=', $searchParams['start_date']);
        }
        if (isset($searchParams['end_date'])) {
            $sql->whereDate('documents.created_at', '<=', $searchParams['end_date']);
        }
        $sql->orderBy('documents.created_at', 'DESC');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function getDocumentDetail($documentId)
    {
        return Document::join('customers', 'customers.id', 'documents.customer_id')
            ->join('quotations', 'quotations.id', 'documents.quotation_id')
            ->select([
                'documents.id',
                'documents.document_name',
                'documents.file',
                'customers.name as customer_name',
                'quotations.reference_no',
                'documents.file_type',
                'documents.created_at'
            ])->where('documents.id', $documentId)->first();
    }

    public function delete($documentId)
    {
        return Document::where('id', $documentId)->delete();
    }

    public function multiDeleteDocument($documentId)
    {
        return Document::whereIn('id', $documentId)->delete();
    }

    public function findDocumentDeleted($documentId)
    {
        return Document::onlyTrashed()->where('id', $documentId)->first();
    }

    public function findDocumentMultiDeleted($documentId)
    {
        return Document::onlyTrashed()->whereIn('id', $documentId)->get();
    }

    public function update($documentId, $updateData)
    {
        return Document::where('id', $documentId)->update($updateData);
    }

    public function getDocumentsByCustomer($searchParams, $paginate = true, $customerId)
    {
        $sql = Document::join('customers', 'customers.id', 'documents.customer_id')
            ->join('quotations', 'quotations.id', 'documents.quotation_id')
            ->select([
                'documents.id',
                'documents.document_name',
                'documents.file',
                'customers.name as customer_name',
                'quotations.reference_no',
                'documents.file_type',
                'documents.created_at'
            ])->where('documents.customer_id', $customerId)
            ->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('documents.document_name', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['document_id']) && is_array($searchParams['document_id'])) {
            $sql->whereIn('documents.id', $searchParams['document_id']);
        }

        if (isset($searchParams['customer_id'])) {
            $sql->where('documents.customer_id', $searchParams['customer_id']);
        }
        if (isset($searchParams['type']) && is_array($searchParams['type'])) {
            $sql->whereIn('documents.file_type', $searchParams['type']);
        }
        if (isset($searchParams['start_date'])) {
            $sql->whereDate('documents.created_at', '>=', $searchParams['start_date']);
        }
        if (isset($searchParams['end_date'])) {
            $sql->whereDate('documents.created_at', '<=', $searchParams['end_date']);
        }
        $sql->orderBy('documents.created_at', 'DESC');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function getDocumentsForDownload($credentials) {
        return Document::whereIn('id', $credentials['document_ids'])->get();
    }
}
