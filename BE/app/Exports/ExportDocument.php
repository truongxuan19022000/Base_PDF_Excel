<?php

namespace App\Exports;

use App\Repositories\DocumentRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportDocument implements FromCollection, WithMapping, WithHeadings
{
    private $documentRepository;
    private $searches;

    public function __construct($searches)
    {
        $this->documentRepository = app(DocumentRepository::class);
        $this->searches = $searches;
    }

    public function collection()
    {
        $searchParams = $this->searches;
        return $this->documentRepository->getDocuments($searchParams, false);
    }

    public function map($row): array
    {
        if (isset($this->searches['customer_id'])) {;
            return [
                $row->document_name,
                $row->file_type,
                date('d M Y', strtotime($row->created_at)),
            ];
        }
        return [
            $row->document_name,
            $row->file_type,
            $row->customer_name,
            date('d M Y', strtotime($row->created_at)),
        ];

    }

    public function headings(): array
    {
        if (isset($this->searches['customer_id'])) {;
            return [
                'FILE NAME',
                'TYPE',
                'UPLOADED ON',
            ];
        }
        return [
            'FILE NAME',
            'TYPE',
            'CUSTOMER',
            'UPLOADED ON',
        ];
    }
}
