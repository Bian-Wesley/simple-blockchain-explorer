function selectionResponse(){
    document.getElementById("results").innerHTML = "";
    var option = document.getElementById("selector").value;
    if(option == "Balance of Bitcoin address"){
        setTexts(
            "bc1q8sat4q6tu7ylsl8jxsrdjj6ecz87r239kjhfx0", 
            null, 
            "See the balance of this Bitcoin address",
            "Enter a Bitcoin address here:",
            null,
            "bitBal()"
        );
    }
    else if(option == "Bitcoin transaction info"){
        setTexts(
            "51d4d07236e97abb7a9118e79605c2b7418f8c387ab94096818c8dfe203b68a1", 
            null, 
            "See information about this Bitcoin transaction",
            "Enter a Bitcoin transaction hash here:",
            null,
            "bitTx()"
        );
    }
    else if(option == "Balance of Ethereum address"){
        setTexts(
            "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549", 
            null, 
            "See the balance of this Ethereum address",
            "Enter an Ethereum address here:",
            null,
            "ethBal()"
        );
    }
    else if(option == "ERC20 token balance for an Ethereum address"){
        setTexts(
            "0x9Ff7A880C8d261D7252EE93f9ad38139cBff26e8", 
            "0xdac17f958d2ee523a2206206994597c13d831ec7", 
            "See how much this address has of this ERC20 token",
            "Enter an Ethereum address here:", 
            "Enter the token contract address here:",
            "ethTokBal()"
        );
    }
    else if(option == "Ethereum transaction info"){
        setTexts(
            "0x3844c56cba464e9f06842401ea2809d0754cda54eab9a05c688c376b11afc4ce", 
            null, 
            "See information for this Ethereum transaction",
            "Enter an Ethereum transaction hash here:", 
            null,
            "ethTx()"
        );
    }
    else if(option == "Balance on an EVM layer 2 of an address"){
        setTexts(
            "0xce5f94f814906fbe7cd151c6ceb9095325612245", 
            "https://rpc.ankr.com/polygon", 
            "See this address' balance on this EVM L2",
            "Enter an address here:",
            "Enter an RPC connection to an EVM L2 chain",
            "ethL2()"
        );
    }
}

function setTexts(inputDefault, inputDefaultExtra, buttonText, inputDescription, inputDescriptionExtra, func){
    //update thie function to change the onclick attribute of the button too
    document.getElementById("userInput").value = inputDefault;
    document.getElementById("button").innerHTML = buttonText;
    document.getElementById("userInputDescription").innerHTML = inputDescription;
    document.getElementById("button").setAttribute("onclick", func);
    if(inputDefaultExtra == null){
        document.getElementById("userInputExtra").setAttribute("style", "display:none;");
        document.getElementById("userInputExtraDescription").setAttribute("style", "display:none;");
    }
    else{
        var extraText = document.getElementById("userInputExtra");
        extraText.value = inputDefaultExtra;
        extraText.setAttribute("style", "display:visible;");

        var extraDescription = document.getElementById("userInputExtraDescription");
        extraDescription.innerHTML = inputDescriptionExtra;
        extraDescription.setAttribute("style", "display:visible;");
    }
}

function makeApiCall(method, url, postData, callback){
    document.getElementById("results").innerHTML = "<h1> Loading </h1>";
    var call = new XMLHttpRequest();
    call.addEventListener("load", callback);
    call.open(method, url);
    if(method == "POST"){
        call.setRequestHeader("Content-Type", "Application/json");
        call.send(JSON.stringify(postData));
    }
    else{
        call.send();
    }
}

function displayResults(payload){
    var keys = Object.keys(payload);
    var resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
    for(var k = 0; k < keys.length; k++){
        var line = document.createElement("h3");
        line.innerHTML = keys[k] + ": " + payload[keys[k]];
        resultsDiv.appendChild(line);
    }
}

function bitBal(){
    var addr = document.getElementById("userInput").value;
    makeApiCall("GET", "https://blockchain.info/multiaddr?cors=true&active=" + addr, null, bitBalResp);
}
function bitBalResp(e){
    var resp = JSON.parse(e.target.response);
    var balance = resp.addresses[0].final_balance / 100000000; //100 million satoshis in 1 bitcoin
    var payload = {
        "This address has" : balance + " bitcoins"
    }
    displayResults(payload);
}   

