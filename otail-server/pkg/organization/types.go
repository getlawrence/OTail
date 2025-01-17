package organization

import "time"

type Organization struct {
	ID        string    `json:"id" bson:"_id"`
	Name      string    `json:"name: bson:"name"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
}
