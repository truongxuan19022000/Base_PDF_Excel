<?php

return [
    'response_status' => [
        'success' => 1,
        'failed' => 0,
    ],
    'scroll' => [
      'up' => 1,
      'down' => 2
    ],
    'jwt_token_expires_time' => env('JWT_TOKEN_EXPIRES_TIME', 43200),
    'jwt_token_default_expires_in' => env('JWT_TOKEN_DEFAULT_EXPIRES_IN', 1440),
    'reset_token_expires_time' => env('RESET_TOKEN_EXPIRES_TIME', 30),
    'generate_password_token_character_number' => 80,
    'mail' => [
        'reset_pwd_url' => [
            'admin' => env('FE_URL') . 'reset-password',
        ],
    ],
    'material_category' => [
      'aluminium' => 'Aluminium',
      'glass' => 'Glass',
      'hardware' => 'Hardware',
      'services' => 'Services',
    ],
    'material_profile' => [
        1 => 'Euro',
        2 => 'Local',
    ],
    'material_price_unit' => [
        1 => 'pc',
        2 => 'm2',
        3 => 'm',
        4 => 'panel',
    ],
    'material_key' => [
        'price' => 'Price',
        'coating_price' => 'Coating Price',
    ],
    'paginate' => 10,
    'door_window_type' => [
        1 => 'Swing Door (SWD)',
        2 => 'Sliding Door / Window (SLD)',
        3 => 'Top Hung / Fixed Panel (FTC)',
        4 => 'Slide & Fold Door (S&F)',
        5 => 'Fixed / Hung Window (FTC-70\s)',
        6 => 'Sliding Door / Window (SLD-80\s)',
        7 => 'Sliding Door (SLD-80\s)',
        8 => 'Sliding Window (SLD-80\s)',
        9 => 'Flush Door',
        10 => 'Louvre Insert',
        11 => 'Substation Door',
        12 => 'Slide & Fold Door (S&F-DR)',
        13 => 'Adj. Glass Louvre Window',
        14 => 'BF-TH & Fixed'
    ],
    'service_type' => [
        1 => 'Aluminium',
        2 => 'Glass',
        3 => 'Hardware',
        4 => 'Services',
    ],
    'side' => [
        'inner' => 'Inner',
        'outer' => 'Outer',
        'inner_outer' => 'Outer / Inner'
    ],
    'profile' => [
        'euro' => 1,
        'local' => 2,
    ],
    'material_type' => [
        'product' => 1,
        'glass' => 2,
        'extra_order' => 3,
    ],
    'material_flag' => [
        'material_screen' => 1,
        'quotation_section_screen' => 2,
    ],
    'storey_type' => [
        1 => '1st Storey',
        2 => '2nd Storey',
        3 => '3rd Storey',
        4 => 'Mezzanine',
    ],
    'area_type' => [
        1 => 'Living Room',
        2 => 'Balcony',
        3 => 'Kitchen',
        4 => 'Dining Area',
        5=> 'Common Toilet',
        6 => 'Master Room Toilet',
        7 => 'Master Room',
        8 => 'Bedroom 1',
        9 => 'Bedroom 2',
        10 => 'Bedroom 3',
        11 => 'Store Room',
    ],
    'screen_type' => [
        'product_template_screen' => 1,
        'quotation_screen' => 2
    ],
    'product_item_screen' => [
        'product_item' => 1,
        'material_item' => 2
    ]
];
