package savedatatodb

import "database/sql"

func SavedataToDB(db *sql.DB, data map[string]float64) {
	// db에 data를 저장하는 코드 구현
	// 예를 들어, 다음과 같이 INSERT SQL문을 실행할 수 있음

	for address, balance := range data {
		_, err := db.Exec("INSERT INTO accounts (address, balance) VALUES (?, ?)", address, balance)
		if err != nil {
			// error handling
		}
	}
}
