import requests
from datetime import datetime

addr = "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549"
data = {
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": [addr, "latest"],
    "id": 1
}
#https://ethereumnodes.com/
rpc = "https://eth.llamarpc.com"
respRaw = requests.post(rpc, json = data)
resp = respRaw.json()
bal_wei_hex = resp["result"]
bal_wei = int(bal_wei_hex, 16)
bal = bal_wei / 10**18
print(addr, "has", bal, "ETH")

#erc20 tok bal call
#https://gist.github.com/arshamalh/33e6646eb793997f2cc69668bd97010a
#https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call
#https://emn178.github.io/online-tools/keccak_256.html
token_contract_address = "0xdac17f958d2ee523a2206206994597c13d831ec7" #tether
account_address = "0x9Ff7A880C8d261D7252EE93f9ad38139cBff26e8" 
keccak_data = {
    "jsonrpc": "2.0", 
    "method": "web3_sha3",
    "params": [
        "balanceOf(address)".encode().hex()
    ],
    "id": 2
}
keccak_respRaw = requests.post(rpc, json=keccak_data)
keccak_resp = keccak_respRaw.json()
keccak = keccak_resp["result"]
#'0x' + "70a08231b98ef4ca268c9cc3f6b4590e4bfec28280db06bb5d45e689f2a360be"[0:8]
data_str = keccak[0:10] + '000000000000000000000000' + account_address[2:]
tok_data = {
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [
        {
            "to": token_contract_address,
            "data": data_str
        },
        "latest"
    ],
    "id": 3
}
tok_respRaw = requests.post(rpc, json = tok_data)
tok_resp = tok_respRaw.json()
tok_hex = tok_resp["result"]
tok_bal = int(tok_hex, 16)
tether_dec = 6
tok_bal /= 10**tether_dec
print(account_address, "has", tok_bal, "USDT(Tether)")


#https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionbyhash
hash = "0x3844c56cba464e9f06842401ea2809d0754cda54eab9a05c688c376b11afc4ce"
tx_payload = {
    "jsonrpc": "2.0",
    "method": "eth_getTransactionByHash",
    "params": [hash],
    "id": 4
}
tx_respRaw = requests.post(rpc, json = tx_payload)
tx_resp = tx_respRaw.json()
tx_info = tx_resp["result"]
sender = tx_info["from"]
gas = int(tx_info["gasPrice"], 16) / 10**18
tx_data = tx_info["input"]
receiver = tx_info["to"]
eth_transfered = int(tx_info["value"], 16) / 10**18
blockhash = tx_info["blockHash"] #use this to get the time of the tx
time_payload = {
    "jsonrpc": "2.0",
    "method": "eth_getBlockByHash",
    "params": [blockhash, False],
    "id": 5
}
time_respRaw = requests.post(rpc, json = time_payload)
tx_time = datetime.utcfromtimestamp(int(time_respRaw.json()["result"]["timestamp"], 16))

print(sender, "sent", eth_transfered, "ETH to", receiver, "with data", tx_data, "and paid", gas, "ETH in gas at", tx_time, "UTC")

#same process for L2
poly_addr = "0xce5f94f814906fbe7cd151c6ceb9095325612245"
poly_data = {
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": [poly_addr, "latest"],
    "id": 6
}

poly_rpc = "https://rpc.ankr.com/polygon"
poly_respRaw = requests.post(poly_rpc, json = poly_data)
poly_resp = poly_respRaw.json()
poly_bal_wei_hex = poly_resp["result"]
poly_bal_wei = int(poly_bal_wei_hex, 16)
poly_bal = poly_bal_wei / 10**18
print(poly_addr, "has", poly_bal, "MATIC on Polygon L2")
