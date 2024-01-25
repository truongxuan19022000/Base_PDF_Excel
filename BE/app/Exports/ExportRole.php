<?php

namespace App\Exports;

use App\Repositories\RoleRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportRole implements FromCollection, WithMapping, WithHeadings
{
    private $roleRepository;
    private $searchs;

    public function __construct($searchs)
    {
        $this->roleRepository = app(RoleRepository::class);
        $this->searchs = $searchs;
    }

    public function collection()
    {
        $searchParams = $this->searchs;
        return $this->roleRepository->getRoles($searchParams, false);
    }

    public function map($row): array
    {
        return [
            $row->role_name,
            $row->number_user,
        ];
    }

    public function headings(): array
    {
        return [
            'ROLE',
            'NO. OF USERS',
        ];
    }
}
