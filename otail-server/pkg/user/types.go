package user

import "time"

type User struct {
	ID        string    `json:"id" bson:"_id"`
	Email     string    `json:"email" bson:"email"`
	Password  []byte    `json:"-" bson:"password"`
	APIToken  string    `json:"api_token" bson:"api_token"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
}

type UserStore interface {
	CreateUser(user *User) (*User, error)
	GetUserByEmail(email string) (*User, error)
	GetUserByToken(token string) (*User, error)
	Close() error
}
