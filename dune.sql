SELECT 
    evt_tx_hash,
    CASE 
        WHEN "from" = 0xE500D63E69203BBFD13CcF25323b091fD6c44007 THEN cast(value as DOUBLE) / -1000000 
        ELSE cast(value as DOUBLE) / 1000000
    END as change,
    evt_block_time
FROM erc20_arbitrum.evt_Transfer
WHERE contract_address = 0xff970a61a04b1ca14834a43f5de4533ebddb5cc8 
    AND (
        "from" = 0xE500D63E69203BBFD13CcF25323b091fD6c44007 
        OR 
        to = 0xE500D63E69203BBFD13CcF25323b091fD6c44007
    )
ORDER BY evt_block_time DESC 
