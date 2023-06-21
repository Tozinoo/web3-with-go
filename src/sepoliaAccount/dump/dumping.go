package dumping

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/ledgerwatch/erigon-lib/kv/mdbx"
	"github.com/ledgerwatch/erigon/core/state"
	"github.com/ledgerwatch/log/v3"
)

func DumpTx(chainPath string) {
	logger := log.New()

	file, err := os.Create("output.json")
	if err != nil {
		// 에러 처리
		fmt.Println("error : ", err)
	}

	encoder := json.NewEncoder(file)
	fmt.Println(123123123, encoder)

	db := mdbx.NewMDBX(logger).Path(chainPath)
	fmt.Println(234234, db)

	tx, err := db.MustOpen().BeginRo(context.Background())
	if err != nil {
		fmt.Println("error : ", err)
	}
	defer tx.Rollback()

	fmt.Println(345345, tx)

	for i := uint64(2); i < uint64(3000000); i++ {
		dumper := state.NewDumper(tx, i, false)
		fmt.Println(dumper)
	}

}