function bitTx(){
    var hash = document.getElementById("userInput").value;
    makeApiCall("GET", "https://blockchain.info/rawtx/" + hash, null, bitTxResp);
}
function bitTxResp(e){
    var resp = JSON.parse(e.target.response);
    var payload = {};

    var inputs = resp.inputs;
    var moneyIn = 0;
    for(var i = 0; i < inputs.length; i++){
        var currSourceAddr = inputs[i].prev_out.addr;
        var currAmnt = inputs[i].prev_out.value / 100000000;
        payload["Input " + (i + 1)] = currSourceAddr + " paid " + currAmnt + "BTC";
        moneyIn += currAmnt;
    }

    var outputs = resp.out;
    var moneyOut = 0;
    for(var o = 0; o < outputs.length; o++){
        var currAmnt = outputs[o].value / 100000000
        payload["Output " + (o + 1)] = outputs[o].addr + " received " + currAmnt + "BTC";
        moneyOut += currAmnt;
    }

    payload.Fee = (moneyIn - moneyOut) + " BTC";
    var txTime = new Date(resp.time * 1000);
    payload.Time = txTime;
    displayResults(payload);
}

function ethBal(){
    var addr = document.getElementById("userInput").value;
    var balPayload = {
        id: Math.round(Math.random() * 100),
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [addr, "latest"],
    };
    makeApiCall("POST", "https://eth.llamarpc.com", balPayload, ethBalResp);
}
function ethBalResp(e){
    var resp = JSON.parse(e.target.response);
    var balHex = resp.result;
    var balWei = Number(balHex);
    var balEth = balWei / 10**18;
    var payload = {"This address has": balEth + " ETH"};
    displayResults(payload);
}

function ethTokBal(){
    var method = "balanceOf(address)";
    var encoded = "";
    for (i = 0; i < method.length; i++) {
        var hex = method.charCodeAt(i).toString(16);
        encoded += hex //("000" + hex).slice(-4);
    }
    var keccakPayload = {
        jsonrpc: "2.0", 
        method: "web3_sha3",
        params: [encoded],
        id: Math.round(Math.random() * 1000)
    };
    makeApiCall("POST", "https://eth.llamarpc.com", keccakPayload, processKeccak);
}
function processKeccak(e){
    var resp = JSON.parse(e.target.response);
    var keccak = resp.result;
    var addr = document.getElementById("userInput").value;
    var token = document.getElementById("userInputExtra").value;
    var data_str = keccak.substring(0, 10) + '000000000000000000000000' + addr.substring(2)
    var tok_data = {
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
            {
                to: token,
                data: data_str
            },
            "latest"
        ],
        id: Math.round(Math.random() * 1000)
    };
    makeApiCall("POST", "https://eth.llamarpc.com", tok_data, ethTokBalResp);
}
function ethTokBalResp(e){
    var resp = JSON.parse(e.target.response);
    var balHex = resp.result;
    var bal = Number(balHex);
    var payload = {"This address has": bal + " of this token. Note that the balance is not converted from token decimals."};
    displayResults(payload);
}

function ethTx(){
    var hash = document.getElementById("userInput").value;
    var txPayload = {
        jsonrpc: "2.0",
        method: "eth_getTransactionByHash",
        params: [hash],
        id: Math.round(Math.random() * 1000)
    };
    makeApiCall("POST", "https://eth.llamarpc.com", txPayload, ethTxResp);

}
function ethTxResp(e){
    var resp = JSON.parse(e.target.response);
    var txInfo = resp.result;
    var sender = txInfo.from;
    var gas = Number(txInfo.gasPrice) / 10**18;
    var txData = txInfo.input;
    var receiver = txInfo.to;
    var ethTransfered = Number(txInfo.value) / 10**18;
    var payload = {
        Sender: sender,
        Receiver: receiver,
        Gas: gas + " ETH",
        "Transaction Data": txData,
        "ETH transfered": ethTransfered
    };
    displayResults(payload);
    
    var blockhash = txInfo.blockHash;
    var timePayload = {
        jsonrpc: "2.0",
        method: "eth_getBlockByHash",
        params: [blockhash, false],
        id: Math.round(Math.random() * 10000)
    };
    var timeCall = new XMLHttpRequest();
    timeCall.addEventListener("load", getTime);
    timeCall.open("POST", "https://eth.llamarpc.com");
    timeCall.setRequestHeader("Content-Type", "Application/json");
    timeCall.send(JSON.stringify(timePayload));
}
function getTime(e){
    var resp = JSON.parse(e.target.response);
    var timestamp = resp.result.timestamp;
    var time = new Date(Number(timestamp) * 1000);
    var timeEl = document.createElement("h3");
    timeEl.innerHTML = "Transaction time: " + time;
    document.getElementById("results").appendChild(timeEl);
}

function ethL2(){
    var addr = document.getElementById("userInput").value;
    var rpc = document.getElementById("userInputExtra").value;
    var l2Payload = {
        id: Math.round(Math.random() * 100),
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [addr, "latest"]
    };
    makeApiCall("POST", rpc, l2Payload, ethL2Resp);
}
function ethL2Resp(e){
    var resp = JSON.parse(e.target.response);
    var balHex = resp.result;
    var balWei = Number(balHex);
    var balEth = balWei / 10**18;
    var payload = {"This address has": balEth + " of this EVM L2's native token"};
    displayResults(payload);
}