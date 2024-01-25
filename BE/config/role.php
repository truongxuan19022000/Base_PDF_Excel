<?php

return [
    'role_setting' => [
        'create' => [
            0 => 0,
            1 => 1,
        ],
        'update' => [
            0 => 0,
            1 => 2,
        ],
        'delete' => [
            0 => 0,
            1 => 4,
        ],
        'edit' => [
            0 => 0,
            1 => 100,
        ],
        'send' => [
            0 => 0,
            1 => 8
        ]
    ],
    'mode' => [
        15 => [
            'create' => 1,
            'update' => 1,
            'delete' => 1,
            'send'  => 1,
        ],
        14 => [
            'create' => 0,
            'update' => 1,
            'delete' => 1,
            'send'   => 1,
        ],
        13 => [
            'create' => 1,
            'update' => 0,
            'delete' => 1,
            'send'   => 1,
        ],
        12 => [
            'create' => 0,
            'update' => 0,
            'delete' => 1,
            'send'   => 1,
        ],
        11 => [
            'create' => 1,
            'update' => 1,
            'delete' => 0,
            'send'   => 1,
        ],
        10 => [
            'create' => 0,
            'update' => 1,
            'delete' => 0,
            'send'   => 1,
        ],
        9 => [
            'create' => 1,
            'update' => 0,
            'delete' => 0,
            'send'   => 1,
        ],
        8 => [
            'create' => 0,
            'update' => 0,
            'delete' => 0,
            'send'   => 1,
        ],
        7 => [
            'create' => 1,
            'update' => 1,
            'delete' => 1,
            'send'   => 0,
        ],
        6 => [
            'create' => 0,
            'update' => 1,
            'delete' => 1,
            'send'   => 0,
        ],
        5 => [
            'create' => 1,
            'update' => 0,
            'delete' => 1,
            'send'   => 0,
        ],
        4 => [
            'create' => 0,
            'update' => 0,
            'delete' => 1,
            'send'   => 0,
        ],
        3 => [
            'create' => 1,
            'update' => 1,
            'delete' => 0,
            'send'   => 0,
        ],
        2 => [
            'create' => 0,
            'update' => 1,
            'delete' => 0,
            'send'   => 0,
        ],
        1 => [
            'create' => 1,
            'update' => 0,
            'delete' => 0,
            'send'   => 0,
        ],
        0 => [
            'create' => 0,
            'update' => 0,
            'delete' => 0,
            'send'   => 0,
        ],
    ],
    'role_mode' => [
        'create' => [1, 3, 5, 7, 9, 11, 13, 15],
        'update' => [2, 3, 6, 7, 10, 11, 14, 15],
        'delete' => [4, 5, 6, 7, 12, 13, 14, 15],
        'send'   => [8, 9, 10, 11, 12, 13, 14, 15],
    ]
];
