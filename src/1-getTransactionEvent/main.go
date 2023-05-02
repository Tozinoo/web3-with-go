package main

import (
	"1-getTransactionEvent/getEvent"
	"context"
	"fmt"
	"log"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

func main() {
	client, err := ethclient.Dial("https://sepolia.infura.io/v3/0dc3f69ff69e4548ad9b70ae0f18d837")

	if err != nil {
		fmt.Println("Error connecting to Ethereum network:", err)
		return
	}

	fmt.Println("we have a connection")

	account := common.HexToAddress("0x0A774ea1Ed2Fd9A79266Dc2fF167acB8c2482E12")

	balance, err := client.BalanceAt(context.Background(), account, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(balance)

	getEvent.GetEvent(client)
}
