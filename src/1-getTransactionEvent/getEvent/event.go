package getEvent

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/big"
	"os"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

type ABIEntry struct {
	Anonymous       bool             `json:"anonymous"`
	Inputs          []ABIEntryInput  `json:"inputs"`
	Name            string           `json:"name"`
	Outputs         []ABIEntryOutput `json:"outputs"`
	StateMutability string           `json:"stateMutability"`
	Type            string           `json:"type"`
}

type ABIEntryInput struct {
	Indexed      bool   `json:"indexed"`
	InternalType string `json:"internalType"`
	Name         string `json:"name"`
	Type         string `json:"type"`
}

type ABIEntryOutput struct {
	InternalType string `json:"internalType"`
	Name         string `json:"name"`
	Type         string `json:"type"`
}

type ContractJSON struct {
	ContractAddress  string     `json:"contractAddress"`
	ABI              []ABIEntry `json:"abi"`
	ByteCode         string     `json:"bytecode"`
	DeployedByteCode string     `json:"deployedBytecode"`
}

func GetEvent(client *ethclient.Client) {
	jsonFilePath := "artifacts/MyToken.json"
	jsonFile, err := os.Open(jsonFilePath)
	if err != nil {
		fmt.Println("Error opening JSON file: ", err)
		return
	}
	defer jsonFile.Close()

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		fmt.Println("Error reading JSON file:", err)
		return
	}

	var contractJSON ContractJSON
	err = json.Unmarshal(byteValue, &contractJSON)
	if err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
		return
	}

	contractAddress := common.HexToAddress(contractJSON.ContractAddress)

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
		from := common.HexToAddress(vLog.Topics[1].Hex())
		to := common.HexToAddress(vLog.Topics[2].Hex())

		amount := new(big.Int)
		amount.SetBytes(vLog.Topics[3].Bytes())

		fmt.Printf("From: %s\n", from.Hex())
		fmt.Printf("To: %s\n", to.Hex())
		fmt.Printf("Amount: %d\n", amount)
		fmt.Printf("Transaction Hash: %s\n", vLog.TxHash.Hex())
		fmt.Printf("Block Number: %d\n", vLog.BlockNumber)
	}
}
