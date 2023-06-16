import requests
from datetime import datetime
#https://www.blockchain.com/explorer/api/blockchain_api
#also has more endpoints, like get UTXOs for an address
#there are 100 million satoshis in a BTC

url = "https://blockchain.info/multiaddr?cors=true&active=" 
addr = "bc1q8sat4q6tu7ylsl8jxsrdjj6ecz87r239kjhfx0"
respRaw = requests.get(url + addr)
#print(respRaw.text)
resp = respRaw.json()
#has 4 different attributes
#addresses --> array of info of addresses. It seems that if I had put a wallet instead of an address as the active parameter, there would be multiple addresses here
#   final_balance stores current address balance
#info --> information about the specific cryptocurrency
#txs -->  array of txs involving this addr, 
#   result attr is the change in balance to this addr that resulted from this tx, 
#   time is the unix timestamp of the tx
#   if block_height or block_index is null, then the tx is unconfirmed
#   to get confirmations for this tx, subtract block_height from lock_time of 1st tx and then add 1
#   fee, in satoshis, fee of the tx 
#wallet --> information about the wallet to which this addr belongs
print("Balance of", addr, "is:", resp["addresses"][0]["final_balance"], "satoshis")

#write code to print out wanted info on each hash

ref_block = resp["txs"][0]["lock_time"] #the lock time is the blockheight after which a miner can include the transaction in a block
for tx in resp["txs"]:
    print("information for tx", tx["hash"])
    print("fee:", tx["fee"], "satoshis")
    print("time:", datetime.utcfromtimestamp(tx["time"]).isoformat())
    print("effect on", addr, ":", tx["result"], "satoshis")
    if "block_height" not in tx:
        print("unconfirmed")
    else:
        print("confirmations:", ref_block - tx["block_height"] + 1)

txurl = "https://blockchain.info/rawtx/"
txhash = "51d4d07236e97abb7a9118e79605c2b7418f8c387ab94096818c8dfe203b68a1"
respRaw = requests.get(txurl + txhash)
resp = respRaw.json()
print("Details for", txhash, "at", datetime.utcfromtimestamp(resp["time"]))
inputs = 0
for i in resp["inputs"]:
    print(i["prev_out"]["value"], "from", i["prev_out"]["addr"]) 
    #any bitcoin that is spent needs to have been the output of a previous transaction. 
    #this is the "x dollar bill" that is being spent
    inputs += i["prev_out"]["value"]

outputs = 0
for o in resp["out"]:
    print(o["value"], "to", o["addr"])
    outputs += o["value"]

print("fee of", inputs - outputs)

#for ETH, get eth bal, get erc20 bal, 
# get txs for addr maybe, 
# given tx hash get amnts transferred, time, confrimations, gas, data


