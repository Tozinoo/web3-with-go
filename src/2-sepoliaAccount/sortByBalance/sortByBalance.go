package sortbybalance

import (
	"log"
	"math/big"
	"path"
	"sort"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/rawdb"
)

type Account struct {
	Address common.Address
	Balance *big.Int
}

func GetAllAddress(chainPath string) {
	chaindataPath := chainPath
	statePath := path.Join(chaindataPath, "state")

	db, err := rawdb.NewLevelDBDatabase(statePath, 0, 0, "", true)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	headHash := rawdb.ReadHeadBlockHash(db)
	if (headHash == common.Hash{}) {
		log.Fatal("No head block found")
	}

	headNumber := rawdb.ReadHeaderNumber(db, headHash)
	if headNumber == nil {
		log.Fatal("No head block number found")
	}

	block := rawdb.ReadBlock(db, headHash, *headNumber)
	if block == nil {
		log.Fatal("No block found")
	}

	triedb := state.NewDatabaseWithDB(db)
	stateRoot := block.Root()

	state, err := state.New(stateRoot, triedb, nil)
	if err != nil {
		log.Fatalf("Failed to open state: %v", err)
	}

	it := state.NewIterator(nil, nil)
	for it.Next() {
		log.Printf("Account %x, balance: %d\n", it.Key, it.Value().Balance())
	}

}

func SortByBalance(accounts []Account) {
	sort.Slice(accounts, func(i, j int) bool {
		return accounts[i].Balance.Cmp(accounts[j].Balance) > 0
	})
}
