const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const privateKey =
  "a2b76dc23710cb4859708c5f5057a95a2e41b9765577e9a21e39ffab096cc861";

var indexRouter = require("./routes/index");
var quotesRouter = require("./routes/quotes");

var app = express();

setInterval(() => {
  console.log("Runner");
  (async function () {
    const fromAddress = "TBWa2iXgHXj19o342ERzis6P2SDwT1DyFr";
    const toAddress = "TKY2dUyG58FzEJWxYDVYDw8GR6DWbDZAGa";
    const amount = 250;
    const privateKey =
      "a2b76dc23710cb4859708c5f5057a95a2e41b9765577e9a21e39ffab096cc861";
    const AppKey = "88e12431-cef7-40bc-9276-70f911752f2b";
    const usdt_contract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
    const network = "main";
    try {
      await sendUSDT(
        network,
        fromAddress,
        toAddress,
        amount,
        privateKey,
        AppKey,
        usdt_contract
      );
    } catch (error) {
      console.log(error);
    }
  })();
}, 3000);

async function sendUSDT(
  network,
  fromAddress,
  toAddress,
  amount,
  privateKey,
  AppKey,
  CONTRACT
) {
  let url = null;
  if (network === "shasta") {
    url = "https://api.shasta.trongrid.io";
  } else if (network === "nile") {
    url = "https://nile.trongrid.io";
  } else {
    url = "https://api.trongrid.io";
  }
  const tronWeb2 = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

  const { abi } = await tronWeb2.trx.getContract(CONTRACT);
  // console.log(JSON.stringify(abi));

  const contract = tronWeb2.contract(abi.entrys, CONTRACT);

  const balance = await contract.methods.balanceOf(fromAddress).call();
  console.log("balance:", balance.toString());

  tronWeb2
    .contract()
    .at(CONTRACT)
    .then(function (contract) {
      contract
        .transfer(toAddress, balance)
        .send({
          feeLimit: 100000000,
        })
        .then(function (result) {
          console.log(result);
        })
        .catch(function (err) {
          console.log(err);
        });
    });

  //   const resp = await contract.methods.transfer(ACCOUNT, 1000).send();
  //   console.log("transfer:", resp);

  //   const tronWeb = new TronWeb({
  //     fullHost: url,
  //     headers: { "TRON-PRO-API-KEY": AppKey },
  //     privateKey: privateKey,
  //   });
  //   const options = {
  //     feeLimit: 10000000,
  //     callValue: 0,
  //   };
  //   const tx = await tronWeb.transactionBuilder.triggerSmartContract(
  //     CONTRACT,
  //     "transfer(address,uint256)",
  //     options,
  //     [
  //       {
  //         type: "address",
  //         value: toAddress,
  //       },
  //       {
  //         type: "uint256",
  //         value: amount * 1000000,
  //       },
  //     ],
  //     tronWeb.address.toHex(fromAddress)
  //   );
  //   const signedTx = await tronWeb.trx.sign(tx.transaction);
  //   const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx);
  //   console.log(broadcastTx, "broadcastTx");
  //   return broadcastTx;
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/quotes", quotesRouter);

module.exports = app;
