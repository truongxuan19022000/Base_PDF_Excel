<?php

namespace App\Exports;

use App\Repositories\RoleRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportRole implements FromCollection, WithMapping, WithHeadings
{
    private $roleRepository;
    private $searches;

    public function __construct($searches)
    {
        $this->roleRepository = app(RoleRepository::class);
        $this->searches = $searches;
    }

    public function collection()
    {
        $searchParams = $this->searches;
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
