<?php

namespace App\Exports;

use App\Repositories\UserRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportUser implements FromCollection, WithMapping, WithHeadings
{
    private $userRepository;
    private $searchs;

    public function __construct($searchs)
    {
        $this->userRepository = app(UserRepository::class);
        $this->searchs = $searchs;
    }

    public function collection()
    {
        $searchParams = $this->searchs;
        return $this->userRepository->getUsers($searchParams, false);
    }

    public function map($row): array
    {
        return [
            $row->name,
            $row->username,
            $row->role_name,
            $row->email,
        ];
    }

    public function headings(): array
    {
        return [
            'NAME',
            'USERNAME',
            'ROLE',
            'EMAIL',
        ];
    }
}
