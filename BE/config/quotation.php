<?php

return [
    'status' => [
        'unpaid' => 1,
        'partial_payment' => 2,
        'paid' => 3,
        'rejected' => 4,
        'cancelled' => 5
    ],
    'status_text' => [
        1 => 'Unpaid',
        2 => 'Partial Payment',
        3 => 'Paid',
        4 => 'Rejected',
        5 => 'Cancelled'
    ],
    'material_price_unit' => [
        'pc' => 1,
        'm2' => 2,
        'm' => 3,
        'panel' => 4,
    ],
    'product_item_type' => [
        'aluminium' => 1,
        'other' => 2
    ],
    'note_type' => [
        1 => 'Excluded',
        2 => 'Information'
    ],
    'other_fee_type' => [
        'excluded' => 1,
        'included' => 2,
    ]
];
