package main

import (
	"context"
	"fmt"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

type Minting struct {
	From  common.Address
	To    common.Address
	Value *big.Int
}

func main() {
	client, err := ethclient.Dial("http://192.168.153.143:8547")

	if err != nil {
		fmt.Println("Error connecting to Ethereum network:", err)
		return
	}

	fmt.Println(("we have a connection"))
	_ = client

	account := common.HexToAddress("0x0A774ea1Ed2Fd9A79266Dc2fF167acB8c2482E12")

	balance, err := client.BalanceAt(context.Background(), account, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(balance)

	contractAddress := common.HexToAddress("0x99a9b6cBEF89A03c34788cB6495fb4b946b1bD87")

	mintingEventSignature := []byte("Minting(address,address,uint256)")
	mintingEventSignatureHash := crypto.Keccak256Hash(mintingEventSignature)

	query := ethereum.FilterQuery{
		FromBlock: big.NewInt(0),
		ToBlock:   nil,
		Addresses: []common.Address{contractAddress},
		Topics: [][]common.Hash{
			{mintingEventSignatureHash},
		},
	}

	logs, err := client.FilterLogs(context.Background(), query)

	if err != nil {
		fmt.Println("Error fetching logs:", err)
		return
	}

	for _, vLog := range logs {
		if len(vLog.Data) < 96 {
			fmt.Println("Not enough data")
			continue
		}

		from := common.BytesToAddress(vLog.Data[12:32])
		to := common.BytesToAddress(vLog.Data[44:64])

		amount := new(big.Int)
		amount.SetBytes(vLog.Data[64:96])

		fmt.Printf("From: %s\n", from.Hex())
		fmt.Printf("To: %s\n", to.Hex())
		fmt.Printf("Amount: %d\n", amount)
		fmt.Printf("Transaction Hash: %s\n", vLog.TxHash.Hex())
		fmt.Printf("Block Number: %d\n", vLog.BlockNumber)
	}
}
