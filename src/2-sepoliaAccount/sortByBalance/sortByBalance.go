package sortbybalance

import (
	"math/big"
	"sort"

	"github.com/ethereum/go-ethereum/common"
)

type Account struct {
	Address common.Address
	Balance *big.Int
}

func SortByBalance(accounts []Account) {
	sort.Slice(accounts, func(i, j int) bool {
		return accounts[i].Balance.Cmp(accounts[j].Balance) > 0
	})
}
