package main

import (
	"fmt"
	"os"

	dumping "dumping/dump"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}

	chainDataDir := os.Getenv("DIR_CHAINDATA")
	dumping.DumpTx(chainDataDir)
}
