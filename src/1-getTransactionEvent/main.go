package main

import (
	"1-getTransactionEvent/getEvent"
	"context"
	"fmt"
	"log"
	"os"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}

	infuraApiKey := os.Getenv("INFURA_API_KEY")
	ethClientUrl := "https://sepolia.infura.io/v3/" + infuraApiKey

	client, err := ethclient.Dial(ethClientUrl)

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
