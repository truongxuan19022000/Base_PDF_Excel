<?php

return [
    'status' => [
        'draft' => 1,
        'pending_approval' => 2,
        'approved' => 3,
        'rejected' => 4,
        'cancelled' => 5
    ],
    'status_text' => [
        1 => 'Draft',
        2 => 'Pending Approval',
        3 => 'Approved',
        4 => 'Rejected',
        5 => 'Cancelled'
    ],
    'material_price_unit' => [
        'pcs' => 1,
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
    ],
    'info_note_data' => [
        [
            'order' => 1,
            'description' => 'Laboratory or field performance test on aluminium component for performing solar optical properties, light reflectance, air infiltration, water penetration, acoustic, Conquas field water tightness test & etc.',
            'type' => 1
        ],
        [
            'order' => 2,
            'description' => 'Any fees render for the services of or/and from PE, RTO, RE & Specialist Accredited Checker shall be excluded from our offer.',
            'type' => 2
        ],
        [
            'order' => 3,
            'description' => 'Any works related to aluminium or glazing offer herein shall have a minimum billing area of 0.50m2 for normal shape, while 1m2 for odd shape.',
            'type' => 2
        ],
        [
            'order' => 4,
            'description' => 'Any glass components related to frameless glass system such as safety barrier railing behind aluminium framed door or/and window, glass railing to staircase or balcony, shower screen, glass canopy, skylight, lift shaft, screen and etc.',
            'type' => 1
        ],
        [
            'order' => 5,
            'description' => 'Color tonality of non-metallic POWDER COATED finish offer herein shall be in the range of standard Oxyplast Color range, with one colour tonality for the whole project. Two or more color coating shall incur cost implication.',
            'type' => 2
        ],
        [
            'order' => 6,
            'description' => 'Glazing proposed for the project herein shall be in CLEAR tonality since there were no shading coefficient requirement in the provided specification and glass rate subjected to change if deviated from the original design intent.',
            'type' => 2
        ],
        [
            'order' => 7,
            'description' => 'The assembled aluminium Local Profile and frameless framing including coating, offered herein, shall be in standard oxyplast color range.',
            'type' => 2
        ],
        [
            'order' => 8,
            'description' => 'All hoisting, staging, scaffolding, mobile elevated work platform, materials hoisting crane or/and boomlift for our installation works shall be provided by Client at no cost to us.',
            'type' => 2
        ],
        [
            'order' => 9,
            'description' => 'All glazing in Powder Room & WC shall come with frosted glass w/ chemical treatment',
            'type' => 2
        ],
        [
            'order' => 10,
            'description' => 'All Galvanised Mild Steel Lintel Supports are excluded from our quotation unless explicitly stated.',
            'type' => 2
        ],
        [
            'order' => 11,
            'description' => "All glazing specifications are as follows:
            - 13.52mm thk CLEAR heat-strengthened glass (6mm thk CLEAR heat-strengthened glass + 1.52mm thk CLEAR PVB + 6mm thk CLEAR heat-strengthened glass)",
            'type' => 2
        ],
        [
            'order' => 12,
            'description' => 'Heat-strengthened glass is proposed in lieue of tempered glass due to tempered glass being prone to spontaneous breakage',
            'type' => 2
        ],
    ],
    'other_fee_data' => [
        [
            'order_number' => 1,
            'description' => 'Field or laboratory testing. (Please refer to A.1 for exclusion)',
            'type' => 1,
            'amount' => 0
        ],
        [
            'order_number' => 2,
            'description' => 'Professional Engineers Fee for providing review on shopdrawing with design endorsement and BCA submission. (Please refer to A.2 for exclusion)',
            'type' => 1,
            'amount' => 0
        ],
        [
            'order_number' => 3,
            'description' => 'Performance bond and insurances (CAR, WIC & etc)',
            'type' => 1,
            'amount' => 0
        ],
        [
            'order_number' => 4,
            'description' => 'Minature sample and mock ups',
            'type' => 1,
            'amount' => 0
        ],
        [
            'order_number' => 5,
            'description' => "2D Shop drawing preparation and AS BUILT drawing submission. (Clients' to provide us the elevation & floor plan in CAD format)",
            'type' => 2,
            'amount' => floatval('1500.00')
        ],
    ],
    'term_condition_data' => [
        [
            'order_number' => 1,
            'description' => "Above amount quoted subjected to prevailing GST.",
        ],
        [
            'order_number' => 2,
            'description' => "Above amount and quantities quoted are based on the information / drawing provided by you at the time of preparing the quotation and subjected to remeasurement, if deviated from the original design intent. (without specification)",
        ],
        [
            'order_number' => 3,
            'description' => "The above aluminium framing offer herein are extruded in 6063-T5 alloy with one coat polyester powder coated finish system (minimum 35 microns), cut and conventional assembled to aluminium fabricator details with one layer of protection tape onto surface finished. Subjected to remeasurement, if deviated from the original design intent.",
        ],
        [
            'order_number' => 4,
            'description' => "Clients' to provide free and full general facilities inclusive attendance on site for materials hoisting, lift access for uploading & placing of materials to upper level, working staging, platform, works at height equipments, scaffolding, elevated mobile platform, grouting materials, water & electricity and including forming of opening, hacking and making good of concrete structures or adjacent finishes during the course of our installation works.",
        ],
        [
            'order_number' => 5,
            'description' => "All steel framing support, RC stiffeners or lintel in connection to our aluminium works shall be provided by Clients'.",
        ],
        [
            'order_number' => 6,
            'description' => "Terms of payments shall be 40% upon confirmation. Balance 60% shall be payable through our monthly progress claims with payments to be made to us within 30 days from the date of submission of each progress claim (e.g.: 45% on installation of outer frame, 55% on installation of inner panel against value of rate priced or based on individual element breakdown. The deposit sum collected shall be offset or deduction make in the way of monthly drawdown against the percentage of works done certified) and without retention.",
        ],
        [
            'order_number' => 7,
            'description' => "Validity period of our quotation offer is 7 days from the date of this quotation.",
        ],
        [
            'order_number' => 8,
            'description' => "Any items not specifically called out herein must be considered exclusive from this quotation.",
        ],
        [
            'order_number' => 9,
            'description' => "In case of discrepancy, this quotation shall take precedence.",
        ],
    ]
];
