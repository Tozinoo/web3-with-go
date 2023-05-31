package main

import (
	sortbybalance "2-sepoliaAccount/sortByBalance"
	"fmt"
	"os"

	"github.com/ethereum/go-ethereum/ethclient"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}

	cahinDataDir := os.Getenv("INFURA_API_KEY")

	// db, err := sql.Open("mysql", "user:chlgustjr1!@tcp(127.0.0.1:3306)/web3_with_go")
	// if err != nil {
	// 	panic(err.Error())
	// }
	// defer db.Close()

	client, err := ethclient.Dial("http://127.0.0.1:8546")

	if err != nil {
		fmt.Println("Error connecting to Ethereum network:", err)
		return
	}
	_ = client
	fmt.Println("we have a connection")

	// account := common.HexToAddress("0x54f5B89B3CE420a4BBcCE689C01f9d16864eb342")

	// balance, err := client.BalanceAt(context.Background(), account, nil)
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// fmt.Println(balance)

	// addresses := []common.Address{
	// 	common.HexToAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e"),
	// 	common.HexToAddress("0x2a65Aca4D5fC5B5C859090a6c34d164135398226"),
	// }

	// accounts := make([]sortbybalance.Account, 0, len(addresses))
	// for _, addr := range addresses {
	// 	balance, err := client.BalanceAt(context.Background(), addr, nil)
	// 	if err != nil {
	// 		fmt.Println("Failed to get balance for address:", addr.Hex(), err)
	// 		continue
	// 	}
	// 	accounts = append(accounts, sortbybalance.Account{Address: addr, Balance: balance})
	// }

	// // Print sorted accounts
	// for _, account := range accounts {
	// 	fmt.Printf("Address: %s, Balance: %s\n", account.Address.Hex(), account.Balance.String())
	// }

	sortbybalance.GetAllAddress(cahinDataDir)

}
